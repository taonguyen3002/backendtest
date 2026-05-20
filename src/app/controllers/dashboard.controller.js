import { getUserModel } from "../models/user.models.js";
import { getPostModel } from "../models/post.models.js";
import { getOrderModel } from "../models/order.models.js";
import { getTrafficModel } from "../models/traffic.models.js";
import { getTransaction } from "../models/transaction.model.js";

class DashboardController {
  getStats = async (req, res) => {
    const Traffic = getTrafficModel(req.db);
    const Post = getPostModel(req.db);
    const Order = getOrderModel(req.db);
    const Transaction = getTransaction(req.db);
    const User = getUserModel(req.db);
    try {
      // Thống kê tổng quan
      const stats = await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Order.countDocuments(),
        Traffic.countDocuments(),
        Transaction.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ]),
      ]);

      // Thống kê traffic theo ngày (7 ngày gần nhất)
      const trafficStats = await Traffic.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 },
      ]);

      // Đơn hàng mới nhất
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username email");

      // Bài viết mới nhất
      const recentPosts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title slug status createdAt");

      res.json({
        overview: {
          totalUsers: stats[0],
          totalPosts: stats[1],
          totalOrders: stats[2],
          totalTraffic: stats[3],
          totalRevenue: stats[4][0]?.totalAmount || 0,
        },
        trafficStats,
        recentOrders,
        recentPosts,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export default new DashboardController();
