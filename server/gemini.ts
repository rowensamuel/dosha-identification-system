import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialization of Gemini client to ensure the app boots smoothly even if the key is initially missing
let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("Warning: GEMINI_API_KEY environment variable is not defined or using placeholder. AI features will be unavailable.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

export async function askAyurvedaAI(prompt: string, chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    return "Our AI Ayurvedic Consultant is currently in offline mode (API key not configured in Secrets). You can still access full results, standard recommendations, and historical reports!";
  }

  const systemInstruction = `You are a warm, traditional, yet highly scientifically trained Ayurvedic Doctor (Vaidya) and Expert System Consultant.
Your goal is to answer health and wellness questions aligned with classical Ayurvedic text wisdom (Charaka Samhita, Sushruta Samhita) translated into practical modern lifestyle advice.
The user has completed their Dosha assessment or is asking general questions.
Keep your tone compassionate, professional, and authentic (refer to elements, qualities, tastes, and gunas).
Always include a standard disclaimer at the very end of your response stating: 'Disclaimer: Ayurveda AI is for educational and wellness guidance only. Please consult an Ayurvedic practitioner or your primary healthcare provider before making significant medical/dietary changes.'`;

  try {
    // If we have history, we can recreate a chat session, else simple generation
    if (chatHistory.length > 0) {
      // Re-create the chat using client.chats
      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      
      // Send message
      const response = await chat.sendMessage({ message: prompt });
      return response.text || "I was unable to formulate a response. Please try again.";
    } else {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      return response.text || "I was unable to formulate a response. Please try again.";
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return `The AI Consultant is temporarily resting. (Error: ${error instanceof Error ? error.message : String(error)}). Please try again soon.`;
  }
}
