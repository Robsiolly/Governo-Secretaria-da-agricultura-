import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: 'hello',
    });
    console.log("gemini-flash-latest success:", res.text);
  } catch (e: any) {
    console.error("gemini-flash-latest error:", e.message);
  }
}
run();
