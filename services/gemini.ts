import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserAnswer, AssessmentResult } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

// Define the schema for strict JSON output
const assessmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    eligibility: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'] },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['status', 'title', 'description', 'keyFactors']
    },
    ability: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "A score from 0 to 100 representing overall ability to succeed." },
        financialAnalysis: { type: Type.STRING },
        languageAnalysis: { type: Type.STRING },
        academicAnalysis: { type: Type.STRING },
        recommendation: { type: Type.STRING }
      },
      required: ['score', 'financialAnalysis', 'languageAnalysis', 'academicAnalysis', 'recommendation']
    }
  },
  required: ['eligibility', 'ability']
};

// Helper function to safely retrieve the API key from Vite environment
const getApiKey = (): string | undefined => {
  // Check for Vite standard env var
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  return undefined;
};

export const analyzeEligibility = async (answers: UserAnswer[], userName: string): Promise<AssessmentResult> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API Key is missing. Please check your Vercel Environment Variables. Expected: VITE_API_KEY");
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const promptData = answers.map(a => `Question: ${a.questionText}\nAnswer: ${a.selectedOption.label}`).join('\n\n');

  const prompt = `
    You are an expert academic consultant for international students wishing to study in Germany.
    The user's name is "${userName}".
    
    Analyze the following user profile based on their answers to 5 key questions.
    
    Determine two main things:
    1. Eligibility: Can they legally and academically get admission? (Consider HZB rules and Language).
    2. Ability: Can they afford it and succeed?

    CRITICAL INSTRUCTION: 
    - Address the user directly as "${userName}".
    - Write the 'title', 'description', 'recommendation' and analysis fields directly to the user. 
    - Make it sound very personal, encouraging, yet realistic.
    - KEEP THE CONTENT CONCISE AND BRIEF. Short paragraphs. Focus on the bottom line.

    User Profile Data:
    ${promptData}

    Provide a strictly formatted JSON response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: assessmentSchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AssessmentResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};