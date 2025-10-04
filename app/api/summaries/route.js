// app/api/summaries/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb'; // adjust path if needed

// Helper: normalize DB doc -> frontend shape
function normalizeDoc(doc) {
  return {
    id: doc._id?.toString() || doc.id || null,
    created_at: (doc.createdAt || doc.created_at)
      ? (new Date(doc.createdAt || doc.created_at)).toISOString()
      : new Date().toISOString(),
    custom_prompt: doc.customPrompt ?? doc.custom_prompt ?? '',
    generated_summary: doc.generatedSummary ?? doc.generated_summary ?? '',
    edited_summary: doc.editedSummary ?? doc.edited_summary ?? null,
    model_used: doc.modelUsed ?? doc.model_used ?? null,
  };
}

// GET /api/summaries
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const docs = await db
      .collection('summaries')
      .find({})
      .sort({ createdAt: -1 }) // if you used created_at, adjust sort key
      .limit(100)
      .toArray();

    const summaries = docs.map(normalizeDoc);

    return NextResponse.json({ summaries }, { status: 200 });
  } catch (err) {
    console.error('GET /api/summaries error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/summaries
export async function POST(request) {
  try {
    const body = await request.json();
    const { transcript, customPrompt, generatedSummary, editedSummary, modelUsed } = body;

    if (!transcript || !generatedSummary) {
      return NextResponse.json(
        { error: 'transcript and generatedSummary are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('summaries');

    const doc = {
      transcript,
      customPrompt: customPrompt ?? null,
      generatedSummary,
      editedSummary: editedSummary ?? null,
      modelUsed: modelUsed ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    // return normalized document (so client immediately gets the shape it expects)
    const saved = {
      ...normalizeDoc({ ...doc, _id: result.insertedId }),
    };

    return NextResponse.json({ ok: true, id: result.insertedId.toString(), summary: saved }, { status: 201 });
  } catch (error) {
    console.error('POST /api/summaries error:', error);
    return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
  }
}
