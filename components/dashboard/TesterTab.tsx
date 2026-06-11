"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2, FlaskConical } from "lucide-react";
import { ENGAGEMENT_LABEL } from "@/lib/cycle";
import { BugReportDialog } from "@/components/dashboard/BugReportDialog";
import type { EngagementStatus, TesterAssignment } from "@/lib/types/db";

type AssignmentView = TesterAssignment & {
	cycle: {
		id: string;
		status: string;
		start_date: string | null;
		end_date: string | null;
		tester_target: number;
		app: {
			id: string;
			name: string;
			category: string | null;
			opt_in_link: string | null;
			play_store_link: string | null;
		} | null;
	} | null;
};

const TARGET_DAYS = 14;

const ENGAGEMENT_VARIANT: Record<EngagementStatus, "default" | "secondary" | "destructive" | "outline"> = {
	invited: "outline",
	opted_in: "secondary",
	active: "default",
	inactive: "outline",
	dropped: "destructive",
};

export function TesterTab() {
	const [rows, setRows] = useState<AssignmentView[]>([]);
	const [loading, setLoading] = useState(true);
	const [busyId, setBusyId] = useState<string | null>(null);

	async function load() {
		try {
			const res = await fetch("/api/tester/assignments");
			const data = res.ok ? await res.json() : [];
			setRows(Array.isArray(data) ? data : []);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function act(id: string, action: "opt_in" | "checkin", optInLink?: string | null) {
		setBusyId(id);
		try {
			const res = await fetch(`/api/tester/assignments/${id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Action failed");
				return;
			}
			if (action === "opt_in" && optInLink) window.open(optInLink, "_blank");
			if (action === "checkin") {
				toast.success(data.already ? "Already logged today" : "Thanks — activity logged");
			}
			await load();
		} finally {
			setBusyId(null);
		}
	}

	if (loading) {
		return (
			<div className='animate-pulse grid gap-4 md:grid-cols-2'>
				{[1, 2].map((i) => (
					<div key={i} className='h-40 bg-muted rounded-xl' />
				))}
			</div>
		);
	}

	const active = rows.filter((r) => r.cycle?.status === "active");

	if (rows.length === 0) {
		return (
			<Card>
				<CardContent className='py-12 text-center'>
					<FlaskConical className='mx-auto mb-3 h-8 w-8 text-muted-foreground' />
					<p className='font-medium'>No apps assigned yet</p>
					<p className='mt-1 text-sm text-muted-foreground'>
						We&apos;ll match you to apps that fit your profile. Check back soon.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold'>Apps to test</h2>
				<span className='text-sm text-muted-foreground'>{active.length} active</span>
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				{rows.map((r) => {
					const app = r.cycle?.app;
					const pct = Math.min(100, Math.round(((r.days_active ?? 0) / TARGET_DAYS) * 100));
					const busy = busyId === r.id;
					return (
						<Card key={r.id}>
							<CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
								<div>
									<CardTitle className='text-base'>{app?.name ?? "App"}</CardTitle>
									{app?.category && (
										<p className='mt-0.5 text-xs text-muted-foreground'>{app.category}</p>
									)}
								</div>
								<Badge variant={ENGAGEMENT_VARIANT[r.engagement_status]}>
									{ENGAGEMENT_LABEL[r.engagement_status]}
								</Badge>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<div className='mb-1.5 flex justify-between text-xs text-muted-foreground'>
										<span>
											{r.days_active ?? 0} / {TARGET_DAYS} days tested
										</span>
										<span>{pct}%</span>
									</div>
									<div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
										<div
											className='h-full rounded-full bg-primary transition-all'
											style={{ width: `${pct}%` }}
										/>
									</div>
								</div>

								{r.engagement_status === "invited" ? (
									<Button
										className='w-full'
										disabled={busy || !app?.opt_in_link}
										onClick={() => act(r.id, "opt_in", app?.opt_in_link)}>
										<ExternalLink className='mr-2 h-4 w-4' />
										{app?.opt_in_link ? "Opt in on Google Play" : "Opt-in link pending"}
									</Button>
								) : r.engagement_status === "dropped" ? (
									<p className='text-sm text-muted-foreground'>
										This assignment was closed.
									</p>
								) : (
									<div className='space-y-2'>
										<div className='flex gap-2'>
											<Button
												className='flex-1'
												disabled={busy}
												onClick={() => act(r.id, "checkin")}>
												<CheckCircle2 className='mr-2 h-4 w-4' />
												I tested today
											</Button>
											{app?.opt_in_link && (
												<Button
													variant='outline'
													size='icon'
													onClick={() => window.open(app.opt_in_link!, "_blank")}
													title='Open app'>
													<ExternalLink className='h-4 w-4' />
												</Button>
											)}
										</div>
										{r.cycle?.id && (
											<BugReportDialog cycleId={r.cycle.id} appName={app?.name ?? "App"} />
										)}
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
