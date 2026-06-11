"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/Reveal";

const STATS = [
	{ value: "12", label: "testers required", sub: "we supply every one" },
	{ value: "14", label: "days of activity", sub: "tracked daily, no gaps" },
	{ value: "0", label: "testers you chase", sub: "no swap groups, ever" },
	{ value: "100%", label: "outcome focused", sub: "free re-run if it slips" },
];

const CATEGORIES = [
	"Productivity",
	"Finance",
	"Health & Fitness",
	"Social",
	"Education",
	"Games",
	"Lifestyle",
	"Business",
	"Tools",
];

export function Stats() {
	return (
		<section className="relative border-y border-border/60 bg-muted/30 py-16">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<RevealGroup className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-4">
					{STATS.map((s) => (
						<RevealItem key={s.label} className="text-center">
							<div className="text-4xl font-semibold tracking-tight sm:text-5xl">
								<span className="text-gradient">{s.value}</span>
							</div>
							<div className="mt-2 text-sm font-medium">{s.label}</div>
							<div className="mt-0.5 text-xs text-muted-foreground">{s.sub}</div>
						</RevealItem>
					))}
				</RevealGroup>

				<Reveal delay={0.1} className="mt-14">
					<p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
						Category-matched testers — your idea stays away from competitors
					</p>
					<div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
						<div className="flex w-max animate-marquee gap-3">
							{[...CATEGORIES, ...CATEGORIES].map((c, i) => (
								<span
									key={i}
									className="whitespace-nowrap rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
									{c}
								</span>
							))}
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
