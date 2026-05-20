export default function buildMetaPrompt(numberWord, keyword, promptCustom) {
  return `
Bạn là chuyên gia SEO. Viết metadata & outline cho bài viết nội dung ${numberWord} từ .
tiêu đề bài viết: "${keyword}"

Trả về JSON:
{
  "title": "${keyword}",
  "description": "Mô tả ngắn 150-160 ký tự và liên quan đến tiêu đề bài viết",
  "slug": "tieu-de-chua-tu-khoa-chinh",
  "outline": ["outline", "outline", "outline", "..."]
}
${promptCustom || ""}
- slug được tạo thành tiêu đề ${keyword} ví dụ grab xe máy có slug grab-xe-may
- Bắt Buộc tuyệt đối 100% Chỉ trả JSON hợp lệ. không trả thêm bất cữ dữ liệu nào khác
`;
}
