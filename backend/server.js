const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyRoutes = require('./routes/verify');

const app = express();
const port = process.env.PORT || 5000;

// Manual CORS - works reliably with Express 5
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://authentikit-48299.web.app',
  'https://authentikit-48299.firebaseapp.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// Setup multer for local temporary uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
app.use('/api/verify', verifyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AuthentiKit Backend Running' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
