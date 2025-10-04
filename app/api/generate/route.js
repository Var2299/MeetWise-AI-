// app/api/generate/route.js  (or pages/api/generate.js if using pages/)
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// The SDK picks up GEMINI_API_KEY from env automatically, but we pass it explicitly for clarity.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Primary model choice: gemini-2.5-flash (good quality; supports thinkingConfig).
const PRIMARY_MODEL = 'gemini-2.5-flash';

export async function POST(request) {

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY in server environment.');
      return NextResponse.json(
        { error: 'Server misconfiguration: missing GEMINI_API_KEY' },
        { status: 500 }
      );
    }

    const { transcript, customPrompt } = await request.json();

    if (!transcript || !customPrompt) {
      return NextResponse.json(
        { error: 'Transcript and custom prompt are required' },
        { status: 400 }
      );
    }

    const systemMessage = `You are an expert at creating structured summaries based on user instructions. Follow the user's instructions precisely.`;
    const userMessage = `${customPrompt}\n\nTranscript:\n${transcript}`;
    const prompt = `${systemMessage}\n\n${userMessage}`;


    // Call Gemini via the Google GenAI SDK
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      // 'contents' can be a single string or an array of content blocks; SDK returns .text
      contents: prompt,
      // config controls generation tokens and "thinking" behavior
      config: {
        // keep output bounded; adjust as you need (or omit to let model decide)
        maxOutputTokens: 1024,
        // disable 'thinking' to save time & tokens; set >0 for higher reasoning quality
        thinkingConfig: { thinkingBudget: 0 },
        // temperature/topK/topP can be added if you want sampling control
        // temperature: 0.6
      },
    });
     
     
    // SDK exposes a simple .text property when available
    const summary =
      (response && (response.text || (response.candidates?.[0]?.content?.[0]?.parts?.[0]?.text))) ||
      '';

    if (!summary || summary.trim().length === 0) {
      // Return diagnostic info so the client can show helpful errors
      return NextResponse.json(
        {
          error: 'Model returned empty response',
          details: {
            model: PRIMARY_MODEL,
            raw: response,
          },
        },
        { status: 502 }
      );
    }
    
    return NextResponse.json({ summary, modelUsed: PRIMARY_MODEL });
  } catch (err) {
    console.error('Error generating summary (Gemini):', err?.message ?? err);
    // return safe diagnostics to the client (avoid leaking keys)
    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        errorDetails: {
          message: err?.message ?? String(err),
          // if the SDK attaches structured details, include them for debugging
          code: err?.code ?? null,
        },
      },
      { status: 500 }
    );
  }
}
