"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export async function signInWithGoogle() {
	try {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				queryParams: { access_type: "offline", prompt: "consent" },
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
		if (error) toast.error("Sign in failed", { description: error.message });
	} catch {
		toast.error("Something went wrong", { description: "Please try again later" });
	}
}

export function SignInButton({
	children = "Get started free",
	size = "lg",
	variant = "primary",
	showArrow = true,
	className,
}: {
	children?: ReactNode;
	size?: "sm" | "lg";
	variant?: "primary" | "ghost" | "outline";
	showArrow?: boolean;
	className?: string;
}) {
	const base =
		"group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all";
	const sizing = size === "lg" ? "h-12 px-7 text-[15px]" : "h-10 px-5 text-sm";

	const styles =
		variant === "primary"
			? "text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 bg-[linear-gradient(110deg,hsl(var(--tm-accent)),hsl(var(--tm-accent-2)))]"
			: variant === "outline"
				? "border border-border bg-background/60 backdrop-blur hover:bg-accent hover:-translate-y-0.5"
				: "hover:bg-accent";

	return (
		<Button
			asChild
			variant="ghost"
			onClick={signInWithGoogle}
			className={cn(base, sizing, styles, "hover:no-underline", className)}>
			<span>
				<FaGoogle className={cn("h-4 w-4", variant === "primary" ? "opacity-90" : "")} />
				{children}
				{showArrow && (
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				)}
			</span>
		</Button>
	);
}
