import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Verifies that the incoming request has an authenticated Better Auth session
 * with the `admin` role, returning an error response otherwise.
 */
export async function requireAdminSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
      reqHeaders,
    };
  }

  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
      reqHeaders,
    };
  }

  return { error: null, session, reqHeaders };
}
