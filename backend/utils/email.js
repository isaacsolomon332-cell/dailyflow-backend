const nodemailer = require("nodemailer");
const logger = require("./logger");

const sendEmail = async ({ to, subject, html }) => {
  try {
   const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,        // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    const info = await transporter.sendMail({
      from: `"DailyFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

const baseTemplate = (content) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>DailyFlow</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6c63ff 0%,#48c6ef 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:1px;">DailyFlow</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Smart Goal Planning</p>
          </td>
        </tr>
        <tr><td style="padding:40px;">${content}</td></tr>
        <tr>
          <td style="background:#f9fafc;padding:24px 40px;text-align:center;border-top:1px solid #eef0f4;">
            <p style="margin:0;color:#9aa0ac;font-size:12px;">&copy; ${new Date().getFullYear()} DailyFlow. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const welcomeTemplate = (fullName) => baseTemplate(`
  <h2 style="margin:0 0 8px;color:#2d3748;font-size:22px;">Welcome aboard, ${fullName}! 🎉</h2>
  <p style="margin:0 0 20px;color:#718096;font-size:15px;line-height:1.7;">
    We're thrilled to have you join <strong>DailyFlow</strong>. Your account is all set and ready 
    to help you plan, track, and crush your daily goals.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0edff;border-radius:10px;margin-bottom:28px;">
    <tr><td style="padding:24px;">
      <p style="margin:0 0 12px;color:#6c63ff;font-weight:700;font-size:14px;text-transform:uppercase;">What you can do</p>
      <p style="margin:0 0 8px;color:#4a5568;font-size:14px;">✅ &nbsp;Set and track daily goals</p>
      <p style="margin:0 0 8px;color:#4a5568;font-size:14px;">📊 &nbsp;Visualise your progress</p>
      <p style="margin:0;color:#4a5568;font-size:14px;">🔔 &nbsp;Get smart reminders</p>
    </td></tr>
  </table>
  <p style="margin:0;color:#a0aec0;font-size:13px;">Cheers,<br/><strong style="color:#6c63ff;">The DailyFlow Team</strong></p>`);

const loginNotificationTemplate = (fullName, loginTime) => baseTemplate(`
  <h2 style="margin:0 0 8px;color:#2d3748;font-size:22px;">New Login Detected 🔐</h2>
  <p style="margin:0 0 24px;color:#718096;font-size:15px;line-height:1.7;">
    Hi <strong>${fullName}</strong>, we noticed a new login to your DailyFlow account.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fc;border-radius:10px;margin-bottom:20px;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 10px;color:#4a5568;font-size:14px;"><span style="color:#9aa0ac;">Time:</span> &nbsp;<strong>${loginTime}</strong></p>
      <p style="margin:0;color:#4a5568;font-size:14px;"><span style="color:#9aa0ac;">Status:</span> &nbsp;<strong style="color:#38a169;">Successful</strong></p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border-radius:10px;margin-bottom:28px;border-left:4px solid #fc8181;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0;color:#c53030;font-size:13px;line-height:1.6;"><strong>Wasn't you?</strong> Reset your password immediately.</p>
    </td></tr>
  </table>
  <p style="margin:0;color:#a0aec0;font-size:13px;">Stay safe,<br/><strong style="color:#6c63ff;">The DailyFlow Team</strong></p>`);

const otpTemplate = (fullName, otp) => baseTemplate(`
  <h2 style="margin:0 0 8px;color:#2d3748;font-size:22px;">Password Reset Request 🔑</h2>
  <p style="margin:0 0 24px;color:#718096;font-size:15px;line-height:1.7;">
    Hi <strong>${fullName}</strong>, use the one-time code below to reset your password. 
    This code expires in <strong>10 minutes</strong>.
  </p>
  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-block;background:linear-gradient(135deg,#6c63ff 0%,#48c6ef 100%);border-radius:12px;padding:24px 48px;">
      <p style="margin:0;color:#fff;font-size:42px;font-weight:800;letter-spacing:10px;font-family:'Courier New',monospace;">${otp}</p>
    </div>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border-radius:10px;margin-bottom:28px;border-left:4px solid #fc8181;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0;color:#c53030;font-size:13px;"><strong>Never share this code with anyone.</strong></p>
    </td></tr>
  </table>
  <p style="margin:0;color:#a0aec0;font-size:13px;"><strong style="color:#6c63ff;">The DailyFlow Team</strong></p>`);

const passwordChangedTemplate = (fullName) => baseTemplate(`
  <h2 style="margin:0 0 8px;color:#2d3748;font-size:22px;">Password Changed Successfully ✅</h2>
  <p style="margin:0 0 24px;color:#718096;font-size:15px;line-height:1.7;">
    Hi <strong>${fullName}</strong>, your DailyFlow password has been changed successfully.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fff4;border-radius:10px;margin-bottom:20px;border-left:4px solid #68d391;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0;color:#276749;font-size:14px;">Your account is secured with the new password.</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border-radius:10px;margin-bottom:28px;border-left:4px solid #fc8181;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0;color:#c53030;font-size:13px;"><strong>Wasn't you?</strong> Contact support immediately.</p>
    </td></tr>
  </table>
  <p style="margin:0;color:#a0aec0;font-size:13px;">Stay secure,<br/><strong style="color:#6c63ff;">The DailyFlow Team</strong></p>`);

const sendWelcomeEmail = (user) =>
  sendEmail({ to: user.email, subject: "Welcome to DailyFlow 🎉", html: welcomeTemplate(user.fullName) });

const sendLoginNotificationEmail = (user) => {
  const loginTime = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }) + " UTC";
  return sendEmail({ to: user.email, subject: "New Login to Your DailyFlow Account", html: loginNotificationTemplate(user.fullName, loginTime) });
};



const sendOtpEmail = (user, otp) =>
  sendEmail({ to: user.email, subject: "Your DailyFlow Password Reset Code", html: otpTemplate(user.fullName, otp) });

const sendPasswordChangedEmail = (user) =>
  sendEmail({ to: user.email, subject: "DailyFlow Password Changed Successfully", html: passwordChangedTemplate(user.fullName) });

module.exports = { sendWelcomeEmail, sendLoginNotificationEmail, sendOtpEmail, sendPasswordChangedEmail };