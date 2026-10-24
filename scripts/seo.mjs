import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const mode = process.argv[2] ?? 'pre';
const raw = process.env.SITE_URL?.trim();

if (!raw) {
  console.warn('SITE_URL is not set; keeping the generic robots.txt and skipping absolute sitemap/canonical generation.');
  process.exit(0);
}

let site;
try {
  site = new URL(raw);
  if (site.protocol !== 'https:' || site.pathname !== '/' || site.search || site.hash) {
    throw new Error('SITE_URL must be the HTTPS origin only, e.g. https://your-site.netlify.app');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Invalid SITE_URL');
  process.exit(1);
}
const origin = site.origin;
const root = resolve(process.cwd());

if (mode === 'pre') {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
  await writeFile(resolve(root, 'public/sitemap.xml'), sitemap, 'utf8');
  await writeFile(resolve(root, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, 'utf8');
  console.log(`Generated sitemap and robots.txt for ${origin}`);
} else if (mode === 'post') {
  const indexPath = resolve(root, 'dist/index.html');
  let html = await readFile(indexPath, 'utf8');
  html = html.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/>/g, '');
  html = html.replace('</head>', `    <link rel="canonical" href="${origin}/" />\n  </head>`);
  await writeFile(indexPath, html, 'utf8');
  console.log(`Added canonical URL for ${origin}`);
} else {
  console.error('Usage: node scripts/seo.mjs pre|post');
  process.exit(1);
}
