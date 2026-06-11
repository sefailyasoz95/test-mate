"use client";

import { Reveal, RevealGroup, RevealItem } from "@/components/landing/Reveal";
import { UserPlus, CreditCard, Rocket, LineChart } from "lucide-react";

const STEPS = [
	{
		icon: UserPlus,
		title: "Add your app",
		body: "Sign in with Google and drop in your app details and closed-test opt-in link. Two minutes, no setup calls.",
	},
	{
		icon: CreditCard,
		title: "Pick a package",
		body: "Choose the outcome you need — from a single tester to a full 12-tester pass with an analysis report.",
	},
	{
		icon: Rocket,
		title: "We assign & start",
		body: "Verified, category-matched testers opt in and the 14-day clock begins the moment you mark your track ready.",
	},
	{
		icon: LineChart,
		title: "Pass & launch",
		body: "Track daily engagement in your dashboard. Hit the requirement, get your report, and ship to production.",
	},
];

export function HowItWorks() {
	return (
		<section id="how" className="relative py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--tm-accent))]">
						How it works
					</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
						From upload to launch in four steps
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						You bring the app. We run the test the way Google wants it.
					</p>
				</Reveal>

				<RevealGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{STEPS.map((s, i) => {
						const Icon = s.icon;
						return (
							<RevealItem key={s.title}>
								<div className="group relative h-full rounded-3xl border border-border/60 bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30">
									<div className="mb-5 flex items-center justify-between">
										<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--tm-accent)/0.18),hsl(var(--tm-accent-2)/0.12))] text-[hsl(var(--tm-accent))]">
											<Icon className="h-5 w-5" />
										</div>
										<span className="text-5xl font-bold leading-none text-muted-foreground/15">
											{i + 1}
										</span>
									</div>
									<h3 className="text-lg font-semibold">{s.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
								</div>
							</RevealItem>
						);
					})}
				</RevealGroup>
			</div>
		</section>
	);
}
