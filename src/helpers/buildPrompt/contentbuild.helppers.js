export default function buildContentPrompt(outline, promptCustom = "") {
  return `
Bạn là một chuyên gia SEO và copywriter.  
Hãy viết một bài content hoàn chỉnh bằng HTML dựa trên các outline sau:  

Outline:
${outline}

Yêu cầu:
- Chỉ trả về **một chuỗi HTML duy nhất**, không giải thích gì thêm.  
- Sử dụng semantic tags: <h2>, <h3>, <p>, <ul>, <li>.  
- Không thêm <html>, <head>, <body>.  
- Nội dung phải mạch lạc, tự nhiên, có giá trị với người đọc.  
- HTML phải hợp lệ và dễ copy-paste vào website.  

${promptCustom}
`;
}
