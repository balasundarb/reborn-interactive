
import { MongoClient, Db } from 'mongodb';

// Connection URI - use localhost for local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || '';

// Cache the connection in development to prevent multiple connections
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectDB(): Promise<Db> {
    try {
        // If we have a cached connection in development, use it
        if (cachedDb) {
            console.log('Using cached MongoDB connection');
            return cachedDb;
        }

        console.log('Connecting to MongoDB...');

        // Create a new MongoClient
        const client = new MongoClient(MONGODB_URI, {
            // Connection options
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Connect to MongoDB
        await client.connect();

        // Select the database
        const db = client.db(DB_NAME);

        // Test the connection
        await db.command({ ping: 1 });

        console.log('✅ Successfully connected to MongoDB');

        // Cache the connection in development
        if (process.env.NODE_ENV === 'development') {
            cachedClient = client;
            cachedDb = db;
        }

        return db;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }
}

export async function getDB(): Promise<Db> {
    try {
        if (cachedDb) {
            return cachedDb;
        }
        return await connectDB();
    } catch (error) {
        console.error('❌ Error getting database connection:', error);
        throw error;
    }
}

export async function closeDB(): Promise<void> {
    try {
        if (cachedClient) {
            await cachedClient.close();
            cachedClient = null;
            cachedDb = null;
            console.log('MongoDB connection closed');
        }
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
}

// For serverless/Next.js API routes
export async function withDB<T>(operation: (db: Db) => Promise<T>): Promise<T> {
    const db = await getDB();
    return operation(db);
}