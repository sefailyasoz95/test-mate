"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { App } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPlus, CheckCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusBadge } from "../status-badge";

interface Purchase {
	id: string;
	package_type: string;
	amount: number;
	status: string;
	created_at: string;
	expires_at: string;
}

interface AppDetailsModalProps {
	appId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isAdmin?: boolean;
}

export function AppDetailsModal({ appId, open, onOpenChange, isAdmin = false }: AppDetailsModalProps) {
	const [app, setApp] = useState<App | null>(null);
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [testerAccounts, setTesterAccounts] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showTesterForm, setShowTesterForm] = useState(false);
	const [isGooglePlayAdded, setIsGooglePlayAdded] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	useEffect(() => {
		async function fetchAppDetails() {
			if (!appId) return;
			setIsLoading(true);

			try {
				const [appResponse, purchasesResponse] = await Promise.all([
					supabase.from("apps").select("*").eq("id", appId).single(),
					supabase.from("purchases").select("*").eq("app_id", appId),
				]);

				setApp(appResponse.data);
				setPurchases(purchasesResponse.data || []);

				if (appResponse.data?.tester_accounts) {
					setTesterAccounts(appResponse.data.tester_accounts);
				}

				// Set checkbox state based on current status
				setIsGooglePlayAdded(appResponse.data?.status === "testers_added_google_play");
			} catch (error) {
				console.error("Error fetching app details:", error);
			} finally {
				setIsLoading(false);
			}
		}

		if (open && appId) {
			fetchAppDetails();
		}
	}, [appId, open]);

	const handleAddTesters = async () => {
		if (!appId || !testerAccounts.trim()) {
			toast.error("Please enter tester accounts");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/apps/update-testers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					appId,
					testerAccounts,
					status: "testers_added",
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update tester accounts");
			}

			toast.success("Tester accounts added successfully!");
			setShowTesterForm(false);

			// Refresh app data
			const { data } = await supabase.from("apps").select("*").eq("id", appId).single();
			setApp(data);
		} catch (error) {
			console.error("Error updating tester accounts:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update tester accounts");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGooglePlayStatusChange = async (checked: boolean) => {
		if (!appId) return;

		setIsUpdatingStatus(true);

		try {
			const newStatus = checked ? "testers_added_google_play" : "testers_added";

			const response = await fetch("/api/apps/update-status", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					appId,
					status: newStatus,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update app status");
			}

			// Update local state
			setIsGooglePlayAdded(checked);
			if (app) {
				setApp({
					...app,
					status: newStatus,
				});
			}

			toast.success(`App status updated to ${checked ? "Testers Added to Google Play" : "Testers Added"}`);
		} catch (error) {
			console.error("Error updating app status:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update app status");
			// Revert checkbox state on error
			setIsGooglePlayAdded(!checked);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-3xl'>
				<DialogHeader>
					<DialogTitle>App Details</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className='flex justify-center items-center h-40'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
					</div>
				) : app ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className='space-y-6'>
						<Card>
							<CardHeader>
								<div className='flex justify-between items-center'>
									<CardTitle>{app.name}</CardTitle>
									{app.status && getStatusBadge(app.status)}
								</div>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<p className='text-sm font-medium'>Package Name</p>
									<p className='text-sm text-muted-foreground'>{app.package_name}</p>
								</div>
								<div>
									<p className='text-sm font-medium'>Play Store Link</p>
									{app.play_store_link ? (
										<a
											href={app.play_store_link}
											target='_blank'
											rel='noopener noreferrer'
											className='text-sm text-blue-500 hover:underline'>
											{app.play_store_link}
										</a>
									) : (
										<p className='text-sm text-muted-foreground'>No link provided</p>
									)}
								</div>
								{(app.status === "testers_added" ||
									app.status === "testers_added_google_play" ||
									app.status === "test_started") &&
									app.tester_accounts && (
										<div>
											<p className='text-sm font-medium'>Tester Accounts</p>
											<pre className='mt-2 p-3 bg-muted rounded-md text-xs overflow-auto'>{app.tester_accounts}</pre>
										</div>
									)}

								{/* Test Status Information */}
								{app.status === "test_started" && (
									<div className='bg-indigo-50 p-3 rounded-md border border-indigo-100'>
										<div className='flex items-center gap-2'>
											<PlayCircle className='h-5 w-5 text-indigo-600' />
											<p className='text-sm font-medium text-indigo-800'>Test is in progress</p>
										</div>
										<p className='text-xs text-indigo-700 mt-1'>
											The testing phase has been started for this app. You'll receive updates as the testing progresses.
										</p>
									</div>
								)}

								{/* Google Play Status Checkbox - Only visible for admins when status is testers_added */}
								{app.status === "testers_added" && (
									<div className='flex items-center space-x-2 pt-2'>
										<Checkbox
											id='googlePlayStatus'
											checked={isGooglePlayAdded}
											onCheckedChange={handleGooglePlayStatusChange}
											disabled={isUpdatingStatus}
										/>
										<div className='grid gap-1.5 leading-none'>
											<label
												htmlFor='googlePlayStatus'
												className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
												Testers added to Google Play
											</label>
											<p className='text-sm text-muted-foreground'>
												Check this when testers have been added to Google Play
											</p>
										</div>
										{isUpdatingStatus && <Loader2 className='h-4 w-4 animate-spin ml-2' />}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Purchase History</CardTitle>
							</CardHeader>
							<CardContent>
								{purchases.length === 0 ? (
									<p className='text-sm text-muted-foreground'>No purchases found for this app.</p>
								) : (
									<div className='space-y-4'>
										{purchases.map((purchase) => (
											<motion.div
												key={purchase.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className='flex justify-between p-4 border rounded-lg'>
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
				) : (
					<p>App not found</p>
				)}
			</DialogContent>
		</Dialog>
	);
}
