"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types/supabase";

interface UserDetailsModalProps {
	userId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UserDetailsModal({ userId, open, onOpenChange }: UserDetailsModalProps) {
	const [user, setUser] = useState<Profile | null>(null);
	const [apps, setApps] = useState<any[]>([]);
	const [purchases, setPurchases] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchUserDetails() {
			if (!userId) return;
			setIsLoading(true);

			try {
				const [userResponse, appsResponse, purchasesResponse] = await Promise.all([
					supabase.from("profiles").select("*").eq("id", userId).single(),
					supabase.from("apps").select("*").eq("user_id", userId),
					supabase.from("purchases").select("*").eq("user_id", userId),
				]);

				setUser(userResponse.data);
				setApps(appsResponse.data || []);
				setPurchases(purchasesResponse.data || []);
			} catch (error) {
				console.error("Error fetching user details:", error);
			} finally {
				setIsLoading(false);
			}
		}

		if (open && userId) {
			fetchUserDetails();
		}
	}, [userId, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-3xl'>
				<DialogHeader>
					<DialogTitle>User Details</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className='animate-pulse space-y-4'>
						{[1, 2, 3].map((i) => (
							<div key={i} className='h-24 bg-muted rounded-lg' />
						))}
					</div>
				) : (
					<div className='space-y-6'>
						<Card>
							<CardContent className='pt-6'>
								<div className='space-y-2'>
									<p className='font-medium'>Email: {user?.email}</p>
									<p className='text-sm text-muted-foreground'>
										Joined: {user?.created_at && new Date(user.created_at).toLocaleDateString()}
									</p>
									<p className='text-sm text-muted-foreground'>
										Status: <span className='capitalize'>{user?.subscription_status}</span>
									</p>
								</div>
							</CardContent>
						</Card>

						<div>
							<h3 className='text-lg font-medium mb-4'>Apps ({apps.length})</h3>
							<div className='space-y-4'>
								{apps.map((app) => (
									<Card key={app.id}>
										<CardContent className='pt-6'>
											<p className='font-medium'>{app.name}</p>
											<p className='text-sm text-muted-foreground'>{app.package_name}</p>
											{app.play_store_link && (
												<a
													href={app.play_store_link}
													target='_blank'
													rel='noopener noreferrer'
													className='text-sm text-blue-500 hover:underline'>
													View on Play Store
												</a>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						<div>
							<h3 className='text-lg font-medium mb-4'>Purchases ({purchases.length})</h3>
							<div className='space-y-4'>
								{purchases.map((purchase) => (
									<Card key={purchase.id}>
										<CardContent className='pt-6'>
											<div className='flex justify-between'>
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
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
