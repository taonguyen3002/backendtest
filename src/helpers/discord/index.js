import axios from "axios";

const axiosClient = axios.create({
  timeout: 5000,
});

/* ================= SEND TRAFFIC ================= */

export async function sendDiscordMessage({ ip, lat, lon, referrer, device, browser, userAgent, DISCORD_WEBHOOK_URL }) {
  if (!DISCORD_WEBHOOK_URL) return false;

  const maps = lat && lon ? `[Google Maps](https://www.google.com/maps/place/${lat},${lon})` : "Không lấy được vị trí";

  const payload = {
    embeds: [
      {
        title: `👤 Truy cập từ ${referrer || "Trực tiếp"}`,
        color: 3447003,
        fields: [
          { name: "🌐 IP", value: ip || "unknown", inline: true },
          { name: "📍 Vị trí", value: maps, inline: true },
          { name: "💻 Thiết bị", value: device || "unknown", inline: true },
          { name: "🌍 Trình duyệt", value: browser || "unknown", inline: true },
          { name: "🔍 User-Agent", value: userAgent || "unknown" },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axiosClient.post(DISCORD_WEBHOOK_URL, payload);
    return true;
  } catch (error) {
    console.error("❌ Discord traffic error:", error?.response?.data || error.message);
    return false;
  }
}

/* ================= SEND ORDER ================= */

export async function sendOrderToDiscord({
  addressFrom,
  addressTo,
  phoneNumber,
  serviceType,
  additionalInfo,
  DISCORD_WEBHOOK_URL,
}) {
  if (!DISCORD_WEBHOOK_URL) return false;

  const payload = {
    embeds: [
      {
        title: "🚗 Đơn Hàng Mới",
        color: 15844367,
        fields: [
          { name: "📍 Điểm đón", value: addressFrom, inline: true },
          { name: "📍 Điểm đến", value: addressTo, inline: true },
          { name: "📞 SĐT", value: phoneNumber, inline: true },
          { name: "🚘 Dịch vụ", value: serviceType, inline: true },
          {
            name: "📝 Thông tin thêm",
            value: additionalInfo || "Không có",
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axiosClient.post(DISCORD_WEBHOOK_URL, payload);
    return true;
  } catch (error) {
    console.error("❌ Discord order error:", error?.response?.data || error.message);
    return false;
  }
}
