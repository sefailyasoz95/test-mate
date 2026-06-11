"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SignInButton } from "@/components/landing/SignInButton";
import TestMateIcon from "@/components/icons/TestMateIcon";
import { Menu, X } from "lucide-react";

const LINKS = [
	{ href: "#how", label: "How it works" },
	{ href: "#features", label: "Features" },
	{ href: "#pricing", label: "Pricing" },
	{ href: "#faq", label: "FAQ" },
];

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed top-0 inset-x-0 z-50 transition-all duration-300",
				scrolled
					? "border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
					: "border-b border-transparent bg-transparent"
			)}>
			<nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-1.5">
					<TestMateIcon />
					<span className="text-lg font-semibold tracking-tight">TestMate</span>
				</Link>

				<div className="hidden items-center gap-1 md:flex">
					{LINKS.map((l) => (
						<a
							key={l.href}
							href={l.href}
							className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
							{l.label}
						</a>
					))}
				</div>

				<div className="hidden items-center gap-2 md:flex">
					<ThemeSwitcher />
					<SignInButton size="sm" showArrow={false}>
						Sign in
					</SignInButton>
				</div>

				<div className="flex items-center gap-1 md:hidden">
					<ThemeSwitcher />
					<button
						aria-label="Toggle menu"
						onClick={() => setOpen((v) => !v)}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-accent">
						{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</button>
				</div>
			</nav>

			{open && (
				<div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
					<div className="space-y-1 px-4 py-4">
						{LINKS.map((l) => (
							<a
								key={l.href}
								href={l.href}
								onClick={() => setOpen(false)}
								className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
								{l.label}
							</a>
						))}
						<div className="pt-2">
							<SignInButton size="sm" className="w-full">
								Get started free
							</SignInButton>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
