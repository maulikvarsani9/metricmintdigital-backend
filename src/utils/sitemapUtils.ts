import { Request } from 'express';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

const DEFAULT_FRONTEND = 'https://metricmintdigital.com';

export const getFrontendBaseUrl = (): string => {
  return process.env.FRONTEND_URL?.replace(/\/$/, '') || DEFAULT_FRONTEND;
};

export const getBackendBaseUrl = (req?: Request): string => {
  const fromEnv = process.env.BACKEND_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (req) {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'localhost:4000';
    return `${protocol}://${host}`;
  }
  return DEFAULT_FRONTEND;
};

export const generateSitemapUrl = (
  loc: string,
  lastmod?: Date,
  priority: string = '0.9'
): string => {
  const lastmodStr = lastmod
    ? `<lastmod>${lastmod.toISOString()}</lastmod>`
    : '';
  return `
    <url>
      <loc>${loc}</loc>
      ${lastmodStr}
      <priority>${priority}</priority>
    </url>`;
};

export const generateSitemapXml = (urls: string[]): string => {
  const urlEntries = urls.join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
};

export const generateSitemapIndexXml = (
  sitemaps: Array<{ loc: string; lastmod?: Date }>
): string => {
  const sitemapEntries = sitemaps
    .map(
      sitemap =>
        `  <sitemap>
    <loc>${sitemap.loc}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod.toISOString()}</lastmod>` : ''}
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
};

export const compressToGzip = async (xml: string): Promise<Buffer> => {
  return gzip(xml, { level: 9 }) as Promise<Buffer>;
};
