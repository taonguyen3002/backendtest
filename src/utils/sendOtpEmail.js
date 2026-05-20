// utils/sendOtpEmail.js
import nodemailer from "nodemailer";

async function sendOtpEmail(toEmail, otp, config) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Đăng ký <${config.EMAIL_USER}>`,
    to: toEmail,
    subject: "Mã xác minh OTP",
    html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>OTP sẽ hết hạn sau 5 phút.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export default sendOtpEmail;
