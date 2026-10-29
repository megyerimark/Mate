// Az Angular buildet bemásolja a Laravel public mappájába, hogy egy tárhelyen fusson a kettő.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', 'frontend', 'browser');
// A Laravel projekt mappája: BACKEND_DIR környezeti változó, vagy a mellette lévő mate_back / backend mappa.
const candidates = [process.env.BACKEND_DIR, join(root, '..', 'mate_back'), join(root, '..', 'backend')].filter(Boolean);
const backend = candidates.find((dir) => existsSync(join(dir, 'artisan')));
if (!backend) {
  console.error('Nem találom a Laravel projektet. Add meg az útvonalát: BACKEND_DIR=../mate_back npm run build:backend');
  process.exit(1);
}
const target = join(backend, 'public');

if (!existsSync(dist)) {
  console.error('Nincs build. Futtasd előbb: npm run build');
  process.exit(1);
}

// A korábbi build hash-elt fájljainak törlése (a Laravel saját fájljaihoz nem nyúl).
for (const name of readdirSync(target)) {
  if (/^(main|chunk|polyfills|styles)-[A-Z0-9]+\.(js|css)$/.test(name)) {
    rmSync(join(target, name));
  }
}

cpSync(dist, target, { recursive: true });
console.log(`Frontend bemásolva ide: ${target}`);
