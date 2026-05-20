//src/configs/domain/index.js
import dotenv from "dotenv";
dotenv.config();
const configMap = {
  "localhost:3000": {
    DATABASE_URI: process.env.MONGODB_URI_LOCAL,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_LOCAL,
    JWT_SECRET: process.env.JWT_SECRET_LOCAL,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_LOCAL,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_LOCAL,
    EMAIL_PASS: process.env.EMAIL_PASS_LOCAL,
    DOMAIN: "http://localhost:3000",
    PROMPT: `Nội dung phải CHUYÊN SÂU:
   - Ngành viết về dịch vụ đặt xe : xe ôm , taxi , giao hàng
   - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cảnh>
   - Có ví dụ thực tế, số liệu, và nghiên cứu liên quan.
   - Dùng các thương hiệu tương tự như XanhSM, Grab, Be, Vinasun để phân tích nội dung.
   - Một số thông tin su dung trong content:
      + Số điện thoại 0327883039
      + Website: https://datxenhanh-24h.pro.vn
      + Có thể đặt xe qua biểu mẫu trong website ( nhap diem don, diem den, loai xe , so dien thoai )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
    `,
    numberWord: "3000",
  },
  "datxetietkiem.com": {
    DATABASE_URI: process.env.MONGODB_URI_DUYHAI,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_DUYHAI,
    JWT_SECRET: process.env.JWT_SECRET_DUYHAI,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_DUYHAI,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_DUYHAI,
    EMAIL_PASS: process.env.EMAIL_PASS_DUYHAI,
    DOMAIN: process.env.DOMAIN_DUYHAI,
    PROMPT: `Nội dung phải CHUYÊN SÂU:
   - Ngành viết về dịch vụ đặt xe : xe ôm , taxi , giao hàng
   - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cảnh>
   - Có ví dụ thực tế, số liệu, và nghiên cứu liên quan.
   - Dùng các thương hiệu tương tự như XanhSM, Grab, Be, Vinasun để phân tích nội dung.
   - Một số thông tin su dung trong content:
      + Số điện thoại 0967524995
      + Website: https://datxetietkiem.com
      + Có thể đặt xe qua biểu mẫu trong website ( nhap diem don, diem den, loai xe , so dien thoai )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
    `,
    numberWord: "2500",
  },
  "taxinhanh247.pro.vn": {
    DATABASE_URI: process.env.MONGODB_URI_TAXINHANH,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_TAXINHANH,
    JWT_SECRET: process.env.JWT_SECRET_TAXINHANH,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_TAXINHANH,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_TAXINHANH,
    EMAIL_PASS: process.env.EMAIL_PASS_TAXINHANH,
    DOMAIN: process.env.DOMAIN_TAXINHANH,
    PROMPT: `Nội dung phải CHUYÊN SÂU:
   - outline và nội dung phải (liên quan) đến từ khóa chính và sử dụng ngôn từ tự nhiên
   - không sử dụng nội dung kiểu như mô tả (đây là nội dung seo) vì bạn đang viết cho khách hàng,độc giả,người dùng đọc chứ không ph>
   - Ngành viết về dịch vụ vận tải hành khách như grab , mai linh, vinasun , xanh sm ,...
   - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cảnh>
   - nếu cần sử dụng thêm icon phù hợp ,ví dụ thực tế, số liệu, và nghiên cứu liên quan.
   - trong nội dung nếu có thể sử dụng bảng thì nên sử dụng bảng cho dữ liệu sinh động mang lại nội dung sạch
   - Một số thông tin su dung:
      + Số điện thoại 0327883039
      + Website: https://taxinhanh247.pro.vn
      + Có thể đặt xe qua biểu mẫu trong website ( nhap diem don, diem den, loai xe , so dien thoai )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
   - viết không dưới 2000 từ và không vượt quá 3500 từ
    `,
  },
  "datxenhanh-24h.pro.vn": {
    DATABASE_URI: process.env.MONGODB_URI_DATXENHANH_24H_PRO_VN,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_DATXENHANH_24H_PRO_VN,
    JWT_SECRET: process.env.JWT_SECRET_DATXENHANH_24H_PRO_VN,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_DATXENHANH_24H_PRO_VN,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_DATXENHANH_24H_PRO_VN,
    EMAIL_PASS: process.env.EMAIL_PASS_DATXENHANH_24H_PRO_VN,
    DOMAIN: process.env.DOMAIN_DATXENHANH_24H_PRO_VN,
    PROMPT: `Nội dung phải CHUYÊN SÂU:
   - Ngành viết về dịch vụ vận tải hành khách như grab , bee, vinasun , xanh sm ,...
   - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cảnh>
   - Có thể sử dụng ví dụ thực tế, số liệu, và nghiên cứu liên quan.
   - Dùng các thương hiệu tương tự như XanhSM, Grab, Be, Vinasun để phân tích nội dung.
   - Một số thông tin su dung trong content:
      + Số điện thoại 0327883039
      + Website: https://datxenhanh-24h.pro.vn
      + Có thể đặt xe qua biểu mẫu trong website ( nhap diem don, diem den, loai xe , so dien thoai )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
    `,
    numberWord: "3000-4000",
  },
  "taxisieure.com": {
    DATABASE_URI: process.env.MONGODB_URI_TAXISIEURE,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_TAXISIEURE,
    JWT_SECRET: process.env.JWT_SECRET_TAXISIEURE,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_TAXISIEURE,
    HOST: process.env.HOST,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_TAXISIEURE,
    EMAIL_PASS: process.env.EMAIL_PASS_TAXISIEURE,
    DOMAIN: "https://taxisieure.com",
    PROMPT: `Nội dung phải CHUYÊN SÂU:
   - Ngành viết về dịch vụ vận tải hành khách như grab , bee, vinasun , xanh sm ,...
   - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cảnh>
   - Có thể sử dụng ví dụ thực tế, số liệu, và nghiên cứu liên quan.
   - Một số thông tin su dung trong content:
      + Số điện thoại 0898335292
      + Website: https://taxisieure.com
      + Có thể đặt xe qua biểu mẫu trong website ( nhập điểm đón , điểm đến, loại xe , số điện thoại )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
    `,
    numberWord: "2500-3500",
  },
  "hotrodatxesieure.com": {
    DATABASE_URI: process.env.MONGODB_URI_HOTRODATXESIEURE,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_HOTRODATXESIEURE,
    JWT_SECRET: process.env.JWT_SECRET_HOTRODATXESIEURE,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_HOTRODATXESIEURE,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_HOTRODATXESIEURE,
    EMAIL_PASS: process.env.EMAIL_PASS_HOTRODATXESIEURE,
    DOMAIN: "https://hotrodatxesieure.com",
    PROMPT: `Nội dung phải CHUYÊN SÂU:
    - Ngành viết về dịch vụ vận tải hành khách như grab , bee, vinasun , xanh sm ,...
    - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cản>
    - Có thể sử dụng ví dụ thực tế, số liệu, và nghiên cứu liên quan.
    - Một số thông tin su dung trong content:
      + Số điện thoại 0933551965
      + Website: https://hotrodatxesieure.com
      + Có thể đặt xe qua biểu mẫu trong website ( nhập điểm đón , điểm đến, loại xe , số điện thoại )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
    `,
    numberWord: "2500-3500",
  },
  "tongdatdatxe24gio.top": {
    DATABASE_URI: process.env.MONGODB_URI_TONGDAIDATXESIEURE,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK_URL_TONGDAIDATXESIEURE,
    JWT_SECRET: process.env.JWT_SECRET_TONGDAIDATXESIEURE,
    JWT_SECRET_RERESH: process.env.JWT_SECRET_RERESH_TONGDAIDATXESIEURE,
    HOST: process.env.HOST,
    EMAIL_USER: process.env.EMAIL_USER_TONGDAIDATXESIEURE,
    EMAIL_PASS: process.env.EMAIL_PASS_TONGDAIDATXESIEURE,
    DOMAIN: "https://tongdatdatxe24gio.top",
    PROMPT: `Nội dung phải CHUYÊN SÂU:
    - Ngành viết về dịch vụ vận tải hành khách như grab , bee, vinasun , xanh sm ,...
    - dùng thông tin về địa phương như các huyện , tỉnh , phường , xã , thành phố và các địa điểm nổi tiếng , các danh lam thắng cản>
    - Có thể sử dụng ví dụ thực tế, số liệu, và nghiên cứu liên quan.
    - Một số thông tin su dung trong content:
      + Số điện thoại 0942151158
      + Website: https://tongdaidatxe24gio.top
      + Có thể đặt xe qua biểu mẫu trong website ( nhập điểm đón , điểm đến, loại xe , số điện thoại )
   - nếu có thể hãy sử dụng bảng giá cước tham khảo
    `,
    numberWord: "2500-3500",
  },
};
export default configMap;
