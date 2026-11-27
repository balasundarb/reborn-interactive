import { NextRequest, NextResponse } from 'next/server';
import { withDB } from '@/lib/mongodb'; // adjust path to your db file

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawName = body?.name;
    const rawEmail = body?.email;
    const rawDescription = body?.description;

    if (
      typeof rawName !== 'string' ||
      typeof rawEmail !== 'string' ||
      typeof rawDescription !== 'string'
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const name = rawName.trim();
    const email = rawEmail.trim().toLowerCase();
    const description = rawDescription.trim();

    if (!name || !email || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (name.length > 120 || description.length > 5000) {
      return NextResponse.json({ error: 'Input exceeds maximum length' }, { status: 400 });
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