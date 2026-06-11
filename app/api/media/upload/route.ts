import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";
import type { MediaItem, MediaType } from "@/lib/types/db";

const BUCKET = "media";
const MAX_BYTES = 50 * 1024 * 1024; // 50MB — covers short videos
const ALLOWED: Record<string, MediaType> = {
	"image/png": "image",
	"image/jpeg": "image",
	"image/jpg": "image",
	"image/webp": "image",
	"image/gif": "image",
	"video/mp4": "video",
	"video/quicktime": "video",
	"video/webm": "video",
};

/**
 * Upload one or more media files (screenshots, photos, videos) to the public
 * 'media' Storage bucket via the service role (per the all-via-API-routes rule).
 * Any authenticated user may upload (testers attach to bug reports, admin to
 * the composed report). Returns [{ url, type, name }] for the caller to persist.
 */
export async function POST(req: NextRequest) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const form = await req.formData().catch(() => null);
	if (!form) return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });

	const files = form.getAll("files").filter((f): f is File => f instanceof File);
	if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });

	const supabase = createAdminClient();
	const uploaded: MediaItem[] = [];

	for (const file of files) {
		const type = ALLOWED[file.type];
		if (!type) {
			return NextResponse.json({ error: `Unsupported file type: ${file.type || "unknown"}` }, { status: 400 });
		}
		if (file.size > MAX_BYTES) {
			return NextResponse.json({ error: `${file.name} exceeds the 50MB limit` }, { status: 400 });
		}

		const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
		const path = `${user.id}/${crypto.randomUUID()}${ext ? "." + ext : ""}`;
		const bytes = new Uint8Array(await file.arrayBuffer());

		const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
			contentType: file.type,
			upsert: false,
		});
		if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

		const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
		uploaded.push({ url: pub.publicUrl, type, name: file.name });
	}

	return NextResponse.json({ media: uploaded }, { status: 201 });
}
