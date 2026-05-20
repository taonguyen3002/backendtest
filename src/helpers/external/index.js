/**
 * External Integrations Helpers
 * OpenAI, Gemini, Discord, Telegram, etc.
 */

// Import existing helpers
// import { callOpenAi, buildTag, buildMeta } from "./openAi/";
// import { callGeminiAi } from "./geminiAi/";
// etc.

// Re-export từ các file cũ hoặc tạo wrapper

export { default as OpenAiHelper } from "./openAi.helper.js";
export { default as GeminiHelper } from "./gemini.helper.js";
export { default as DiscordHelper } from "./discord.helper.js";
export { default as TelegramHelper } from "./telegram.helper.js";
