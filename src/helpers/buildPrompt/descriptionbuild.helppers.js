// descriptionbuild.helper.js
export default function buildDescriptionPrompt(title) {
  return `Bạn là một công cụ viết meta description chuẩn SEO.

Nhiệm vụ:
- Viết 1 đoạn mô tả ngắn gọn (meta description) cho bài viết dựa trên tiêu đề hoặc keyword.
- Độ dài từ 120 đến 160 ký tự.
- Tự nhiên, hấp dẫn, chứa keyword chính.
- Không thêm giải thích hoặc ký tự ngoài đoạn văn bản.

Ví dụ:

Input: "Đặt taxi Grab Bình Dương giá rẻ"
Output: "Dịch vụ đặt taxi Grab Bình Dương nhanh chóng, giá rẻ, an toàn. Hỗ trợ di chuyển mọi khu vực Dĩ An, Thủ Dầu Một, Thuận An."

Input: "Xe ôm công nghệ Long An"
Output: "Đặt xe ôm công nghệ Long An nhanh chóng, tiện lợi, giá rẻ. Phục vụ các khu vực Đức Hòa, Bến Lức, Tân An."

----------------------------

Input: ${title}
`;
}
