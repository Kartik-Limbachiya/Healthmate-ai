const { GoogleGenAI } = require('@google/genai');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "healthmate-ai-683ba"
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error.stack);
  }
}

async function run() {
  try {
    const userDoc = await admin.firestore().collection('users').doc('vGfC537B84P72nJ4Y8AylF7S9fR2').get();
    console.log("Firestore OK:", userDoc.exists);
  } catch (err) {
    console.error("Firebase Error:", err);
  }
}
run();
