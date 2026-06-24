import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI Error: GEMINI_API_KEY is missing");
    return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
  }

  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  try {
    const { prompt } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      } as any
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json|```/g, '').trim();
    
    try {
      const json = JSON.parse(cleaned);
      return res.json(json);
    } catch (e) {
      return res.json({ text: cleaned });
    }
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate AI response" });
  }
}
