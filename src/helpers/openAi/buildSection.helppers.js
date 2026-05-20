export default function buildBatchSectionPrompt(
  outline,
  keyword,
  domain,
  numberWord
) {
  return `
Bạn là chuyên gia SEO. Viết nội dung CHUYÊN SÂU cho website ${domain}.
tiêu đề: "${keyword}"

Outline:
${outline.map((title, i) => `${i + 1}. ${title}`).join("\n")}

Yêu cầu:
- Mỗi mục 50 - 300 từ, thẻ H2/H3/H4 rõ ràng.
- tổng thể dữ liệu dữ liệu trả về không vượt quá ${numberWord} từ
- Nội dung khác nhau, không trùng lặp, tự nhiên cho khách hàng, độc giả đọc.
- Chèn icon nếu phù hợp.
- sử dụng tags html semantic ul,li,table,...
- Trả về JSON dạng:
{
  "sections": [
    {"title": "outline", "content": "<h2>...</h2><p>...</p>"},
    ...
  ]
}
- Bắt Buộc tuyệt đối 100% Chỉ trả JSON hợp lệ.không trả thêm dữ liệu không liên quan
`;
}
