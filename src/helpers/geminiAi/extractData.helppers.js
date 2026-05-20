export default function extractData(input) {
  if (!input) return null;

  try {
    // Nếu input đã là object hoặc array
    if (typeof input === "object") {
      return input;
    }

    let text = String(input).trim();

    // Xoá markdown code block nếu có (```json ... ``` hoặc ```)
    text = text.replace(/```json|```/g, "").trim();

    // Ưu tiên thử parse JSON (cả object {} và array [])
    if (
      (text.startsWith("{") && text.endsWith("}")) ||
      (text.startsWith("[") && text.endsWith("]"))
    ) {
      return JSON.parse(text);
    }

    // Nếu không phải JSON cũng không có dấu phẩy → trả string thuần
    return text;
  } catch (err) {
    console.error("extractData parse error:", err.message);
    // fallback: trả string gốc
    return String(input).trim();
  }
}
