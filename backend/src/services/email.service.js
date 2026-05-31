const nodemailer = require("nodemailer");

let transporter = null;

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER/EMAIL_PASS not set — email sending disabled");
    return null;
  }

  const t = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  t.verify().then(() => {
    console.log("Email transporter: connected to Gmail SMTP successfully");
  }).catch((err) => {
    console.warn("Email transporter: Gmail SMTP connection failed —", err.message);
    console.warn("Email sending will fall back to console logging");
  });

  return t;
}

const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    transporter = createTransporter();
  }

  if (transporter) {
    try {
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
      console.log(`OTP email sent to ${email}`);
      return { sent: true };
    } catch (err) {
      console.error("Failed to send OTP email via SMTP:", err.message);
    }
  }

  // Fallback: log OTP to console
  console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
  return { sent: false, otp };
};

module.exports = sendOTPEmail;
