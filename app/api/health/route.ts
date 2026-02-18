import { NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDB();
    
    // Test the connection with a ping
    await db.command({ ping: 1 });
    
    // Optionally check if Better Auth collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    return NextResponse.json({
      status: 'connected',
      database: db.databaseName,
      collections: collectionNames,
      message: '✅ MongoDB is connected'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ MongoDB connection failed'
    }, { status: 500 });
  }
}