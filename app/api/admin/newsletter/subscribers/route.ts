import { NextResponse } from "next/server";
import { withDB } from "@/lib/mongodb";

export async function GET() {
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
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { ObjectId } = await import("mongodb");
    await withDB(async (db) => {
      await db.collection("newsletter").deleteOne({ _id: new ObjectId(id) });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter/subscribers] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
