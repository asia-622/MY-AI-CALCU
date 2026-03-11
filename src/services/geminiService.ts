import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function explainCalculation(expression: string, result: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain the following calculation step-by-step: ${expression} = ${result}. Keep it concise and educational.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return "Could not generate an explanation at this time.";
  }
}

export async function solveWordProblem(problem: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Solve this math problem and provide the final expression that can be evaluated: ${problem}. 
      Return the response in JSON format with two fields: 'explanation' (string) and 'expression' (string, a mathjs compatible expression).`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Problem Solving Error:", error);
    return { explanation: "I encountered an error solving this problem.", expression: "" };
  }
}
