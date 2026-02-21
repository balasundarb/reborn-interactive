import { Db, Collection, Document } from "mongodb";

/**
 * Ensures all required collections and indexes exist.
 * Safe to call on every startup — handles existing index conflicts gracefully.
 */
export async function setupVisitorCollections(db: Db): Promise<void> {
  // ── site_visits ────────────────────────────────────────────────────────────
  const visits = db.collection("site_visits");

  // Drop any conflicting indexes before creating ours.
  // MongoDB won't allow two indexes on the same key with different names/options.
  await dropIndexIfExists(visits, "createdAt_1");   // plain index auto-created earlier
  await dropIndexIfExists(visits, "lastActive_1");  // may exist from earlier runs

  await visits.createIndexes([
    { key: { sessionId: 1 }, unique: true },
    { key: { ipAddress: 1 } },
    { key: { lastActive: 1 } },
    { key: { country: 1 } },
  ]);

  // TTL index — auto-delete visits older than 1 year
  await visits.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 365, name: "ttl_visits" }
  );

  // ── page_views ─────────────────────────────────────────────────────────────
  const pageViews = db.collection("page_views");

  // Drop conflicting plain index if it was auto-created before our TTL one
  await dropIndexIfExists(pageViews, "timestamp_1");

  await pageViews.createIndexes([
    { key: { sessionId: 1 } },
    { key: { pathname: 1 } },
  ]);

  // TTL index — auto-delete page views older than 1 year
  await pageViews.createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 365, name: "ttl_pageviews" }
  );

  console.log("✅ Visitor collections and indexes ready");
}

/**
 * Silently drops an index by name — ignores the error if it doesn't exist.
 */
async function dropIndexIfExists(
  collection: Collection<Document>,
  indexName: string
): Promise<void> {
  try {
    await collection.dropIndex(indexName);
    console.log(
      `🗑  Dropped conflicting index: ${collection.collectionName}.${indexName}`
    );
  } catch {
    // Index didn't exist — nothing to do
  }
}