import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractedTaskData, Priority } from "../types";

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const taskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise title for the task or assignment.",
    },
    teacher: {
      type: Type.STRING,
      description: "The name of the teacher or professor assigning the task.",
    },
    deadline: {
      type: Type.STRING,
      description: "The due date in YYYY-MM-DD format. If not explicitly stated, infer the closest logical future date.",
    },
    description: {
      type: Type.STRING,
      description: "A short summary of what needs to be done.",
    },
    priority: {
      type: Type.STRING,
      enum: [Priority.High, Priority.Medium, Priority.Low],
      description: "The estimated priority based on urgency and importance.",
    },
  },
  required: ["title", "teacher", "description", "priority"],
};

export const extractTaskFromInput = async (
  promptText: string,
  imageBase64?: string
): Promise<ExtractedTaskData> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      // Remove data URL prefix if present for API consumption
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Assuming JPEG for simplicity/universality in this demo context
          data: cleanBase64,
        },
      });
    }

    if (promptText) {
      parts.push({
        text: `Analyze this input (which may be a photo of a board, a syllabus, or messy notes) and extract the task details. 
        Input text context: ${promptText}`,
      });
    }

    if (parts.length === 0) {
      throw new Error("No input provided for analysis");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        systemInstruction: "You are a helpful student assistant. Extract assignment details accurately. If a date is missing, leave deadline empty. If specific details are missing, use 'Unknown'.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text) as ExtractedTaskData;
    return data;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
