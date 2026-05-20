// outlinebuild.helper.js
export default function buildOutlinePrompt(title) {
  return `Bạn là một công cụ tạo dàn ý (outline) cho bài viết chuẩn SEO.  
Nhiệm vụ: từ một tiêu đề chính, hãy trả về **dàn ý dưới dạng văn bản thuần túy**.  

Quy tắc:  
- Chỉ trả về dàn ý, không giải thích thêm.  
- Mỗi heading nằm trên một dòng, bắt đầu bằng dấu gạch đầu dòng hoặc số thứ tự.  
- Heading phải ngắn gọn, súc tích, liên quan trực tiếp đến tiêu đề.  
- Không thêm dấu chấm câu cuối heading.  
- Ưu tiên tạo 5–20 heading, có thể lồng H3 dưới H2 bằng thụt dòng hoặc ký hiệu phân cấp.  
- Sử dụng thêm địa phương liên quan.

Ví dụ:  

Input: "Grab Bình Dương – Đặt xe giá rẻ tiện lợi"  
Output:  
1. Giới thiệu dịch vụ Grab tại Bình Dương  
2. Lợi ích khi sử dụng Grab Bình Dương  
3. Các loại dịch vụ Grab phổ biến  
   - Grab xe máy Bình Dương  
   - Grab Dĩ An Bình Dương  
   - Grab Thủ Dầu Một Bình Dương  
4. Cách đặt Grab Bình Dương đi Thành phố Hồ Chí Minh  
5. Hướng dẫn đặt taxi Grab Bình Dương đi Vũng Tàu  
6. Bảng giá Grab Bình Dương  
7. Kinh nghiệm đặt Grab nhanh chóng  
8. Khu vực hỗ trợ Grab tại Bình Dương  
9. Cách liên hệ và đặt xe Grab Bình Dương  
...

----------------------------  

Input: ${title}  
`;
}
