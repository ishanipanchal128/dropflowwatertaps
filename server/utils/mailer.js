const nodemailer = require('nodemailer');

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

async function sendNotification(entry) {
  const transporter = buildTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    subject: `New enquiry from ${entry.name} - Drop Flow website`,
    text:
      `Name: ${entry.name}\n` +
      `Phone: ${entry.phone}\n` +
      `Email: ${entry.email}\n` +
      `Received: ${entry.receivedAt}\n\n` +
      `Message:\n${entry.message}`,
  });
}

module.exports = { sendNotification };
