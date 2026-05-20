export const geminiApiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  // Thêm các key khác
];

export class ApiKeyManager {
  constructor(apiKeys) {
    this.apiKeys = apiKeys;
    this.currentIndex = 0;
    this.failedKeys = new Map(); // Lưu thời gian key bị lỗi
  }

  getCurrentKey() {
    return this.apiKeys[this.currentIndex];
  }

  rotateKey() {
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
    return this.getCurrentKey();
  }

  markKeyAsFailed(key) {
    this.failedKeys.set(key, Date.now());
  }

  isKeyValid(key) {
    const failedTime = this.failedKeys.get(key);
    if (!failedTime) return true;

    // Thử lại key sau 1 giờ
    const oneHour = 60 * 60 * 1000;
    return Date.now() - failedTime > oneHour;
  }

  getNextValidKey() {
    const startIndex = this.currentIndex;

    do {
      const currentKey = this.getCurrentKey();
      if (this.isKeyValid(currentKey)) {
        return currentKey;
      }
      this.rotateKey();
    } while (this.currentIndex !== startIndex);

    throw new Error("No valid API keys available");
  }
}
