"use client";

import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { SignInButton } from "@/components/landing/SignInButton";
import TestMateIcon from "@/components/icons/TestMateIcon";
import { Check } from "lucide-react";

const FOOTER_LINKS = [
	{ href: "#how", label: "How it works" },
	{ href: "#features", label: "Features" },
	{ href: "#pricing", label: "Pricing" },
	{ href: "#faq", label: "FAQ" },
];

export function Cta() {
	return (
		<>
			<section className="relative py-24 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<Reveal>
						<div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,hsl(var(--tm-accent)/0.12),hsl(var(--tm-accent-2)/0.08)_45%,transparent)] px-6 py-16 text-center sm:px-12 sm:py-20">
							{/* glow */}
							<div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--tm-accent)/0.35),transparent_60%)] blur-2xl" />

							<h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
								Stop chasing testers.
								<br />
								<span className="text-gradient">Start shipping.</span>
							</h2>
							<p className="relative mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
								Hand off the 12-tester requirement and get back to building. We&apos;ll
								take it from here.
							</p>

							<div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
								<SignInButton size="lg">Start your test</SignInButton>
								<a
									href="#pricing"
									className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/60 px-7 text-[15px] font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-accent">
									See pricing
								</a>
							</div>

							<div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
								<span className="inline-flex items-center gap-1.5">
									<Check className="h-4 w-4 text-green-500" /> No subscription
								</span>
								<span className="inline-flex items-center gap-1.5">
									<Check className="h-4 w-4 text-green-500" /> Free re-run guarantee
								</span>
								<span className="inline-flex items-center gap-1.5">
									<Check className="h-4 w-4 text-green-500" /> Pay per cycle
								</span>
							</div>
						</div>
					</Reveal>
				</div>
			</section>

			<footer className="border-t border-border/60">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
						<Link href="/" className="flex items-center gap-1.5">
							<TestMateIcon />
							<span className="text-lg font-semibold tracking-tight">TestMate</span>
						</Link>

						<nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
							{FOOTER_LINKS.map((l) => (
								<a
									key={l.href}
									href={l.href}
									className="text-sm text-muted-foreground transition-colors hover:text-foreground">
									{l.label}
								</a>
							))}
						</nav>
					</div>

					<div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
						<p>© {new Date().getFullYear()} TestMate. All rights reserved.</p>
						<p>
							Not affiliated with Google LLC. Google Play is a trademark of Google LLC.
						</p>
					</div>
				</div>
			</footer>
		</>
	);
}
