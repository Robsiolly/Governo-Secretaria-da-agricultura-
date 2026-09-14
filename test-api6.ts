import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Retorne um array com um objeto { "nome": "Teste" }',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { nome: { type: Type.STRING } }
          }
        }
      }
    });
    console.log("3.1-flash-lite schema success:", res.text);
  } catch (e: any) {
    console.error("3.1-flash-lite schema error:", e.message);
  }
}
run();
