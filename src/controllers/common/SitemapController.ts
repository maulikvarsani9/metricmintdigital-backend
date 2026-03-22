import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { Blog } from '../../models';
import {
  getFrontendBaseUrl,
  getBackendBaseUrl,
  generateSitemapUrl,
  generateSitemapXml,
  generateSitemapIndexXml,
  compressToGzip,
} from '../../utils/sitemapUtils';
import { sitemapCache } from '../../utils/sitemapCache';

export class SitemapController {
  getSitemapIndex = asyncHandler(async (req: Request, res: Response) => {
    const backendUrl = getBackendBaseUrl(req);
    const cacheKey = 'sitemap-index';

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    });

    const cached = await sitemapCache.get(cacheKey);
    if (cached) {
      return res.send(cached.toString());
    }

    const sitemaps = [
      {
        loc: `${backendUrl}/api/sitemap/sitemap-blogs-p9r1y6g0p3.xml.gz`,
        lastmod: new Date(),
      },
    ];

    const xml = generateSitemapIndexXml(sitemaps);
    const xmlBuffer = Buffer.from(xml, 'utf-8');
    await sitemapCache.set(cacheKey, xmlBuffer);

    return res.send(xml);
  });

  getBlogsSitemap = asyncHandler(async (req: Request, res: Response) => {
    const frontendUrl = getFrontendBaseUrl();
    const cacheKey = 'sitemap-blogs';

    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    const cached = await sitemapCache.get(cacheKey);
    if (cached) {
      res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="sitemap-blogs-p9r1y6g0p3.xml.gz"`,
        'Content-Length': cached.length.toString(),
      });
      return res.end(cached, 'binary');
    }

    const blogs = await Blog.find({})
      .select('slug updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    const urls = blogs.map(blog => {
      const lastmod = blog.updatedAt || new Date();
      return generateSitemapUrl(
        `${frontendUrl}/blogs/${blog.slug}`,
        lastmod,
        '0.9'
      );
    });

    const xml = generateSitemapXml(urls);
    const compressed = await compressToGzip(xml);

    await sitemapCache.set(cacheKey, compressed);

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="sitemap-blogs-p9r1y6g0p3.xml.gz"`,
      'Content-Length': compressed.length.toString(),
    });
    return res.end(compressed, 'binary');
  });

  invalidateCache = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.body;

    if (type) {
      await sitemapCache.invalidate(type);
      return res.json({
        success: true,
        message: `Cache invalidated for type: ${type}`,
      });
    }

    await sitemapCache.clear();
    return res.json({
      success: true,
      message: 'All sitemap cache cleared',
    });
  });
}
