"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { App } from "@/lib/types/db";

interface AppDetailsModalProps {
	app: App | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function Field({ label, value, href }: { label: string; value: string | null; href?: boolean }) {
	return (
		<div>
			<p className='text-sm font-medium'>{label}</p>
			{value ? (
				href ? (
					<a
						href={value}
						target='_blank'
						rel='noopener noreferrer'
						className='text-sm text-blue-500 hover:underline break-all'>
						{value}
					</a>
				) : (
					<p className='text-sm text-muted-foreground break-all'>{value}</p>
				)
			) : (
				<p className='text-sm text-muted-foreground'>—</p>
			)}
		</div>
	);
}

export function AppDetailsModal({ app, open, onOpenChange }: AppDetailsModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>App Details</DialogTitle>
				</DialogHeader>

				{app ? (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}>
						<Card>
							<CardHeader>
								<div className='flex justify-between items-center'>
									<CardTitle>{app.name}</CardTitle>
									{app.category && <Badge variant='secondary'>{app.category}</Badge>}
								</div>
							</CardHeader>
							<CardContent className='space-y-4'>
								<Field label='Package Name' value={app.package_name} />
								<Field label='Description' value={app.description} />
								<Field label='Closed-test Opt-in Link' value={app.opt_in_link} href />
								<Field label='Play Store Link' value={app.play_store_link} href />
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
