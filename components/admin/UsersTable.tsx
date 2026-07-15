"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/lib/types/admin";

const fmtDate = (s: string) =>
	new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const money = (n: number) =>
	`$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function UsersTable({
	users,
	isLoading,
	onSelect,
}: {
	users: AdminUser[];
	isLoading: boolean;
	onSelect: (user: AdminUser) => void;
}) {
	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-3'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{users.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Testers</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{users.filter((u) => u.is_tester || u.role === "tester").length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium'>Paying Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{users.filter((u) => u.totalSpentUsd > 0).length}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='animate-pulse space-y-3'>
							{[1, 2, 3].map((i) => (
								<div key={i} className='h-16 bg-muted rounded-lg' />
							))}
						</div>
					) : users.length === 0 ? (
						<p className='text-sm text-muted-foreground'>No users yet.</p>
					) : (
						<div className='space-y-2'>
							{users.map((u) => (
								<div
									key={u.id}
									onClick={() => onSelect(u)}
									className='flex items-center justify-between gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50'>
									<div className='min-w-0'>
										<div className='flex items-center gap-2 mb-1'>
											<p className='font-medium truncate'>{u.email}</p>
											{u.role !== "user" && (
												<Badge variant='outline' className='shrink-0'>
													{u.role}
												</Badge>
											)}
										</div>
										<p className='text-sm text-muted-foreground truncate'>
											Joined {fmtDate(u.created_at)} · {u.appsCount} app
											{u.appsCount === 1 ? "" : "s"} · {u.ordersCount} order
											{u.ordersCount === 1 ? "" : "s"}
										</p>
									</div>
									<div className='shrink-0'>
										<Badge variant='secondary'>{money(u.totalSpentUsd)} spent</Badge>
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
