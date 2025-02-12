"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Activity, Package, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateAppForm } from "@/components/dashboard/CreateAppForm";
import { AllocateTestersModal } from "@/components/dashboard/AllocateTestersModal";
import { AppDetailsModal } from "@/components/dashboard/AppDetailsModal";

interface DashboardStats {
	totalApps: number;
	totalPurchases: number;
	expiringPurchases: {
		package_type: string;
		expires_at: string;
		daysLeft: number;
	}[];
	apps: {
		id: string;
		name: string;
		package_name: string;
		created_at: string;
	}[];
}

export default function DashboardPage() {
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats>({
		totalApps: 0,
		totalPurchases: 0,
		expiringPurchases: [],
		apps: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

	async function fetchDashboardData() {
		if (!user?.id) return;

		// Fetch apps count
		const { count: appsCount } = await supabase.from("apps").select("*", { count: "exact" }).eq("user_id", user.id);

		// Fetch total purchases
		const { count: purchasesCount } = await supabase
			.from("purchases")
			.select("*", { count: "exact" })
			.eq("user_id", user.id)
			.eq("status", "completed");

		// Fetch purchases that will expire in 3 days or less
		const threeDaysFromNow = new Date();
		threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

		const { data: expiringPurchases } = await supabase
			.from("purchases")
			.select("package_type, expires_at")
			.eq("user_id", user.id)
			.eq("status", "completed")
			.gte("expires_at", new Date().toISOString())
			.lte("expires_at", threeDaysFromNow.toISOString())
			.order("expires_at", { ascending: true });

		const { data: apps } = await supabase
			.from("apps")
			.select("id, name, package_name, created_at")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		setStats({
			totalApps: appsCount || 0,
			totalPurchases: purchasesCount || 0,
			expiringPurchases:
				expiringPurchases?.map((purchase) => ({
					package_type: purchase.package_type,
					expires_at: purchase.expires_at,
					daysLeft: Math.ceil((new Date(purchase.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
				})) || [],
			apps: apps || [],
		});
		setIsLoading(false);
	}
	useEffect(() => {
		fetchDashboardData();
	}, [user?.id]);

	const handleCreateSuccess = () => {
		fetchDashboardData();
		setIsCreateDialogOpen(false);
	};

	if (isLoading) {
		return (
			<div className='w-screen h-screen flex items-center justify-center'>
				<h1>Loading...</h1>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-10'>
			<Tabs defaultValue='overview' className='w-full'>
				<div className='flex justify-center mb-6'>
					<TabsList className='grid w-full max-w-[400px] grid-cols-2'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='apps'>Apps</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value='overview'>
					<div className='grid gap-4 md:grid-cols-3 mb-8'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Total Apps</CardTitle>
								<Package className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.totalApps}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Total Purchases</CardTitle>
								<Activity className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.totalPurchases}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Expiring Soon</CardTitle>
								<Clock className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='space-y-3'>
									{stats.expiringPurchases.length === 0 ? (
										<p className='text-sm text-muted-foreground'>No packages expiring soon</p>
									) : (
										stats.expiringPurchases.map((purchase, i) => (
											<div key={i} className='flex flex-col gap-1'>
												<div className='flex justify-between text-sm'>
													<span className='font-medium'>{purchase.package_type}</span>
													<span className={`${purchase.daysLeft <= 1 ? "text-red-500" : "text-yellow-500"}`}>
														{purchase.daysLeft} day
														{purchase.daysLeft !== 1 ? "s" : ""} left
													</span>
												</div>
												<p className='text-sm text-muted-foreground'>
													Expires on {new Date(purchase.expires_at).toLocaleDateString()}
												</p>
											</div>
										))
									)}
								</div>
							</CardContent>
						</Card>
					</div>
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
						<CardContent className=''>
							{isLoading ? (
								<p className='text-muted-foreground'>Loading apps...</p>
							) : stats.apps.length === 0 ? (
								<p className='text-muted-foreground'>No apps registered yet.</p>
							) : (
								stats.apps.map((app) => (
									<div
										key={app.id}
										className='flex items-center justify-between p-4 border rounded-lg mt-5 cursor-pointer hover:bg-accent/50'
										onClick={() => setSelectedAppId(app.id)}>
										<div>
											<h3 className='font-medium'>{app.name}</h3>
											<p className='text-sm text-muted-foreground'>{app.package_name}</p>
										</div>
										<div className='flex flex-col items-end gap-2'>
											<div onClick={(e) => e.stopPropagation()}>
												<AllocateTestersModal appId={app.id} appName={app.name} userId={user?.id || ""} />
											</div>
											<p className='text-xs text-muted-foreground'>
												Created on {new Date(app.created_at).toLocaleDateString()}
											</p>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New App</DialogTitle>
					</DialogHeader>
					<CreateAppForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateDialogOpen(false)} />
				</DialogContent>
			</Dialog>

			<AppDetailsModal
				appId={selectedAppId || ""}
				open={!!selectedAppId}
				onOpenChange={(open) => !open && setSelectedAppId(null)}
			/>
		</div>
	);
}
