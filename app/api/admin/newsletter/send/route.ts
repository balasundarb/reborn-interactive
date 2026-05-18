import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { withDB } from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, htmlContent, targetEmails, sendToAll } = body as {
      subject: string;
      htmlContent: string;
      targetEmails?: string[];
      sendToAll: boolean;
    };

    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!htmlContent?.trim()) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 });
    }

    // Resolve recipient list
    let recipients: string[] = [];
    if (sendToAll) {
      recipients = await withDB(async (db) => {
        const docs = await db.collection("newsletter").find({}).toArray();
        return docs.map((d) => d.email as string);
      });
    } else {
      recipients = targetEmails ?? [];
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    // Resend allows max 50 per batch; chunk them
    const CHUNK_SIZE = 50;
    const chunks: string[][] = [];
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      chunks.push(recipients.slice(i, i + CHUNK_SIZE));
    }

    let sent = 0;
    let failed = 0;

    for (const chunk of chunks) {
      try {
        await resend.emails.send({
          from: "Reborn Interactive <onboarding@resend.dev>",
          to: chunk,
          subject,
          html: htmlContent,
        });
        sent += chunk.length;
      } catch {
        failed += chunk.length;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: recipients.length,
    });
  } catch (error) {
    console.error("[newsletter/send] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
