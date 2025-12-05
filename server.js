import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { fileURLToPath } = require('url');
const { promisify } = require('util');
const { execFile } = require('child_process');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = process.env.PORT || 4000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
}));

app.use(express.json());

const users = new Map();

const execFileAsync = promisify(execFile);

// Simple in-memory rate limiting: 60 requests per 15 minutes per IP
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitStore = new Map(); // key: ip, value: array of timestamps

function isRateLimited(ip) {
  const now = Date.now();
  const key = ip || 'unknown';
  let timestamps = rateLimitStore.get(key) || [];
  timestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return false;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getUserUsage(userId) {
  const today = getToday();
  let user = users.get(userId);
  if (!user) {
    user = { date: today, count: 0, isPro: false };
    users.set(userId, user);
  } else if (user.date !== today && !user.isPro) {
    user.date = today;
    user.count = 0;
  }
  return user;
}

// Free tier limit per day for non-Pro users
const DAILY_LIMIT = 5;

async function compressPdfWithGhostscript(inputBuffer, profile) {
  const tmpDir = os.tmpdir();
  const id = crypto.randomBytes(8).toString('hex');
  const inputPath = path.join(tmpDir, `greenpdf_in_${id}.pdf`);
  const outputPath = path.join(tmpDir, `greenpdf_out_${id}.pdf`);

  await fs.promises.writeFile(inputPath, inputBuffer);

  const isWin = process.platform === 'win32';
  const candidates = isWin ? ['gswin64c', 'gswin32c'] : ['gs'];
  let lastError = null;

  // Additional Ghostscript tuning based on profile
  let profileArgs = [];
  if (profile === 'screen') {
    // Very high compression (smallest size, lower quality)
    profileArgs = [
      '-dDetectDuplicateImages=true',
      '-dCompressFonts=true',
      '-dDownsampleColorImages=true',
      '-dColorImageDownsampleType=/Bicubic',
      '-dColorImageResolution=72',
      '-dDownsampleGrayImages=true',
      '-dGrayImageDownsampleType=/Bicubic',
      '-dGrayImageResolution=72',
      '-dDownsampleMonoImages=true',
      '-dMonoImageDownsampleType=/Bicubic',
      '-dMonoImageResolution=300',
    ];
  } else if (profile === 'ebook') {
    // Balanced compression
    profileArgs = [
      '-dDetectDuplicateImages=true',
      '-dCompressFonts=true',
      '-dDownsampleColorImages=true',
      '-dColorImageDownsampleType=/Bicubic',
      '-dColorImageResolution=96',
      '-dDownsampleGrayImages=true',
      '-dGrayImageDownsampleType=/Bicubic',
      '-dGrayImageResolution=96',
      '-dDownsampleMonoImages=true',
      '-dMonoImageDownsampleType=/Bicubic',
      '-dMonoImageResolution=300',
    ];
  } else if (profile === 'printer') {
    // Light compression, better quality
    profileArgs = [
      '-dDetectDuplicateImages=true',
      '-dCompressFonts=true',
      '-dDownsampleColorImages=true',
      '-dColorImageDownsampleType=/Bicubic',
      '-dColorImageResolution=150',
      '-dDownsampleGrayImages=true',
      '-dGrayImageDownsampleType=/Bicubic',
      '-dGrayImageResolution=150',
      '-dDownsampleMonoImages=true',
      '-dMonoImageDownsampleType=/Bicubic',
      '-dMonoImageResolution=600',
    ];
  }

  for (const cmd of candidates) {
    try {
      await execFileAsync(cmd, [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=/${profile}`,
        ...profileArgs,
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputPath}`,
        inputPath,
      ]);

      const outputBuffer = await fs.promises.readFile(outputPath);
      await fs.promises.unlink(inputPath).catch(() => {});
      await fs.promises.unlink(outputPath).catch(() => {});
      return outputBuffer;
    } catch (err) {
      lastError = err;
    }
  }

  await fs.promises.unlink(inputPath).catch(() => {});
  await fs.promises.unlink(outputPath).catch(() => {});

  const error = new Error('Ghostscript compression failed');
  error.cause = lastError;
  throw error;
}

app.get('/api/usage', (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : null;
  if (!userId) {
    res.status(400).json({ error: 'MISSING_USER_ID' });
    return;
  }
  const usage = getUserUsage(userId);
  const remaining = usage.isPro ? null : Math.max(0, DAILY_LIMIT - usage.count);
  res.json({
    isPro: usage.isPro,
    remaining,
    dailyLimit: DAILY_LIMIT,
  });
});

app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    const userId = req.body.userId;
    const compressionLevelRaw = req.body.compressionLevel;
    // Normalize compression level from UI (Light/Balanced/Max) to internal ids
    const normalizedLevel =
      typeof compressionLevelRaw === 'string'
        ? compressionLevelRaw.toLowerCase()
        : 'balanced';

    // Basic IP-based rate limiting
    const ip = (req.ip || req.headers['x-forwarded-for'] || '').toString();
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'RATE_LIMITED' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'MISSING_USER_ID' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'MISSING_FILE' });
      return;
    }
    // Free tier limit and Pro status are tracked per userId
    const usage = getUserUsage(userId);
    const isPro = usage.isPro;

    if (!isPro && usage.count >= DAILY_LIMIT) {
      res.status(403).json({
        error: 'LIMIT_REACHED',
        remaining: 0,
        isPro: false,
      });
      return;
    }
    const inputBuffer = req.file.buffer;
    const originalSize = inputBuffer.length;
    let outputBuffer;

    // Map UI compression presets to Ghostscript profiles
    let gsProfile = 'ebook'; // balanced default
    if (normalizedLevel === 'max') {
      gsProfile = 'screen'; // strongest compression, smallest size
    } else if (normalizedLevel === 'light') {
      gsProfile = 'printer'; // lighter compression, better quality
    }

    try {
      // First try strong compression via Ghostscript (Ghostscript-based core logic)
      outputBuffer = await compressPdfWithGhostscript(inputBuffer, gsProfile);
    } catch (e) {
      // Fallback: simple re-save via pdf-lib if Ghostscript is unavailable or fails
      try {
        const pdfDoc = await PDFDocument.load(inputBuffer);
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        outputBuffer = Buffer.from(pdfBytes);
      } catch (innerErr) {
        outputBuffer = inputBuffer;
      }
    }
    if (!isPro) {
      usage.count += 1;
    }

    const remaining = isPro ? null : Math.max(0, DAILY_LIMIT - usage.count);
    if (remaining !== null) {
      res.setHeader('X-Remaining-Compressions', String(remaining));
    }
    res.setHeader('X-Is-Pro', isPro ? 'true' : 'false');

    // Response metrics (sizes, reduction, simple CO2 estimate) as headers
    const compressedSize = outputBuffer.length;
    res.setHeader('X-Original-Size', String(originalSize));
    res.setHeader('X-Compressed-Size', String(compressedSize));
    if (originalSize > 0) {
      const reductionPercent = Math.round(
        ((originalSize - compressedSize) / originalSize) * 100
      );
      res.setHeader('X-Reduction-Percent', String(reductionPercent));

      // Very rough demo estimate: grams of CO2 saved per MB of data avoided
      const savedBytes = Math.max(0, originalSize - compressedSize);
      const savedMB = savedBytes / (1024 * 1024);
      const gramsPerMB = 0.5; // demo value, not scientifically precise
      const co2SavedGrams = Math.round(savedMB * gramsPerMB * 100) / 100;
      res.setHeader('X-CO2-Saved-Grams', String(co2SavedGrams));
    }
    const baseName = req.file.originalname.replace(/\.pdf$/i, '');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}-compressed.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(outputBuffer);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (razorpayKeyId && razorpayKeySecret) {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

app.post('/api/payment/create-order', async (req, res) => {
  if (!razorpayInstance) {
    res.status(500).json({ error: 'RAZORPAY_NOT_CONFIGURED' });
    return;
  }
  const userId = req.body.userId;
  if (!userId) {
    res.status(400).json({ error: 'MISSING_USER_ID' });
    return;
  }
  const amount = 90 * 100;
  try {
    const order = await razorpayInstance.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
      notes: { userId },
    });
    res.json({
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
    });
  } catch (error) {
    res.status(500).json({ error: 'ORDER_CREATION_FAILED' });
  }
});

app.post('/api/payment/verify', (req, res) => {
  const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!userId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: 'MISSING_FIELDS' });
    return;
  }
  if (!razorpayKeySecret) {
    res.status(500).json({ error: 'RAZORPAY_NOT_CONFIGURED' });
    return;
  }
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(body.toString())
    .digest('hex');
  if (expectedSignature === razorpay_signature) {
    const usage = getUserUsage(userId);
    usage.isPro = true;
    res.json({ success: true, isPro: true });
  } else {
    res.status(400).json({ error: 'INVALID_SIGNATURE' });
  }
});

// Serve built frontend (Vite dist) in production / Docker environments
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
