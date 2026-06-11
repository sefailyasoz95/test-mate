"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { CycleReportSection } from "@/components/admin/CycleReportSection";
import { CYCLE_STATUS_LABEL, ENGAGEMENT_LABEL } from "@/lib/cycle";
import type { CycleStatus, EngagementStatus } from "@/lib/types/db";
import type { AdminCycle } from "@/lib/types/admin";

const STATUS_ACTIONS: { status: CycleStatus; label: string; variant: "default" | "outline" | "destructive" }[] = [
	{ status: "active", label: "Mark active", variant: "outline" },
	{ status: "completed", label: "Mark completed", variant: "default" },
	{ status: "failed", label: "Mark failed", variant: "destructive" },
	{ status: "rerun_scheduled", label: "Schedule free re-run", variant: "outline" },
];

const ENGAGEMENT_OPTIONS: EngagementStatus[] = [
	"invited",
	"opted_in",
	"active",
	"inactive",
	"dropped",
];

export function CycleManageModal({
	cycle,
	open,
	onOpenChange,
	onChanged,
}: {
	cycle: AdminCycle | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onChanged: () => void;
}) {
	const [busy, setBusy] = useState(false);

	async function setStatus(status: CycleStatus) {
		if (!cycle) return;
		setBusy(true);
		try {
			const res = await fetch(`/api/admin/cycles/${cycle.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Update failed");
				return;
			}
			if (status === "rerun_scheduled" && data.rerun_cycle_id) {
				toast.success("Free re-run scheduled", { description: "A new pending_setup cycle was created." });
			} else {
				toast.success(`Status → ${CYCLE_STATUS_LABEL[status]}`);
			}
			onChanged();
		} finally {
			setBusy(false);
		}
	}

	async function setEngagement(assignmentId: string, engagement_status: EngagementStatus) {
		setBusy(true);
		try {
			const res = await fetch(`/api/admin/assignments/${assignmentId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ engagement_status }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				toast.error(data.error || "Update failed");
				return;
			}
			onChanged();
		} finally {
			setBusy(false);
		}
	}

	if (!cycle) return null;

	const pkg = cycle.order?.package;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Manage Cycle</DialogTitle>
				</DialogHeader>

				<Card>
					<CardHeader className='pb-3'>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-base'>{cycle.app?.name ?? "App"}</CardTitle>
							<Badge>{CYCLE_STATUS_LABEL[cycle.status]}</Badge>
						</div>
						<p className='text-sm text-muted-foreground'>
							{cycle.buyer?.email} · {pkg?.name ?? "Package"} · target {cycle.tester_target}
						</p>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div className='flex flex-wrap gap-2'>
							{STATUS_ACTIONS.map((a) => (
								<Button
									key={a.status}
									size='sm'
									variant={a.variant}
									disabled={busy || cycle.status === a.status}
									onClick={() => setStatus(a.status)}>
									{a.label}
								</Button>
							))}
						</div>
						{cycle.start_date && (
							<p className='text-xs text-muted-foreground'>
								Window: {cycle.start_date} → {cycle.end_date}
							</p>
						)}
					</CardContent>
				</Card>

				<div className='mt-4'>
					<h3 className='text-sm font-medium mb-2'>
						Testers ({cycle.assignments?.length ?? 0})
					</h3>
					{!cycle.assignments || cycle.assignments.length === 0 ? (
						<p className='text-sm text-muted-foreground'>
							No testers assigned yet. The buyer assigns testers when they start the cycle.
						</p>
					) : (
						<div className='space-y-2'>
							{cycle.assignments.map((a) => (
								<div
									key={a.id}
									className='flex items-center justify-between gap-3 p-3 border rounded-lg'>
									<div className='min-w-0'>
										<p className='text-sm font-medium truncate'>
											{a.tester?.display_name || a.tester?.email || "Tester"}
										</p>
										<p className='text-xs text-muted-foreground'>
											{a.days_active} day{a.days_active === 1 ? "" : "s"} active
										</p>
									</div>
									<Select
										value={a.engagement_status}
										onValueChange={(v) => setEngagement(a.id, v as EngagementStatus)}>
										<SelectTrigger className='w-[130px] h-8'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{ENGAGEMENT_OPTIONS.map((e) => (
												<SelectItem key={e} value={e}>
													{ENGAGEMENT_LABEL[e]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							))}
						</div>
					)}
				</div>

				<CycleReportSection cycleId={cycle.id} />
			</DialogContent>
		</Dialog>
	);
}
