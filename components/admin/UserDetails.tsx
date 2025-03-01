"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface App {
	id: string;
	name: string;
	package_name: string;
	play_store_link: string;
	created_at: string;
}

interface Purchase {
	id: string;
	package_type: string;
	amount: number;
	status: string;
	created_at: string;
}

export function UserDetails({ userId }: { userId: string }) {
	const [apps, setApps] = useState<App[]>([]);
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchUserDetails() {
			setIsLoading(true);

			const [appsResponse, purchasesResponse] = await Promise.all([
				supabase.from("apps").select("*").eq("user_id", userId),
				supabase.from("purchases").select("*").eq("user_id", userId),
			]);

			setApps(appsResponse.data || []);
			setPurchases(purchasesResponse.data || []);
			setIsLoading(false);
		}

		fetchUserDetails();
	}, [userId]);

	if (isLoading) {
		return (
			<div className='animate-pulse space-y-4'>
				{[1, 2].map((i) => (
					<div key={i} className='h-24 bg-muted rounded-lg' />
				))}
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-lg font-medium mb-4'>Apps ({apps.length})</h3>
				<div className='space-y-4'>
					{apps.map((app) => (
						<Card key={app.id}>
							<CardContent className='pt-6'>
								<p className='font-medium'>{app.name}</p>
								<p className='text-sm text-muted-foreground'>{app.package_name}</p>
								<div className='flex justify-between text-sm mt-2'>
									<span>{new Date(app.created_at).toLocaleDateString()}</span>
									{app.play_store_link && (
										<a
											href={app.play_store_link}
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-500 hover:underline'>
											View on Play Store
										</a>
									)}
								</div>
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
	);
}
