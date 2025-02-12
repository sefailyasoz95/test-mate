"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { App } from "@/lib/types/supabase";

interface Purchase {
	id: string;
	package_type: string;
	amount: number;
	status: string;
	created_at: string;
	expires_at: string;
}

interface AppDetailsModalProps {
	appId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AppDetailsModal({ appId, open, onOpenChange }: AppDetailsModalProps) {
	const [app, setApp] = useState<App | null>(null);
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchAppDetails() {
			if (!appId) return;

			try {
				// Fetch app details
				const { data: appData } = await supabase.from("apps").select("*").eq("id", appId).single();

				setApp(appData);

				// Fetch app purchases
				const { data: purchasesData } = await supabase
					.from("purchases")
					.select("*")
					.eq("app_id", appId)
					.order("created_at", { ascending: false });

				setPurchases(purchasesData || []);
			} catch (error) {
				console.error("Error fetching app details:", error);
			} finally {
				setIsLoading(false);
			}
		}

		if (open) {
			fetchAppDetails();
		}
	}, [appId, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-3xl h-[80vh] lg:h-[50vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold'>{isLoading ? "Loading..." : app?.name}</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className='py-8 text-center'>Loading app details...</div>
				) : (
					<motion.div
						initial={{
							y: -10,
							opacity: 0,
						}}
						animate={{
							y: 0,
							opacity: 1,
						}}
						className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>App Information</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>Package Name</p>
										<p className='font-medium'>{app?.package_name}</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>Created At</p>
										<p className='font-medium'>
											{app?.created_at ? new Date(app?.created_at).toLocaleDateString() : ""}
										</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>Play Store Link</p>
										<p className='font-medium'>
											{app?.play_store_link ? (
												<a
													href={app.play_store_link}
													target='_blank'
													rel='noopener noreferrer'
													className='text-blue-500 hover:underline'>
													View on Play Store
												</a>
											) : (
												"Not available"
											)}
										</p>
									</div>
								</div>
								{app?.app_review && (
									<div className='mt-4'>
										<p className='text-sm text-muted-foreground mb-2'>App Review</p>
										<p className='font-medium p-4 bg-muted/20 rounded-lg'>{app.app_review}</p>
									</div>
								)}
								{app?.app_screenshots && app.app_screenshots.length > 0 && (
									<div className='mt-4'>
										<p className='text-sm text-muted-foreground mb-2'>App Screenshots</p>
										<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
											{app.app_screenshots.map((screenshot, index) => (
												<img
													key={index}
													src={screenshot}
													alt={`App screenshot ${index + 1}`}
													className='w-full h-48 object-cover rounded-lg'
												/>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Purchase History</CardTitle>
							</CardHeader>
							<CardContent>
								{isLoading ? (
									<div className='space-y-4 animate-pulse'>
										{[1, 2, 3].map((i) => (
											<div key={i} className='flex justify-between items-center p-4 border rounded-lg bg-muted/50'>
												<div className='space-y-2'>
													<div className='h-4 w-32 bg-muted rounded' />
													<div className='h-3 w-24 bg-muted rounded' />
												</div>
												<div className='text-right space-y-2'>
													<div className='h-4 w-16 bg-muted rounded' />
													<div className='h-3 w-20 bg-muted rounded' />
												</div>
											</div>
										))}
									</div>
								) : purchases.length === 0 ? (
									<p className='text-muted-foreground'>No purchases found</p>
								) : (
									<div className='space-y-4'>
										{purchases.map((purchase, index) => (
											<motion.div
												initial={{
													y: -10,
													opacity: 0,
												}}
												animate={{
													y: 0,
													opacity: 1,
												}}
												transition={{
													delay: 0.1 * index,
												}}
												key={purchase.id}
												className='flex justify-between items-center p-4 border rounded-lg'
												style={{ animationDelay: `${index * 100}ms` }}>
												<div>
													<p className='font-medium'>{purchase.package_type}</p>
													<p className='text-sm text-muted-foreground'>
														{new Date(purchase.created_at).toLocaleDateString()}
													</p>
												</div>
												<div className='text-right'>
													<p className='font-medium'>${purchase.amount.toFixed(2)}</p>
													<p className='text-sm capitalize text-muted-foreground'>{purchase.status}</p>
												</div>
											</motion.div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				)}
			</DialogContent>
		</Dialog>
	);
}
