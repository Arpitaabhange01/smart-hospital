const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async ({ to, name, otp, type, customSubject, customHtml }) => {
  if (customSubject && customHtml) {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject: customSubject, html: customHtml });
    return;
  }

  const subject =
    type === 'register'
      ? 'Verify Your Email - Smart Hospital'
      : 'Password Reset OTP - Smart Hospital';

  const heading =
    type === 'register' ? 'Email Verification' : 'Reset Your Password';

  const message =
    type === 'register'
      ? 'Please use the OTP below to verify your email and complete registration.'
      : 'Use the OTP below to reset your password. If you did not request this, ignore this email.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        body { margin:0; padding:0; background:#f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0f4c81 0%, #1a7fc1 100%); padding:36px 40px; text-align:center; }
        .header h1 { color:#fff; margin:0; font-size:22px; font-weight:700; letter-spacing:0.5px; }
        .header p  { color:rgba(255,255,255,0.8); margin:6px 0 0; font-size:13px; }
        .body { padding:40px; }
        .body p  { color:#444; font-size:15px; line-height:1.7; margin:0 0 20px; }
        .otp-box { background:#f0f7ff; border:2px dashed #1a7fc1; border-radius:12px; text-align:center; padding:24px; margin:28px 0; }
        .otp-box span { font-size:42px; font-weight:800; color:#0f4c81; letter-spacing:10px; }
        .otp-box small { display:block; color:#888; font-size:12px; margin-top:8px; }
        .footer { background:#f9fafb; padding:20px 40px; text-align:center; border-top:1px solid #eee; }
        .footer p { color:#999; font-size:12px; margin:0; }
        .badge { display:inline-block; background:#e8f4fd; color:#1a7fc1; border-radius:20px; padding:4px 14px; font-size:12px; font-weight:600; margin-bottom:16px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>🏥 Smart Hospital</h1>
          <p>AI Powered Hospital Management System</p>
        </div>
        <div class="body">
          <span class="badge">${heading}</span>
          <p>Hello <strong>${name}</strong>,</p>
          <p>${message}</p>
          <div class="otp-box">
            <span>${otp}</span>
            <small>This OTP expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</small>
          </div>
          <p>Do not share this OTP with anyone. Our team will never ask for your OTP.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Smart Hospital. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { generateOTP, sendOTPEmail };
