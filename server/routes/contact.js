const express = require('express');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const { appendInquiry } = require('../utils/storage');

const router = express.Router();

const MAX_LEN = { name: 100, phone: 20, email: 150, message: 2000 };

// Stricter limiter just for the write endpoint, to blunt form-spam/bot abuse.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent from this device. Please try again later.' },
});

function clean(value) {
  return validator.escape(validator.trim(String(value ?? '')));
}

router.post('/contact', contactLimiter, async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = body.name;
    const phone = body.phone;
    const email = body.email;
    const message = body.message;

    // ---- Validation ----
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required.' });
    }
    if (!validator.isLength(String(name), { min: 1, max: MAX_LEN.name })) {
      return res.status(400).json({ error: `Name must be under ${MAX_LEN.name} characters.` });
    }
    if (!validator.isLength(String(phone), { min: 5, max: MAX_LEN.phone })) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }
    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (message !== undefined && !validator.isLength(String(message), { max: MAX_LEN.message })) {
      return res.status(400).json({ error: `Message must be under ${MAX_LEN.message} characters.` });
    }

    // ---- Sanitisation (defense in depth, in case this is ever rendered as HTML later) ----
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: clean(name),
      phone: clean(phone),
      email: validator.normalizeEmail(String(email)) || clean(email),
      message: clean(message || ''),
      receivedAt: new Date().toISOString(),
    };

    await appendInquiry(entry);

    // ---- Optional email notification (only runs if SMTP is configured in .env) ----
    if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL) {
      try {
        const { sendNotification } = require('../utils/mailer');
        await sendNotification(entry);
      } catch (mailErr) {
        // Never fail the request just because the email notification failed;
        // the enquiry is already safely stored on disk.
        console.error('Email notification failed:', mailErr.message);
      }
    }

    res.json({ message: 'Thanks! We will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
