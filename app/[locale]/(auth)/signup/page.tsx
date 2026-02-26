import { SmokeyBackground } from "@/components/ui/smokeybg";
import { SignupForm } from "./signup";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function DemoOne({  params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    if (!session?.user) {
      redirect(`/${locale}/login`);
    }
  
  return (
    <main className="relative w-screen h-screen bg-gray-900">
      <SmokeyBackground className="absolute inset-0" />
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
    <SignupForm/>
      </div>
    </main>
  );
}