"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CYCLE_STATUS_LABEL } from "@/lib/cycle";
import type { OrderStatus } from "@/lib/types/db";
import type { AdminOrder } from "@/lib/types/admin";

const ORDER_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
	pending: "outline",
	paid: "default",
	failed: "destructive",
	refunded: "secondary",
};

const money = (n: number | string) =>
	`$${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (s: string) =>
	new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function OrdersTable({
	orders,
	isLoading,
}: {
	orders: AdminOrder[];
	isLoading: boolean;
}) {
	const paid = orders.filter((o) => o.status === "paid");
	const revenue = paid.reduce((sum, o) => sum + Number(o.amount_usd ?? 0), 0);

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-3'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Revenue (paid)</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{money(revenue)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{orders.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Pending / Failed</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{orders.filter((o) => o.status === "pending" || o.status === "failed").length}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Payments</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='animate-pulse space-y-3'>
							{[1, 2, 3].map((i) => (
								<div key={i} className='h-16 bg-muted rounded-lg' />
							))}
						</div>
					) : orders.length === 0 ? (
						<p className='text-sm text-muted-foreground'>No payments yet.</p>
					) : (
						<div className='space-y-2'>
							{orders.map((o) => (
								<div
									key={o.id}
									className='flex items-center justify-between gap-3 p-4 border rounded-lg'>
									<div className='min-w-0'>
										<div className='flex items-center gap-2 mb-1'>
											<p className='font-medium truncate'>{o.app?.name ?? "App"}</p>
											{o.package?.name && (
												<Badge variant='outline' className='shrink-0'>
													{o.package.name}
												</Badge>
											)}
										</div>
										<p className='text-sm text-muted-foreground truncate'>
											{o.buyer?.email ?? "—"} · {fmtDate(o.created_at)}
										</p>
										<div className='mt-1 flex flex-wrap items-center gap-1.5'>
											{o.cycles.length === 0 ? (
												<span className='text-xs text-muted-foreground'>No cycle</span>
											) : (
												o.cycles.map((c) => (
													<Badge key={c.id} variant='secondary' className='text-[11px]'>
														{CYCLE_STATUS_LABEL[c.status]}
														{c.is_rerun ? " · re-run" : ""}
													</Badge>
												))
											)}
										</div>
									</div>
									<div className='flex flex-col items-end gap-1 shrink-0'>
										<span className='font-semibold'>{money(o.amount_usd)}</span>
										<Badge variant={ORDER_VARIANT[o.status]}>{o.status}</Badge>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
