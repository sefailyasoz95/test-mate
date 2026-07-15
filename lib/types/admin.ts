import type {
	App,
	CycleStatus,
	Order,
	Package,
	Profile,
	TestCycle,
	TesterAccount,
	TesterAssignment,
} from "@/lib/types/db";

export type AdminAssignment = TesterAssignment & {
	tester: TesterAccount | null;
};

export type AdminCycle = TestCycle & {
	app: App | null;
	buyer: { id: string; email: string } | null;
	order: (Order & { package: Package | null }) | null;
	assignments: AdminAssignment[];
};

export type AdminOrder = Order & {
	app: App | null;
	package: Package | null;
	buyer: { id: string; email: string } | null;
	cycles: { id: string; status: CycleStatus; is_rerun: boolean }[];
};

export type AdminUser = Profile & {
	appsCount: number;
	ordersCount: number;
	totalSpentUsd: number;
};

export type AdminUserDetail = Profile & {
	apps: App[];
	orders: (Order & { app: App | null; package: Package | null })[];
};
