"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { TesterAccount, TesterType } from "@/lib/types/db";
import { COUNTRIES } from "@/lib/countries";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
	available: "default",
	assigned: "secondary",
	inactive: "outline",
};

const COUNTRY_NAME = new Map(COUNTRIES.map((c) => [c.code, c.name]));

export function TesterPool({
	testers,
	onChanged,
}: {
	testers: TesterAccount[];
	onChanged: () => void;
}) {
	const [email, setEmail] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [type, setType] = useState<TesterType>("owned");
	const [device, setDevice] = useState("");
	const [busy, setBusy] = useState(false);

	async function add() {
		if (!email.trim()) {
			toast.error("Email is required");
			return;
		}
		setBusy(true);
		try {
			const res = await fetch("/api/admin/testers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					display_name: displayName.trim() || undefined,
					type,
					device_model: device.trim() || undefined,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Failed to add tester");
				return;
			}
			toast.success("Tester added to pool");
			setEmail("");
			setDisplayName("");
			setDevice("");
			onChanged();
		} finally {
			setBusy(false);
		}
	}

	const available = testers.filter((t) => t.status === "available").length;

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Add Tester</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid gap-3 md:grid-cols-2'>
						<Input
							placeholder='tester@gmail.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Input
							placeholder='Display name (optional)'
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
						/>
						<Select value={type} onValueChange={(v) => setType(v as TesterType)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='owned'>Owned</SelectItem>
								<SelectItem value='recruited'>Recruited</SelectItem>
								<SelectItem value='exchange'>Exchange</SelectItem>
							</SelectContent>
						</Select>
						<Input
							placeholder='Device model (optional)'
							value={device}
							onChange={(e) => setDevice(e.target.value)}
						/>
					</div>
					<div className='flex justify-end mt-3'>
						<Button onClick={add} disabled={busy}>
							{busy ? "Adding…" : "Add to pool"}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>
						Pool ({testers.length}) · {available} available
					</CardTitle>
				</CardHeader>
				<CardContent>
					{testers.length === 0 ? (
						<p className='text-sm text-muted-foreground'>No testers in the pool yet.</p>
					) : (
						<div className='space-y-2'>
							{testers.map((t) => (
								<div
									key={t.id}
									className='flex items-center justify-between p-3 border rounded-lg'>
									<div className='min-w-0'>
										<p className='text-sm font-medium truncate'>
											{t.display_name || t.email}
										</p>
										<p className='text-xs text-muted-foreground'>
											{t.type}
											{t.country ? ` · ${COUNTRY_NAME.get(t.country) ?? t.country}` : ""}
											{t.device_model ? ` · ${t.device_model}` : ""} · score{" "}
											{t.reliability_score} · tested {t.apps_tested_count}
										</p>
									</div>
									<div className='flex items-center gap-2'>
										{t.type === "community" && (
											<Badge variant='outline'>community</Badge>
										)}
										<Badge variant={STATUS_VARIANT[t.status] ?? "outline"}>{t.status}</Badge>
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
