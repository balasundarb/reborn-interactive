import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const result = await withDB(async (db) => {
      const existing = await db.collection("newsletter").findOne({ email });

      if (existing) {
        return { duplicate: true };
      }

      const inserted = await db.collection("newsletter").insertOne({
        email,
        createdAt: new Date(),
      });

      return { insertedId: inserted.insertedId };
    });

    if ("duplicate" in result) {
      return NextResponse.json(
        { error: "Email already subscribed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}