"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

const CATEGORIES = [
	"Productivity",
	"Finance",
	"Health & Fitness",
	"Social",
	"Education",
	"Games",
	"Lifestyle",
	"Business",
	"Tools",
	"Other",
] as const;

const formSchema = z.object({
	name: z.string().min(2, "App name must be at least 2 characters"),
	package_name: z
		.string()
		.regex(
			/^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/,
			"Must be a valid package name (e.g., com.example.app)"
		),
	category: z.string().min(1, "Pick a category"),
	opt_in_link: z
		.string()
		.url("Must be a valid URL")
		.min(1, "Closed-test opt-in link is required"),
	play_store_link: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateAppForm({
	onSuccess,
	onCancel,
}: {
	onSuccess: () => void;
	onCancel: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			package_name: "",
			category: "",
			opt_in_link: "",
			play_store_link: "",
			description: "",
		},
	});

	async function onSubmit(values: FormValues) {
		setSubmitting(true);
		try {
			const res = await fetch("/api/apps", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: values.name,
					package_name: values.package_name,
					category: values.category,
					opt_in_link: values.opt_in_link,
					play_store_link: values.play_store_link || null,
					description: values.description || null,
				}),
			});

			if (!res.ok) {
				const { error } = await res.json().catch(() => ({ error: "" }));
				toast.error("Failed to create app", { description: error || `HTTP ${res.status}` });
				return;
			}

			toast.success("App created", { description: "You can now buy a testing package" });
			form.reset();
			onSuccess();
		} catch {
			toast.error("Something went wrong", { description: "Please try again later" });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>App Name</FormLabel>
							<FormControl>
								<Input placeholder='My Awesome App' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='package_name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Package Name</FormLabel>
							<FormControl>
								<Input placeholder='com.example.app' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='category'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Select a category' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{CATEGORIES.map((c) => (
										<SelectItem key={c} value={c}>
											{c}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormDescription>
								We match testers within your category to keep your idea away from competitors.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='opt_in_link'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Closed-test Opt-in Link</FormLabel>
							<FormControl>
								<Input placeholder='https://play.google.com/apps/testing/...' {...field} />
							</FormControl>
							<FormDescription>
								The web opt-in URL from your Play Console closed test track.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='play_store_link'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Play Store Link (optional)</FormLabel>
							<FormControl>
								<Input placeholder='https://play.google.com/store/apps/details?id=...' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description (optional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder='What should testers know about your app?'
									rows={3}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='flex justify-end space-x-4'>
					<Button type='button' variant='outline' onClick={onCancel} disabled={submitting}>
						Cancel
					</Button>
					<Button type='submit' disabled={submitting}>
						{submitting ? "Creating…" : "Create App"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
