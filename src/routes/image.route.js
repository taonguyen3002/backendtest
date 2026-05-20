import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";
import Auth from "../middleware/checkToken.js";
import ImageController from "../app/controllers/image.controller.js";
// Tạo thư mục lưu trữ ảnh nếu chưa tồn tại
import { fileURLToPath } from "url";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../cloudinary/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });
router.get("/images", ImageController.getImage);
router.post(
  "/images",
  Auth.verifyAdmin,
  upload.single("image"),
  ImageController.uploadImage
);
router.delete("/images", Auth.verifyAdmin, ImageController.deleteImage);
export default router;
