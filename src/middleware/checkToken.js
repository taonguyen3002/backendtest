import { getUserModel } from "../app/models/user.models.js";
import jwt from "jsonwebtoken";

const checkToken = {
  verifyUser: async (req, res, next) => {
    const User = getUserModel(req.db);
    const { JWT_SECRET } = req.app.locals.config;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không có token" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
      req.user = user; // gắn thông tin user vào request
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  },

  verifyAdmin: (req, res, next) => {
    checkToken.verifyUser(req, res, () => {
      if (req.user && req.user.role === "admin") {
        next();
      } else {
        return res.status(403).json({ message: "Access denied: Admins only" });
      }
    });
  },
};

export default checkToken;
