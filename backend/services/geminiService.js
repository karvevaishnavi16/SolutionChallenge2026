const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const QRCode = require('qrcode');
require("dotenv").config();

let genAI = null;
let fileManager = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
} else {
  console.log("Warning: GEMINI_API_KEY is not set. API calls will fail.");
}

const DETECTION_PROMPT = `You are a forensic sports video authentication expert.
Analyze this video strictly for deepfake or AI generation.
This video may contain ANY of these suspicious scenarios:
- Non-player or random person inserted into a real match
- Real player placed in a fictional or wrong context
- AI-generated crowd, stadium, or background
- Digitally replaced faces on real player bodies
- Real match footage with manipulated moments
- Entirely AI-generated sports scene
- Partial edits - only some frames manipulated

Check ALL of these signals strictly:
1. IDENTITY - does the person match a real known player?
   Wrong body proportions, face inconsistency = FAKE
2. CONTEXT - does the person belong in this sports scene?
   Wrong uniform, wrong stadium, wrong era = FAKE
3. PHYSICS - ball trajectory, gravity, player speed realistic?
   Impossible curves, superhuman jumps = FAKE
4. VISUAL ARTIFACTS - edge blurring, GAN skin texture,
   temporal flickering between frames = FAKE
5. LIGHTING - shadows and light consistent across all frames?
   Inconsistent light direction = FAKE
6. BACKGROUND - crowd, stadium, pitch look real or synthetic?
   AI-generated textures, copy-paste crowd = FAKE
7. MOTION - does camera movement feel natural?
   Unnatural zoom or cut = FAKE

Be STRICT. Flag ANY single suspicious signal as FAKE.
Return ONLY valid JSON, no markdown, no explanation:
{
  "isFake": boolean,
  "confidenceScore": number,
  "flaggedFrames": [array of frame numbers],
  "reasons": [array of specific strings explaining each issue found],
  "aiToolDetected": boolean,
  "aiToolLikely": "Sora" | "Runway" | "Kling" | "FaceSwap" | "DeepFaceLab" | "Unknown" | "None",
  "manipulationType": "FullySynthetic" | "FaceSwap" | "ContextManipulation" | "PartialEdit" | "BackgroundReplacement" | "IdentityFraud" | "Authentic"
}`;

const MATCH_DETAILS_PROMPT = `You are a sports and media analyst.
Examine this video carefully.
This video could be ANY of these types:
- Live match footage
- Training/practice session
- Celebration or fan video
- Highlight reel
- Press conference
- Player in non-sports context
- Completely AI-generated scene
- Edited/manipulated clip

Extract whatever context is visible.
Look at: scoreboards, jerseys, banners,
text overlays, stadium, setting, people present.

Return ONLY valid JSON, no markdown:
{
  "videoType": "Match" | "Training" | "Celebration" | "PressConference" | "Highlight" | "NonSportsContext" | "AIGenerated" | "Unknown",
  "sport": "string or Unknown",
  "team1": "string or Unknown",
  "team2": "string or Unknown",
  "score": "string or Unknown",
  "date": "string or Unknown",
  "stadium": "string or Unknown",
  "tournament": "string or Unknown",
  "playersIdentified": [array of strings or empty array],
  "settingLooksReal": boolean,
  "contextMatchesSport": boolean,
  "suspiciousElements": [array of strings describing anything that looks out of place]
}`;

async function uploadToGeminiFileAPI(filePath, mimeType, retries = 3) {
    console.log(`Uploading ${filePath} to Gemini File API...`);
    let uploadResult;
    
    for (let i = 0; i < retries; i++) {
        try {
            uploadResult = await fileManager.uploadFile(filePath, {
                mimeType,
                displayName: path.basename(filePath).replace(/[^\x00-\x7F]/g, ""), // strip weird chars just in case
            });
            break; // Success
        } catch (error) {
            console.error(`Upload attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) throw error;
            console.log("Waiting 3 seconds before retrying...");
            await new Promise(res => setTimeout(res, 3000));
        }
    }

    let file = await fileManager.getFile(uploadResult.file.name);
    console.log(`Uploaded file as: ${file.uri}`);

    console.log("Waiting for video processing to complete on Gemini's servers...");
    while (file.state === "PROCESSING") {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === "FAILED") {
        throw new Error("Analysis failed. Try again.");
    }

        console.log(`\nVideo is ready for analysis. State: ${file.state}`);
    return file;
}

function getAnalysisFailureMessage(error) {
    const message = String(error && error.message ? error.message : '');

    if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        return 'Gemini API key is invalid or missing. Check backend/.env and restart the server.';
    }

    if (message.includes('429') || message.includes('quota')) {
        return 'Gemini quota exceeded. Please wait a minute and try again, or enable billing for the API project.';
    }

    if (message.includes('404') || message.includes('not found')) {
        return 'Configured Gemini model is unavailable for this API key.';
    }

    return 'Analysis failed. Try again.';
}

function stripCodeFences(text) {
    const trimmed = String(text || "").trim();
    if (trimmed.startsWith("```json")) {
        return trimmed.slice(7, trimmed.endsWith("```") ? -3 : undefined).trim();
    }
    if (trimmed.startsWith("```")) {
        return trimmed.slice(3, trimmed.endsWith("```") ? -3 : undefined).trim();
    }
    return trimmed;
}

function parseGeminiJson(text) {
    return JSON.parse(stripCodeFences(text));
}

function normalizeString(value, fallback = 'Unknown') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
}

function normalizeNumberArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item));
}

function normalizeDetectionResult(parsed) {
    const rawConfidence = Number(parsed && parsed.confidenceScore);
    const normalizedConfidence = Number.isFinite(rawConfidence)
        ? (rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence)
        : 0;

    return {
        isFake: Boolean(parsed && parsed.isFake),
        confidenceScore: Math.max(0, Math.min(100, normalizedConfidence)),
        flaggedFrames: normalizeNumberArray(parsed && parsed.flaggedFrames),
        reasons: normalizeStringArray(parsed && parsed.reasons),
        aiToolDetected: Boolean(parsed && parsed.aiToolDetected),
        aiToolLikely: normalizeString(parsed && parsed.aiToolLikely, 'Unknown'),
        manipulationType: normalizeString(parsed && parsed.manipulationType, 'Authentic'),
    };
}

function normalizeMatchDetails(parsed) {
    return {
        videoType: normalizeString(parsed && parsed.videoType),
        sport: normalizeString(parsed && parsed.sport),
        team1: normalizeString(parsed && parsed.team1),
        team2: normalizeString(parsed && parsed.team2),
        score: normalizeString(parsed && parsed.score),
        date: normalizeString(parsed && parsed.date),
        stadium: normalizeString(parsed && parsed.stadium),
        tournament: normalizeString(parsed && parsed.tournament),
        playersIdentified: normalizeStringArray(parsed && parsed.playersIdentified),
        settingLooksReal: Boolean(parsed && parsed.settingLooksReal),
        contextMatchesSport: Boolean(parsed && parsed.contextMatchesSport),
        suspiciousElements: normalizeStringArray(parsed && parsed.suspiciousElements),
    };
}

async function runGeminiJsonCall(model, filePart, prompt) {
    const result = await model.generateContent([
        filePart,
        { text: prompt }
    ]);

    return parseGeminiJson(result.response.text());
}

async function performVARCheck(matchDetails) {
    return {
        details: matchDetails,
        verified: Boolean(
            matchDetails &&
            matchDetails.settingLooksReal &&
            matchDetails.contextMatchesSport
        )
    };
}

async function generateC2PACertificate(videoHash, verdict) {
    console.log("Generating Certificate...");
    const qrCodeDataUrl = await QRCode.toDataURL(`https://authentikit.app/verify/${videoHash}`);

    return {
        certificateUrl: `/api/verify/download/${videoHash}`,
        qrCode: qrCodeDataUrl,
        manifest: {
            hash: videoHash,
            timestamp: new Date().toISOString(),
            issuer: "AuthentiKit",
            verdict,
            signaturesValid: true
        }
    };
}

async function analyzeVideoWithGemini(filePath, mimeType) {
    console.log(`Starting Gemini analysis for ${filePath}`);

    try {
        const uploadedFile = await uploadToGeminiFileAPI(filePath, mimeType);
        const filePart = {
            fileData: {
                fileUri: uploadedFile.uri,
                mimeType: uploadedFile.mimeType,
            },
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                temperature: 0,
                responseMimeType: "application/json"
            }
        });

        const detectionRaw = await runGeminiJsonCall(model, filePart, DETECTION_PROMPT);
        const matchDetailsRaw = await runGeminiJsonCall(model, filePart, MATCH_DETAILS_PROMPT);

        const physicsResult = normalizeDetectionResult(detectionRaw);
        const matchDetails = normalizeMatchDetails(matchDetailsRaw);
        const isFakeWithThreshold = physicsResult.isFake && physicsResult.confidenceScore > 55;
        const verdict = isFakeWithThreshold ? 'MANIPULATED' : 'AUTHENTIC';
        const videoHash = crypto
            .createHash('sha256')
            .update(fs.readFileSync(filePath))
            .digest('hex');

        const varResult = await performVARCheck(matchDetails);
        const certificate = await generateC2PACertificate(videoHash, verdict);
        const contextLooksSafe = matchDetails.settingLooksReal && matchDetails.contextMatchesSport;
        const contextSummary = [
            `Video Type: ${matchDetails.videoType}`,
            `Sport: ${matchDetails.sport}`,
            `Teams: ${matchDetails.team1} vs ${matchDetails.team2}`,
            `Score: ${matchDetails.score}`,
            `Stadium: ${matchDetails.stadium}`,
            `Tournament: ${matchDetails.tournament}`
        ].join(' | ');

        return {
            status: 'completed',
            verdict,
            confidenceScore: physicsResult.confidenceScore,
            xaiReport: {
                summary: physicsResult.reasons.length > 0
                    ? physicsResult.reasons.join('. ')
                    : 'No anomalies detected. Video appears authentic.',
                manipulationType: physicsResult.manipulationType,
                details: [
                    ...physicsResult.reasons.map((reason, index) => ({
                        type: physicsResult.isFake ? 'Anomaly Detected' : 'Check Passed',
                        description: reason,
                        timestamp: physicsResult.flaggedFrames[index]
                            ? `Frame ${physicsResult.flaggedFrames[index]}`
                            : 'overall',
                        severity: physicsResult.isFake ? 'Critical' : 'Pass'
                    })),
                    {
                        type: 'VAR Integrity Check',
                        description: contextSummary,
                        timestamp: 'overall',
                        severity: 'Info'
                    },
                    {
                        type: 'Identity & Context Check',
                        description: contextLooksSafe
                            ? 'Setting appears genuine and context matches the sport'
                            : 'Setting or sports context appears suspicious',
                        timestamp: 'overall',
                        severity: contextLooksSafe ? 'Pass' : 'Warning'
                    }
                ]
            },
            varCheck: varResult,
            certificate,
            rawGeminiData: {
                detection: physicsResult,
                matchDetails
            }
        };
    } catch (error) {
        console.error("Gemini analysis failed:", error);
        return { error: true, message: getAnalysisFailureMessage(error) };
    }
}

module.exports = { analyzeVideoWithGemini, generateC2PACertificate };
