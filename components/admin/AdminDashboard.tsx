"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CycleManageModal } from "@/components/admin/CycleManageModal";
import { TesterPool } from "@/components/admin/TesterPool";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { CYCLE_STATUS_LABEL } from "@/lib/cycle";
import type { CycleStatus, TesterAccount } from "@/lib/types/db";
import type { AdminCycle, AdminOrder } from "@/lib/types/admin";

const STATUS_VARIANT: Record<CycleStatus, "default" | "secondary" | "destructive" | "outline"> = {
	pending_setup: "outline",
	assigning: "secondary",
	active: "default",
	completed: "secondary",
	failed: "destructive",
	rerun_scheduled: "outline",
};

function activeCount(c: AdminCycle): number {
	return (c.assignments ?? []).filter(
		(a) => a.engagement_status === "active" || a.engagement_status === "opted_in"
	).length;
}

export function AdminDashboard() {
	const [cycles, setCycles] = useState<AdminCycle[]>([]);
	const [testers, setTesters] = useState<TesterAccount[]>([]);
	const [orders, setOrders] = useState<AdminOrder[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selected, setSelected] = useState<AdminCycle | null>(null);

	async function fetchData() {
		try {
			const [cyclesRes, testersRes, ordersRes] = await Promise.all([
				fetch("/api/admin/cycles"),
				fetch("/api/admin/testers"),
				fetch("/api/admin/orders"),
			]);
			const cyclesData = cyclesRes.ok ? await cyclesRes.json() : [];
			const testersData = testersRes.ok ? await testersRes.json() : [];
			const ordersData = ordersRes.ok ? await ordersRes.json() : [];
			setCycles(Array.isArray(cyclesData) ? cyclesData : []);
			setTesters(Array.isArray(testersData) ? testersData : []);
			setOrders(Array.isArray(ordersData) ? ordersData : []);
			// keep the open modal in sync with refreshed data
			setSelected((prev) =>
				prev ? cyclesData.find((c: AdminCycle) => c.id === prev.id) ?? null : null
			);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchData();
	}, []);

	const needsAction = cycles.filter(
		(c) => c.status === "pending_setup" || c.status === "active"
	).length;

	return (
		<div className='container mx-auto py-8'>
			<h1 className='text-3xl font-bold mb-6'>Admin · Operations</h1>

			<Tabs defaultValue='cycles' className='w-full'>
				<TabsList className='grid w-full max-w-[540px] grid-cols-3 mb-6'>
					<TabsTrigger value='cycles'>Cycles</TabsTrigger>
					<TabsTrigger value='payments'>Payments</TabsTrigger>
					<TabsTrigger value='testers'>Tester Pool</TabsTrigger>
				</TabsList>

				<TabsContent value='cycles'>
					<div className='grid gap-4 md:grid-cols-3 mb-6'>
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium'>Total Cycles</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{cycles.length}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium'>Needs Action</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{needsAction}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium'>Available Testers</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{testers.filter((t) => t.status === "available").length}
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>All Cycles</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className='animate-pulse space-y-3'>
									{[1, 2, 3].map((i) => (
										<div key={i} className='h-16 bg-muted rounded-lg' />
									))}
								</div>
							) : cycles.length === 0 ? (
								<p className='text-sm text-muted-foreground'>No cycles yet.</p>
							) : (
								<div className='space-y-3'>
									{cycles.map((c) => (
										<div
											key={c.id}
											onClick={() => setSelected(c)}
											className='flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50'>
											<div className='min-w-0'>
												<div className='flex items-center gap-2 mb-1'>
													<p className='font-medium truncate'>{c.app?.name ?? "App"}</p>
													{c.is_rerun && <Badge variant='outline'>re-run</Badge>}
												</div>
												<p className='text-sm text-muted-foreground truncate'>
													{c.buyer?.email} · {c.order?.package?.name ?? "Package"}
												</p>
											</div>
											<div className='flex flex-col items-end gap-1'>
												<Badge variant={STATUS_VARIANT[c.status]}>
													{CYCLE_STATUS_LABEL[c.status]}
												</Badge>
												<span className='text-xs text-muted-foreground'>
													{activeCount(c)}/{c.tester_target} active
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='payments'>
					<OrdersTable orders={orders} isLoading={isLoading} />
				</TabsContent>

				<TabsContent value='testers'>
					<TesterPool testers={testers} onChanged={fetchData} />
				</TabsContent>
			</Tabs>

			<CycleManageModal
				cycle={selected}
				open={!!selected}
				onOpenChange={(open) => !open && setSelected(null)}
				onChanged={fetchData}
			/>
		</div>
	);
}
