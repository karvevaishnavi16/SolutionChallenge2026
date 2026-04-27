const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyRoutes = require('./routes/verify');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://authentikit-48299.web.app',
    'https://authentikit-48299.firebaseapp.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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
