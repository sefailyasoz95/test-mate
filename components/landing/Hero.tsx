"use client";

import { motion } from "framer-motion";
import { SignInButton } from "@/components/landing/SignInButton";
import { ShieldCheck, Sparkles, Check } from "lucide-react";
import { FaGooglePlay } from "react-icons/fa";

const EASE = [0.22, 1, 0.36, 1] as const;

function Aurora() {
	return (
		<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
			{/* grid */}
			<div className="absolute inset-0 bg-grid mask-radial opacity-60" />
			{/* aurora blobs */}
			<div className="absolute left-1/2 top-[-12%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--tm-accent)/0.30),transparent_60%)] blur-2xl animate-aurora" />
			<div className="absolute right-[-8%] top-[8%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--tm-accent-3)/0.22),transparent_60%)] blur-2xl animate-aurora [animation-delay:-6s]" />
			<div className="absolute left-[-6%] top-[24%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--tm-accent-2)/0.20),transparent_60%)] blur-2xl animate-aurora [animation-delay:-12s]" />
		</div>
	);
}

function ProductMock() {
	const testers = Array.from({ length: 12 });
	return (
		<div className="gradient-ring relative mx-auto w-full max-w-md rounded-3xl border border-border/60 bg-card/80 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl dark:shadow-black/40">
			<div className="rounded-[1.25rem] border border-border/50 bg-background/80 p-5">
				{/* window chrome */}
				<div className="mb-5 flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
					<span className="ml-3 text-xs text-muted-foreground">Test cycle</span>
				</div>

				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-semibold">Habit Tracker</p>
						<p className="text-xs text-muted-foreground">Standard · 14 days</p>
					</div>
					<span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
						<span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
					</span>
				</div>

				{/* progress */}
				<div className="mt-5">
					<div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
						<span>Day 9 of 14</span>
						<span className="font-medium text-foreground">12 / 12 active</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<motion.div
							className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--tm-accent)),hsl(var(--tm-accent-2)))]"
							initial={{ width: 0 }}
							whileInView={{ width: "64%" }}
							viewport={{ once: true }}
							transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
						/>
					</div>
				</div>

				{/* testers grid */}
				<div className="mt-5 grid grid-cols-6 gap-2">
					{testers.map((_, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, scale: 0.6 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.5 + i * 0.04, ease: EASE }}
							className="flex aspect-square items-center justify-center rounded-lg bg-muted/70 ring-1 ring-border/50">
							<Check className="h-3.5 w-3.5 text-green-500" />
						</motion.div>
					))}
				</div>

				<div className="mt-5 flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-2.5">
					<ShieldCheck className="h-4 w-4 text-[hsl(var(--tm-accent))]" />
					<span className="text-xs text-muted-foreground">
						On track to pass — eligible{" "}
						<span className="font-medium text-foreground">in 5 days</span>
					</span>
				</div>
			</div>
		</div>
	);
}

export function Hero() {
	return (
		<section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
			<Aurora />

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
					{/* Left: copy */}
					<div className="text-center lg:text-left">
						<motion.a
							href="#how"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: EASE }}
							className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground">
							<Sparkles className="h-3.5 w-3.5 text-[hsl(var(--tm-accent))]" />
							Pass Google Play's testing requirement — guaranteed
						</motion.a>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
							className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4rem]">
							Ship your app.
							<br />
							<span className="text-gradient">We handle the 12 testers.</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
							className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
							Google requires 12 testers running your app for 14 straight days before
							you can launch. TestMate delivers the outcome — verified testers, daily
							engagement, and a clean pass. No tester hunt, no group swaps.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
							className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
							<SignInButton size="lg">Start your test</SignInButton>
							<a
								href="#pricing"
								className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/60 px-7 text-[15px] font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-accent">
								See pricing
							</a>
						</motion.div>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.45 }}
							className="mt-3 text-xs text-muted-foreground">
							By continuing with Google you agree to our Terms and idea-safety policy.
						</motion.p>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start">
							<span className="inline-flex items-center gap-1.5">
								<FaGooglePlay className="h-3.5 w-3.5" /> Play Console ready
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Check className="h-4 w-4 text-green-500" /> 14-day requirement
							</span>
							<span className="inline-flex items-center gap-1.5">
								<ShieldCheck className="h-4 w-4 text-[hsl(var(--tm-accent))]" /> Free re-run guarantee
							</span>
						</motion.div>
					</div>

					{/* Right: product mock */}
					<motion.div
						initial={{ opacity: 0, y: 40, rotateX: 8 }}
						animate={{ opacity: 1, y: 0, rotateX: 0 }}
						transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
						className="[perspective:1200px]">
						<div className="animate-float">
							<ProductMock />
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
