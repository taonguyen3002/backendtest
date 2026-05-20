import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
class OrtherController {
  // [POST] /sentmessage/discord/traffic
  sentMessageTrafficDiscord = async (req, res) => {
    const config = req.app.locals.config;
    try {
      const { lat, lon, referrer, userAgent } = req.body || {};

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress;
      // Gửi về Discord
      await axios.post(config.DISCORD_WEBHOOK, {
        embeds: [
          {
            title: `👤 Truy cập từ ${referrer || "user"}`,
            color: 3447003,
            fields: [
              { name: "🌐 IP", value: `\`${ip}\``, inline: true },
              {
                name: "📍 Vị trí",
                value: `https://www.google.com/maps/place/${lat || "unknown"},${
                  lon || "unknown"
                }`,
                inline: true,
              },
              { name: "💻 User-Agent", value: userAgent },
            ],
            timestamp: new Date(),
          },
        ],
      });

      res.status(200).json({ message: "Tracked!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };
}
export default new OrtherController();
