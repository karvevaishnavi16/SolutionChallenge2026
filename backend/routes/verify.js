const express = require('express');
const multer = require('multer');
const { analyzeVideo } = require('../services/mockAI');
const crypto = require('crypto');

const router = express.Router();

// Setup Multer for handling file uploads locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
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

    // Generate a mock hash for the video to act as its unique fingerprint
    const videoHash = crypto.createHash('sha256').update(req.file.filename + Date.now()).digest('hex');

    // Call our mock AI service to analyze
    const analysisResult = await analyzeVideo(req.file.path);

    res.json({
      success: true,
      hash: videoHash,
      results: analysisResult
    });

  } catch (error) {
    console.error('Error in analysis:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;
