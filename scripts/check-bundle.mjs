import { readdir, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve('dist/assets');
const files = await readdir(root);
const assets = await Promise.all(files.map(async name => {
  const path = resolve(root, name);
  const data = await (await import('node:fs/promises')).readFile(path);
  return { name, ext: extname(name), bytes: data.length, gzipBytes: gzipSync(data).length };
}));
const js = assets.filter(a => a.ext === '.js');
const css = assets.filter(a => a.ext === '.css');
const sum = items => items.reduce((total, item) => total + item.gzipBytes, 0);
const jsGzip = sum(js);
const cssGzip = sum(css);
console.log(`JS assets: ${js.length}; gzip total ${Math.round(jsGzip / 1024)} KiB (limit 350 KiB)`);
console.log(`CSS assets: ${css.length}; gzip total ${Math.round(cssGzip / 1024)} KiB (limit 100 KiB)`);
if (!js.length || !css.length) throw new Error('Expected at least one JavaScript and CSS build asset.');
if (jsGzip > 350 * 1024) throw new Error('JavaScript gzip budget exceeded.');
if (cssGzip > 100 * 1024) throw new Error('CSS gzip budget exceeded.');
