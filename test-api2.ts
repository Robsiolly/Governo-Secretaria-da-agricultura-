import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'hello',
    });
    console.log("3.8-flash success:", res.text);
  } catch (e: any) {
    console.error("3.8-flash error:", e.message);
  }
}
run();
