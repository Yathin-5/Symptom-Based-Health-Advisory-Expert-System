import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { runInference } from './src/expert-system/inference-engine.ts';
import { KNOWLEDGE_BASE_FACTS } from './src/expert-system/knowledge-base.ts';
import { RULE_BASE } from './src/expert-system/rule-base.ts';
import { runAllTests } from './src/expert-system/test-suite.ts';
import { findNutrientProfile, NUTRITION_KNOWLEDGE_BASE } from './src/expert-system/nutrition-knowledge-base.ts';
import { PatientInput, AssessmentResult } from './src/types/expert-system.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory assessment history log
const assessmentHistory: AssessmentResult[] = [];

// Initialize Gemini Client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. POST /api/assessment -> Runs deterministic Expert System inference
app.post('/api/assessment', (req: Request, res: Response) => {
  try {
    const input: PatientInput = req.body;
    const result = runInference(input);
    assessmentHistory.unshift(result);
    // Keep max 100 entries
    if (assessmentHistory.length > 100) {
      assessmentHistory.pop();
    }
    res.json(result);
  } catch (error: any) {
    console.error('Error running assessment inference:', error);
    res.status(500).json({ error: 'Failed to process assessment inference', details: error?.message });
  }
});

// 2. POST /api/chat/extract -> Natural Language symptom fact extraction via Gemini
app.post('/api/chat/extract', async (req: Request, res: Response) => {
  const { message, currentFacts, chatHistory } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check if message is asking about a vitamin/mineral/food enrichment
  const detectedNutrient = findNutrientProfile(message);

  // If Gemini API is available, use it for conversational extraction
  if (aiClient) {
    try {
      const systemInstruction = `
You are the natural language conversation interface for a symptom-based Health Advisory & Nutritional Expert System.
Your job is to talk with the user step-by-step to gather their symptoms, timeline, and severity, OR provide medical and nutritional guidance if they ask about vitamins/minerals/foods.
CRITICAL CONSTRAINT: You do NOT invent medical diagnoses. All decision logic is strictly delegated to the rule base.
You must speak in a warm, concise, professional clinical manner.
Keep your responses short (2-3 sentences max) and ask for ONE or TWO missing pieces of information at a time.
Suggest 3 to 4 quick reply options the user can click. Always include an "Other / Different issue" or "Check Vitamins & Foods" option when relevant.

Target Schema:
- mainSymptom: string (chief symptom if identified)
- additionalSymptoms: list of strings (accompanying symptoms)
- durationDays: number (days duration)
- severity: "mild" | "moderate" | "severe"
- temperatureC: number (body temperature in Celsius if mentioned)
- chestPain: boolean
- severeDyspnea: boolean
- stiffNeck: boolean
- suddenWeaknessOrNumbness: boolean
- unableToKeepFluidsDown: boolean
- bloodInVomitOrStool: boolean
- age: number (if mentioned)
- assistantReply: string (conversational response acknowledging what was heard and asking the next question or providing overview)
- quickOptions: list of strings (3-4 clickable chips for the user)
- isReadyForInference: boolean (true if at least mainSymptom and duration or a red flag are known)
- missingCrucialInfo: list of strings
`;

      const prompt = `
Current recorded facts: ${JSON.stringify(currentFacts || {})}
Recent conversation context: ${JSON.stringify((chatHistory || []).slice(-6))}
Latest user message: "${message}"
Detected nutrient query if any: ${detectedNutrient ? detectedNutrient.name : 'none'}

Extract the updated facts (merging with current facts), formulate a short empathetic reply, provide 3-4 quickOptions for the user to click, and indicate if ready for inference. If user asks about a nutrient/food, acknowledge the nutrient and explain that the detailed food enrichment table and physiological functions are displayed.
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainSymptom: { type: Type.STRING },
              additionalSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              durationDays: { type: Type.NUMBER },
              severity: { type: Type.STRING },
              temperatureC: { type: Type.NUMBER },
              chestPain: { type: Type.BOOLEAN },
              severeDyspnea: { type: Type.BOOLEAN },
              stiffNeck: { type: Type.BOOLEAN },
              suddenWeaknessOrNumbness: { type: Type.BOOLEAN },
              unableToKeepFluidsDown: { type: Type.BOOLEAN },
              bloodInVomitOrStool: { type: Type.BOOLEAN },
              age: { type: Type.NUMBER },
              assistantReply: { type: Type.STRING },
              quickOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              isReadyForInference: { type: Type.BOOLEAN },
              missingCrucialInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['assistantReply', 'isReadyForInference'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        extractedFacts: {
          ...(currentFacts || {}),
          ...parsed,
          assistantReply: undefined,
          quickOptions: undefined,
          isReadyForInference: undefined,
          missingCrucialInfo: undefined,
        },
        assistantReply: parsed.assistantReply,
        quickOptions: parsed.quickOptions || [],
        isReadyForInference: parsed.isReadyForInference,
        missingCrucialInfo: parsed.missingCrucialInfo || [],
        nutrientProfile: detectedNutrient || undefined,
      });
    } catch (err: any) {
      console.warn('Gemini chat extraction error, fallback to rule parser:', err?.message);
    }
  }

  // Fallback if AI not configured or failed
  if (detectedNutrient) {
    return res.json({
      extractedFacts: currentFacts || {},
      assistantReply: `Here is the comprehensive clinical profile for **${detectedNutrient.name}**, including what it does to our body, RDA, and foods sorted by enrichment percentage:`,
      quickOptions: ['Vitamin B12', 'Vitamin D', 'Iron', 'Magnesium', 'Other Health Issue'],
      isReadyForInference: false,
      nutrientProfile: detectedNutrient,
    });
  }

  res.json({
    extractedFacts: currentFacts || {},
    assistantReply: `I noted your message: "${message}". Could you tell me your main symptom and how many days you've had it? Or tell me if you'd like to check a specific nutrient or food enrichment.`,
    quickOptions: ['1-2 days', '3-5 days', 'More than 7 days', 'Other / Custom Symptom'],
    isReadyForInference: false,
    missingCrucialInfo: ['duration in days', 'severity'],
  });
});

// Endpoint to list all available nutrients in the knowledge base
app.get('/api/nutrients', (_req: Request, res: Response) => {
  res.json(NUTRITION_KNOWLEDGE_BASE);
});

// 3. GET /api/knowledge-base -> Knowledge base facts and rules
app.get('/api/knowledge-base', (_req: Request, res: Response) => {
  res.json({
    facts: KNOWLEDGE_BASE_FACTS,
    rules: RULE_BASE,
  });
});

// 4. GET /api/history -> Saved assessments
app.get('/api/history', (_req: Request, res: Response) => {
  res.json(assessmentHistory);
});

// 5. POST /api/tests -> Automated test suite runner
app.post('/api/tests', (_req: Request, res: Response) => {
  const results = runAllTests();
  res.json(results);
});

// Vite Middleware integration for development and static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Expert System Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
