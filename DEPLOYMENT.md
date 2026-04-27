# Deployment Guide

This guide covers the steps required to deploy the AuthentiKit application.

## Backend (Google Cloud Run)

The backend is a Node.js Express API that utilizes Firebase, Google Cloud Vision, and the Gemini API.

### Prerequisites
1. Install the Google Cloud CLI (`gcloud`).
2. Authenticate using `gcloud auth login`.
3. Set your project `gcloud config set project hackathon-gemini-project`.

### Environment Variables
You must provide the following environment variables during deployment:
- `GEMINI_API_KEY`: Your Google Gemini API key.

*Note: The backend automatically uses Application Default Credentials (ADC) in Google Cloud Run to authenticate with Firebase and Google Cloud Vision, so no local `.json` key files are needed in production.*

### Deployment Command
Run the following command from within the `backend` directory:

```bash
gcloud run deploy authentikit-backend --source . --region us-central1 --allow-unauthenticated --set-env-vars="GEMINI_API_KEY=YOUR_API_KEY_HERE"
```

## Frontend (Vite + React)

The frontend is a React application built with Vite.

Before deploying the frontend, make sure the `axios` API calls point to your newly deployed Cloud Run backend URL instead of `localhost:5000`. We have already updated these in `AnalysisScreen.jsx` and `PublicVerificationScreen.jsx`.

### Local Development
```bash
cd frontend
npm install
npm run dev
```

### Production Build
To build the frontend for production (e.g., to deploy to Vercel, Render, or Firebase Hosting):
```bash
cd frontend
npm install
npm run build
```
The production-ready static files will be located in the `frontend/dist` directory.
