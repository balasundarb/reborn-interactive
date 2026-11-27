// app/api/admin/users/set-role/route.ts
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { error: authError, session, reqHeaders } = await requireAdminSession();
  if (authError || !session) return authError!;

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