import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Manual CORS middleware para acesso do APK
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser com limite aumentado para imagens base64 de fotos
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy init Gemini SDK
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave GEMINI_API_KEY não configurada no servidor.');
    }
    genAIClient = new GoogleGenAI({ 
      apiKey
    });
  }
  return genAIClient;
}

// Função auxiliar para chamar a IA com retentativa (Exponential Backoff)
async function callGeminiWithRetry(
  callFn: () => Promise<any>,
  maxRetries = 2,
  baseDelay = 1000
) {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callFn();
    } catch (error: any) {
      lastError = error;
      const msg = error.message?.toLowerCase() || '';
      const isTransient = msg.includes('quota') || msg.includes('429') || 
                          msg.includes('503') || msg.includes('overloaded') || 
                          msg.includes('unavailable') || msg.includes('resource_exhausted');
      
      if (!isTransient || attempt === maxRetries) break;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Gemini ocupado. Tentativa ${attempt + 1}/${maxRetries} em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// Endpoint de OCR e extração estruturada de foto de controle de veículos
app.post('/api/ocr-scan', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    const ai = getGeminiClient();

    // Limpar prefixo data:image/...;base64, se houver
    let cleanMime = mimeType;
    let base64Data = imageBase64;
    const matchPrefix = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (matchPrefix) {
      cleanMime = matchPrefix[1];
      base64Data = matchPrefix[2];
    }

    const prompt = `Você é um perito em extração de dados e OCR de fichas, pranchetas, cadernos e planilhas impressas de controle de portaria/garagem de frotas oficiais (Secretaria da Agricultura e Secretaria do Turismo).
Analise com extrema atenção a imagem fornecida. Ela pode ser uma foto de prancheta manuscrita, uma folha impressa de controle, ou uma foto de tela/tabela com registros de viagens e veículos.

Identifique CADA linha ou registro de viagem de veículo.
Mesmo que a caligrafia esteja difícil ou a folha esteja com sombras, use o contexto das colunas (Placa, Motorista/Condutor, Secretaria, Data, Saída, Chegada, Andar/Garagem, Destino, etc.) para deduzir e extrair o máximo de registros possível.

Para cada linha/viagem encontrada, extraia os campos:
1. "placa": A placa do veículo (ex: ABC1D23, DKH-3D29, SUV0F29, EGL4590). Se não for possível ler todas as letras, extraia o máximo visível em maiúsculas sem traços.
2. "motorista": Nome do condutor/motorista ou solicitante. Se for uma assinatura ilegível, tente decifrar o nome ou sobrenome visível na linha.
3. "secretaria": "Secretaria da Agricultura" ou "Secretaria do Turismo". Caso não seja óbvio, verifique siglas como SAA, CATI, CDA, Gabinete ou Turismo/Setur. Se indefinido, preencha "Secretaria da Agricultura".
4. "data": Data da saída/registro no formato YYYY-MM-DD. Se a folha tiver apenas dia e mês (ex: 14/09), use o ano corrente 2026 (ex: "2026-09-14").
5. "horarioSaida": Horário de saída se visível (ex: "07:30", "08:15").
6. "horarioChegada": Horário de chegada/retorno se visível (ex: "17:45", "12:30"). Deixe "" se ainda não tiver retornado.
7. "garagem": Nome da garagem ou pátio (ex: "Kalunga", "G1", "G2", "Pátio Central"), padrão "Kalunga".
8. "andar": Localização ou andar (ex: "SAA", "Térreo", "Andar 1", "Sub Solo"), padrão "SAA".
9. "fct": Número da FCT (Ficha de Controle de Tráfego) se houver (para Turismo coloque "N/A").
10. "modeloVeiculo": Modelo do veículo se anotado (ex: Spin, Duster, Gol, Hilux, Corolla, Ônix).
11. "destino": Destino ou finalidade do serviço (ex: Palácio, Reunião, Aeroporto, Campo, Interior, Manutenção).
12. "ocorrencia": Observações, avarias, pendências ou ocorrências anotadas na linha se houver.

IMPORTANTE: Responda estritamente com um array JSON válido contendo os objetos encontrados. Se não houver certeza de um campo numérico ou horário, prefira uma string aproximada ou vazia em vez de ignorar o registro.`;

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: cleanMime || 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              placa: { type: Type.STRING },
              motorista: { type: Type.STRING },
              secretaria: { type: Type.STRING },
              data: { type: Type.STRING },
              horarioSaida: { type: Type.STRING },
              horarioChegada: { type: Type.STRING },
              garagem: { type: Type.STRING },
              andar: { type: Type.STRING },
              fct: { type: Type.STRING },
              modeloVeiculo: { type: Type.STRING },
              destino: { type: Type.STRING },
              ocorrencia: { type: Type.STRING },
            },
          },
        },
      },
    }));


    const rawText = response.text || '[]';
    console.log('Gemini Raw Response length:', rawText.length);
    let registrosExtraidos: any[] = [];
    
    try {
      // Tentar parse direto
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        registrosExtraidos = parsed;
      } else if (parsed && Array.isArray(parsed.registros)) {
        registrosExtraidos = parsed.registros;
      } else if (parsed && typeof parsed === 'object') {
        registrosExtraidos = [parsed];
      }
    } catch (e) {
      // Se tiver blocos de markdown ```json ... ```
      const matchJson = rawText.match(/\[[\s\S]*\]/);
      if (matchJson) {
        try {
          registrosExtraidos = JSON.parse(matchJson[0]);
        } catch {
          registrosExtraidos = [];
        }
      }
    }

    // Filtrar e normalizar registros mínimos (que tenham pelo menos placa OU motorista)
    const registrosValidos = registrosExtraidos
      .map((r: any) => ({
        placa: String(r.placa || '').toUpperCase().trim(),
        motorista: String(r.motorista || '').trim(),
        secretaria: String(r.secretaria || '').toLowerCase().includes('turismo') ? 'Secretaria do Turismo' : 'Secretaria da Agricultura',
        data: String(r.data || '').trim(),
        horarioSaida: String(r.horarioSaida || '').trim(),
        horarioChegada: String(r.horarioChegada || '').trim(),
        garagem: String(r.garagem || 'Kalunga').trim(),
        andar: String(r.andar || 'SAA').trim(),
        fct: String(r.fct || '').trim(),
        modeloVeiculo: String(r.modeloVeiculo || '').trim(),
        destino: String(r.destino || '').trim(),
        ocorrencia: String(r.ocorrencia || '').trim(),
      }))
      .filter((r) => r.placa.length >= 3 || r.motorista.length >= 2);

    res.json({
      sucesso: true,
      totalEncontrados: registrosValidos.length,
      registros: registrosValidos,
    });
    } catch (error: any) {
    console.error('Erro na rota /api/ocr-scan:', error);
    let errorMessage = error.message || 'Erro ao analisar imagem com a IA.';
    const msgLower = errorMessage.toLowerCase();
    
    if (msgLower.includes('quota') || msgLower.includes('429') || msgLower.includes('resource_exhausted')) {
      errorMessage = 'O limite do scanner foi atingido temporariamente (proteção do sistema). Aguarde cerca de 1 a 2 minutos e tente novamente.';
    } else if (msgLower.includes('503') || msgLower.includes('unavailable') || msgLower.includes('high demand') || msgLower.includes('sobrecarregado')) {
      errorMessage = 'Os servidores de inteligência artificial do Google estão sobrecarregados no momento. Por favor, aguarde alguns minutos e tente novamente.';
    } else if (msgLower.includes('not found') || msgLower.includes('404')) {
      errorMessage = 'Erro de configuração do modelo de IA (404). Por favor, informe ao suporte que o modelo gemini-3-flash-preview não foi encontrado.';
    }

    res.status(500).json({
      sucesso: false,
      error: errorMessage,
    });
  }
});

// Endpoint de Chat IA Global de Busca de Registros
app.post('/api/global-search-chat', async (req, res) => {
  try {
    const { prompt, history = [], registros = [] } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Mensagem vazia.' });
    }

    const ai = getGeminiClient();
    const contents: any[] = [];

    // System info sobre os registros (passa um resumo extremamente leve para economizar tokens)
    const registrosResumo = registros.map((r: any) => 
      `[${r.placa}] ${r.motorista} - ${r.status === 'EM_TRANSITO' ? 'Rua' : 'Garagem'} (${r.data})`
    ).slice(0, 50); // Limita aos últimos 50 para evitar estouro de contexto se houver muitos dados

    const systemPrompt = `Seu nome é Aura. Você é a assistente virtual inteligente e institucional (tema Ouro Velho) de busca e análise de frotas da Secretaria da Agricultura e Turismo.
O usuário vai perguntar sobre os registros de veículos cadastrados. Aqui está a lista atual de registros em formato resumido:
---
${registrosResumo.length > 0 ? registrosResumo.join('\n') : 'Nenhum registro no momento.'}
---
Seja objetiva, clara e educada. Diga sempre as placas ou nomes que encontrar de forma fácil de ler.`;

    // Montar histórico
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      },
    }));

    res.json({ reply: response.text || 'Desculpe, não consegui encontrar essa informação.' });
  } catch (error: any) {
    console.error('Erro na rota /api/global-search-chat:', error);
    let errorMessage = 'Os servidores da IA estão sobrecarregados. Tente novamente em alguns instantes.';
    
    if (error.message) {
      const msgLower = error.message.toLowerCase();
      if (msgLower.includes('quota') || msgLower.includes('429') || msgLower.includes('resource_exhausted')) {
        errorMessage = 'Limite de mensagens atingido. Por favor, aguarde 60 segundos antes de tentar novamente.';
      } else if (msgLower.includes('key') || msgLower.includes('api_key') || msgLower.includes('unauthorized') || msgLower.includes('401')) {
        errorMessage = 'A chave de API da Aura não foi encontrada ou é inválida. Por favor, configure a GEMINI_API_KEY no menu Settings.';
      } else if (msgLower.includes('not found') || msgLower.includes('404')) {
        errorMessage = 'O modelo Aura está passando por manutenção. Tente novamente em breve.';
      } else if (msgLower.includes('safety') || msgLower.includes('blocked')) {
        errorMessage = 'A pergunta foi bloqueada pelos filtros de segurança. Tente reformular.';
      }
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Inicialização do servidor integrado com Vite ou estático
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log('Verificação de IA Aura:', process.env.GEMINI_API_KEY ? 'Chave de API Detectada ✓' : 'AVISO: Chave de API não detectada ✗');
  });
}

startServer();
