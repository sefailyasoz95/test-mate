"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MediaUploader } from "@/components/media/MediaUploader";
import { toast } from "sonner";
import { Bug, ImageIcon, Loader2, Plus, Send, Save, CheckCircle2 } from "lucide-react";
import type { BugReportWithTester, BugSeverity, MediaItem, Report } from "@/lib/types/db";

const SEVERITY_VARIANT: Record<BugSeverity, "outline" | "secondary" | "destructive"> = {
	low: "outline",
	medium: "secondary",
	high: "destructive",
};

function MediaThumbs({
	media,
	onAdd,
}: {
	media: MediaItem[];
	onAdd?: (m: MediaItem) => void;
}) {
	if (media.length === 0) return null;
	return (
		<div className='mt-2 flex flex-wrap gap-2'>
			{media.map((m) => (
				<div key={m.url} className='group relative h-16 w-16 overflow-hidden rounded border bg-muted'>
					{m.type === "image" ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={m.url} alt={m.name} className='h-full w-full object-cover' />
					) : (
						<video src={m.url} className='h-full w-full object-cover' />
					)}
					{onAdd && (
						<button
							type='button'
							title='Add to report'
							onClick={() => onAdd(m)}
							className='absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100'>
							<Plus className='h-4 w-4' />
						</button>
					)}
				</div>
			))}
		</div>
	);
}

/**
 * Admin section: review tester bug reports for a cycle, then compose and send
 * the deliverable report (summary + curated attachments) to the buyer.
 */
export function CycleReportSection({ cycleId }: { cycleId: string }) {
	const [bugs, setBugs] = useState<BugReportWithTester[]>([]);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [attachments, setAttachments] = useState<MediaItem[]>([]);
	const [sentAt, setSentAt] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [sending, setSending] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [bugRes, repRes] = await Promise.all([
				fetch(`/api/admin/cycles/${cycleId}/bug-reports`),
				fetch(`/api/admin/cycles/${cycleId}/report`),
			]);
			const bugData = bugRes.ok ? await bugRes.json() : [];
			setBugs(Array.isArray(bugData) ? bugData : []);
			if (repRes.ok) {
				const rep = (await repRes.json()) as Report | null;
				if (rep) {
					setTitle(rep.title ?? "");
					setSummary(rep.summary ?? "");
					setAttachments(Array.isArray(rep.attachments) ? rep.attachments : []);
					setSentAt(rep.sent_at ?? null);
				}
			}
		} finally {
			setLoading(false);
		}
	}, [cycleId]);

	useEffect(() => {
		load();
	}, [load]);

	function addAttachment(m: MediaItem) {
		setAttachments((prev) => (prev.some((x) => x.url === m.url) ? prev : [...prev, m]));
		toast.success("Added to report");
	}

	async function persist(send: boolean) {
		if (send && !summary.trim()) {
			toast.error("Write a summary before sending");
			return;
		}
		send ? setSending(true) : setSaving(true);
		try {
			const res = await fetch(`/api/admin/cycles/${cycleId}/report`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, summary, attachments, send }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Could not save report");
				return;
			}
			setSentAt(data.report?.sent_at ?? sentAt);
			if (send) {
				toast.success(
					data.emailed ? "Report sent — buyer emailed" : "Report sent (email skipped — check Resend config)"
				);
			} else {
				toast.success("Draft saved");
			}
		} finally {
			setSaving(false);
			setSending(false);
		}
	}

	return (
		<div className='mt-6 space-y-4'>
			<div className='flex items-center gap-2'>
				<Bug className='h-4 w-4' />
				<h3 className='text-sm font-medium'>Bug reports ({bugs.length})</h3>
			</div>

			{loading ? (
				<div className='flex items-center gap-2 text-sm text-muted-foreground'>
					<Loader2 className='h-4 w-4 animate-spin' /> Loading…
				</div>
			) : bugs.length === 0 ? (
				<p className='text-sm text-muted-foreground'>No bug reports submitted yet.</p>
			) : (
				<div className='space-y-2'>
					{bugs.map((b) => (
						<div key={b.id} className='rounded-lg border p-3'>
							<div className='flex items-start justify-between gap-2'>
								<div className='min-w-0'>
									<p className='text-sm font-medium'>{b.title}</p>
									<p className='text-xs text-muted-foreground'>
										{b.tester?.display_name || b.tester?.email || "Tester"}
									</p>
								</div>
								<Badge variant={SEVERITY_VARIANT[b.severity]}>{b.severity}</Badge>
							</div>
							{b.description && <p className='mt-1.5 text-sm text-muted-foreground'>{b.description}</p>}
							<MediaThumbs media={b.media} onAdd={addAttachment} />
						</div>
					))}
				</div>
			)}

			<div className='rounded-lg border bg-muted/30 p-4 space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<ImageIcon className='h-4 w-4' />
						<h3 className='text-sm font-medium'>Compose report</h3>
					</div>
					{sentAt && (
						<Badge variant='secondary' className='gap-1'>
							<CheckCircle2 className='h-3 w-3' /> Sent {new Date(sentAt).toLocaleDateString()}
						</Badge>
					)}
				</div>

				<div className='space-y-1.5'>
					<Label htmlFor='rep-title'>Title</Label>
					<Input
						id='rep-title'
						placeholder='e.g. 14-day closed test — findings'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label htmlFor='rep-summary'>Summary</Label>
					<Textarea
						id='rep-summary'
						rows={6}
						placeholder='Overall stability, notable bugs, device coverage, recommendation…'
						value={summary}
						onChange={(e) => setSummary(e.target.value)}
					/>
				</div>
				<div className='space-y-1.5'>
					<Label>Attachments (hover a bug screenshot above to pull it in, or upload more)</Label>
					<MediaUploader value={attachments} onChange={setAttachments} disabled={saving || sending} />
				</div>

				<div className='flex flex-wrap gap-2'>
					<Button variant='outline' size='sm' disabled={saving || sending} onClick={() => persist(false)}>
						{saving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
						Save draft
					</Button>
					<Button size='sm' disabled={saving || sending} onClick={() => persist(true)}>
						{sending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2 h-4 w-4' />}
						{sentAt ? "Resend to buyer" : "Send to buyer"}
					</Button>
				</div>
			</div>
		</div>
	);
}
