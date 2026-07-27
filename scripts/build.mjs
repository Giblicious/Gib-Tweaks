import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

await build({
  stdin: {
    contents: fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8'),
    resolveDir: path.join(root, 'src'),
    sourcefile: 'main.js',
    loader: 'js',
  },
  outfile: path.join(root, 'main.js'),
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2020',
  external: ['obsidian'],
  legalComments: 'none',
  logLevel: 'warning',
});
