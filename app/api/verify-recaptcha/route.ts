import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const token = body?.token;

  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ secret, response: token.trim() }).toString(),
    }
  );

  const data = await response.json();

  if (!data.success || data.score < 0.5) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
