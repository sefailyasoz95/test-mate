"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon, Video } from "lucide-react";
import type { MediaItem } from "@/lib/types/db";

/**
 * Select images/videos, upload them to the public 'media' bucket via
 * /api/media/upload, and surface the resulting MediaItem[] to the parent.
 * Controlled: parent owns the `value` array.
 */
export function MediaUploader({
	value,
	onChange,
	disabled,
}: {
	value: MediaItem[];
	onChange: (next: MediaItem[]) => void;
	disabled?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;
		setUploading(true);
		try {
			const fd = new FormData();
			Array.from(files).forEach((f) => fd.append("files", f));
			const res = await fetch("/api/media/upload", { method: "POST", body: fd });
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Upload failed");
				return;
			}
			onChange([...value, ...(data.media as MediaItem[])]);
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	function remove(url: string) {
		onChange(value.filter((m) => m.url !== url));
	}

	return (
		<div className='space-y-3'>
			<input
				ref={inputRef}
				type='file'
				accept='image/*,video/*'
				multiple
				hidden
				onChange={(e) => handleFiles(e.target.files)}
			/>
			<Button
				type='button'
				variant='outline'
				size='sm'
				disabled={disabled || uploading}
				onClick={() => inputRef.current?.click()}>
				{uploading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Upload className='mr-2 h-4 w-4' />}
				{uploading ? "Uploading…" : "Add screenshots / video"}
			</Button>

			{value.length > 0 && (
				<div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
					{value.map((m) => (
						<div key={m.url} className='group relative aspect-square overflow-hidden rounded-lg border bg-muted'>
							{m.type === "image" ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={m.url} alt={m.name} className='h-full w-full object-cover' />
							) : (
								<video src={m.url} className='h-full w-full object-cover' />
							)}
							<div className='absolute left-1 top-1 rounded bg-black/60 p-0.5 text-white'>
								{m.type === "image" ? <ImageIcon className='h-3 w-3' /> : <Video className='h-3 w-3' />}
							</div>
							{!disabled && (
								<button
									type='button'
									onClick={() => remove(m.url)}
									className='absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100'>
									<X className='h-3 w-3' />
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
