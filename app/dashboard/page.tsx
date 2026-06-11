"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/firebase/config";
import { Activity, Package as PackageIcon, Users, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateAppForm } from "@/components/dashboard/CreateAppForm";
import { AllocateTestersModal } from "@/components/dashboard/AllocateTestersModal";
import { AppDetailsModal } from "@/components/dashboard/AppDetailsModal";
import { TesterTab } from "@/components/dashboard/TesterTab";
import { CYCLE_STATUS_LABEL } from "@/lib/cycle";
import type { App, CycleStatus, Package, TestCycle } from "@/lib/types/db";

type CycleListItem = TestCycle & {
	app: App | null;
	order: { package: Package | null } | null;
};

const STATUS_VARIANT: Record<CycleStatus, "default" | "secondary" | "destructive" | "outline"> = {
	pending_setup: "outline",
	assigning: "secondary",
	active: "default",
	completed: "secondary",
	failed: "destructive",
	rerun_scheduled: "outline",
};

function CycleCard({ cycle }: { cycle: CycleListItem }) {
	const total = cycle.order?.package?.duration_days ?? 14;
	let dayIndex = 0;
	if (cycle.start_date) {
		const start = new Date(cycle.start_date).getTime();
		dayIndex = Math.max(0, Math.min(total, Math.floor((Date.now() - start) / 86400000)));
	}
	const pct = cycle.status === "active" ? Math.round((dayIndex / total) * 100) : 0;

	return (
		<Link href={`/dashboard/cycles/${cycle.id}`}>
			<Card className='transition-all hover:border-primary/50 hover:shadow-md cursor-pointer'>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<div>
						<CardTitle className='text-base'>{cycle.app?.name ?? "App"}</CardTitle>
						<p className='text-xs text-muted-foreground'>{cycle.order?.package?.name ?? "Package"}</p>
					</div>
					<Badge variant={STATUS_VARIANT[cycle.status]}>{CYCLE_STATUS_LABEL[cycle.status]}</Badge>
				</CardHeader>
				<CardContent>
					{cycle.status === "active" ? (
						<div className='space-y-2'>
							<div className='flex justify-between text-xs text-muted-foreground'>
								<span>
									Day {dayIndex} of {total}
								</span>
								<span>Target {cycle.tester_target} testers</span>
							</div>
							<div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
								<div className='h-full bg-primary transition-all' style={{ width: `${pct}%` }} />
							</div>
						</div>
					) : (
						<div className='flex items-center justify-between text-sm text-muted-foreground'>
							<span>Target {cycle.tester_target} testers</span>
							<span className='inline-flex items-center gap-1 text-primary'>
								Open <ArrowRight className='h-3 w-3' />
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}

export default function DashboardPage() {
	const { user } = useAuth();
	const [apps, setApps] = useState<App[]>([]);
	const [cycles, setCycles] = useState<CycleListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedApp, setSelectedApp] = useState<App | null>(null);

	async function fetchData() {
		setIsLoading(true);
		try {
			const [appsRes, cyclesRes] = await Promise.all([
				fetch("/api/apps"),
				fetch("/api/cycles"),
			]);
			const appsData = appsRes.ok ? await appsRes.json() : [];
			const cyclesData = cyclesRes.ok ? await cyclesRes.json() : [];
			setApps(Array.isArray(appsData) ? appsData : []);
			setCycles(Array.isArray(cyclesData) ? cyclesData : []);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (!user?.id) return;
		fetchData();
		trackEvent("dashboard_view");
	}, [user?.id]);

	const handleCreateSuccess = () => {
		fetchData();
		setIsCreateDialogOpen(false);
		trackEvent("app_created");
	};

	const activeCycles = cycles.filter((c) => c.status === "active").length;

	if (isLoading) {
		return (
			<div className='w-full h-[60vh] flex items-center justify-center'>
				<h1 className='text-muted-foreground'>Loading…</h1>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-10'>
			<Tabs defaultValue='overview' className='w-full'>
				<div className='flex justify-center mb-6'>
					<TabsList
						className={`grid w-full ${
							user?.isTester ? "max-w-[640px] grid-cols-4" : "max-w-[480px] grid-cols-3"
						}`}>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='cycles'>Cycles</TabsTrigger>
						<TabsTrigger value='apps'>Apps</TabsTrigger>
						{user?.isTester && <TabsTrigger value='testing'>Testing</TabsTrigger>}
					</TabsList>
				</div>

				<TabsContent value='overview'>
					<div className='grid gap-4 md:grid-cols-3 mb-8'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Total Apps</CardTitle>
								<PackageIcon className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{apps.length}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Active Cycles</CardTitle>
								<Activity className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{activeCycles}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Total Cycles</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{cycles.length}</div>
							</CardContent>
						</Card>
					</div>

					{cycles.length > 0 && (
						<div className='grid gap-4 md:grid-cols-2'>
							{cycles.slice(0, 4).map((c) => (
								<CycleCard key={c.id} cycle={c} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value='cycles' className='space-y-4'>
					<h2 className='text-2xl font-bold'>Your Test Cycles</h2>
					{cycles.length === 0 ? (
						<Card>
							<CardContent className='py-10 text-center text-muted-foreground'>
								No cycles yet. Add an app and buy a testing package to start.
							</CardContent>
						</Card>
					) : (
						<div className='grid gap-4 md:grid-cols-2'>
							{cycles.map((c) => (
								<CycleCard key={c.id} cycle={c} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value='apps' className='space-y-4'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-2xl font-bold'>Your Apps</h2>
						<Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className='h-4 w-4 mr-2' />
							Add App
						</Button>
					</div>

					<Card>
						<CardContent className='pt-6'>
							{apps.length === 0 ? (
								<p className='text-muted-foreground'>No apps registered yet.</p>
							) : (
								apps.map((app) => (
									<div
										key={app.id}
										className='flex items-center justify-between p-4 border rounded-lg mt-3 first:mt-0 cursor-pointer hover:bg-accent/50'
										onClick={() => setSelectedApp(app)}>
										<div>
											<div className='flex items-center gap-2 mb-1'>
												<h3 className='font-medium'>{app.name}</h3>
												{app.category && <Badge variant='secondary'>{app.category}</Badge>}
											</div>
											<p className='text-sm text-muted-foreground'>{app.package_name}</p>
										</div>
										<div className='flex flex-col items-end gap-2'>
											<div onClick={(e) => e.stopPropagation()}>
												<AllocateTestersModal appId={app.id} appName={app.name} />
											</div>
											<p className='text-xs text-muted-foreground'>
												Created {new Date(app.created_at).toLocaleDateString()}
											</p>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{user?.isTester && (
					<TabsContent value='testing' className='space-y-4'>
						<TesterTab />
					</TabsContent>
				)}
			</Tabs>

			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className='max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Create New App</DialogTitle>
					</DialogHeader>
					<CreateAppForm
						onSuccess={handleCreateSuccess}
						onCancel={() => setIsCreateDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			<AppDetailsModal
				app={selectedApp}
				open={!!selectedApp}
				onOpenChange={(open) => !open && setSelectedApp(null)}
			/>
		</div>
	);
}
