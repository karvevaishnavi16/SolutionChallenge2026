// This service mocks the Google Cloud Vision API and Gemini API for the MVP.
// In the final version, this will be replaced with actual API calls.

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeVideo(filePath) {
  console.log(`Starting mock analysis for ${filePath}`);
  
  // Simulate processing time
  await wait(3500);

  // We randomly decide if the video is fake or real for demo purposes, 
  // but bias towards 'fake' to show off the XAI features.
  const isFake = Math.random() > 0.3;

  if (isFake) {
    return {
      status: 'completed',
      verdict: 'MANIPULATED',
      confidenceScore: 94.2,
      xaiReport: {
        summary: "Anomalies detected in physics-based trajectory and facial artifacts.",
        details: [
          {
            type: "Vision Anomaly",
            description: "Inconsistent lighting on the player's face compared to the environment.",
            timestamp: "00:04",
            severity: "High"
          },
          {
            type: "Physics Anomaly (Gemini VAR)",
            description: "The ball trajectory violates the Magnus effect given the apparent spin rate.",
            timestamp: "00:07",
            severity: "Critical"
          }
        ]
      }
    };
  } else {
    return {
      status: 'completed',
      verdict: 'AUTHENTIC',
      confidenceScore: 98.7,
      xaiReport: {
        summary: "No significant anomalies detected. Physics and visuals are consistent.",
        details: [
          {
            type: "Vision Check",
            description: "Facial features and lighting are consistent across frames.",
            timestamp: "overall",
            severity: "Pass"
          },
          {
            type: "Physics Check (Gemini VAR)",
            description: "Motion blur and object trajectory align with expected physics models.",
            timestamp: "overall",
            severity: "Pass"
          }
        ]
      }
    };
  }
}

module.exports = { analyzeVideo };
