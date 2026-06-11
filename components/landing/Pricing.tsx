"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/Reveal";
import { SignInButton } from "@/components/landing/SignInButton";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = {
	name: string;
	price: string;
	tagline: string;
	features: string[];
	cta: string;
	popular?: boolean;
};

const TIERS: Tier[] = [
	{
		name: "Single",
		price: "$1",
		tagline: "Try it with one tester",
		features: [
			"1 verified tester",
			"Real Google account",
			"Daily engagement tracking",
		],
		cta: "Start small",
	},
	{
		name: "Basic 12",
		price: "$19",
		tagline: "The full requirement, covered",
		features: [
			"All 12 testers supplied",
			"14 days of tracked activity",
			"Category-matched pool",
			"Free re-run if a cycle slips",
		],
		cta: "Get 12 testers",
	},
	{
		name: "Standard",
		price: "$29",
		tagline: "Pass with proof in hand",
		features: [
			"Everything in Basic 12",
			"Production-readiness report",
			"Pre-launch checklist",
			"Priority support",
		],
		cta: "Go Standard",
		popular: true,
	},
	{
		name: "Premium",
		price: "$39",
		tagline: "Fastest path to launch",
		features: [
			"Everything in Standard",
			"Same-day priority start",
			"Cycle jumps the queue",
			"Hands-on pass guarantee",
		],
		cta: "Go Premium",
	},
];

export function Pricing() {
	return (
		<section id="pricing" className="relative py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--tm-accent))]">
						Pricing
					</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
						Pay per cycle. Never a subscription.
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Pick the outcome you need. Every plan includes real testers and daily
						engagement tracking.
					</p>
				</Reveal>

				<RevealGroup className="mt-16 grid gap-5 lg:grid-cols-4">
					{TIERS.map((t) => (
						<RevealItem key={t.name}>
							<div
								className={cn(
									"relative flex h-full flex-col rounded-3xl border p-6 transition-all hover:-translate-y-1",
									t.popular
										? "border-[hsl(var(--tm-accent)/0.5)] bg-card shadow-xl shadow-[hsl(var(--tm-accent)/0.12)]"
										: "border-border/60 bg-card/50 hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30"
								)}>
								{t.popular && (
									<span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[linear-gradient(90deg,hsl(var(--tm-accent)),hsl(var(--tm-accent-2)))] px-3 py-1 text-xs font-semibold text-white shadow-lg">
										Most popular
									</span>
								)}
								<div>
									<h3 className="font-semibold">{t.name}</h3>
									<p className="mt-1 text-xs text-muted-foreground">{t.tagline}</p>
								</div>
								<div className="mt-5 flex items-baseline gap-1">
									<span className="text-4xl font-semibold tracking-tight">{t.price}</span>
									<span className="text-sm text-muted-foreground">/ cycle</span>
								</div>

								<ul className="mt-6 flex-1 space-y-3">
									{t.features.map((f) => (
										<li key={f} className="flex items-start gap-2.5 text-sm">
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-muted-foreground">{f}</span>
										</li>
									))}
								</ul>

								<div className="mt-7">
									<SignInButton
										size="sm"
										variant={t.popular ? "primary" : "outline"}
										showArrow={false}
										className="w-full">
										{t.cta}
									</SignInButton>
								</div>
							</div>
						</RevealItem>
					))}
				</RevealGroup>

				<Reveal delay={0.1} className="mt-8">
					<p className="text-center text-sm text-muted-foreground">
						Every plan is backed by our free re-run guarantee — if a cycle falls short,
						we run the next one on us.
					</p>
				</Reveal>
			</div>
		</section>
	);
}
