import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { findRecommendations } from '@/lib/rag';
import * as admin from 'firebase-admin';

// Only try to use Firebase Admin if credentials are provided in the environment.
// For local development without a service account, we will fall back to Gemini-only extraction.
let dbTraits: any = {};
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error: any) {
    console.log('Firebase admin initialization skipped/failed:', error.message);
  }
}

const ai = new GoogleGenAI({ apiKey: 'AIzaSyCEgXYvKip0ULCvQWWfgUu9Z6GC52xkIKc' });

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    const lastMessage = messages[messages.length - 1].content;

    // Fetch DB traits if we have a userId AND Firebase Admin is successfully initialized
    if (userId && admin.apps.length > 0) {
      try {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const data = userDoc.data() || {};
          
          let age;
          if (data.dob) {
            const birthDate = new Date(data.dob);
            age = new Date().getFullYear() - birthDate.getFullYear();
          }

          dbTraits = {
            name: data.displayName || data.firstName || "Athlete",
            age: age,
            sex: data.gender === "female" ? "Female" : (data.gender === "male" ? "Male" : undefined),
            weight: data.weight,
            height: data.height ? data.height / 100 : undefined, // cm to m
            goal: data.fitnessGoal
          };
          console.log("Loaded traits from DB:", dbTraits);
        }
      } catch (err) {
        console.error("Failed to load user info from DB", err);
      }
    }

    // Step 1: Extract structured parameters using Gemini
    const extractResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract any of the following parameters about the user from the text (if possible) into a clean JSON object ONLY (no markdown formatting, just {"key": "value"}!). \nKeys: "age" (number), "sex" ("Male" or "Female"), "weight" (number in kg), "height" (number in meters), "goal" ("Weight Gain", "Weight Loss", "Weight Maintenance", "Muscle Gain"). If not found, ignore the key.
---
Text: ${lastMessage}
`
    });

    let traits: any = {};
    const rawExtraction = extractResponse.text || '{}';
    try {
      const jsonStr = rawExtraction.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      traits = JSON.parse(jsonStr);
    } catch (e) {
      console.log('Failed to parse extraction:', rawExtraction);
    }

    // Merge DB traits with extracted traits (extracted overrides DB if user explicitly states a change)
    const combinedTraits = { ...dbTraits, ...traits };
    console.log('Combined traits for RAG:', combinedTraits);

    // Step 2: Fetch matches from the JSON dataset
    const matchedData = findRecommendations(combinedTraits);
    console.log('Found matches:', matchedData.length);

    // Step 3: Call Gemini with the dataset context
    const contextStr = matchedData.map((row: any) => 
      `Profile Match: 
Level: ${row.Level}
Goal: ${row['Fitness Goal']}
Exercises to recommend: ${row.Exercises}
Equipment needed: ${row.Equipment}
Diet to recommend: ${row.Diet}
General Advice: ${row.Recommendation}`
    ).join('\n\n');

    // Remove the most recent message so we can swap it out with context-enriched message
    messages.pop();

    const promptText = `You are an expert fitness and diet chatbot. You are polite, encouraging, and highly knowledgeable.
Use the following context from our dataset and the user's explicit profile to help answer their question. If the dataset provides specific workouts, diets, or advice for their profile, incorporate them into your answer naturally. Do not explicitly say "the dataset says", but rather "I recommend" or "Based on your focus...". If the dataset context is empty or irrelevant, just provide standard fitness advice.

---
User's Real Profile:
Name: ${combinedTraits.name || 'Unknown'}
Age: ${combinedTraits.age || 'Unknown'}
Sex: ${combinedTraits.sex || 'Unknown'}
Weight: ${combinedTraits.weight ? combinedTraits.weight + 'kg' : 'Unknown'}
Height: ${combinedTraits.height ? combinedTraits.height + 'm' : 'Unknown'}
Fitness Goal: ${combinedTraits.goal || 'Unknown'}
---
Dataset RAG Context:
${contextStr}
---
User's Question: ${lastMessage}`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    return NextResponse.json({
      role: 'assistant',
      content: chatResponse.text
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
