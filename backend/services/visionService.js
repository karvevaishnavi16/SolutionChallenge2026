const vision = require('@google-cloud/vision');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Initialize the Vision client using the Service Account JSON if it exists, otherwise use ADC
let visionConfig = {};
const keyPath = path.join(__dirname, '../google-cloud-key.json');
if (fs.existsSync(keyPath)) {
  visionConfig.keyFilename = keyPath;
} else {
  console.log('google-cloud-key.json not found, using ADC for Vision API');
}

const visionClient = new vision.ImageAnnotatorClient(visionConfig);

function extractFrames(videoPath, outputDir, numFrames = 3) {
  return new Promise((resolve, reject) => {
    const outputPattern = path.join(outputDir, `frame-${crypto.randomUUID()}-%d.png`);
    let generatedFiles = [];

    ffmpeg(videoPath)
      .on('filenames', (filenames) => {
        generatedFiles = filenames.map(f => path.join(outputDir, f));
      })
      .on('end', () => {
        resolve(generatedFiles);
      })
      .on('error', (err) => {
        console.error('Error extracting frames:', err);
        reject(err);
      })
      .screenshots({
        count: numFrames,
        folder: outputDir,
        filename: `frame-${crypto.randomUUID()}-%i.png`
      });
  });
}

async function analyzeFrame(framePath) {
  try {
    const [faceResult] = await visionClient.faceDetection(framePath);
    const faces = faceResult.faceAnnotations || [];

    const [propResult] = await visionClient.imageProperties(framePath);
    const colors = propResult.imagePropertiesAnnotation?.dominantColors?.colors || [];

    let isSuspicious = false;
    let reasons = [];

    if (faces.length > 0) {
      const face = faces[0];
      if (face.detectionConfidence < 0.7) {
        isSuspicious = true;
        reasons.push('Low face detection confidence (possible AI generation or face morphing).');
      }
      if (face.blurredLikelihood === 'LIKELY' || face.blurredLikelihood === 'VERY_LIKELY') {
        isSuspicious = true;
        reasons.push('Unnatural face blurring detected.');
      }
    }

    if (colors.length === 0) {
      isSuspicious = true;
      reasons.push('Unnatural color distribution detected.');
    }

    return {
      isSuspicious,
      reasons,
      facesDetected: faces.length
    };
  } catch (error) {
    console.error('Vision API error on frame:', error);
    return { isSuspicious: false, reasons: [], error: error.message };
  }
}

async function scanVideoWithVisionAPI(videoPath) {
  console.log(`Starting Vision API scan for ${videoPath}`);
  
  const framesDir = path.join(__dirname, '../uploads');
  let extractedFrames = [];
  
  try {
    // 1. Extract frames
    console.log('Extracting frames for Vision analysis...');
    extractedFrames = await extractFrames(videoPath, framesDir, 3);
    
    // 2. Analyze each frame
    console.log(`Analyzing ${extractedFrames.length} frames with Google Cloud Vision...`);
    let suspiciousCount = 0;
    let allReasons = new Set();
    
    for (const framePath of extractedFrames) {
      const analysis = await analyzeFrame(framePath);
      if (analysis.isSuspicious) {
        suspiciousCount++;
        analysis.reasons.forEach(r => allReasons.add(r));
      }
    }
    
    const isFake = suspiciousCount > 0;
    
    return {
      status: 'completed',
      isFake,
      confidenceScore: isFake ? Math.min(100, 50 + (suspiciousCount * 15)) : 95,
      reasons: Array.from(allReasons),
      framesScanned: extractedFrames.length,
      suspiciousFrames: suspiciousCount
    };
    
  } catch (error) {
    console.error("Vision scan failed:", error);
    return { error: true, message: error.message };
  } finally {
    // Cleanup extracted frames
    for (const frame of extractedFrames) {
      if (fs.existsSync(frame)) {
        fs.unlinkSync(frame);
      }
    }
  }
}

module.exports = { scanVideoWithVisionAPI };
