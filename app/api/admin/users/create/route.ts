// app/api/admin/users/create/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  try {
    // createUser does NOT require headers per the docs (admin role checked via session internally)
    const user = await auth.api.createUser({
      body: { name, email, password, role: "user" },
      headers: reqHeaders,
    });
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}