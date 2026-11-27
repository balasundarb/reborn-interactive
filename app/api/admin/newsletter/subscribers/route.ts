import { NextResponse } from "next/server";
import { withDB } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const subscribers = await withDB(async (db) => {
      const docs = await db
        .collection("newsletter")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return docs.map((d) => ({
        id: d._id.toString(),
        email: d.email as string,
        createdAt: d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : String(d.createdAt),
      }));
    });

    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch (error) {
    console.error("[newsletter/subscribers] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error: authError } = await requireAdminSession();
  if (authError) return authError;

  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { ObjectId } = await import("mongodb");
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await withDB(async (db) => {
      await db.collection("newsletter").deleteOne({ _id: new ObjectId(id) });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter/subscribers] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
