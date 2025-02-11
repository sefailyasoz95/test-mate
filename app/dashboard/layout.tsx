import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/UserNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold">TestMate</span>
            </a>
          </div>
          <UserNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
