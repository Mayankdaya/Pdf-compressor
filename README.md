

<div align="center">
<img width="1895" height="905" alt="image" src="https://github.com/user-attachments/assets/6db7bf96-b617-40a9-afe9-126221b7c8da" />

</div>

# PDF Compressor (GreenPDF)

> Fast, privacy-friendly PDF compression with a clean UI, daily free plan, and optional lifetime Pro upgrade.

This project is a full-stack PDF compressor:

- Frontend built with **React + Vite**
- Backend built with **Node.js + Express**
- Uses **Ghostscript** under the hood for high-quality PDF compression
- Deployed as a **Docker Space on Hugging Face**

Live Space:

- Hugging Face: https://huggingface.co/spaces/Mayankdl233/PDF-Compressor
- Public URL: https://mayankdl233-pdf-compressor.hf.space (when the Space is running)

---

## Features

- **Drag & drop PDF upload**
- **Three compression modes**: Light, Balanced, Max
- **Smart quality presets** tuned via Ghostscript
- **Daily free tier**: 5 compressions per day for non-Pro users
- **Pro lifetime plan**: unlocks unlimited compressions after one-time payment
- **Razorpay integration** for payments (can be disabled locally)
- **Local-only admin bypass** for testing the Pro flow without real payments
- Deployed to **Hugging Face Spaces (Docker)** using the included `Dockerfile`

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS (via CDN for the landing page styling)
- **Backend**: Node.js, Express, Multer
- **PDF processing**: Ghostscript, `pdf-lib` (fallback)
- **Payments**: Razorpay (optional)
- **Deployment**: Docker, Hugging Face Spaces (Docker SDK)

---

## Local Development

### Prerequisites

- **Node.js**: v18 or newer recommended (Docker image uses Node 20)
- **npm**: comes with Node
- **Ghostscript** (optional but recommended locally)
  - On Linux/macOS: `gs` in your PATH
  - On Windows: `gswin64c` / `gswin32c` in PATH

### 1. Clone the repository

```bash
git clone https://github.com/Mayankdaya/Pdf-compressor.git
cd Pdf-compressor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a file named `.env.local` in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key-optional
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
ENABLE_DEBUG_PRO=0
# Optional: local-only admin bypass for testing Pro without real payment
ADMIN_BYPASS_SECRET=my-super-long-local-secret-123
```

Notes:

- **Razorpay keys** are only required if you want to test real payments.
- Without Razorpay keys, the app still works for free daily compression.
- `ADMIN_BYPASS_SECRET` is only used **locally** to mark your account as Pro for testing.

### 4. Run the backend server

```bash
npm run server
```

This starts the Express backend on **http://localhost:4000**.

### 5. Run the frontend (Vite dev server)

In a second terminal:

```bash
npm run dev
```

This starts the Vite dev server on **http://localhost:3000**.

The Vite dev server is configured to **proxy** `/api` requests to the backend at `http://localhost:4000`.

### 6. Open the app

Visit:

```text
http://localhost:3000
```

Upload a PDF, choose a compression mode, and click **Compress PDF** to test the flow.

---

## Environment Variables

Summary of important variables:

- `GEMINI_API_KEY` (optional)
  - Reserved for future AI features; not required for compression.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (optional)
  - Required only if you want the Razorpay payment flow to work.
- `ENABLE_DEBUG_PRO` (optional)
  - Can be used for debug flags.
- `ADMIN_BYPASS_SECRET` (local only)
  - If set locally, you can mark your user as Pro by calling the admin endpoint from the browser console.

---

## Testing Pro Mode Locally (without real payment)

> This works **only locally**; the deployed Hugging Face Space runs with `NODE_ENV=production`, so bypass is disabled there by default.

1. Ensure `ADMIN_BYPASS_SECRET` is set in `.env.local` and `npm run server` has been restarted.
2. In your browser at `http://localhost:3000`, open DevTools → Console and run:

```js
const userId = localStorage.getItem('greenpdf_user_id');

fetch('/api/admin/grant-pro', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-secret': 'my-super-long-local-secret-123', // must match .env.local
  },
  body: JSON.stringify({ userId }),
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

3. If successful, the response will be:

```json
{ "success": true, "isPro": true }
```

4. Refresh the page. You should now see:

- A **"Pro account active – Unlimited compressions"** banner in the app.
- In Pricing, the Pro plan button shows **"You already have lifetime access"**.

---

## Deploying to Hugging Face Spaces (Docker)

This repo is preconfigured for deployment as a **Docker Space**.

### 1. Create a Space

1. Go to https://huggingface.co/spaces
2. Create a new Space under your account (e.g. `Mayankdl233/PDF-Compressor`).
3. Choose **SDK: Docker**.

### 2. Connect and push code

From the project root:

```bash
git remote add origin https://huggingface.co/spaces/Mayankdl233/PDF-Compressor
# (remote already configured in this project; adjust if needed)

git push origin main
```

The Space will build the Docker image using the included `Dockerfile` and expose the app on port **7860**.

### 3. Configure Space secrets

In the Space **Settings → Variables and secrets** add (if you want payments to work):

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Ghostscript is installed in the Docker image, so compression will work out of the box.

---

## Project Structure (high level)

- `components/CompressorApp.tsx` – main compression UI and client logic
- `components/Pricing.tsx` – pricing and payment UI
- `components/*` – landing page sections (hero, features, FAQ, etc.)
- `server.js` – Express API server (compression, usage tracking, payments, admin bypass)
- `Dockerfile` – build and runtime configuration for Hugging Face Spaces
- `vite.config.ts` – Vite config and dev proxy for `/api`

---

## License

No explicit license is included yet. Add one (e.g. MIT) if you plan to open-source or share this project widely.
