import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { createServer } from "@/lib/supabase/client";

export default async function AdminPage() {
	const supabase = await createServer({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/auth");
	}

	// Check if user is super admin
	const { data: profile } = await supabase.from("profiles").select("super_admin").eq("id", session.user.id).single();

	if (!profile?.super_admin) {
		redirect("/dashboard");
	}

	return <AdminDashboard />;
}
