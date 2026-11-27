// app/api/admin/users/change-password/route.ts
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { error: authError, reqHeaders } = await requireAdminSession();
  if (authError) return authError;

  const { userId, newPassword } = await req.json();

  if (!userId || !newPassword)
    return NextResponse.json({ error: "userId and newPassword are required" }, { status: 400 });
  if (newPassword.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  try {
    // setUserPassword requires session headers per the docs
    await auth.api.setUserPassword({
      body: { userId, newPassword },
      headers: reqHeaders,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}