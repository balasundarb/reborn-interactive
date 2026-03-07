// app/api/admin/users/set-role/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, role } = await req.json();

  if (!userId || !role)
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });

  if (!["admin", "user"].includes(role))
    return NextResponse.json({ error: "Role must be 'admin' or 'user'" }, { status: 400 });

  if (userId === session.user.id)
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });

  try {
    // setRole requires session headers per the Better Auth docs
    await auth.api.setRole({
      body: { userId, role },
      headers: reqHeaders,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}