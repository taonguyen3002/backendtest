import { getOrderModel } from "../models/order.models.js";
import { sendOrderToDiscord as sendToDiscord } from "../../helpers/discord/index.js";
import { sendOrderToTelegram } from "../../helpers/telegram/index.js";
class OrtherController {
  createOrder = async (req, res) => {
    const Booking = getOrderModel(req.db);
    const config = req.app.locals.config;
    const DISCORD_WEBHOOK_URL = config.DISCORD_WEBHOOK;

    try {
      const { userId, visitorId, ...dataBooking } = req.body;
      const { addressFrom, addressTo, serviceType, phoneNumber, additionalInfo } = dataBooking;

      const dataSend = { ...dataBooking, DISCORD_WEBHOOK_URL };

      // Check thông tin bắt buộc
      if (!addressFrom || !phoneNumber) {
        return res.status(400).json({ message: "error", err: "Thiếu thông tin bắt buộc." });
      }

      // Gửi Telegram
      await sendOrderToTelegram(dataBooking);
      // Gửi Discord (1 lần duy nhất)
      await sendToDiscord(dataSend);

      // Nếu chưa đăng nhập → lưu bằng visitorId
      if (!userId) {
        if (!visitorId) {
          return res.status(400).json({
            message: "error",
            err: "Thiếu visitorId",
          });
        }

        const newBooking = new Booking({
          ...dataBooking,
          visitorId,
        });

        const savedBooking = await newBooking.save();

        return res.status(201).json({
          message: "success",
          booking: savedBooking,
        });
      }

      // Nếu có userId → kiểm tra xem visitorId đã có record chưa
      let existingBooking = null;
      if (visitorId) {
        existingBooking = await Booking.findOne({ visitorId });
      }

      if (existingBooking) {
        // Nếu tồn tại visitorId thì cập nhật sang userId
        existingBooking.userId = userId;
        await existingBooking.save();

        return res.status(200).json({
          message: "success",
          booking: existingBooking,
        });
      } else {
        // Nếu chưa có visitorId thì tạo mới với userId
        const newBooking = new Booking({
          ...dataBooking,
          userId,
        });

        const savedBooking = await newBooking.save();

        return res.status(201).json({
          message: "success",
          booking: savedBooking,
        });
      }
    } catch (error) {
      console.error("Lỗi tạo đơn đặt xe:", error);
      return res.status(500).json({ message: "error", err: "Lỗi server, vui lòng thử lại sau." });
    }
  };

  // [POST] /booking/get-all/history
  readOrder = async (req, res) => {
    const Booking = getOrderModel(req.db);
    try {
      const { userId, visitorId } = req.body;

      if (!userId && !visitorId) {
        console.log("invalid Id:", userId, visitorId);
        return res.status(400).json({ message: "error", err: "invalid Id" });
      }

      let query = {};

      // Nếu có cả userId và visitorId thì lấy dữ liệu gộp
      if (userId && visitorId) {
        query = { $or: [{ userId }, { visitorId }] };
      } else if (userId) {
        query = { userId };
      } else {
        query = { visitorId };
      }

      const history = await Booking.find(query)
        .select("addressFrom addressTo createdAt serviceType status _id rating visitorId userId")
        .sort({ createdAt: -1 });

      return res.status(200).json({ message: "success", err: "", history });
    } catch (error) {
      console.error("Lỗi lấy lịch sử đặt xe:", error);
      return res.status(500).json({ message: "error", err: "server error" });
    }
  };

  readAllOrder = async (req, res) => {
    const Booking = getOrderModel(req.db);
    try {
      const result = await Booking.find({}).populate("userId", "username");

      return res.status(200).json({
        success: true,
        message: "success",
        result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "server error",
        result: [],
      });
    }
  };
  // [DELETE] /booking/delete?id=${id}
  deleteOrderById = async (req, res) => {
    const Booking = getOrderModel(req.db);
    const _id = req.query.id;
    if (!_id) {
      console.log("can't id:", _id);
      return res.status(404).json({
        success: false,
        message: "not found",
        err: "can't receiver id",
      });
    }
    try {
      const result = await Booking.findByIdAndDelete(_id).exec();
      res.status(200).json({
        success: true,
        message: "success",
        err: "",
      });
    } catch (error) {
      console.log("server err:", error);
      return res.status(500).json({
        success: false,
        message: "server error",
        err: "500 server err",
      });
    }
  };
  // [PUT] /booking/update?id=${id}
  updateOrder = async (req, res) => {
    const Booking = getOrderModel(req.db);
    const _id = req.query.id;
    if (!_id) {
      console.log("can't receiver data:", _id);
      return res.status(404).json({
        success: false,
        message: "not found",
      });
    }
    try {
      const orther = req.body;

      Object.keys(orther).forEach((key) => orther[key] === undefined && delete orther[key]);
      await Booking.findByIdAndUpdate(_id, orther);
      return res.status(200).json({
        success: true,
        message: "success",
      });
    } catch (error) {
      console.log("500 err :", error);
      return res.status(500).json({
        success: false,
        message: "server err",
      });
    }
  };
}

export default new OrtherController();
