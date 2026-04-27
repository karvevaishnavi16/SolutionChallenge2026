const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount = null;
try {
  serviceAccount = require('../firebase-key.json');
} catch (err) {
  console.log('Local firebase-key.json not found, using default credentials (ADC).');
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
} else {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'hackathon-gemini-project';
  admin.initializeApp({
    storageBucket: `${projectId}.appspot.com`
  });
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

async function uploadVideoToFirebase(localFilePath, destinationName) {
  try {
    console.log(`Uploading ${destinationName} to Firebase Storage...`);
    const [file] = await bucket.upload(localFilePath, {
      destination: `videos/${destinationName}`,
      metadata: {
        contentType: 'video/mp4',
      },
    });

    // Make the file publicly accessible so it can be viewed in the certificate if needed
    await file.makePublic();
    
    return file.publicUrl();
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    // Don't throw, just return null so analysis doesn't fail if storage fails
    return null; 
  }
}

async function saveVerificationRecord(hash, data) {
  try {
    console.log(`Saving verification record for hash ${hash} to Firestore...`);
    
    const recordRef = db.collection('verifications').doc(hash);
    
    await recordRef.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      hash: hash
    });
    
    return true;
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return false;
  }
}

async function getVerificationRecord(hash) {
  try {
    const doc = await db.collection('verifications').doc(hash).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  } catch (error) {
    console.error('Error getting from Firestore:', error);
    return null;
  }
}

module.exports = {
  uploadVideoToFirebase,
  saveVerificationRecord,
  getVerificationRecord
};
