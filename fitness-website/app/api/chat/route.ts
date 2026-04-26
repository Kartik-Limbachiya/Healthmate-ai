import { NextResponse } from 'next/server';
import { generateAIResponse, extractTraitsFromMessage } from '@/lib/ai-client';
import { findRecommendations } from '@/lib/rag';

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

    const { messages, userId, profile } = await req.json();
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
