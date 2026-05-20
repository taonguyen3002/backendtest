import { getToastModel } from "../models/toastMessage.models.js";
import { maskSecret } from "../../helpers/security/maskSecret.js";

// filepath: d:\workplace\taxiwebproject\backend\src\app\controllers\toastMessage.controller.js

export async function createToastMessage(req, res) {
  try {
    const { telegramChatId, telegramToken, discordWebhook, toastDiscord, toastTelegram } = req.body;
    const Toast = getToastModel(req.db);
    console.log("Creating toast message with data:", {
      telegramChatId,
      telegramToken,
      discordWebhook,
      toastDiscord,
      toastTelegram,
    });
    const newToast = new Toast({
      telegramChatId,
      telegramToken,
      discordWebhook,
      toastDiscord: toastDiscord ?? true,
      toastTelegram: toastTelegram ?? false,
    });

    await newToast.save();
    res.status(201).json({ success: true, data: newToast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getToastMessage(req, res) {
  try {
    const Toast = getToastModel(req.db);

    const toasts = await Toast.find();

    const maskedToasts = toasts.map((toast) => ({
      ...toast.toObject(),

      telegramChatId: maskSecret(toast.telegramChatId),

      telegramToken: maskSecret(toast.telegramToken),

      discordWebhook: maskSecret(toast.discordWebhook),

      toastDiscord: toast.toastDiscord,
      toastTelegram: toast.toastTelegram,
    }));

    res.status(200).json({
      success: true,
      data: maskedToasts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateToastMessage(req, res) {
  try {
    const { id } = req.params;
    const { telegramChatId, telegramToken, discordWebhook, toastDiscord, toastTelegram } = req.body;
    const Toast = getToastModel(req.db);

    const updatedToast = await Toast.findByIdAndUpdate(
      id,
      { telegramChatId, telegramToken, discordWebhook, toastDiscord, toastTelegram },
      { new: true },
    );

    res.status(200).json({ success: true, data: updatedToast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteToastMessage(req, res) {
  try {
    const { id } = req.params;
    const { field } = req.body;

    const Toast = getToastModel(req.db);

    if (!field) {
      return res.status(400).json({
        success: false,
        message: "Field is required",
      });
    }

    const updated = await Toast.findByIdAndUpdate(id, { $unset: { [field]: "" } }, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Toast not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `${field} deleted`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
