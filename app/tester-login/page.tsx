"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import TestMateIcon from "@/components/icons/TestMateIcon";

export default function TesterLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email.trim() || !password) {
			toast.error("Enter your email and password");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/auth/tester-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data.error || "Could not sign in");
				return;
			}
			// Server set the auth cookies (middleware); now hydrate the browser
			// client so client-side hooks (useAuth) see the session immediately.
			if (data.access_token && data.refresh_token) {
				await supabase.auth.setSession({
					access_token: data.access_token,
					refresh_token: data.refresh_token,
				});
			}
			toast.success("Signed in");
			router.replace("/dashboard");
			router.refresh();
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-background px-4'>
			<Card className='w-full max-w-sm'>
				<CardHeader className='space-y-3 text-center'>
					<div className='flex justify-center'>
						<TestMateIcon size={48} />
					</div>
					<CardTitle className='text-xl'>Tester sign in</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Sign in with the email and password you were given to start testing.
					</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className='space-y-4'>
						<div className='space-y-1.5'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								autoComplete='email'
								autoCapitalize='none'
								placeholder='you@example.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>
						<div className='space-y-1.5'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								autoComplete='current-password'
								placeholder='••••••••'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={loading}
							/>
						</div>
						<Button type='submit' className='w-full' disabled={loading}>
							{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							Sign in
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
