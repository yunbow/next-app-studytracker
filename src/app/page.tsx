import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LPHeader } from "@/components/landing/LPHeader";
import { LandingContent } from "@/components/landing/LandingContent";
import { LPFooter } from "@/components/landing/LPFooter";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LPHeader />
      <main className="flex-1">
        <LandingContent />
      </main>
      <LPFooter />
    </div>
  );
}
