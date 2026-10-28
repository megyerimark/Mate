// Az Angular buildet bemásolja a Laravel public mappájába, hogy egy tárhelyen fusson a kettő.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', 'frontend', 'browser');
const target = join(root, '..', 'backend', 'public');

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
