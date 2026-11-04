// Build a file:// snapshot without changing models, confidence thresholds or reader decisions.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..'), docs = path.join(root, 'docs'), out = path.join(docs, 'file');
await fs.mkdir(path.join(out, 'assets'), { recursive: true });
const hash = value => createHash('sha256').update(value).digest('hex');
const modules = ['bench-canon', 'neural-confidence', 'combined-confidence', 'vss-confidence', 'vote-confidence', 'vss-formalizer', 'clarify'];
await build({
  stdin: { contents: modules.map((name, i) => `import * as m${i} from ${JSON.stringify(path.join(docs, 'js', name + '.js'))};`).join('\n') +
    '\nglobalThis.SOPFileModules = {' + modules.map((name, i) => `${JSON.stringify('js/' + name + '.js')}:m${i}`).join(',') + '};',
    resolveDir: root, sourcefile: 'file-entry.js', loader: 'js' },
  outfile: path.join(out, 'modules.js'), bundle: true, format: 'iife', platform: 'browser', target: 'es2022',
  plugins: [{ name: 'original-module-urls', setup(b) {
    b.onLoad({ filter: /\.js$/ }, async args => ({ loader: 'js', contents: (await fs.readFile(args.path, 'utf8'))
      .replaceAll('import.meta.url', `new URL(${JSON.stringify(path.relative(docs, args.path).split(path.sep).join('/'))}, document.baseURI).href`) }));
  } }]
});
const ui = await fs.readFile(path.join(docs, 'js/ui.js'), 'utf8');
let replacements = 0;
const localUI = ui.replace(/import\(new URL\('([^']+)', document\.baseURI\)\.href\)/g, (_, name) => {
  if (!modules.some(m => name === 'js/' + m + '.js')) throw new Error('Unpackaged UI module: ' + name);
  replacements++; return `Promise.resolve(SOPFileModules[${JSON.stringify(name)}])`;
});
if (!replacements || /import\(new URL/.test(localUI)) throw new Error('Unresolved dynamic UI import');
await fs.writeFile(path.join(out, 'ui.js'), localUI);
const manifest = { builtAt: new Date().toISOString(), uiSha256: hash(ui), files: {} };
async function collect(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) { await collect(source); continue; }
    if (!entry.isFile()) continue;
    const key = path.relative(docs, source).split(path.sep).join('/'), bytes = await fs.readFile(source);
    const sha256 = hash(bytes), script = 'assets/' + hash(key + '\0' + sha256).slice(0, 24) + '.js';
    await fs.writeFile(path.join(out, script), `SOPLocalData(${JSON.stringify(key)},${JSON.stringify(bytes.toString('base64'))});\n`);
    manifest.files[key] = { script, bytes: bytes.length, sha256,
      type: key.endsWith('.json') ? 'application/json' : key.endsWith('.bin') || key.endsWith('.onnx') ? 'application/octet-stream' : 'text/plain;charset=utf-8' };
  }
}
await collect(path.join(docs, 'model'));
await collect(path.join(docs, 'examples'));
await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile(path.join(out, 'manifest.js'), 'globalThis.SOPLocalManifest=' + JSON.stringify(manifest) + ';\n');
await fs.copyFile(path.join(here, 'runtime.js'), path.join(out, 'runtime.js'));
let html = await fs.readFile(path.join(docs, 'index.html'), 'utf8');
html = html.replace('<head>', '<head>\n<base href="../">\n<script src="file/manifest.js"></script>\n<script src="file/runtime.js"></script>')
  .replace('<script src="js/file-bootstrap.js"></script>', '')
  .replace('<script src="js/reader-entry.js"></script>', '<script src="file/modules.js"></script><script src="file/ui.js"></script>')
  .replace('</body>', `<script>document.querySelector('title').textContent += ' · local snapshot'; console.info('Local snapshot built ' + SOPLocalManifest.builtAt + '. Rebuild after model or source changes. Transformers.js and its WASM runtime still require internet.');</script>\n</body>`);
await fs.writeFile(path.join(out, 'index.html'), html);
await fs.writeFile(path.join(out, 'build-info.js'), `globalThis.SOPFileBuild=${JSON.stringify({ builtAt: manifest.builtAt })};\n`);
console.log(`Built ${Object.keys(manifest.files).length} local assets in ${out}. Open docs/index.html or docs/file/index.html using file://. External Transformers.js/WASM still need internet.`);
