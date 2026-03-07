// app/api/admin/users/delete/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();

  if (!userId)
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  if (userId === session.user.id)
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });

  try {
    // removeUser requires session headers per the docs
    await auth.api.removeUser({
      body: { userId },
      headers: reqHeaders,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}