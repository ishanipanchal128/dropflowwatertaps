# Drop Flow Website

Full-stack setup: the existing frontend (unchanged) served by a secure Node.js/Express backend.

## Folder structure

```
dropflow/
├─ package.json
├─ .env.example
├─ public/              ← the website itself (not modified)
│  ├─ index.html, about.html, contact.html, products.html, series.html,
│  │  product-detail.html, privacy-policy.html, terms-and-conditions.html
│  ├─ css/style.css
│  ├─ js/ (main.js, products.js, contact.js, inquiry.js, catalog-data.js)
│  └─ images/           ← put your image assets here (hero images, swatches, etc.)
└─ server/
   ├─ index.js          ← Express app (security middleware + static hosting)
   ├─ routes/
   │  ├─ products.js    ← GET /api/products, GET /api/categories
   │  └─ contact.js     ← POST /api/contact (validated + rate-limited)
   ├─ utils/
   │  ├─ storage.js     ← safe, queued writes to data/inquiries.json
   │  └─ mailer.js      ← optional SMTP email notification
   └─ data/
      ├─ products.json
      ├─ categories.json
      └─ inquiries.json ← enquiries submitted through the site land here
```

## Run it in VS Code

1. Open the `dropflow` folder in VS Code.
2. Open a terminal (`` Ctrl+` ``) and install dependencies:
   ```
   npm install
   ```
3. Copy the environment template and (optionally) fill in SMTP details:
   ```
   cp .env.example .env
   ```
   Leaving the `SMTP_*` values blank is fine — enquiries are still saved to
   `server/data/inquiries.json` either way.
4. Start the server:
   ```
   npm start
   ```
   or, for auto-restart while editing:
   ```
   npm run dev
   ```
5. Open **http://localhost:3000** in your browser. The Contact page and the
   floating "Product Inquiry" button both submit to `/api/contact`, and the
   product/category pages load their data from `/api/products` and
   `/api/categories`.

## What the backend adds

- **Helmet** — sets secure HTTP headers and a Content-Security-Policy.
- **CORS** — locked to same-origin by default (set `ALLOWED_ORIGIN` in `.env` to open it up).
- **express-rate-limit** — general API limiter plus a stricter one on the contact form to blunt spam/bots.
- **Input validation & sanitisation** (`validator`) — every contact submission is checked (required fields, email format, length limits) and escaped before being stored.
- **Body size limits** — JSON/urlencoded bodies capped at 20kb to reject oversized payloads.
- **Queued file writes** — enquiries are appended to `inquiries.json` through a small write-queue so two simultaneous submissions can't corrupt the file.
- **Centralised error handler** — unexpected errors return a generic message instead of leaking stack traces.
- **.env / .gitignore** — secrets (SMTP credentials) stay out of source control.

## Note

The `public/images/` folder is currently empty because no image files were
uploaded with the project (the pages reference local paths like
`images/hero/hero-ptmt.jpg`). Add your image files there with matching names,
or update the `src` paths, and they'll be served automatically.
