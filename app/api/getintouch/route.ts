import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb'; // adjust path to your db file

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, description } = body;

    // Basic validation
    if (!name || !email || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const result = await withDB(async (db) => {
      return db.collection('getintouch').insertOne({
        name,
        email,
        description,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error saving Info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}