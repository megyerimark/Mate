import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

export interface GlyphWord {
  text: string;
  language: string;
}

interface SceneOptions {
  words: GlyphWord[];
  font: string;
  onWordChange: (index: number) => void;
  /** Ennyi ideig áll egy szó, ms. */
  holdMs?: number;
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uFade;
  attribute float aSeed;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + aSeed * 40.0);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * twinkle * (10.0 / -mv.z);
    vSeed = aSeed;
    vAlpha = uFade;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 1.8);
    vec3 color = mix(uColorA, uColorB, smoothstep(0.2, 0.9, vSeed));
    gl_FragColor = vec4(color, glow * vAlpha);
  }
`;

/**
 * Részecskefelhő, ami sorban a megadott szavak alakját veszi fel.
 * Egér közelében szétrebben, görgetéskor (setScatter) szétszóródik.
 */
export class GlyphScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(50, 1, 0.1, 100);
  private readonly material: ShaderMaterial;
  private readonly geometry = new BufferGeometry();
  private readonly dust: Points;

  private readonly count: number;
  private readonly positions: Float32Array;
  private readonly velocities: Float32Array;
  private readonly targets: Float32Array;
  private readonly seeds: Float32Array;

  private shapes: Float32Array[] = [];
  private wordIndex = 0;
  private lastSwitch = 0;
  private frame = 0;
  private running = false;
  private scatter = 0;
  private readonly mouse = { x: 9999, y: 9999, active: false };
  private readonly parallax = { x: 0, y: 0 };
  private viewW = 1;
  private viewH = 1;
  private readonly start = performance.now();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: SceneOptions,
  ) {
    const small = window.matchMedia('(max-width: 760px)').matches;
    this.count = small ? 2600 : 7000;

    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.set(0, 0, 10);

    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.targets = new Float32Array(this.count * 3);
    this.seeds = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      this.seeds[i] = Math.random();
      this.positions[i * 3] = (Math.random() - 0.5) * 30;
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    this.geometry.setAttribute('position', new BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aSeed', new BufferAttribute(this.seeds, 1));

    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uSize: { value: small ? 5.5 : 4.2 },
        uFade: { value: 1 },
        uColorA: { value: new Color('#c8ff2e') },
        uColorB: { value: new Color('#2ef2d0') },
      },
    });
    this.scene.add(new Points(this.geometry, this.material));

    // Háttérben lassan sodródó por a mélységérzethez.
    const dustCount = small ? 250 : 700;
    const dustPos = new Float32Array(dustCount * 3);
    const dustSeed = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 40;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      dustPos[i * 3 + 2] = -Math.random() * 20;
      dustSeed[i] = Math.random() * 0.4;
    }
    const dustGeo = new BufferGeometry();
    dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('aSeed', new BufferAttribute(dustSeed, 1));
    const dustMat = this.material.clone();
    dustMat.uniforms['uFade'].value = 0.35;
    this.dust = new Points(dustGeo, dustMat);
    this.scene.add(this.dust);

    this.resize();
  }

  /** Betűtípus betöltése után kell hívni, mert a szavak alakját a vászonra rajzolt szövegből mintázza. */
  build(): void {
    this.shapes = this.options.words.map((w) => this.sampleWord(w.text));
    this.applyShape(0);
    this.lastSwitch = performance.now();
    this.options.onWordChange(0);
  }

  play(): void {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.tick();
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  pause(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  /** 0 = szó összeállva, 1 = teljesen szétszórva (görgetés). */
  setScatter(value: number): void {
    this.scatter = Math.min(Math.max(value, 0), 1);
  }

  setPointer(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.mouse.x = (nx * this.viewW) / 2;
    this.mouse.y = (ny * this.viewH) / 2;
    this.mouse.active = true;
    this.parallax.x = nx;
    this.parallax.y = ny;
  }

  clearPointer(): void {
    this.mouse.active = false;
  }

  resize(): void {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.viewH = 2 * this.camera.position.z * Math.tan((this.camera.fov * Math.PI) / 360);
    this.viewW = this.viewH * this.camera.aspect;
    if (this.shapes.length) {
      this.shapes = this.options.words.map((w) => this.sampleWord(w.text));
      this.applyShape(this.wordIndex);
    }
  }

  dispose(): void {
    this.pause();
    this.geometry.dispose();
    this.material.dispose();
    this.dust.geometry.dispose();
    (this.dust.material as ShaderMaterial).dispose();
    this.renderer.dispose();
  }

  private sampleWord(text: string): Float32Array {
    const cw = 1200;
    const ch = 360;
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    let size = 300;
    ctx.font = `700 ${size}px ${this.options.font}`;
    const measured = ctx.measureText(text).width;
    if (measured > cw * 0.94) {
      size = Math.floor((size * cw * 0.94) / measured);
      ctx.font = `700 ${size}px ${this.options.font}`;
    }
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cw / 2, ch / 2);

    const data = ctx.getImageData(0, 0, cw, ch).data;
    const pts: number[] = [];
    const step = 3;
    for (let y = 0; y < ch; y += step) {
      for (let x = 0; x < cw; x += step) {
        if (data[(y * cw + x) * 4 + 3] > 128) pts.push(x, y);
      }
    }

    // A szó a látható szélesség kb. 80%-át töltse ki, mobilon többet.
    const small = this.viewW < this.viewH;
    const worldW = this.viewW * (small ? 0.95 : 0.72);
    const scale = worldW / cw;
    // A szó a képernyő felső részén álljon, ne takarja a címsort.
    const yOffset = small ? this.viewH * 0.2 : this.viewH * 0.22;
    const out = new Float32Array(this.count * 3);
    const n = pts.length / 2;
    for (let i = 0; i < this.count; i++) {
      const k = n ? Math.floor(Math.random() * n) : 0;
      const px = n ? pts[k * 2] : cw / 2;
      const py = n ? pts[k * 2 + 1] : ch / 2;
      out[i * 3] = (px - cw / 2 + (Math.random() - 0.5) * step) * scale;
      out[i * 3 + 1] = -(py - ch / 2 + (Math.random() - 0.5) * step) * scale + yOffset;
      out[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    return out;
  }

  private applyShape(index: number): void {
    this.wordIndex = index;
    this.targets.set(this.shapes[index]);
  }

  private nextWord(): void {
    const next = (this.wordIndex + 1) % this.shapes.length;
    this.applyShape(next);
    // Kis robbanás az átalakulás elején.
    for (let i = 0; i < this.count; i++) {
      this.velocities[i * 3] += (Math.random() - 0.5) * 0.35;
      this.velocities[i * 3 + 1] += (Math.random() - 0.5) * 0.35;
      this.velocities[i * 3 + 2] += (Math.random() - 0.2) * 0.5;
    }
    this.options.onWordChange(next);
  }

  private tick(): void {
    const now = performance.now();
    const t = (now - this.start) / 1000;
    if (this.shapes.length > 1 && now - this.lastSwitch > (this.options.holdMs ?? 3200)) {
      this.lastSwitch = now;
      this.nextWord();
    }

    const p = this.positions;
    const v = this.velocities;
    const tg = this.targets;
    const s = this.scatter;
    const radius = 1.6;
    const r2 = radius * radius;

    for (let i = 0; i < this.count; i++) {
      const ix = i * 3;
      const seed = this.seeds[i];
      // Görgetéskor a részecskék a kamera felé és szét repülnek.
      const tx = tg[ix] * (1 + s * (1.5 + seed * 3));
      const ty = tg[ix + 1] * (1 + s * (1 + seed * 2)) + Math.sin(t * 0.8 + seed * 20) * 0.04;
      const tz = tg[ix + 2] + s * (seed * 14 - 2);

      v[ix] += (tx - p[ix]) * 0.012;
      v[ix + 1] += (ty - p[ix + 1]) * 0.012;
      v[ix + 2] += (tz - p[ix + 2]) * 0.012;

      if (this.mouse.active) {
        const dx = p[ix] - this.mouse.x;
        const dy = p[ix + 1] - this.mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const f = (1 - d2 / r2) * 0.08;
          v[ix] += dx * f;
          v[ix + 1] += dy * f;
          v[ix + 2] += f * 2;
        }
      }

      v[ix] *= 0.9;
      v[ix + 1] *= 0.9;
      v[ix + 2] *= 0.9;
      p[ix] += v[ix];
      p[ix + 1] += v[ix + 1];
      p[ix + 2] += v[ix + 2];
    }
    (this.geometry.attributes['position'] as BufferAttribute).needsUpdate = true;

    this.material.uniforms['uTime'].value = t;
    this.material.uniforms['uFade'].value = 1 - s * 0.85;
    (this.dust.material as ShaderMaterial).uniforms['uTime'].value = t;
    this.dust.rotation.z = t * 0.01;
    this.dust.position.y = s * 3;

    this.camera.position.x += (this.parallax.x * 0.6 - this.camera.position.x) * 0.04;
    this.camera.position.y += (this.parallax.y * 0.4 - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
