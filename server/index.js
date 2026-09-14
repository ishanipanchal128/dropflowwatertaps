require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const productsRouter = require('./routes/products');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Render correctly behind a reverse proxy (Render, Railway, Nginx, etc.)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ---------- Security headers ----------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // The site's own inline <script> blocks (e.g. renderFeatured()) need 'unsafe-inline'.
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ---------- CORS (API is same-origin by default) ----------
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN : true,
    methods: ['GET', 'POST'],
  })
);

app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));

// ---------- Body parsing with sane size limits (mitigates payload-flood abuse) ----------
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// ---------- General API rate limiting (contact form has its own stricter limit) ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ---------- API routes ----------
app.use('/api', productsRouter);
app.use('/api', contactRouter);

// ---------- Static frontend (unchanged site) ----------
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html'],
    maxAge: isProd ? '1d' : 0,
  })
);

// ---------- 404 for anything else ----------
app.use((req, res) => {
  res.status(404).type('html').send('<h1>404 - Page Not Found</h1><p><a href="/">Back to Drop Flow</a></p>');
});

// ---------- Centralised error handler (never leaks stack traces to the client) ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again shortly.' });
});

app.listen(PORT, () => {
  console.log(`Drop Flow server running at http://localhost:${PORT}`);
});
