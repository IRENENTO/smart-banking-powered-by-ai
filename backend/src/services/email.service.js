const nodemailer = require("nodemailer");

let transporter = null;
let lastAttempt = 0;

async function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER/EMAIL_PASS not set — email sending disabled");
    return null;
  }

  // Cooldown: don't retry SMTP more than once per 60s
  if (Date.now() - lastAttempt < 60000 && !transporter) return transporter;
  lastAttempt = Date.now();

  const configs = [
    { host: "smtp.gmail.com", port: 465, secure: true },
    { host: "smtp.gmail.com", port: 587, secure: false },
  ];

  for (const cfg of configs) {
    const t = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    try {
      await t.verify();
      console.log(`Email transporter connected (${cfg.host}:${cfg.port})`);
      return t;
    } catch (err) {
      console.warn(`Email SMTP ${cfg.host}:${cfg.port} — ${err.message}`);
      t.close();
    }
  }

  console.warn("Email: all SMTP attempts failed — will fall back to console logging OTP");
  return null;
}

const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    transporter = await createTransporter();
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
      console.error("Email send failed:", err.message);
      transporter = null;
    }
  }

  console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
  return { sent: false, otp };
};

module.exports = sendOTPEmail;
