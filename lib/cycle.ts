import type {
	CycleProgress,
	CycleStatus,
	EngagementStatus,
	TesterAssignment,
} from "@/lib/types/db";

// Engagement states that count toward the "active testers" requirement.
const ACTIVE_ENGAGEMENT: EngagementStatus[] = ["opted_in", "active"];

function daysBetween(from: Date, to: Date): number {
	const ms = to.getTime() - from.getTime();
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Derive UI progress for a cycle from its window + assignments.
 * - dayIndex: how many days into the test window we are (0..totalDays)
 * - activeCount: testers currently engaged (opted_in/active)
 * - projectedEligibleDate: earliest date the 14-day clock can finish, given today
 * - onTrack: enough active testers to hit the target
 */
export function computeCycleProgress(args: {
	status: CycleStatus;
	tester_target: number;
	start_date: string | null;
	end_date: string | null;
	assignments: Pick<TesterAssignment, "engagement_status">[];
}): CycleProgress {
	const { tester_target, start_date, end_date, assignments } = args;

	const activeCount = assignments.filter((a) =>
		ACTIVE_ENGAGEMENT.includes(a.engagement_status)
	).length;

	const start = start_date ? new Date(start_date) : null;
	const end = end_date ? new Date(end_date) : null;
	const totalDays = start && end ? daysBetween(start, end) : 14;

	const now = new Date();
	const dayIndex = start
		? Math.max(0, Math.min(totalDays, daysBetween(start, now)))
		: 0;

	const projectedEligibleDate = end ? end.toISOString().slice(0, 10) : null;
	const onTrack = activeCount >= tester_target;

	return {
		dayIndex,
		totalDays,
		activeCount,
		target: tester_target,
		projectedEligibleDate,
		onTrack,
	};
}

export const ENGAGEMENT_LABEL: Record<EngagementStatus, string> = {
	invited: "Invited",
	opted_in: "Opted in",
	active: "Active",
	inactive: "Inactive",
	dropped: "Dropped",
};

export const CYCLE_STATUS_LABEL: Record<CycleStatus, string> = {
	pending_setup: "Setup needed",
	assigning: "Assigning testers",
	active: "Testing in progress",
	completed: "Completed",
	failed: "Failed",
	rerun_scheduled: "Free re-run scheduled",
};
