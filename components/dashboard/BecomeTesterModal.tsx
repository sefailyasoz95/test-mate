"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, Coins, ShieldCheck, Smartphone } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

const POINTS = [
	{
		icon: Smartphone,
		title: "Test real apps on your device",
		body: "We assign you apps that match your interests. Open and use each one for a few minutes a day across its 14-day cycle.",
	},
	{
		icon: Coins,
		title: "Earn free testing",
		body: "Test 12 apps to completion and you earn a free Basic 12 cycle for one of your own apps — a $19 value.",
	},
	{
		icon: ShieldCheck,
		title: "Stay reliable",
		body: "Your reliability score grows as you show up daily. Higher score means you get matched first.",
	},
];

export function BecomeTesterModal({
	open,
	onOpenChange,
	onOptedIn,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onOptedIn?: () => void;
}) {
	const [country, setCountry] = useState("");
	const [device, setDevice] = useState("");
	const [androidVersion, setAndroidVersion] = useState("");
	const [busy, setBusy] = useState(false);

	async function confirm() {
		setBusy(true);
		try {
			const res = await fetch("/api/tester/opt-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					accept: true,
					country: country.trim() || undefined,
					device_model: device.trim() || undefined,
					android_version: androidVersion.trim() || undefined,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Could not opt in");
				return;
			}
			toast.success("You're now a tester", {
				description: "We'll match you to apps soon. Watch your dashboard.",
			});
			onOptedIn?.();
			onOpenChange(false);
		} finally {
			setBusy(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Become a tester</DialogTitle>
					<DialogDescription>
						Help other developers pass their closed test — and earn free testing for your
						own apps.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{POINTS.map((p) => {
						const Icon = p.icon;
						return (
							<div key={p.title} className="flex gap-3">
								<div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--tm-accent)/0.12)] text-[hsl(var(--tm-accent))]">
									<Icon className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">{p.title}</p>
									<p className="text-sm text-muted-foreground">{p.body}</p>
								</div>
							</div>
						);
					})}
				</div>

				<div className="grid gap-3 sm:grid-cols-3">
					<Select value={country} onValueChange={setCountry}>
						<SelectTrigger>
							<SelectValue placeholder="Country" />
						</SelectTrigger>
						<SelectContent className="max-h-64">
							{COUNTRIES.map((c) => (
								<SelectItem key={c.code} value={c.code}>
									{c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						placeholder="Device (e.g. Pixel 7)"
						value={device}
						onChange={(e) => setDevice(e.target.value)}
					/>
					<Input
						placeholder="Android ver."
						value={androidVersion}
						onChange={(e) => setAndroidVersion(e.target.value)}
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					You need a real Android device to test. We use your Google sign-in email to add
					you to closed-test tracks.
				</p>

				<div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
					<span className="font-medium text-foreground">Tester terms.</span> Apps you test
					are other developers&apos; confidential work. Copying, cloning, or otherwise
					stealing another developer&apos;s idea is unethical and strictly prohibited. We
					segment testers by category to avoid conflicts, but we cannot guarantee a
					competitor will never be assigned, and TestMate is not liable for what an
					individual tester does with what they see. By continuing you agree to these terms.
				</div>

				<div className="flex items-center justify-end gap-2">
					<Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
						Cancel
					</Button>
					<Button onClick={confirm} disabled={busy}>
						<CheckCircle2 className="mr-2 h-4 w-4" />
						{busy ? "Joining…" : "Agree & become a tester"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
