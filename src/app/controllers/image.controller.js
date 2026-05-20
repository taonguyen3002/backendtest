import { getImageModel } from "../models/image.models.js";
import cloudinary from "../../../cloudinary/index.js";
class ImageController {
  // [GET] /api/images
  getImage = async (req, res, next) => {
    const Image = getImageModel(req.db);
    try {
      const image = await Image.find({}, "filePath");
      res.status(200).json({
        success: true,
        images: image,
      });
    } catch (error) {
      next(error);
    }
  };
  // [POST] /api/images
  uploadImage = async (req, res, next) => {
    const Image = getImageModel(req.db);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const publicId = req.file.filename;
      const filePath = req.file.path;
      const image = new Image({ filePath, publicId });
      await image.save();

      res.json({
        success: true,
        message: "Upload thành công!",
        imageUrl: filePath,
        cloudinaryId: publicId,
      });
    } catch (error) {
      next(error);
    }
  };
  deleteImage = async (req, res) => {
    const Image = getImageModel(req.db);
    try {
      const _id = req.query._id;

      if (!_id) {
        return res.status(400).json({
          message: "Thiếu _id ảnh cần xóa",
          success: false,
        });
      }

      // Tìm ảnh trong DB để lấy publicId
      const deletedImage = await Image.findByIdAndDelete(_id);

      if (!deletedImage) {
        return res.status(404).json({
          message: "Ảnh không tồn tại",
          success: false,
        });
      }

      // Xóa ảnh trên Cloudinary nếu có publicId
      if (deletedImage.publicId) {
        await cloudinary.uploader.destroy(deletedImage.publicId);
      }

      return res.status(200).json({
        message: "Xóa ảnh thành công",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Lỗi server khi xóa ảnh",
        success: false,
        error: error.message,
      });
    }
  };
}
export default new ImageController();
