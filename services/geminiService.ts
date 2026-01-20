
import { GoogleGenAI } from "@google/genai";

export const getRecipeChatResponse = async (userMessage: string, history: {role: string, parts: {text: string}[]}[] = []): Promise<string> => {
  try {
    // Always use process.env.API_KEY directly as per guidelines.
    // Create a new GoogleGenAI instance right before making an API call to ensure the latest config is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const systemInstruction = `You are "Chef AI", a world-class culinary expert. 
    Your goal is to provide detailed, accurate recipes and professional cooking guidance.
    
    Response Rules:
    1. For any recipe request, ALWAYS include:
       - 📝 Description: A short Appetizing intro.
       - 🛒 Ingredients: A precise list with measurements.
       - 👨‍🍳 Instructions: Clear, numbered step-by-step process.
       - 💡 Chef's Tip: A secret trick for better results.
    2. Format using Markdown (bolding, lists, etc.) for readability.
    3. If asked about techniques (e.g., "how to julienne"), provide a detailed explanation.
    4. Keep the tone inspiring and helpful.`;

    const contents = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    // Access the text property directly on the response object
    return response.text || "My stove seems to have gone out. Please try your request again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Chef AI is currently taking a break. Please check back in a moment.";
  }
};
