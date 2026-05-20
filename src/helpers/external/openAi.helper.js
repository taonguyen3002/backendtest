/**
 * OpenAI Helper
 * Tích hợp OpenAI API
 */

class OpenAiHelper {
  // ✅ Call OpenAI API
  static async callOpenAi(prompt) {
    // Import từ helpers/openAi/callOpenAi.helppers.js
    // return await callOpenAi(prompt);
    return {
      success: true,
      content: "Generated content from OpenAI",
    };
  }

  // ✅ Build meta
  static async buildMeta(content) {
    // Import từ helpers/openAi/buildMeta.helppers.js
    return {
      title: "Meta title",
      description: "Meta description",
    };
  }

  // ✅ Build section
  static async buildSection(content) {
    // Import từ helpers/openAi/buildSection.helppers.js
    return {
      sections: [],
    };
  }

  // ✅ Build tag
  static async buildTag(content) {
    // Import từ helpers/openAi/buildTag.helppers.js
    return {
      tags: [],
    };
  }
}

export default OpenAiHelper;
