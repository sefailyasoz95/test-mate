"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { createClient, supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Purchase {
	id: string;
	package_type: string;
	amount: number;
	status: string;
	created_at: string;
	expires_at: string;
}

export default function ProfilePage() {
	const { user, isLoading } = useAuth();
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [purchasesLoading, setPurchasesLoading] = useState(true);

	useEffect(() => {
		async function fetchPurchases() {
			const { data } = await supabase.from("purchases").select("*").order("created_at", { ascending: false });

			setPurchases(data || []);
			setPurchasesLoading(false);
		}

		fetchPurchases();
	}, []);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className='container mx-auto py-10 space-y-8'>
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<label className='text-sm font-medium'>Email</label>
						<p className='text-lg'>{user?.email}</p>
					</div>
					<div>
						<label className='text-sm font-medium'>Name</label>
						<p className='text-lg'>{"User"}</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Purchase History</CardTitle>
				</CardHeader>
				<CardContent>
					{purchasesLoading ? (
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
								<div
									key={purchase.id}
									className='flex justify-between items-center p-4 border rounded-lg animate-fadeIn'
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
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
