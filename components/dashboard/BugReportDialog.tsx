"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "@/components/media/MediaUploader";
import { Bug, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BugSeverity, MediaItem } from "@/lib/types/db";

/**
 * Tester-facing "Report a bug" dialog for a single cycle. Uploads media first
 * (via MediaUploader), then POSTs the bug report. Calls onSubmitted on success.
 */
export function BugReportDialog({
	cycleId,
	appName,
	onSubmitted,
}: {
	cycleId: string;
	appName: string;
	onSubmitted?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [severity, setSeverity] = useState<BugSeverity>("medium");
	const [media, setMedia] = useState<MediaItem[]>([]);
	const [saving, setSaving] = useState(false);

	function reset() {
		setTitle("");
		setDescription("");
		setSeverity("medium");
		setMedia([]);
	}

	async function submit() {
		if (!title.trim()) {
			toast.error("Add a short title");
			return;
		}
		setSaving(true);
		try {
			const res = await fetch("/api/tester/bug-reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ test_cycle_id: cycleId, title, description, severity, media }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Could not submit report");
				return;
			}
			toast.success("Bug report submitted — thanks!");
			reset();
			setOpen(false);
			onSubmitted?.();
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(o) => (setOpen(o), o || reset())}>
			<DialogTrigger asChild>
				<Button variant='outline' className='w-full'>
					<Bug className='mr-2 h-4 w-4' /> Report a bug
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-lg'>
				<DialogHeader>
					<DialogTitle>Report a bug · {appName}</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div className='space-y-1.5'>
						<Label htmlFor='bug-title'>Title</Label>
						<Input
							id='bug-title'
							placeholder='e.g. Crash on sign-up screen'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div className='space-y-1.5'>
						<Label htmlFor='bug-desc'>What happened?</Label>
						<Textarea
							id='bug-desc'
							rows={4}
							placeholder='Steps to reproduce, what you expected, what you saw…'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className='space-y-1.5'>
						<Label>Severity</Label>
						<Select value={severity} onValueChange={(v) => setSeverity(v as BugSeverity)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='low'>Low</SelectItem>
								<SelectItem value='medium'>Medium</SelectItem>
								<SelectItem value='high'>High</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='space-y-1.5'>
						<Label>Attachments</Label>
						<MediaUploader value={media} onChange={setMedia} disabled={saving} />
					</div>
				</div>
				<DialogFooter>
					<Button onClick={submit} disabled={saving}>
						{saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						Submit report
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
