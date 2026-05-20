/**
 * Gemini AI Helper
 * Tích hợp Google Gemini API
 */

class GeminiHelper {
  // ✅ Call Gemini API
  static async callGeminiAi(prompt) {
    // Import từ helpers/geminiAi/callGeminiAi.helppers.js
    return {
      success: true,
      content: "Generated content from Gemini",
    };
  }

  // ✅ Extract data
  static async extractData(response) {
    // Import từ helpers/geminiAi/extractData.helppers.js
    return {
      extracted: {},
    };
  }
}

export default GeminiHelper;
