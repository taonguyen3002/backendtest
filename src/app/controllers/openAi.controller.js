// import buildMetaPrompt from "../../helpers/openAi/buildMeta.helppers.js";
// import buildBatchSectionPrompt from "../../helpers/openAi/buildSection.helppers.js";
// import buildTagsPrompt from "../../helpers/openAi/buildTag.helppers.js";
// import callGPT from "../../helpers/openAi/callOpenAi.helppers.js";
// import callGeminiAi from "../../helpers/geminiAi/callGeminiAi.helppers.js";
// import { getTransaction } from "../models/transaction.model.js";
// import {
//   descriptionbuild,
//   contentbuild,
//   outlinebuild,
//   slugbuild,
//   tagsbuild,
// } from "../../helpers/buildPrompt/buildprompt.helppers.js";
// import normalizeTags from "../../helpers/func/normalizeTags.helppers.js";

// class OpenAiController {
//   async generatePost(req, res) {
//     const cost = 4500;
//     const Transaction = getTransaction(req.db);

//     // Lấy config từ server
//     const {
//       DOMAIN: domain,
//       PROMPT: promptCustom,
//       numberWord,
//     } = req.app.locals.config || {};

//     // Validate input trước khi trừ tiền
//     const { keyword } = req.body;
//     if (!keyword || !domain) {
//       return res.status(400).json({ message: "Thiếu keyword hoặc domain" });
//     }

//     try {
//       const user = req.user; // đã được middleware checkToken.verifyUser gắn vào

//       if (user.balance < cost) {
//         return res.status(400).json({ message: "Số dư không đủ" });
//       }
//       // 1️⃣ Tạo metadata (title, description, tags, outline, slug)
//       const metaPrompt = buildMetaPrompt(numberWord, keyword, promptCustom);
//       const metaText = await callGPT(metaPrompt);

//       let meta;
//       try {
//         meta = JSON.parse(metaText);
//       } catch (parseErr) {
//         // Throw để vào catch bên ngoài -> rollback
//         throw new Error(
//           "Lỗi parse metadata: " + String(metaText).slice(0, 200)
//         );
//       }

//       // Kiểm tra outline cơ bản
//       if (!meta || !Array.isArray(meta.outline) || meta.outline.length === 0) {
//         throw new Error("Metadata thiếu outline hoặc outline rỗng");
//       }

//       // 2️⃣ Build tags (ép parse JSON nếu trả về string)
//       const tagPrompt = buildTagsPrompt(keyword);
//       const tagsRaw = await callGPT(tagPrompt);

//       let tagsBuild;
//       try {
//         if (typeof tagsRaw === "string") {
//           // Có thể GPT trả plain text array (vd: ["a","b"]) hoặc list. Thử parse JSON trước.
//           // Nếu không parse được, cố gắng chuyển format: loại bỏ backticks rồi parse.
//           const cleaned = tagsRaw
//             .trim()
//             .replace(/```json|```/g, "")
//             .trim();
//           tagsBuild = JSON.parse(cleaned);
//         } else {
//           tagsBuild = tagsRaw;
//         }
//       } catch (err) {
//         // Nếu parse JSON thất bại, cố gắng parse bằng regex tìm [...]:
//         try {
//           const maybe = String(tagsRaw).match(/\[.*\]/s);
//           if (maybe) {
//             tagsBuild = JSON.parse(maybe[0]);
//           } else {
//             throw err;
//           }
//         } catch (err2) {
//           throw new Error(
//             "Parse tags thất bại: " + String(tagsRaw).slice(0, 300)
//           );
//         }
//       }

//       if (!Array.isArray(tagsBuild)) {
//         throw new Error(
//           "Tags trả về không phải array: " + JSON.stringify(tagsBuild)
//         );
//       }
//       // Bắt đầu MongoDB session
//       const session = await req.db.startSession();
//       session.startTransaction();

//       try {
//         // Trừ tiền và ghi log giao dịch trong transaction
//         user.balance -= cost;
//         await user.save({ session });

//         await Transaction.create(
//           [
//             {
//               userId: user._id,
//               amount: -cost,
//               type: "ai_write",
//               meta: { keyword },
//             },
//           ],
//           { session }
//         );

//         // 3️⃣ Viết tất cả section (batch)
//         const batchPrompt = buildBatchSectionPrompt(
//           meta.outline,
//           keyword,
//           domain,
//           numberWord
//         );
//         const batchText = await callGPT(batchPrompt);

//         let sections;
//         try {
//           const parsed = JSON.parse(batchText);
//           sections = parsed.sections;
//         } catch (err) {
//           // Cố gắng lấy array trong text (nếu model trả thêm text)
//           try {
//             const maybe = String(batchText).match(/\{[\s\S]*\}/);
//             if (maybe) {
//               const parsed = JSON.parse(maybe[0]);
//               sections = parsed.sections;
//             } else {
//               throw err;
//             }
//           } catch (err2) {
//             throw new Error(
//               "Lỗi parse sections: " + String(batchText).slice(0, 200)
//             );
//           }
//         }

//         if (!Array.isArray(sections) || sections.length === 0) {
//           throw new Error("Sections không hợp lệ hoặc rỗng");
//         }

//         // Ghép nội dung
//         const fullContent = sections
//           .map((sec) => sec.content || "")
//           .join("\n\n");

//         // Commit transaction khi tất cả đã OK
//         await session.commitTransaction();

//         // End session sau commit
//         session.endSession();

//         // Trả kết quả
//         return res.status(200).json({
//           message: "Tạo bài viết thành công",
//           balance: user.balance,
//           result: {
//             title: meta.title,
//             description: meta.description,
//             tags: tagsBuild,
//             slug: meta.slug,
//             content: fullContent,
//           },
//           success: true,
//         });
//       } catch (errInner) {
//         // Nếu đang trong transaction => rollback
//         if (session.inTransaction && session.inTransaction()) {
//           try {
//             await session.abortTransaction();
//           } catch (e) {
//             console.error("Lỗi khi abortTransaction:", e);
//           }
//         }
//         // Always end session
//         try {
//           session.endSession();
//         } catch (e) {
//           console.error("Lỗi khi endSession:", e);
//         }

//         console.error("Lỗi trong generatePost:", errInner);
//         return res.status(500).json({
//           message: "Lỗi tạo bài viết",
//           error: errInner.message,
//         });
//       }
//     } catch (error) {
//       console.error("Lỗi server generatePost:", error);
//       return res
//         .status(500)
//         .json({ message: "Lỗi server", error: error.message });
//     }
//   }
//   async create(req, res) {
//     const cost = 4500;
//     const Transaction = getTransaction(req.db);

//     const { DOMAIN: domain, PROMPT: promptCustom } =
//       req.app.locals.config || {};
//     const { keyword } = req.body;

//     if (!keyword || !domain) {
//       return res.status(400).json({ message: "Thiếu keyword hoặc domain" });
//     }

//     try {
//       const user = req.user;

//       if (user.balance < cost) {
//         return res.status(400).json({ message: "Số dư không đủ" });
//       }

//       // 🔹 Tạo dữ liệu AI trước khi vào transaction
//       const [description, outline, slug, tags] = await Promise.all([
//         callGeminiAi(descriptionbuild(keyword)),
//         callGPT(outlinebuild(keyword)),
//         callGeminiAi(slugbuild(keyword)),
//         callGeminiAi(tagsbuild(keyword)),
//       ]);

//       const tagsArr = normalizeTags(tags);
//       const content = await callGPT(contentbuild(outline, promptCustom));

//       // 🔹 Sau khi có kết quả AI -> mới bắt đầu transaction
//       const session = await req.db.startSession();
//       session.startTransaction();

//       try {
//         user.balance -= cost;
//         await user.save({ session });

//         await Transaction.create(
//           [
//             {
//               userId: user._id,
//               amount: -cost,
//               type: "ai_write",
//               meta: { keyword },
//             },
//           ],
//           { session }
//         );

//         await session.commitTransaction();
//         session.endSession();

//         return res.status(200).json({
//           message: "Tạo bài viết thành công",
//           balance: user.balance,
//           result: {
//             title: keyword,
//             description,
//             tags: tagsArr,
//             slug,
//             content,
//           },
//           success: true,
//         });
//       } catch (errTx) {
//         if (session.inTransaction()) {
//           await session.abortTransaction();
//         }
//         session.endSession();

//         console.error("Lỗi trong transaction:", errTx);
//         return res
//           .status(500)
//           .json({ message: "Lỗi tạo bài viết", error: errTx.message });
//       }
//     } catch (error) {
//       console.error("Lỗi server generatePost:", error);
//       return res
//         .status(500)
//         .json({ message: "Lỗi server", error: error.message });
//     }
//   }
// }

// export default new OpenAiController();
