export default function normalizeTags(tags) {
  try {
    // Nếu trả về JSON string (ví dụ: '["a","b"]')
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => t.trim());
    }
  } catch (e) {
    // Không phải JSON, fallback tách bằng dấu phẩy
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }
  return [];
}
