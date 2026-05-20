import { UAParser } from "ua-parser-js";
import { isbot } from "isbot";

import { getTrafficModel } from "../models/traffic.models.js";
import { getSettingModel } from "../models/setting.models.js";
import { getToastModel } from "../models/toastMessage.models.js";
import { sendDiscordMessage } from "../../helpers/discord/index.js";
import { sendTelegramMessage } from "../../helpers/telegram/index.js";

class TrafficController {
  /* ================= CACHE ================= */

  cache = {
    toast: null,
    setting: {},
    lastToastFetch: 0,
    lastSettingFetch: {},
  };

  CACHE_TIME = 5000; // 5s

  /* ================= UTIL ================= */

  isIpBlocked = (ip, blocked) =>
    blocked.some((rule) => (rule.split(".").length < 4 ? ip.startsWith(rule + ".") : ip === rule));

  /* ================= GET SETTINGS CACHE ================= */

  getSetting = async (Settings, slug) => {
    const now = Date.now();

    if (this.cache.setting[slug] && now - this.cache.lastSettingFetch[slug] < this.CACHE_TIME) {
      return this.cache.setting[slug];
    }

    const setting = await Settings.findOne({ slug }).lean();

    this.cache.setting[slug] = setting;
    this.cache.lastSettingFetch[slug] = now;

    return setting;
  };

  /* ================= GET TOAST CACHE ================= */

  getToast = async (ToastSettings) => {
    const now = Date.now();

    if (this.cache.toast && now - this.cache.lastToastFetch < this.CACHE_TIME) {
      return this.cache.toast;
    }

    const toast = await ToastSettings.findOne().lean();

    this.cache.toast = toast;
    this.cache.lastToastFetch = now;

    return toast;
  };

  /* ================= CHECK NOTIFICATION ================= */

  checkNotification = async ({ Settings, ToastSettings, slug, ip, isBotUser, ipBot }) => {
    try {
      if (isBotUser) return { discord: false, telegram: false };

      if (this.isIpBlocked(ip, ipBot)) return { discord: false, telegram: false };

      const setting = await this.getSetting(Settings, slug);

      if (setting && setting.notificationDiscord === true) {
        return { discord: false, telegram: false };
      }

      const toast = await this.getToast(ToastSettings);

      if (!toast) {
        return { discord: true, telegram: false };
      }

      return {
        discord: toast.toastDiscord === true,
        telegram: toast.toastTelegram === true,
        telegramToken: toast.telegramToken,
        telegramChatId: toast.telegramChatId,
        discordWebhook: toast.discordWebhook,
      };
    } catch (error) {
      console.error("Notification check error:", error);

      return { discord: true, telegram: false };
    }
  };

  /* ================= SEND NOTIFICATION ================= */

  sendNotification = async ({ notify, payload, config }) => {
    try {
      if (notify.discord) {
        await sendDiscordMessage({
          ...payload,
          DISCORD_WEBHOOK_URL: notify.discordWebhook || config.DISCORD_WEBHOOK,
        });
      }

      if (notify.telegram) {
        await sendTelegramMessage({
          token: notify.telegramToken,
          chatId: notify.telegramChatId,
          ...payload,
        });
      }
    } catch (error) {
      console.error("Notification send error:", error);

      if (notify.discord && notify.telegram) {
        await sendDiscordMessage({
          ...payload,
          DISCORD_WEBHOOK_URL: config.DISCORD_WEBHOOK,
        });
      }
    }
  };

  /* ================= CREATE TRAFFIC ================= */

  createTraffic = async (req, res) => {
    const config = req.app.locals.config;

    const Traffic = getTrafficModel(req.db);
    const Settings = getSettingModel(req.db);
    const ToastSettings = getToastModel(req.db);

    const ipBot = ["72.14.199"];

    try {
      const { lat, lon, referrer, userAgent, visitorId, slug } = req.body || {};

      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";

      const parser = new UAParser(userAgent || "");

      const browser = parser.getBrowser().name || "unknown";

      const deviceInfo = parser.getDevice();

      const device = deviceInfo.model ? `${deviceInfo.vendor || "android"} ${deviceInfo.model}` : "Desktop";

      const isBotUser = isbot(userAgent || "");

      const location = lat && lon ? `https://www.google.com/maps/place/${lat},${lon}` : "không lấy được vị trí";

      const payload = {
        ip,
        lat,
        lon,
        referrer,
        device,
        browser,
        userAgent,
      };

      const existing = await Traffic.findOne({ visitorId });

      const notify = await this.checkNotification({
        Settings,
        ToastSettings,
        slug,
        ip,
        isBotUser,
        ipBot,
      });

      /* ========= EXIST VISITOR ========= */

      if (existing) {
        existing.times += 1;
        existing.ref = referrer;

        existing.historyIp.push(ip);
        existing.historyTimestamps.push(new Date());
        existing.historyLocation.push(location);
        existing.historyRef.push(referrer);

        await existing.save();

        const lastTimestamp = existing.historyTimestamps[existing.historyTimestamps.length - 2];

        const timeSinceLastVisit = lastTimestamp ? Date.now() - new Date(lastTimestamp).getTime() : Infinity;

        if (timeSinceLastVisit > 10000) {
          await this.sendNotification({
            notify,
            payload,
            config,
          });
        }

        return res.status(200).json({
          message: "Visitor updated",
        });
      }

      /* ========= NEW VISITOR ========= */

      const newTraffic = new Traffic({
        visitorId,
        Ip: ip,
        isBot: isBotUser,
        ref: referrer,
        browser,
        isAds: referrer?.includes("ads") ?? false,
        device,
        location,
        times: 1,
        historyIp: [ip],
        historyRef: [referrer],
        historyLocation: [location],
        historyTimestamps: [new Date()],
      });

      await newTraffic.save();

      await this.sendNotification({
        notify,
        payload,
        config,
      });

      return res.status(200).json({
        message: "New visitor tracked",
      });
    } catch (err) {
      console.error("❌ Error tracking traffic:", err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };

  /* ================= GET TRAFFIC ================= */

  getTraffic = async (req, res) => {
    const Traffic = getTrafficModel(req.db);

    try {
      const data = await Traffic.find()
        .select("Ip isAds isBot updatedAt times ref _id")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean();

      if (!data.length) {
        return res.status(404).json({
          message: "no traffic data found",
        });
      }

      return res.json({
        success: true,
        result: data,
      });
    } catch (err) {
      console.error("❌ Error fetching traffic:", err);

      return res.status(500).json({
        error: "Failed to fetch traffic",
      });
    }
  };

  /* ================= GET TRAFFIC BY ID ================= */

  getTrafficById = async (req, res) => {
    const Traffic = getTrafficModel(req.db);

    const { id } = req.query;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "not found id",
      });
    }

    try {
      const trafficId = await Traffic.findById(id).lean();

      if (!trafficId) {
        return res.status(404).json({
          success: false,
          message: "not found data",
        });
      }

      return res.status(200).json({
        success: true,
        message: "success",
        result: trafficId,
      });
    } catch (error) {
      console.error("error catch:", error);

      return res.status(500).json({
        success: false,
        message: "catch error",
      });
    }
  };
}

export default new TrafficController();
