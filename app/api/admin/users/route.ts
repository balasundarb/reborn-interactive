// app/api/admin/users/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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