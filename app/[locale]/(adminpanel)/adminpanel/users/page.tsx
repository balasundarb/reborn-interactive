// app/[locale]/(adminpanel)/adminpanel/users/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserManagement } from "@/components/adminpanel/admin/UserManagement";

export default async function UsersPage() {
  const reqHeaders = await headers();

  let session;
  try {
    session = await auth.api.getSession({ headers: reqHeaders });
  } catch (e) {
    console.error("[users/page] getSession failed:", e);
    redirect("/login");
  }

  if (!session?.user) redirect("/login");

  // Fetch users server-side — listUsers also requires session headers per the docs
  let initialUsers: any[] = [];
  try {
    const result = await auth.api.listUsers({
      query: { limit: 200 },
      headers: reqHeaders, // ← required: listUsers needs session cookies
    });
    initialUsers = (result.users ?? []).map((u: any) => ({
      ...u,
      createdAt: u.createdAt instanceof Date
        ? u.createdAt.toISOString()
        : String(u.createdAt),
    }));
  } catch (e) {
    // If adminPlugin() is not yet added to auth.ts, this will throw.
    // Add `admin()` to plugins[] in lib/auth.ts to fix this.
    console.error("[users/page] listUsers failed — is adminPlugin() registered in auth.ts?", e);
  }

  return (
    <UserManagement
      currentUserId={session.user.id}
      initialUsers={initialUsers}
    />
  );
}