"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Users, CalendarDays, CheckCircle2, Loader2, ShieldCheck, FileText } from "lucide-react";
import { computeCycleProgress, ENGAGEMENT_LABEL, CYCLE_STATUS_LABEL } from "@/lib/cycle";
import type { CycleWithRelations, EngagementStatus } from "@/lib/types/db";

const ENGAGEMENT_VARIANT: Record<EngagementStatus, "default" | "secondary" | "destructive" | "outline"> = {
	invited: "outline",
	opted_in: "secondary",
	active: "default",
	inactive: "secondary",
	dropped: "destructive",
};

const SETUP_STEPS = [
	"Create a closed test track in Google Play Console",
	"Publish the closed test and confirm the opt-in link works",
];

export default function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [cycle, setCycle] = useState<CycleWithRelations | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [checked, setChecked] = useState<boolean[]>(SETUP_STEPS.map(() => false));
	const [starting, setStarting] = useState(false);

	async function fetchCycle() {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/cycles/${id}`);
			if (!res.ok) {
				toast.error("Could not load cycle");
				setCycle(null);
				return;
			}
			setCycle(await res.json());
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchCycle();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	async function startCycle() {
		setStarting(true);
		try {
			const res = await fetch(`/api/cycles/${id}/start`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Could not start the cycle");
				return;
			}
			toast.success("Cycle started", {
				description: `${data.assigned} testers assigned · ${data.tester_target} target`,
			});
			fetchCycle();
		} finally {
			setStarting(false);
		}
	}

	if (isLoading) {
		return (
			<div className='w-full h-[60vh] flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	if (!cycle) {
		return (
			<div className='container mx-auto py-10'>
				<Link href='/dashboard' className='inline-flex items-center gap-2 text-sm text-muted-foreground mb-6'>
					<ArrowLeft className='h-4 w-4' /> Back to dashboard
				</Link>
				<p>Cycle not found.</p>
			</div>
		);
	}

	const pkg = cycle.order?.package ?? null;
	const progress = computeCycleProgress({
		status: cycle.status,
		tester_target: cycle.tester_target,
		start_date: cycle.start_date,
		end_date: cycle.end_date,
		assignments: cycle.assignments ?? [],
	});
	const allChecked = checked.every(Boolean);
	const pct = progress.totalDays ? Math.round((progress.dayIndex / progress.totalDays) * 100) : 0;

	return (
		<div className='container mx-auto py-10 max-w-4xl'>
			<Link href='/dashboard' className='inline-flex items-center gap-2 text-sm text-muted-foreground mb-6'>
				<ArrowLeft className='h-4 w-4' /> Back to dashboard
			</Link>

			<div className='flex items-start justify-between mb-6'>
				<div>
					<h1 className='text-2xl font-bold'>{cycle.app?.name ?? "App"}</h1>
					<p className='text-sm text-muted-foreground'>
						{pkg?.name ?? "Package"} · {cycle.app?.package_name}
					</p>
				</div>
				<Badge>{CYCLE_STATUS_LABEL[cycle.status]}</Badge>
			</div>

			{/* Package perks */}
			<div className='flex flex-wrap gap-2 mb-6'>
				<Badge variant='secondary' className='gap-1'>
					<Users className='h-3 w-3' /> {cycle.tester_target} testers
				</Badge>
				<Badge variant='secondary' className='gap-1'>
					<CalendarDays className='h-3 w-3' /> {pkg?.duration_days ?? 14} days
				</Badge>
				{pkg?.includes_report && (
					<Badge variant='secondary' className='gap-1'>
						<FileText className='h-3 w-3' /> Report
					</Badge>
				)}
				{pkg?.includes_guarantee && (
					<Badge variant='secondary' className='gap-1'>
						<ShieldCheck className='h-3 w-3' /> Free re-run
					</Badge>
				)}
			</div>

			{/* Setup checklist */}
			{cycle.status === "pending_setup" && (
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-lg'>Set up your closed test</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p className='text-sm text-muted-foreground'>
							Complete these steps in Play Console, then start the 14-day clock. We assign testers the moment you mark
							this ready.
						</p>
						{cycle.app?.opt_in_link && (
							<a
								href={cycle.app.opt_in_link}
								target='_blank'
								rel='noopener noreferrer'
								className='text-sm text-blue-500 hover:underline break-all block'>
								Opt-in link: {cycle.app.opt_in_link}
							</a>
						)}
						<div className='space-y-3 pt-2'>
							{SETUP_STEPS.map((step, i) => (
								<label key={i} className='flex items-start gap-3 cursor-pointer'>
									<Checkbox
										checked={checked[i]}
										onCheckedChange={(v) => setChecked((prev) => prev.map((c, idx) => (idx === i ? Boolean(v) : c)))}
									/>
									<span className='text-sm leading-tight'>{step}</span>
								</label>
							))}
						</div>
						<Button onClick={startCycle} disabled={!allChecked || starting} className='w-full mt-2'>
							{starting ? "Starting…" : "Mark ready & start the 14-day test"}
						</Button>
						{!allChecked && (
							<p className='text-xs text-muted-foreground text-center'>Complete all steps to enable start.</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Active progress */}
			{(cycle.status === "active" || cycle.status === "completed") && (
				<Card className='mb-6'>
					<CardHeader>
						<CardTitle className='text-lg'>Progress</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex justify-between text-sm'>
							<span className='text-muted-foreground'>
								Day {progress.dayIndex} of {progress.totalDays}
							</span>
							<span className={progress.onTrack ? "text-green-600" : "text-yellow-600"}>
								{progress.activeCount}/{progress.target} testers active
							</span>
						</div>
						<div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
							<div className='h-full bg-primary transition-all' style={{ width: `${pct}%` }} />
						</div>
						{progress.projectedEligibleDate && (
							<p className='text-xs text-muted-foreground'>
								Eligible on {new Date(progress.projectedEligibleDate).toLocaleDateString()} if engagement holds.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Tester engagement grid */}
			{cycle.assignments && cycle.assignments.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Testers ({cycle.assignments.length})</CardTitle>
						<p className='text-sm text-muted-foreground'>
							Add these emails as testers on your closed-test track in Google Play Console.
						</p>
					</CardHeader>
					<CardContent>
						<div className='grid gap-2 sm:grid-cols-2'>
							{cycle.assignments.map((a) => (
								<div key={a.id} className='flex items-center justify-between p-3 border rounded-lg'>
									<div className='min-w-0'>
										<p className='text-sm font-medium truncate'>
											{a.tester?.email || a.tester?.display_name || "Tester"}
										</p>
										<p className='text-xs text-muted-foreground'>
											{a.days_active} day{a.days_active === 1 ? "" : "s"} active
										</p>
									</div>
									<Badge variant={ENGAGEMENT_VARIANT[a.engagement_status]}>
										{ENGAGEMENT_LABEL[a.engagement_status]}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{cycle.report && cycle.report.sent_at && (
				<Card className='mt-6'>
					<CardHeader>
						<CardTitle className='text-lg flex items-center gap-2'>
							<CheckCircle2 className='h-5 w-5 text-green-600' />
							{cycle.report.title || "Test Report"}
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<p className='text-sm text-muted-foreground whitespace-pre-wrap'>
							{cycle.report.summary || "Report generated."}
						</p>
						{cycle.report.attachments && cycle.report.attachments.length > 0 && (
							<div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
								{cycle.report.attachments.map((m) => (
									<a
										key={m.url}
										href={m.url}
										target='_blank'
										rel='noopener noreferrer'
										className='block aspect-video overflow-hidden rounded-lg border bg-muted'>
										{m.type === "image" ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={m.url} alt={m.name} className='h-full w-full object-cover' />
										) : (
											<video src={m.url} controls className='h-full w-full object-cover' />
										)}
									</a>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
