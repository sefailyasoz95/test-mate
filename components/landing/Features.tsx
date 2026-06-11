"use client";

import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/Reveal";
import {
	ShieldCheck,
	Users,
	FileText,
	Gauge,
	Lock,
	Zap,
	Check,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function EngagementMini() {
	const days = Array.from({ length: 14 });
	return (
		<div className="mt-6 rounded-2xl border border-border/50 bg-background/60 p-4">
			<div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
				<span>Daily engagement</span>
				<span className="font-medium text-green-600 dark:text-green-400">on track</span>
			</div>
			<div className="flex items-end gap-1.5">
				{days.map((_, i) => (
					<motion.div
						key={i}
						initial={{ height: 6, opacity: 0.3 }}
						whileInView={{
							height: 14 + ((i * 7) % 26),
							opacity: 1,
						}}
						viewport={{ once: true }}
						transition={{ delay: i * 0.04, ease: EASE }}
						className="w-full rounded-md bg-[linear-gradient(180deg,hsl(var(--tm-accent)),hsl(var(--tm-accent-2)))]"
					/>
				))}
			</div>
		</div>
	);
}

export function Features() {
	return (
		<section id="features" className="relative py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--tm-accent))]">
						Why TestMate
					</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
						Built around the outcome, not the busywork
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Everything you need to satisfy Google&apos;s closed-testing rule — and nothing you don&apos;t.
					</p>
				</Reveal>

				<RevealGroup className="mt-16 grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
					{/* Large feature */}
					<RevealItem className="lg:col-span-2 lg:row-span-2">
						<div className="flex h-full flex-col rounded-3xl border border-border/60 bg-card/50 p-7">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--tm-accent)/0.12)] text-[hsl(var(--tm-accent))]">
								<Gauge className="h-5 w-5" />
							</div>
							<h3 className="mt-5 text-xl font-semibold">Real, tracked engagement</h3>
							<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
								Google doesn&apos;t just count installs — it wants testers actually
								using your app for 14 days. We monitor opt-ins and daily activity per
								tester so you can see the requirement being met, day by day.
							</p>
							<EngagementMini />
						</div>
					</RevealItem>

					{[
						{
							icon: Users,
							title: "Verified tester pool",
							body: "Real Google accounts, ranked by reliability and matched to your app category.",
						},
						{
							icon: ShieldCheck,
							title: "Free re-run guarantee",
							body: "If a cycle falls short, we run a second one free. You get the pass, not a refund.",
						},
						{
							icon: FileText,
							title: "Analysis report",
							body: "A production-readiness summary and checklist on Standard and Premium plans.",
						},
						{
							icon: Lock,
							title: "Idea-safe by design",
							body: "Neutral testers, segmented by category — competitors never see your build.",
						},
					].map((f) => {
						const Icon = f.icon;
						return (
							<RevealItem key={f.title}>
								<div className="flex h-full flex-col rounded-3xl border border-border/60 bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30">
									<div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--tm-accent)/0.12)] text-[hsl(var(--tm-accent))]">
										<Icon className="h-5 w-5" />
									</div>
									<h3 className="mt-4 font-semibold">{f.title}</h3>
									<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
								</div>
							</RevealItem>
						);
					})}
				</RevealGroup>

				<Reveal delay={0.1} className="mt-5">
					<div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/60 bg-[linear-gradient(120deg,hsl(var(--tm-accent)/0.08),transparent)] p-6 sm:flex-row">
						<div className="flex items-center gap-3">
							<Zap className="h-5 w-5 text-[hsl(var(--tm-accent))]" />
							<p className="text-sm">
								<span className="font-semibold">Priority handling</span> on Premium — your cycle jumps the queue and starts the same day.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
							<span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> No subscription</span>
							<span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Pay per cycle</span>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
