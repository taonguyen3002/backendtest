import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import extractData from "./extractData.helppers.js";
import { geminiApiKeys, ApiKeyManager } from "../../configs/apiKeys.js";
dotenv.config();

const keyManager = new ApiKeyManager(geminiApiKeys);

export default async function callGeminiAi(prompt) {
  let attempts = 0;
  const maxAttempts = geminiApiKeys.length;

  while (attempts < maxAttempts) {
    try {
      const currentKey = keyManager.getNextValidKey();
      const genAI = new GoogleGenerativeAI(currentKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.1-pro-preview",
      });

      const result = await model.generateContent(prompt);
      const res = extractData(result.response.text());
      return res;
    } catch (error) {
      attempts++;
      console.error(
        `Attempt ${attempts} failed with key ${keyManager.getCurrentKey()}`
      );

      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        keyManager.markKeyAsFailed(keyManager.getCurrentKey());
        keyManager.rotateKey();

        if (attempts < maxAttempts) {
          continue;
        }
      }

      throw error;
    }
  }

  throw new Error("All API keys have been exhausted");
}
