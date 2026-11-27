// app/api/admin/users/route.ts
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { error: authError, reqHeaders } = await requireAdminSession();
  if (authError) return authError;

  try {
    // listUsers requires session headers to verify admin role
    const result = await auth.api.listUsers({
      query: { limit: 200 },
      headers: reqHeaders,
    });
    return NextResponse.json({ users: result.users ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}