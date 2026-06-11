import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getCurrentUser } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/auth");

	const supabase = createAdminClient();
	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profile?.role !== "admin") redirect("/dashboard");

	return <AdminDashboard />;
}
