import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const client = new GoogleGenAI({ apiKey: apiKey! });
    console.log('Tentando modelo: gemini-3-flash-preview');
    const res = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'Oi' }] }]
    });
    console.log('Sucesso com gemini-3-flash-preview:', res.text);
  } catch (e: any) {
    console.error('Falha com gemini-3-flash-preview:', e.message);
  }
}

test();
