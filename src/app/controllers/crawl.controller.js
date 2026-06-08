import axios from "axios";
import { parseStringPromise } from "xml2js";
import pLimit from "p-limit";
import { crawlArticleData } from "../../utils/crawlHelper.js";
import { getPostModel } from "../models/post.models.js";
import { getSettingModel } from "../models/setting.models.js";
import { cleanContent } from "../../utils/cleanContent.js";
import converSlug from "../../utils/convertSlug.js";
import { getImageModel } from "../models/image.models.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Crawl bài viết từ sitemap và lưu vào database.
 * Gọi qua API: POST /api/crawl
 */
export const crawlFromSitemapController = async (req, res) => {
  const { url: customUrl, defautphone } = req.body || {};
  const sitemapUrl = customUrl;

  if (!sitemapUrl) {
    return res.status(400).json({ success: false, message: "Thiếu URL sitemap" });
  }

  const db = req.db;
  const Post = getPostModel(db);
  const Setting = getSettingModel(db);
  const Image = getImageModel(db);

  const limit = pLimit(5); // giới hạn 5 request song song
  console.log(`🚀 Đang phân tích sitemap: ${sitemapUrl}`);
  try {
    //bắt đầu lấy ảnh từ database - lưu vào mảng
    const images = await Image.find({});
    const imageUrls = images.map((img) => img.filePath);
    console.log(`📸 Lấy được ${imageUrls.length} ảnh từ database.`);
    // 🧭 Lấy toàn bộ URL từ sitemap
    async function getUrlsFromSitemap(sitemapUrl) {
      try {
        const { data } = await axios.get(sitemapUrl);
        const parsed = await parseStringPromise(data);

        if (parsed.sitemapindex) {
          const sitemaps = parsed.sitemapindex.sitemap.map((s) => s.loc[0]);
          console.log(`📂 Sitemap chính chứa ${sitemaps.length} sitemap con.`);
          let allUrls = [];
          for (const sm of sitemaps) {
            const urls = await getUrlsFromSitemap(sm);
            allUrls = [...allUrls, ...urls];
          }
          return allUrls;
        }

        // Sitemap bài viết
        const urls = parsed.urlset.url.map((item) => item.loc[0]);
        return urls;
      } catch (err) {
        console.error("❌ Lỗi đọc sitemap:", sitemapUrl, err.message);
        return [];
      }
    }

    // 🧩 Bắt đầu crawl
    const urls = await getUrlsFromSitemap(sitemapUrl);
    console.log(`🔍 Tìm thấy ${urls.length} bài viết.`);
    let count = 0;
    await Promise.all(
      urls.map((url) =>
        limit(async () => {
          try {
            const slug = url.split("/").filter(Boolean).pop();
            const existing = await Post.findOne({ slug });
            if (existing) {
              console.log(`⏩ Bỏ qua (đã có): ${url}`);
              return;
            }

            const data = await crawlArticleData(url);

            if (!data?.title || !data?.content) {
              console.log(`⚠️ Bỏ qua (thiếu dữ liệu): ${url}`);
              return;
            }
            // 🖼️ Ưu tiên ảnh trong DB trước
            let finalImageUrl = "";
            if (imageUrls.length > 0) {
              const randomIndex = Math.floor(Math.random() * imageUrls.length);
              finalImageUrl = imageUrls[randomIndex];
              console.log(`🎲 Dùng ảnh ngẫu nhiên từ DB cho: ${data.title}`);
            } else if (data.image) {
              finalImageUrl = data.image;
              console.log(`🖼️ Dùng ảnh từ bài viết: ${data.image}`);
            } else {
              // fallback favicon nếu không có gì
              try {
                const siteOrigin = new URL(url).origin;
                finalImageUrl = `${siteOrigin}/favicon.ico`;
                console.log(`🔁 Fallback ảnh từ website: ${finalImageUrl}`);
              } catch {
                finalImageUrl = "";
              }
            }
            // Tạo bài viết
            const post = new Post({
              title: data.title,
              description: data.description || data.title,
              slug: converSlug(data.title) || data.slug,
              content: cleanContent(data.content),
              authorName: "Tổng Đài Đặt Xe",
              authorUrl: "/profile/6905c52e88aabc72ed51aa47",
              publishedDate: new Date(),
              image: {
                url: finalImageUrl,
                alt: data.title || "",
              },
              tags: data.tags || ["grab", "taxi", "đặt taxi"],
              likes: [],
              breadcrumbs: [{ name: "Trang Chủ", url: "/" }],
            });

            await post.save();
            count++;
            console.log(`✅ Lưu thành công: ${data.title}`);

            // Nếu có default phone thì lưu Setting
            if (defautphone) {
              await new Setting({
                slug: post.slug,
                numberphone: defautphone,
              }).save();
              console.log(`✅ Config phone: ${data.title}`);
            }
          } catch (err) {
            console.error("❌ Lỗi khi crawl:", url, err.message);
          }
        }),
      ),
    );

    return res.status(200).json({
      success: true,
      message: `Crawl hoàn tất ${count} bài viết mới.`,
    });
  } catch (err) {
    console.error("❌ Lỗi tổng:", err);
    return res.status(500).json({ success: false, message: "Lỗi crawl sitemap" });
  }
};

export const convertCrawledContentController = async (req, res) => {
  const Post = getPostModel(req.db);
  const config = req.app.locals.config;
  try {
    const cursor = Post.find({}).select("title content slug").cursor();

    let updatedCount = 0;

    for await (const post of cursor) {
      const cleanedContent = cleanContent(post.content);
      if (cleanedContent !== post.content) {
        post.content = cleanedContent;
        await post.save();
        updatedCount++;
        try {
          // await fetch(`${config.DOMAIN}/api/revalidate/post?slug=${post.slug}&secret=${process.env.REVALIDATE_SECRET}`);
          console.log("✅ Vercal render:", post.title);
        } catch (err) {
          console.error("Revalidate error:", err);
        }
        console.log(`✅ Cập nhật bài viết: ${post.title}`);
      } else {
        console.log(`⏩ Bài viết không cần cập nhật: ${post.title}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật nội dung sạch cho ${updatedCount} bài viết.`,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật nội dung:", err);
    return res.status(500).json({ success: false, message: "Lỗi cập nhật nội dung" });
  }
};

export const fixInvalidSlugsController = async (req, res) => {
  const Post = getPostModel(req.db);
  try {
    // Regex tìm slug chứa số điện thoại có dấu chấm, ví dụ: 0933.551.965
    const invalidPosts = await Post.find({ slug: /\d+\.\d+\.\d+/ });

    if (invalidPosts.length === 0) {
      return res.status(200).json({ success: true, message: "Không tìm thấy slug không hợp lệ." });
    }

    let updatedCount = 0;

    // Duyệt qua từng bài viết và sửa slug
    for (const post of invalidPosts) {
      const fixedSlug = post.slug.replace(/(\d+)\.(\d+)\.(\d+)/g, "$1-$2-$3");

      // Cập nhật slug mới nếu khác
      if (fixedSlug !== post.slug) {
        post.slug = fixedSlug;
        await post.save();
        updatedCount++;
      }
    }

    console.log(`Đã sửa ${updatedCount} slug không hợp lệ.`);
    return res.status(200).json({
      success: true,
      message: `Đã sửa ${updatedCount} slug không hợp lệ.`,
      count: updatedCount,
    });
  } catch (error) {
    console.error("Lỗi khi sửa slug:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi sửa slug" });
  }
};
