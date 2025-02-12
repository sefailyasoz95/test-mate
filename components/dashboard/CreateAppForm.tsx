"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
	name: z.string().min(2, "App name must be at least 2 characters"),
	package_name: z
		.string()
		.regex(/^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/, "Must be a valid package name (e.g., com.example.app)"),
	play_store_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export function CreateAppForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			package_name: "",
			play_store_link: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				toast.error("Authentication required", {
					description: "Please sign in to create an app",
				});
				return;
			}

			const { error } = await supabase.from("apps").insert({
				user_id: user.id,
				name: values.name,
				package_name: values.package_name,
				play_store_link: values.play_store_link || null,
			});

			if (error) {
				toast.error("Failed to create app", {
					description: error.message,
				});
				throw error;
			}

			toast.success("App created successfully", {
				description: "You can now allocate testers",
			});
			form.reset();
			onSuccess();
		} catch (error) {
			toast.error("Something went wrong", {
				description: "Please try again later",
			});
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
					name='play_store_link'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Play Store Link (Optional)</FormLabel>
							<FormControl>
								<Input placeholder='https://play.google.com/store/apps/details?id=your.app.id' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='flex justify-end space-x-4'>
					<Button variant='outline' onClick={onCancel}>
						Cancel
					</Button>
					<Button type='submit'>Create App</Button>
				</div>
			</form>
		</Form>
	);
}
