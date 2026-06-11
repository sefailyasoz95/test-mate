// ============================================================
// TestMate v2 domain types (mirror of supabase/schema.v2.sql)
// ============================================================

export type UserRole = "user" | "tester" | "admin";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type CycleStatus =
	| "pending_setup"
	| "assigning"
	| "active"
	| "completed"
	| "failed"
	| "rerun_scheduled";
export type TesterType = "owned" | "recruited" | "exchange" | "community";
export type TesterPoolStatus = "available" | "assigned" | "inactive";
export type EngagementStatus =
	| "invited"
	| "opted_in"
	| "active"
	| "inactive"
	| "dropped";

export type Profile = {
	id: string;
	email: string;
	google_id: string | null;
	role: UserRole;
	is_tester: boolean;
	credits: number; // earned free Basic-12 cycles (12 apps tested = +1)
	created_at: string;
	updated_at: string;
};

export type App = {
	id: string;
	user_id: string;
	name: string;
	package_name: string;
	category: string | null;
	description: string | null;
	play_store_link: string | null;
	opt_in_link: string | null;
	screenshots: string[] | null;
	created_at: string;
};

export type Package = {
	id: string;
	code: string; // 'single' | 'basic12' | 'standard' | 'premium'
	name: string;
	tester_count: number;
	duration_days: number;
	price_usd: number;
	includes_report: boolean;
	includes_guarantee: boolean;
	priority: boolean;
	active: boolean;
	created_at: string;
};

export type Order = {
	id: string;
	user_id: string;
	app_id: string;
	package_id: string;
	amount_usd: number;
	status: OrderStatus;
	stripe_payment_intent: string | null;
	created_at: string;
};

export type TestCycle = {
	id: string;
	order_id: string;
	app_id: string;
	user_id: string;
	status: CycleStatus;
	tester_target: number;
	start_date: string | null;
	end_date: string | null;
	is_rerun: boolean;
	parent_cycle_id: string | null;
	created_at: string;
	updated_at: string;
};

export type TesterAccount = {
	id: string;
	user_id: string | null; // link to auth.users for self-serve (community) testers
	email: string;
	display_name: string | null;
	google_id: string | null;
	type: TesterType;
	device_model: string | null;
	android_version: string | null;
	country: string | null;
	status: TesterPoolStatus;
	reliability_score: number;
	apps_tested_count: number;
	terms_accepted_at: string | null;
	created_at: string;
};

export type TesterAssignment = {
	id: string;
	test_cycle_id: string;
	tester_account_id: string;
	engagement_status: EngagementStatus;
	opted_in_at: string | null;
	last_active_at: string | null;
	days_active: number;
	created_at: string;
};

export type MediaType = "image" | "video";
export type MediaItem = { url: string; type: MediaType; name: string };

export type BugSeverity = "low" | "medium" | "high";

export type BugReport = {
	id: string;
	test_cycle_id: string;
	tester_account_id: string | null;
	title: string;
	description: string | null;
	severity: BugSeverity;
	media: MediaItem[];
	created_at: string;
};

export type BugReportWithTester = BugReport & {
	tester: Pick<TesterAccount, "id" | "email" | "display_name"> | null;
};

export type Report = {
	id: string;
	test_cycle_id: string;
	title: string | null;
	summary: string | null;
	attachments: MediaItem[];
	performance: Record<string, unknown> | null;
	production_checklist: Record<string, unknown> | null;
	sent_at: string | null;
	generated_at: string;
};

// ---- Composed views returned by API routes ----

export type CycleWithRelations = TestCycle & {
	app: App | null;
	order: (Order & { package: Package | null }) | null;
	assignments: (TesterAssignment & { tester: TesterAccount | null })[];
	report: Report | null;
};

// Derived UI helpers
export type CycleProgress = {
	dayIndex: number; // 0..duration
	totalDays: number;
	activeCount: number;
	target: number;
	projectedEligibleDate: string | null;
	onTrack: boolean;
};
