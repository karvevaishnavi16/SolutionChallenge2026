require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { analyzeVideoWithGemini } = require('../services/geminiService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Setup Multer for handling file uploads locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/analyze', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log(`Received video for analysis: ${req.file.filename}`);

    const fileBuffer = fs.readFileSync(req.file.path);
    const videoHash = crypto.createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    const extension = path.extname(req.file.originalname || '').toLowerCase();
    const fallbackMimeType = extension === '.mov' ? 'video/quicktime' : 'video/mp4';
    const mimeType = req.file.mimetype && req.file.mimetype !== 'application/octet-stream'
      ? req.file.mimetype
      : fallbackMimeType;

    // Call our Gemini AI service to analyze
    const analysisResult = await analyzeVideoWithGemini(req.file.path, mimeType);

    if (analysisResult && analysisResult.error) {
      return res.status(500).json(analysisResult);
    }

    res.json({
      success: true,
      hash: videoHash,
      results: analysisResult
    });

  } catch (error) {
    console.error('Error in analysis:', error);
    res.status(500).json({ error: true, message: error.message || 'Analysis failed. Try again.' });
  }
});

module.exports = router;
