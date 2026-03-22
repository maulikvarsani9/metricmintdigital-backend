import { Router, Request, Response, NextFunction } from 'express';
import { SitemapController } from '../../controllers/common/SitemapController';

const router = Router();
const sitemapController = new SitemapController();

const allowCors = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
};

router.use(allowCors);

router.get('/sitemap-p9r1y6g0p3.xml', sitemapController.getSitemapIndex);
router.get(
  '/sitemap-blogs-p9r1y6g0p3.xml.gz',
  sitemapController.getBlogsSitemap
);
router.post('/invalidate', sitemapController.invalidateCache);

export default router;
