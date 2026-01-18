import express from "express";
import {
  getAllBlogsPublic,
  getBlogBySlug,
} from "../../controllers/common/BlogController";

const router = express.Router();

router.get("/blogs", getAllBlogsPublic);
router.get("/blogs/:slug", getBlogBySlug);

export default router;
