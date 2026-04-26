require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { analyzeVideoWithGemini } = require('../services/geminiService');
const { scanVideoWithVisionAPI } = require('../services/visionService');
const { uploadVideoToFirebase, saveVerificationRecord, getVerificationRecord } = require('../services/firebaseService');
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

    // Call our Gemini AI service to analyze (Physics/VAR Check)
    const geminiResult = await analyzeVideoWithGemini(req.file.path, mimeType);

    // Call our Vision API service to analyze frames (Deepfake/Pixel Check)
    const visionResult = await scanVideoWithVisionAPI(req.file.path);

    if ((geminiResult && geminiResult.error) || (visionResult && visionResult.error)) {
      return res.status(500).json({
        error: true, 
        message: geminiResult.error ? geminiResult.message : visionResult.message 
      });
    }

    // Combine the results
    const combinedVerdict = (geminiResult.verdict === 'MANIPULATED' || visionResult.isFake) 
        ? 'MANIPULATED' 
        : 'AUTHENTIC';
        
    const combinedConfidence = Math.max(geminiResult.confidenceScore || 0, visionResult.confidenceScore || 0);

    // Add Vision reasons to the XAI report
    const combinedDetails = [...(geminiResult.xaiReport?.details || [])];
    
    if (visionResult.reasons.length > 0) {
        visionResult.reasons.forEach(reason => {
            combinedDetails.push({
                type: 'Pixel/Face Anomaly',
                description: reason,
                timestamp: 'frame-level',
                severity: 'Critical'
            });
        });
    } else {
        combinedDetails.push({
            type: 'Frame-by-Frame Pixel Analysis',
            description: 'No deepfake pixel manipulation or face anomalies detected.',
            timestamp: 'frame-level',
            severity: 'Pass'
        });
    }

    const finalResult = {
        ...geminiResult,
        verdict: combinedVerdict,
        confidenceScore: combinedConfidence,
        xaiReport: {
            ...geminiResult.xaiReport,
            details: combinedDetails
        },
        visionAnalysis: visionResult
    };

    // Firebase Integration
    // 1. Upload video to Firebase Storage
    const storageUrl = await uploadVideoToFirebase(req.file.path, req.file.filename);
    if (storageUrl) {
      finalResult.videoUrl = storageUrl;
    }

    // 2. Save Verification Record to Firestore
    const recordData = {
      hash: videoHash,
      results: finalResult,
      fileName: req.file.originalname,
      videoUrl: storageUrl || null,
      mimeType: mimeType
    };
    
    await saveVerificationRecord(videoHash, recordData);

    res.json({
      success: true,
      hash: videoHash,
      results: finalResult
    });

  } catch (error) {
    console.error('Error in analysis:', error);
    res.status(500).json({ error: true, message: error.message || 'Analysis failed. Try again.' });
  }
});

// GET endpoint to fetch a verification record by its hash
router.get('/:hash', async (req, res) => {
  try {
    const hash = req.params.hash;
    const record = await getVerificationRecord(hash);
    
    if (!record) {
      return res.status(404).json({ error: true, message: 'Verification record not found' });
    }
    
    res.json({ success: true, record });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: true, message: 'Error fetching record' });
  }
});

module.exports = router;
