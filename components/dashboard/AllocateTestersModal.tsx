"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Users, Check, FileText, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import type { Package } from "@/lib/types/db";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function packageFeatures(pkg: Package): { icon: typeof Check; label: string }[] {
	const list: { icon: typeof Check; label: string }[] = [
		{ icon: Users, label: `${pkg.tester_count} pre-verified tester${pkg.tester_count > 1 ? "s" : ""}` },
		{ icon: Check, label: `${pkg.duration_days}-day Google Play closed test` },
	];
	if (pkg.includes_report) list.push({ icon: FileText, label: "Test analysis report" });
	if (pkg.includes_guarantee) list.push({ icon: ShieldCheck, label: "Free re-run guarantee" });
	if (pkg.priority) list.push({ icon: Zap, label: "Priority handling" });
	return list;
}

export function AllocateTestersModal({ appId, appName }: { appId: string; appName: string }) {
	const [packages, setPackages] = useState<Package[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [quantity, setQuantity] = useState(1);

	async function fetchPackages() {
		setIsLoading(true);
		try {
			const res = await fetch("/api/packages");
			const data = await res.json();
			setPackages(Array.isArray(data) ? data : []);
		} catch {
			toast.error("Failed to load packages");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (open) fetchPackages();
	}, [open]);

	async function checkout(pkg: Package) {
		setBusyId(pkg.id);
		try {
			const stripe = await stripePromise;
			if (!stripe) throw new Error("Stripe failed to load");

			const res = await fetch("/api/create-checkout-session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					appId,
					packageId: pkg.id,
					quantity: pkg.code === "single" ? quantity : 1,
				}),
			});

			const data = await res.json();
			if (!res.ok || !data.sessionId) {
				toast.error(data.error || "Could not start checkout");
				return;
			}

			const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
			if (result.error) toast.error(result.error.message ?? "Something went wrong");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setBusyId(null);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					<Users className='h-4 w-4 mr-2' />
					Buy Testing Package
				</Button>
			</DialogTrigger>
			<DialogContent className='w-[95vw] max-w-[1100px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader className='px-2'>
					<DialogTitle className='text-2xl md:text-3xl text-center mb-2'>
						Choose a package for {appName}
					</DialogTitle>
					<DialogDescription className='text-center'>
						You buy the outcome — passing Google&apos;s 12-tester / 14-day requirement.
					</DialogDescription>
				</DialogHeader>

				<div className='grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-2'>
					{isLoading ? (
						<p className='text-muted-foreground col-span-full text-center py-8'>Loading packages…</p>
					) : packages.length === 0 ? (
						<p className='text-muted-foreground col-span-full text-center py-8'>No packages available.</p>
					) : (
						packages.map((pkg) => {
							const popular = pkg.code === "standard";
							const isSingle = pkg.code === "single";
							const unit = Number(pkg.price_usd);
							const total = isSingle ? unit * quantity : unit;

							return (
								<Card
									key={pkg.id}
									className={cn(
										"relative overflow-hidden transition-all duration-300 flex flex-col",
										"hover:border-primary/50 hover:shadow-xl hover:-translate-y-1",
										popular && "border-primary shadow-lg bg-gradient-to-br from-primary/5 to-background"
									)}>
									{popular && (
										<div className='absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-bl-lg'>
											Popular
										</div>
									)}
									<CardHeader className='space-y-1'>
										<CardTitle className='text-lg font-bold'>{pkg.name}</CardTitle>
										<CardDescription className='text-sm'>
											{pkg.tester_count} testers · {pkg.duration_days} days
										</CardDescription>
									</CardHeader>
									<CardContent className='flex-grow'>
										<div className='text-3xl font-bold mb-1'>${total.toFixed(0)}</div>
										{isSingle && (
											<div className='flex items-center gap-2 mb-4'>
												<span className='text-xs text-muted-foreground'>Qty:</span>
												<Select
													value={quantity.toString()}
													onValueChange={(v) => setQuantity(Number(v))}>
													<SelectTrigger className='w-[70px] h-8'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
															<SelectItem key={n} value={n.toString()}>
																{n}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}
										<ul className='space-y-2 mt-4'>
											{packageFeatures(pkg).map((f, i) => {
												const Icon = f.icon;
												return (
													<li key={i} className='flex items-center gap-2'>
														<Icon className='h-4 w-4 text-primary flex-shrink-0' />
														<span className='text-sm'>{f.label}</span>
													</li>
												);
											})}
										</ul>
									</CardContent>
									<CardFooter className='mt-auto pt-4'>
										<Button
											className='w-full'
											variant={popular ? "default" : "outline"}
											disabled={busyId !== null}
											onClick={() => checkout(pkg)}>
											{busyId === pkg.id ? "Loading…" : "Get Started"}
										</Button>
									</CardFooter>
								</Card>
							);
						})
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
