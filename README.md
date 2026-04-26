# AuthentiKit - Google AI Solution Challenge 2026

![AuthentiKit Banner](https://via.placeholder.com/1200x300/0f172a/3b82f6?text=AuthentiKit+-+AI+Sports+Video+Verification)

## 1. Problem Statement (Given by Google)
Sports organizations generate massive volumes of high-value digital media that rapidly scatter across global platforms, making it nearly impossible to track. This vast visibility gap leaves proprietary content highly vulnerable to widespread digital misappropriation, unauthorized redistribution, and intellectual property violations.

**Objective:** Develop a scalable, innovative solution to identify, track, and flag unauthorized use or misappropriation of official sports media across the internet. Enable organizations to proactively authenticate their digital assets and detect anomalies in content propagation in near real-time.

---

## 2. Our Understanding of the Problem
When we read the problem statement, most teams will think of piracy — stolen real videos being redistributed. But we identified a deeper, newer, and completely unsolved threat:

> **AI tools like Sora, Runway, and Kling can now generate fake sports videos that look completely real.**

A fake Virat Kohli century. A fake VAR decision overturning a goal. A fake IPL match highlight. These spread on social media as truth — and no existing tool can detect them.

**This is the gap we chose to fill.**

---

## 3. Our Solution: AuthentiKit
AuthentiKit is an end-to-end AI-powered verification platform designed to authenticate sports media and detect deepfakes or AI-generated manipulation using physics-based multimodal analysis.

### ✨ Core Features
1. **Physics-Based Anomaly Engine:** Uses **Gemini 1.5 Pro**'s multimodal video understanding to analyze if the trajectory of a ball, the momentum of a player, or the angle of shadows violates real-world physics.
2. **VAR Integrity Protocol:** Automatically extracts match context (Scoreboards, Team Names, Dates) from video frames using Gemini and cross-references it with live external sports databases (e.g., CricAPI).
3. **C2PA Digital Certification:** If a video passes all checks, the system issues a cryptographic C2PA-compliant Certificate of Authenticity with a verifiable QR code fingerprint (SHA-256).

---

## 4. Technology Stack
We aggressively leveraged Google Cloud and AI tools to build a highly scalable prototype.

### 🧠 Google AI & Machine Learning
*   **Google Gemini 1.5 Pro API:** The core multimodal reasoning engine handling video physics analysis and contextual text extraction.
*   **Google Cloud Video Intelligence API:** Pre-processes video files to extract frame metadata and entity labels.

### ⚙️ Backend (Server & API)
*   **Node.js & Express.js:** Robust backend framework for handling API requests and video file streams.
*   **Multer:** Secure middleware for video upload processing.
*   **Axios:** Handles secondary integrity checks via external sports APIs.

### 🎨 Frontend (Dashboard)
*   **React.js & Vite:** High-performance, component-based frontend.
*   **Tailwind CSS:** Modern, responsive "glassmorphism" UI design with dynamic scanning animations.

### 🔐 Trust & Security
*   **SHA-256 Hashing:** Creates a unique, immutable fingerprint for every processed video.
*   **Simulated C2PA Standards & QR Codes:** Dynamically generates visual proof of authenticity for verified media.

---

## 5. How to Run Locally

### Prerequisites
* Node.js (v18+)
* Google Cloud Console Account (for Gemini & Vision APIs)

### Setup Instructions

**1. Clone the repository**
```bash
git clone https://github.com/CtrlAIWin/SolutionChallenge2026.git
cd SolutionChallenge2026
```

**2. Setup Backend**
```bash
cd backend
npm install
```
*Create a `.env` file in the backend folder and add your keys:*
```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
CRIC_API_KEY=your_cricapi_key_here
PORT=5000
```
*Start the backend server:*
```bash
npm start
```

**3. Setup Frontend**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 6. 🧪 Testing the Prototype
To test the AI analysis, please use the provided video clips inside the `sample_videos` folder. 

**Why use these sample clips?**
Because Google Cloud API payloads (specifically inline Base64 video analysis) have strict size limits. Our sample videos are compressed to **under 5MB** to ensure the prototype runs quickly and flawlessly during live demos without throwing payload errors. 

If you upload your own videos, please ensure they are short (under 10 seconds) and highly compressed.

---
*Built with ❤️ by Ctrl+AI+Win for the Google AI Solution Challenge 2026.*
