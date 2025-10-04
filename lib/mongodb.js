// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global._mongo; // use global cache in dev to avoid multiple connections

if (!cached) {
  cached = global._mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const client = new MongoClient(uri, {
      // you can tune options here
    });
    cached.promise = client.connect().then((client) => {
      const db = client.db(dbName);
      return { client, db };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
