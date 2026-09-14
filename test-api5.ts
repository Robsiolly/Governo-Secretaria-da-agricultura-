import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: 'hello',
    });
    console.log("3.1-flash-lite-image success:", res.text);
  } catch (e: any) {
    console.error("3.1-flash-lite-image error:", e.message);
  }
}
run();
