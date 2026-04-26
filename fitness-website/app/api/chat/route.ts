import { NextResponse } from 'next/server';
import { generateAIResponse, extractTraitsFromMessage } from '@/lib/ai-client';
import { findRecommendations } from '@/lib/rag';
import { MemoryClient } from 'mem0ai';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase-config';

// Initialize the mem0 client
const memoryClient = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });

export async function POST(req: Request) {
  try {
    // --- Auth Check ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to use the AI Coach.' },
        { status: 401 }
      );
    }

    const { messages, userId, profile, clientStartOfDay, clientEndOfDay } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // --- Build user traits from profile ---
    let dbTraits: any = {};
    if (profile) {
      const data = profile;
      let age;
      if (data.dob) {
        const birthDate = new Date(data.dob);
        age = new Date().getFullYear() - birthDate.getFullYear();
      }

      dbTraits = {
        name: data.displayName || data.firstName || "Athlete",
        age,
        sex: data.gender === "female" ? "Female" : (data.gender === "male" ? "Male" : undefined),
        weight: data.weight,
        height: data.height ? data.height / 100 : undefined,
        goal: data.fitnessGoal
      };
    }

    // --- Fetch Today's Logged Meals from Firebase ---
    let todayMealsContext = "";
    if (userId) {
      try {
        // Use client's timezone boundaries if provided, fallback to server UTC if not
        const startOfDay = clientStartOfDay ? new Date(clientStartOfDay) : new Date(new Date().setHours(0, 0, 0, 0));
        const endOfDay = clientEndOfDay ? new Date(clientEndOfDay) : new Date(new Date().setHours(23, 59, 59, 999));

        const mealsRef = collection(db, "meals");
        const q = query(
          mealsRef,
          where("userId", "==", userId),
          where("date", ">=", Timestamp.fromDate(startOfDay)),
          where("date", "<=", Timestamp.fromDate(endOfDay))
        );

        const querySnapshot = await getDocs(q);
        const meals = querySnapshot.docs.map(doc => doc.data());
        
        if (meals.length > 0) {
          todayMealsContext = "Today's Logged Meals in App Database:\n";
          meals.forEach((meal: any) => {
            todayMealsContext += `- ${meal.name} at ${meal.time}: `;
            if (meal.items && Array.isArray(meal.items)) {
              todayMealsContext += meal.items.map((i: any) => `${i.quantity}x ${i.name} (${Math.round(i.calories * i.quantity)} cal)`).join(', ');
            }
            todayMealsContext += '\n';
          });
        }
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    }

    // --- Mem0 Integration: Save and Search Memory ---
    let memoryContext = "";
    if (userId) {
      try {
        // Add the latest user message to memory
        await memoryClient.add([{ role: "user", content: lastMessage }], { user_id: userId });
        
        // Search for relevant past memories based on the current query
        const memories = await memoryClient.search(lastMessage, { user_id: userId });
        if (memories && memories.length > 0) {
          // Extract memory text
          memoryContext = memories.map((m: any) => m.memory).join('\n');
        }
      } catch (err) {
        console.error('Mem0 Integration Error:', err);
      }
    }

    // --- Extract traits from message using AI (with Groq fallback) ---
    const extractedTraits = await extractTraitsFromMessage(lastMessage);

    // Merge: extracted traits override DB traits (user explicitly states a change)
    const combinedTraits = { ...dbTraits, ...extractedTraits };

    // --- RAG: Fetch matches from compressed dataset ---
    const matchedData = findRecommendations(combinedTraits);

    // --- Build context for AI ---
    const contextStr = matchedData.map((row: any) =>
      `Profile Match:
Level: ${row.level || row.Level}
Goal: ${row.goal || row['Fitness Goal']}
Exercises to recommend: ${row.exercises || row.Exercises}
Equipment needed: ${row.equipment || row.Equipment}
Diet to recommend: ${row.diet || row.Diet}
General Advice: ${row.recommendation || row.Recommendation}`
    ).join('\n\n');

    const promptText = `You are an expert fitness and diet chatbot. You are polite, encouraging, and highly knowledgeable.
Use the following context from our dataset, the user's explicit profile, the user's logged meals today, and the user's past memory to help answer their question. If the dataset provides specific workouts, diets, or advice for their profile, incorporate them into your answer naturally. Do not explicitly say "the dataset says", but rather "I recommend" or "Based on your focus...". If the dataset context is empty or irrelevant, just provide standard fitness advice. If the user asks what they ate today, refer specifically to "Today's Logged Meals in App Database". Also align your recommendations closely with their "Fitness Goal" (e.g. if weight loss is the goal, recommend lower calories or specific plans that match weight loss).

CRITICAL INSTRUCTION: DO NOT use any Markdown formatting whatsoever. Do not use asterisks (* or **) for bold/italics, do not use hashes (#) for headers, and do not use lists. Respond entirely in plain text, using normal paragraph breaks for structure.

---
User's Real Profile:
Name: ${combinedTraits.name || 'Unknown'}
Age: ${combinedTraits.age || 'Unknown'}
Sex: ${combinedTraits.sex || 'Unknown'}
Weight: ${combinedTraits.weight ? combinedTraits.weight + 'kg' : 'Unknown'}
Height: ${combinedTraits.height ? combinedTraits.height + 'm' : 'Unknown'}
Fitness Goal: ${combinedTraits.goal || 'Unknown'}
---
${todayMealsContext || "No meals logged yet today."}
---
User's Memory Context (e.g., past logged foods from chat conversations, preferences):
${memoryContext || 'No past memory found.'}
---
Dataset RAG Context:
${contextStr}
---
User's Question: ${lastMessage}`;

    // --- Generate response with Gemini → Groq fallback ---
    const aiResponse = await generateAIResponse(promptText);

    return NextResponse.json({
      role: 'assistant',
      content: aiResponse.text,
      provider: aiResponse.provider, // Let the client know which AI answered
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
