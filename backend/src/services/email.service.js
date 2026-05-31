const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify().then(() => {
  console.log("Email transporter: connected to Gmail SMTP successfully");
}).catch((err) => {
  console.error("Email transporter: failed to connect to Gmail SMTP —", err.message);
  console.error("Email transporter: check EMAIL_USER/EMAIL_PASS env vars or Gmail app password");
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Smart Banking Powered By AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
      <h2>Smart Banking powered by AI</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
      <hr>
      <p style="color:#888;font-size:12px;">If you did not request this code, please ignore this email.</p>
    `,
  });
};

module.exports = sendOTPEmail;
