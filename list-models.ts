import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function list() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const client = new GoogleGenAI({ apiKey: apiKey! });
    // Note: The SDK might not have a direct listModels yet in the models namespace if it's very new
    // But usually it's there or we can try common names.
    // Let's try 'gemini-1.5-flash' again but with a different approach if possible.
    // Actually, let's try 'gemini-2.0-flash-exp'
    console.log('Tentando modelo: gemini-2.0-flash-exp');
    const res = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: [{ text: 'Oi' }] }]
    });
    console.log('Sucesso com gemini-2.0-flash-exp:', res.text);
  } catch (e: any) {
    console.error('Falha:', e.message);
  }
}

list();
