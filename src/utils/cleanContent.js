import * as cheerio from "cheerio";

/**
 * Làm sạch nội dung HTML trước khi lưu vào database
 * - Xóa quảng cáo, rating, script, style, shortcode WordPress, v.v.
 * - Giữ lại phần nội dung chính, hình ảnh, tiêu đề phụ, đoạn văn
 */
export function cleanContent(html) {
  if (!html) return "";

  const $ = cheerio.load(html);

  // 1️⃣ Xóa các phần tử theo class/id hay tag không mong muốn
  $(
    "figure , img , #comments , .post-sidebar, .post-views , .size-full ,#ez-toc-container , .heateor_sss_sharing_container , footer, header , .gizmo-bot-avatar , .rmp-rating-widget , .rmp-results-widget , .rating, .wp-block-rating, .review, .ads, .ad, .advertisement, script, style, iframe , .entry-header , .kk-star-ratings , .navigation-post"
  ).remove();

  // 2️⃣ Xóa các block plugin WordPress thường gặp
  $(".wp-block-embed, .wp-block-shortcode, .wp-block-gallery, .wp-block-social-links").remove();

  // 3️⃣ Xóa các comment HTML <!-- ... -->
  $("*")
    .contents()
    .each(function () {
      if (this.type === "comment") $(this).remove();
    });

  // 4️⃣ Xóa shortcode dạng [rating], [ads], [toc], [xyz param=...]
  let bodyHtml = $("body").html() || $.root().html();
  bodyHtml = bodyHtml.replace(/\[[^\]]+\]/g, "");

  // 5️⃣ Loại bỏ khoảng trắng thừa
  bodyHtml = bodyHtml.replace(/\s{2,}/g, " ").trim();

  return bodyHtml;
}
