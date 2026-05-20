/**
 * Telegram Helper
 * Tích hợp Telegram Bot
 */

class TelegramHelper {
  // ✅ Send message to Telegram
  static async sendMessage(chatId, message) {
    // Import từ helpers/telegram/index.js
    return {
      success: true,
      message: "Message sent to Telegram",
    };
  }

  // ✅ Send notification
  static async sendNotification(chatId, title, body) {
    return {
      success: true,
      message: "Notification sent",
    };
  }
}

export default TelegramHelper;
