import axios from "axios";

const axiosClient = axios.create({
  timeout: 5000,
});

/* ================= SEND TRAFFIC ================= */

export async function sendTelegramMessage({ token, chatId, ip, lat, lon, referrer, device, browser, userAgent }) {
  if (!token || !chatId) return false;

  const maps = lat && lon ? `https://www.google.com/maps/place/${lat},${lon}` : "Không lấy được vị trí";

  const text = `
👤 *Truy cập từ:* ${referrer || "Trực tiếp"}

🌐 *IP:* \`${ip}\`
📍 *Vị trí:* ${maps}

💻 *Thiết bị:* ${device}
🌍 *Trình duyệt:* ${browser}

⏰ ${new Date().toLocaleString()}
`;

  try {
    await axiosClient.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    });

    return true;
  } catch (error) {
    console.error("❌ Telegram traffic error:", error?.response?.data || error.message);
    return false;
  }
}

/* ================= SEND ORDER ================= */

export async function sendOrderToTelegram({
  token,
  chatId,
  addressFrom,
  addressTo,
  phoneNumber,
  serviceType,
  additionalInfo,
}) {
  if (!token || !chatId) return false;

  const text = `
🚗 *ĐƠN HÀNG MỚI*

📍 *Điểm đón:* ${addressFrom}
📍 *Điểm đến:* ${addressTo}

📞 *SĐT:* ${phoneNumber}

🚘 *Dịch vụ:* ${serviceType}

📝 *Thông tin thêm:*
${additionalInfo || "Không có"}

⏰ ${new Date().toLocaleString()}
`;

  try {
    await axiosClient.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
    });

    return true;
  } catch (error) {
    console.error("❌ Telegram order error:", error?.response?.data || error.message);
    return false;
  }
}
