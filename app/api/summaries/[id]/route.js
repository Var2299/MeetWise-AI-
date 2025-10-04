// app/api/summaries/[id]/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../lib/mongodb'; // adjust path if needed

// DELETE /api/summaries/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params || {};
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('summaries').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ ok: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (err) {
    console.error('DELETE /api/summaries/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// Optional: GET single summary (useful if you want /api/summaries/:id to return the full object)
export async function GET(request, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection('summaries').findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const normalized = {
      id: doc._id.toString(),
      created_at: (doc.createdAt || doc.created_at) ? (new Date(doc.createdAt || doc.created_at)).toISOString() : new Date().toISOString(),
      custom_prompt: doc.customPrompt ?? doc.custom_prompt ?? '',
      generated_summary: doc.generatedSummary ?? doc.generated_summary ?? '',
      edited_summary: doc.editedSummary ?? doc.edited_summary ?? null,
      model_used: doc.modelUsed ?? doc.model_used ?? null,
    };

    return NextResponse.json({ summary: normalized }, { status: 200 });
  } catch (err) {
    console.error('GET /api/summaries/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
