"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types/db";
import type { AdminUser, AdminUserDetail } from "@/lib/types/admin";

const ORDER_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
	pending: "outline",
	paid: "default",
	failed: "destructive",
	refunded: "secondary",
};

const fmtDate = (s: string) =>
	new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const money = (n: number | string) =>
	`$${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function UserDetailModal({
	user,
	open,
	onOpenChange,
}: {
	user: AdminUser | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [detail, setDetail] = useState<AdminUserDetail | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!open || !user) {
			setDetail(null);
			return;
		}
		let cancelled = false;
		setIsLoading(true);
		fetch(`/api/admin/users/${user.id}`)
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (!cancelled) setDetail(data);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [open, user]);

	if (!user) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{user.email}</DialogTitle>
				</DialogHeader>

				<p className='text-sm text-muted-foreground -mt-2'>
					Joined {fmtDate(user.created_at)} · role: {user.role}
				</p>

				{isLoading ? (
					<div className='animate-pulse space-y-3 mt-2'>
						{[1, 2].map((i) => (
							<div key={i} className='h-16 bg-muted rounded-lg' />
						))}
					</div>
				) : (
					<>
						<div className='mt-2'>
							<h3 className='text-sm font-medium mb-2'>
								Apps ({detail?.apps.length ?? 0})
							</h3>
							{!detail || detail.apps.length === 0 ? (
								<p className='text-sm text-muted-foreground'>No apps created yet.</p>
							) : (
								<div className='space-y-2'>
									{detail.apps.map((a) => (
										<div key={a.id} className='p-3 border rounded-lg'>
											<p className='text-sm font-medium truncate'>{a.name}</p>
											<p className='text-xs text-muted-foreground truncate'>
												{a.package_name} · {fmtDate(a.created_at)}
											</p>
										</div>
									))}
								</div>
							)}
						</div>

						<div className='mt-4'>
							<h3 className='text-sm font-medium mb-2'>
								Purchase History ({detail?.orders.length ?? 0})
							</h3>
							{!detail || detail.orders.length === 0 ? (
								<p className='text-sm text-muted-foreground'>No purchases yet.</p>
							) : (
								<div className='space-y-2'>
									{detail.orders.map((o) => (
										<div
											key={o.id}
											className='flex items-center justify-between gap-3 p-3 border rounded-lg'>
											<div className='min-w-0'>
												<div className='flex items-center gap-2 mb-1'>
													<p className='text-sm font-medium truncate'>
														{o.app?.name ?? "App"}
													</p>
													{o.package?.name && (
														<Badge variant='outline' className='text-[11px] shrink-0'>
															{o.package.name}
														</Badge>
													)}
												</div>
												<p className='text-xs text-muted-foreground'>{fmtDate(o.created_at)}</p>
											</div>
											<div className='flex flex-col items-end gap-1 shrink-0'>
												<span className='text-sm font-semibold'>{money(o.amount_usd)}</span>
												<Badge variant={ORDER_VARIANT[o.status]}>{o.status}</Badge>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
