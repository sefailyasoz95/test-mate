"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Stars, CheckCircle } from "lucide-react";
import { FaGooglePlay, FaAndroid, FaPlayCircle, FaGoogle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Wait until mounted to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Initial style before hydration
	const headingStyle = mounted
		? {
				WebkitTextStroke: theme === "dark" ? "1px #1d4ed855" : "1px #3b82f655",
			}
		: {};

	const handleSignIn = async () => {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					queryParams: {
						access_type: "offline",
						prompt: "consent",
					},
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) {
				toast.error("Sign in failed", {
					description: error.message,
				});
				throw error;
			}
		} catch (error) {
			toast.error("Something went wrong", {
				description: "Please try again later",
			});
		}
	};
	return (
		<div className='relative min-h-screen overflow-x-hidden bg-background py-32'>
			{/* Background gradient effect */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1 }}
				className='fixed inset-0 overflow-hidden'>
				<div className='absolute -inset-[10px] opacity-50'>
					<div className='absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-[100px] dark:from-blue-500/10 dark:to-purple-500/10' />
				</div>
			</motion.div>

			{/* Floating Icons */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 0.5 }}
				className='absolute inset-0 pointer-events-none'>
				<motion.div
					animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
					transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
					<FaGooglePlay className='absolute top-1/4 left-10 w-24 h-24 text-primary/20 dark:text-primary/10' />
				</motion.div>

				<motion.div
					animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
					transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
					<FaAndroid className='absolute top-1/3 right-10 w-32 h-32 text-green-500/20 dark:text-green-500/10' />
				</motion.div>

				<motion.div
					animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }}
					transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
					<FaPlayCircle className='absolute bottom-1/4 left-1/3 w-20 h-20 text-purple-500/20 dark:text-purple-500/10' />
				</motion.div>
			</motion.div>

			{/* Content */}
			<div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-40'>
				<div className='mx-auto max-w-4xl text-center'>
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
						<h1
							className='text-6xl text-transparent bg-clip-text bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 from-blue-700 to-purple-700 tracking-wider'
							style={headingStyle}>
							Skip the Tester Hunt, Launch Faster
						</h1>
					</motion.div>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className='mt-6 text-lg leading-8 text-muted-foreground'>
						Your all-in-one solution for seamless app testing and successful Play Store launches.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className='mt-8 space-y-4 text-left bg-card p-6 rounded-lg border'>
						<h3 className='text-xl font-semibold mb-4 text-center'>How It Works</h3>
						<div className='grid gap-4'>
							{/* Step 1 */}
							<div className='flex items-start gap-3'>
								<div className='bg-primary/10 p-2 rounded-full'>
									<Users className='w-5 h-5 text-primary' />
								</div>
								<div>
									<h4 className='font-medium'>1. Sign In & Set Up</h4>
									<p className='text-sm text-muted-foreground'>
										Quick sign-in with Google, then add your app details through our simple form
									</p>
								</div>
							</div>

							{/* Step 2 */}
							<div className='flex items-start gap-3'>
								<div className='bg-primary/10 p-2 rounded-full'>
									<Stars className='w-5 h-5 text-primary' />
								</div>
								<div>
									<h4 className='font-medium'>2. Choose Your Package</h4>
									<p className='text-sm text-muted-foreground'>
										Select from our testing packages to get instant access to pre-verified testers
									</p>
								</div>
							</div>

							{/* Step 3 */}
							<div className='flex items-start gap-3'>
								<div className='bg-primary/10 p-2 rounded-full'>
									<CheckCircle className='w-5 h-5 text-primary' />
								</div>
								<div>
									<h4 className='font-medium'>3. End-to-End Support</h4>
									<p className='text-sm text-muted-foreground'>
										Get comprehensive coaching, testing coordination, and post-test surveys for Play Store success
									</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* CTA Dialog */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className='mt-10 flex items-center justify-center gap-x-6'>
						<Dialog>
							<DialogTrigger asChild>
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										size='lg'
										className='inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-8 font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50'>
										<FaGoogle className='w-5 h-5 mr-2' />
										<span className='relative z-10'>Get Started with Google</span>
										<ArrowRight className='ml-2 h-4 w-4 relative z-10 transform transition-transform group-hover:translate-x-1' />
									</Button>
								</motion.div>
							</DialogTrigger>

							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle className='text-2xl font-bold text-center'>Welcome</DialogTitle>
									<DialogDescription className='text-center'>Sign in to access your tester dashboard</DialogDescription>
								</DialogHeader>
								<div className='grid gap-4 py-4'>
									<Button
										variant='outline'
										className='flex items-center justify-center gap-2 w-full hover:bg-accent'
										onClick={handleSignIn}>
										<FaGoogle className='h-5 w-5' />
										Continue with Google
									</Button>
									<small className='text-muted-foreground text-center'>
										By signing in you would be accepting our{" "}
										<Link className='underline' href={"/privacy"}>
											privacy policy
										</Link>
									</small>
								</div>
							</DialogContent>
						</Dialog>
					</motion.div>

					{/* Feature Cards */}
					<div className='mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3'>
						{[
							{
								icon: Users,
								title: "Instant Access",
								description: "Get 12 testers immediately",
								color: "blue",
							},
							{
								icon: Stars,
								title: "Premium Testing",
								description: "Active testing & feedback",
								color: "purple",
							},
							{
								icon: CheckCircle,
								title: "Google Verified",
								description: "Meet Play Store requirements",
								color: "green",
							},
						].map((feature) => (
							<motion.div
								key={feature.title}
								initial={{ x: -10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								whileHover={{ scale: 1.1 }}
								className='flex flex-col items-center'>
								<div
									className={cn(
										"rounded-full p-3 transform transition-transform hover:scale-110",
										feature.color === "blue"
											? "bg-blue-100 dark:bg-blue-900/30"
											: feature.color === "purple"
												? "bg-purple-100 dark:bg-purple-900/30"
												: "bg-green-100 dark:bg-green-900/30"
									)}>
									<feature.icon
										className={cn(
											"h-6 w-6",
											feature.color === "blue"
												? "text-blue-600 dark:text-blue-400/80"
												: feature.color === "purple"
													? "text-purple-600 dark:text-purple-400/80"
													: "text-green-600 dark:text-green-400/80"
										)}
									/>
								</div>
								<h3 className='mt-4 text-lg font-semibold'>{feature.title}</h3>
								<p className='mt-2 text-sm text-muted-foreground text-center'>{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='lg:fixed w-full bottom-0 text-center text-sm text-muted-foreground py-4'>
				<code>an app by Softwarify</code>
			</div>
		</div>
	);
};
export default Hero;
