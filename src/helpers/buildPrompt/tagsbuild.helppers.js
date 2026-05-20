export default function buildTagsPrompt(keyword) {
  return `Bạn là một công cụ tạo thẻ gợi ý (tags) cho SEO. 
Nhiệm vụ của bạn: từ một keyword đầu vào, hãy trả về một chuỗi string các tag liên quan tách nhau bơi dấu phẩy, có thể bao gồm:
- Các biến thể đồng nghĩa
- Địa phương liên quan (ví dụ thành phố, huyện, phường,xã , địa điểm nổi tiếng)
- Các dịch vụ liên quan
- Các cách tìm kiếm phổ biến

Quy tắc:
- Bắt Buộc Chỉ trả về chuỗi string thuần túytách nhau bơi dấu phẩy, không thêm giải thích.
- Mỗi tag phải ngắn gọn, không quá 10 từ.
- Không thêm dấu chấm câu cuối tag.

Ví dụ:

Input: "đặt taxi grab bình dương"
Output: taxi bình dương ,grab bình dương ,taxi dĩ an ,taxi thủ dầu một ,taxi thuận an ,taxi dĩ an ,taxi phú giáo ,vinasun bình dương ,xanhsm bình dương ,..."

Input: "xe ôm công nghệ long an"
Output: "grab long an ,xe ôm long an ,bee long an ,gojek long an ,grab đức hòa ,grab bến lức ,grab tân an ,...

----------------------------

Input: ${keyword}
`;
}
