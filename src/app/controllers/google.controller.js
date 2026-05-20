// const base64Credentials = process.env.GOOGLE_CREDENTIALS;
// import { getPostModel } from "../models/post.models.js";
// import { google } from "googleapis";

// if (!base64Credentials) {
//   throw new Error("Thiếu GOOGLE_CREDENTIALS_BASE64");
// }

// const key = JSON.parse(
//   Buffer.from(base64Credentials, "base64").toString("utf-8")
// );

// const SCOPES = ["https://www.googleapis.com/auth/indexing"];

// const jwtClient = new google.auth.JWT({
//   email: key.client_email,
//   key: key.private_key,
//   scopes: SCOPES,
// });

// const indexing = google.indexing({
//   version: "v3",
//   auth: jwtClient,
// });
// class GoogleController {
//   postIndexUrl = async (req, res) => {
//     const Post = getPostModel(req.db);
//     const config = req.app.locals.config; // lấy config theo domain
//     const { slug, type = "URL_UPDATED" } = req.body;
//     const url = `${config.DOMAIN}/blogs/${slug}`;
//     if (!url) {
//       return res.status(400).json({ message: "Thiếu URL cần index." });
//     }

//     try {
//       const response = await indexing.urlNotifications.publish({
//         requestBody: {
//           url,
//           type, // "URL_UPDATED" hoặc "URL_DELETED"
//         },
//       });
//       if (response.status !== 200) {
//         return res.status(response.status).json({
//           message: "Lỗi khi gửi yêu cầu index.",
//           error: response.data,
//         });
//       }
//       console.log("Đã gửi yêu cầu index:", response.data);
//       // Cập nhật trạng thái index trong cơ sở dữ liệu
//       const updateRes = await Post.updateOne(
//         { slug },
//         { $set: { isIndexed: true } }
//       );
//       if (updateRes.nModified === 0) {
//         console.warn(`Không tìm thấy bài viết với slug: ${slug}`);
//         return res.status(404).json({
//           message: `Không tìm thấy bài viết với slug: ${slug}`,
//         });
//       }
//       return res.status(200).json({
//         message: "Đã gửi yêu cầu index thành công.",
//         data: response.data,
//       });
//     } catch (error) {
//       console.error("Lỗi gửi Indexing API:", error); // Log toàn bộ error
//       return res.status(500).json({
//         message: "Lỗi gửi Indexing API",
//         error: error.message,
//         details: error,
//       });
//     }
//   };
// }
// export default new GoogleController();
