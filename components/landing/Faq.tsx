"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/landing/Reveal";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const FAQS = [
	{
		q: "What exactly is Google's testing requirement?",
		a: "Before a new personal developer account can publish to production, Google requires at least 12 testers opted into your closed test and actively running the app for 14 continuous days. TestMate supplies every tester and tracks that activity day by day so the requirement is provably met.",
	},
	{
		q: "Are these real testers or bots?",
		a: "Real people with real, established Google accounts — ranked by reliability and matched to your app's category. Google's review looks for genuine engagement signals, so synthetic installs don't pass. Ours do.",
	},
	{
		q: "What if a cycle doesn't pass?",
		a: "We run the next cycle for free. You get the pass, not a refund — our job is to get you across the line, and the re-run guarantee is included on every plan.",
	},
	{
		q: "Is my app idea safe?",
		a: "Yes. Testers are neutral and segmented by category, so competitors in your space never get assigned to your build. You share only what's needed to opt in and run the test.",
	},
	{
		q: "How fast does it start?",
		a: "Add your app, pick a package, and mark your track ready — the 14-day clock begins immediately. On Premium, your cycle jumps the queue and starts the same day.",
	},
	{
		q: "Do I need anything set up in Play Console?",
		a: "Just a closed testing track with an opt-in link and your tester group email. That's it — no setup calls, no integrations. We handle the rest.",
	},
];

function Item({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="border-b border-border/60 last:border-0">
			<button
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between gap-4 py-5 text-left">
				<span className="text-base font-medium">{q}</span>
				<Plus
					className={cn(
						"h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
						open && "rotate-45 text-[hsl(var(--tm-accent))]"
					)}
				/>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.32, ease: EASE }}
						className="overflow-hidden">
						<p className="pb-5 pr-9 text-sm leading-relaxed text-muted-foreground">{a}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function Faq() {
	return (
		<section id="faq" className="relative py-24 sm:py-32">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<Reveal className="text-center">
					<p className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--tm-accent))]">
						FAQ
					</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
						Questions, answered
					</h2>
				</Reveal>

				<Reveal delay={0.1} className="mt-12">
					<div className="rounded-3xl border border-border/60 bg-card/50 px-6 sm:px-8">
						{FAQS.map((f) => (
							<Item key={f.q} q={f.q} a={f.a} />
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}
