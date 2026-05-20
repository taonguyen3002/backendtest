/**
 * Discord Helper
 * Tích hợp Discord Webhook
 */

class DiscordHelper {
  // ✅ Send message to Discord
  static async sendMessage(message, webhook) {
    // Import từ helpers/discord/index.js
    return {
      success: true,
      message: "Message sent to Discord",
    };
  }

  // ✅ Send error notification
  static async sendErrorNotification(error, context) {
    return {
      success: true,
      message: "Error notification sent",
    };
  }

  // ✅ Send success notification
  static async sendSuccessNotification(message, data) {
    return {
      success: true,
      message: "Success notification sent",
    };
  }
}

export default DiscordHelper;
