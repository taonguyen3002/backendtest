import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Crawl 1 bài viết từ URL cụ thể.
 * Tuỳ chỉnh các selector bên dưới để khớp với website cần crawl.
 */
export async function crawlArticleData(url) {
  try {
    const { data } = await axios.get(url, { timeout: 20000 });
    const $ = cheerio.load(data);

    const title = $("title").text().trim() || $("h1").first().text().trim();

    const description = $('meta[name="description"]').attr("content") || "";
    const content =
      $(
        " .news-left , .single-page  , .entry-content, .post-content , .content-main , .content-format , #content"
      ).html() || "";
    const image = $("meta[property='og:image']").attr("content") || $("img").first().attr("src") || "";

    const slug = url.split("/").filter(Boolean).pop();

    return { title, description, content, image, slug, sourceUrl: url };
  } catch (error) {
    console.error("❌ Lỗi khi crawl:", url, error.message);
    return null;
  }
}
