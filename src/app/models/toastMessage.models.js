import mongoose from "mongoose";

const toastMessage = new mongoose.Schema(
  {
    telegramChatId: { type: String },
    telegramToken: { type: String },
    discordWebhook: { type: String },
    toastDiscord: { type: Boolean, default: true },
    toastTelegram: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export function getToastModel(connection) {
  return connection.model("Toast", toastMessage);
}
