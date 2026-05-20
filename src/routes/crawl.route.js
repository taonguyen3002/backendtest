import express from "express";
import {
  crawlFromSitemapController,
  convertCrawledContentController,
  fixInvalidSlugsController,
} from "../app/controllers/crawl.controller.js";

const router = express.Router();

// POST /api/crawl
router.patch("/crawl/clean", convertCrawledContentController);
router.post("/crawl", crawlFromSitemapController);
router.patch("/crawl/deleted", fixInvalidSlugsController);

export default router;
