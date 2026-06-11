import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ArrowRight, ShieldCheck, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestMateIcon from "@/components/icons/TestMateIcon";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://testmate.softwarify.co";
const PATH = "/google-play-12-testers-14-days";
const URL = `${SITE}${PATH}`;

const TITLE = "Google Play 12 Testers for 14 Days: The Complete Requirement Guide (2026)";
const DESCRIPTION =
	"Everything about Google Play's closed testing requirement — 12 testers, 14 consecutive days — for new personal developer accounts. What it is, who it applies to, how to pass it, and the fastest way to get verified testers.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords:
		"google play 12 testers, 12 testers 14 days, google play closed testing, closed testing requirement, google play production access, get testers for android app, 14 day testing requirement, play console closed test",
	alternates: { canonical: URL },
	openGraph: {
		type: "article",
		title: TITLE,
		description: DESCRIPTION,
		url: URL,
		siteName: "TestMate by Softwarify",
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
	},
};

const FAQ: { q: string; a: string }[] = [
	{
		q: "How many testers does Google Play require?",
		a: "Google Play requires at least 12 testers who stay opted in to your closed test for 14 consecutive days. This applies to personal developer accounts created after November 13, 2023.",
	},
	{
		q: "What does '14 consecutive days' mean exactly?",
		a: "At least 12 testers must be opted in and remain opted in for 14 days in a row before you apply for production access. If testers drop out and your count falls below 12, the clock effectively resets, so consistent engagement matters more than a one-time signup.",
	},
	{
		q: "Did Google change the requirement from 20 to 12 testers?",
		a: "Yes. Google reduced the minimum from 20 to 12 testers on December 11, 2024, after developers reported that finding 20 testers was difficult. The 14-day duration stayed the same.",
	},
	{
		q: "Does the requirement apply to organization accounts?",
		a: "No. The closed-testing requirement only applies to personal developer accounts created after November 13, 2023. Organization (company) accounts are currently exempt.",
	},
	{
		q: "Can I use emulators or fake accounts as testers?",
		a: "No. Testers must use real Android devices with genuine Google accounts. Emulators, bots, and duplicate accounts are not counted and can put your account at risk.",
	},
	{
		q: "Do testers need to use the app every day?",
		a: "Google doesn't publish an exact daily-usage rule, but testers must remain opted in for the full 14 days and the test should show genuine engagement. Real, periodic use across the window is the safest way to satisfy reviewers.",
	},
	{
		q: "What happens after I pass the 14-day closed test?",
		a: "You apply for production access from the Dashboard in Play Console. You'll answer a short questionnaire about your app and its testing process, then Google reviews your request before you can publish to production.",
	},
	{
		q: "How can TestMate help me pass the requirement?",
		a: "TestMate provides verified testers on real devices who opt in to your closed test and stay engaged for the full 14 days, with transparent live tracking and a free re-run guarantee on eligible plans — so you meet the requirement without recruiting testers yourself.",
	},
];

const STEPS: { title: string; body: string }[] = [
	{
		title: "Create a closed testing track in Play Console",
		body: "In Google Play Console, open Testing → Closed testing and create a new track (or use the default one). Upload your app bundle so there's a build for testers to install.",
	},
	{
		title: "Add your 12+ testers",
		body: "Add testers by email list or Google Group. You need at least 12 real Google accounts. Build in a buffer above 12 in case someone drops out during the 14 days.",
	},
	{
		title: "Share the opt-in link",
		body: "Publish the closed test and share the opt-in URL. Each tester must open the link and accept the invitation — installing alone isn't enough; they have to be opted in.",
	},
	{
		title: "Keep 12 testers engaged for 14 consecutive days",
		body: "Maintain at least 12 opted-in testers for 14 days straight. Monitor drop-offs, because falling under 12 can reset your progress in practice.",
	},
	{
		title: "Apply for production access",
		body: "Once you've held 12 testers for 14 days, go to the Play Console Dashboard, apply for production access, and complete the production-readiness questionnaire.",
	},
];

function faqJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: FAQ.map((f) => ({
			"@type": "Question",
			name: f.q,
			acceptedAnswer: { "@type": "Answer", text: f.a },
		})),
	};
}

function howToJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: "How to pass Google Play's 12 testers / 14 days closed testing requirement",
		description: DESCRIPTION,
		step: STEPS.map((s, i) => ({
			"@type": "HowToStep",
			position: i + 1,
			name: s.title,
			text: s.body,
		})),
	};
}

function articleJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: TITLE,
		description: DESCRIPTION,
		mainEntityOfPage: URL,
		author: { "@type": "Organization", name: "Softwarify" },
		publisher: {
			"@type": "Organization",
			name: "TestMate by Softwarify",
			logo: { "@type": "ImageObject", url: `${SITE}/icon-192.png` },
		},
	};
}

export default function GooglePlay12TestersPage() {
	return (
		<main className='min-h-screen bg-background'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd()) }}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd()) }}
			/>

			{/* Top bar */}
			<header className='border-b'>
				<div className='mx-auto flex h-16 max-w-3xl items-center justify-between px-4'>
					<Link href='/' className='flex items-center gap-2'>
						<TestMateIcon />
						<span className='font-semibold tracking-tight'>TestMate</span>
					</Link>
					<Link href='/#pricing'>
						<Button size='sm'>See pricing</Button>
					</Link>
				</div>
			</header>

			<article className='mx-auto max-w-3xl px-4 py-12'>
				<p className='text-sm font-medium text-primary'>Google Play Closed Testing</p>
				<h1 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>
					Google Play&apos;s 12 Testers for 14 Days Requirement, Explained
				</h1>
				<p className='mt-4 text-lg text-muted-foreground'>
					If you created a personal Google Play developer account after November 13, 2023, you can&apos;t
					publish to production until you run a closed test with <strong>at least 12 testers for 14
					consecutive days</strong>. Here&apos;s exactly what that means, why it trips up most developers, and
					how to pass it fast.
				</p>

				{/* Quick facts */}
				<div className='mt-8 grid gap-4 sm:grid-cols-3'>
					<div className='rounded-xl border p-4'>
						<Users className='h-5 w-5 text-primary' />
						<p className='mt-2 text-2xl font-bold'>12</p>
						<p className='text-sm text-muted-foreground'>opted-in testers minimum</p>
					</div>
					<div className='rounded-xl border p-4'>
						<Clock className='h-5 w-5 text-primary' />
						<p className='mt-2 text-2xl font-bold'>14</p>
						<p className='text-sm text-muted-foreground'>consecutive days</p>
					</div>
					<div className='rounded-xl border p-4'>
						<ShieldCheck className='h-5 w-5 text-primary' />
						<p className='mt-2 text-2xl font-bold'>Real</p>
						<p className='text-sm text-muted-foreground'>devices &amp; Google accounts</p>
					</div>
				</div>

				<section className='mt-12'>
					<h2 className='text-2xl font-semibold tracking-tight'>What is the requirement?</h2>
					<p className='mt-3 text-muted-foreground'>
						Google Play requires new personal developer accounts to complete a closed test before applying for
						production access. The bar is a minimum of <strong>12 testers who stay opted in for 14
						consecutive days</strong>. Only after you hold that for the full two weeks can you request
						production access and distribute your app publicly on Google Play.
					</p>
				</section>

				<section className='mt-10'>
					<h2 className='text-2xl font-semibold tracking-tight'>Who does it apply to?</h2>
					<p className='mt-3 text-muted-foreground'>
						The requirement applies only to <strong>personal developer accounts created after November 13,
						2023</strong>. Organization (company) accounts are currently exempt. If you registered your
						personal account before that date, or you&apos;re on an organization account, you may not see this
						gate.
					</p>
				</section>

				<section className='mt-10'>
					<h2 className='text-2xl font-semibold tracking-tight'>It used to be 20 testers</h2>
					<p className='mt-3 text-muted-foreground'>
						When the policy launched, the minimum was 20 testers. On <strong>December 11, 2024</strong>, Google
						lowered it to 12 after developers reported that recruiting 20 engaged testers was a serious blocker
						for small and solo teams. The 14-day duration didn&apos;t change.
					</p>
				</section>

				<section className='mt-10'>
					<h2 className='text-2xl font-semibold tracking-tight'>Why it&apos;s harder than it sounds</h2>
					<p className='mt-3 text-muted-foreground'>
						The number 12 looks small, but the real challenge is the word <em>consecutive</em>. You need 12
						people on real Android devices with genuine Google accounts who opt in and stay opted in for two
						straight weeks. Emulators, bots, and duplicate accounts don&apos;t count. Friends and family sign
						up and then forget, drop out, or never actually opt in — and if your active count slips below 12,
						you effectively lose progress. For most solo developers, finding and retaining real testers is the
						single biggest delay to launch.
					</p>
				</section>

				<section className='mt-10'>
					<h2 className='text-2xl font-semibold tracking-tight'>
						How to set up closed testing, step by step
					</h2>
					<ol className='mt-4 space-y-4'>
						{STEPS.map((s, i) => (
							<li key={i} className='flex gap-3 rounded-xl border p-4'>
								<span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'>
									{i + 1}
								</span>
								<div>
									<p className='font-medium'>{s.title}</p>
									<p className='mt-1 text-sm text-muted-foreground'>{s.body}</p>
								</div>
							</li>
						))}
					</ol>
				</section>

				<section className='mt-10'>
					<h2 className='text-2xl font-semibold tracking-tight'>Common mistakes to avoid</h2>
					<ul className='mt-3 space-y-2 text-muted-foreground'>
						{[
							"Counting installs instead of opt-ins — testers must accept the opt-in link, not just install the app.",
							"Recruiting exactly 12 with no buffer, so a single drop-out breaks the requirement.",
							"Using emulators or secondary accounts, which Google does not count and may flag.",
							"Letting engagement lapse mid-window and resetting your 14-day progress.",
							"Applying for production before holding 12 testers for the full, continuous 14 days.",
						].map((t, i) => (
							<li key={i} className='flex gap-2'>
								<CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
								<span>{t}</span>
							</li>
						))}
					</ul>
				</section>

				{/* CTA */}
				<section className='mt-12 rounded-2xl border bg-muted/40 p-6 text-center sm:p-8'>
					<h2 className='text-2xl font-semibold tracking-tight'>
						Pass the 12 testers / 14 days requirement without the headache
					</h2>
					<p className='mx-auto mt-3 max-w-xl text-muted-foreground'>
						TestMate gives you verified testers on real devices who opt in and stay engaged for the full 14
						days — with transparent live tracking and a free re-run guarantee on eligible plans. You meet the
						requirement; we handle the testers.
					</p>
					<div className='mt-6 flex justify-center'>
						<Link href='/#pricing'>
							<Button size='lg' className='gap-2'>
								See pricing <ArrowRight className='h-4 w-4' />
							</Button>
						</Link>
					</div>
				</section>

				<section className='mt-12'>
					<h2 className='text-2xl font-semibold tracking-tight'>Frequently asked questions</h2>
					<div className='mt-4 divide-y rounded-xl border'>
						{FAQ.map((f, i) => (
							<details key={i} className='group p-4'>
								<summary className='cursor-pointer list-none font-medium'>
									<span className='inline-flex w-full items-center justify-between gap-2'>
										{f.q}
										<span className='text-muted-foreground transition group-open:rotate-45'>+</span>
									</span>
								</summary>
								<p className='mt-2 text-sm text-muted-foreground'>{f.a}</p>
							</details>
						))}
					</div>
				</section>

				<p className='mt-10 text-xs text-muted-foreground'>
					This guide is for general information. Google Play policies can change — always confirm the current
					requirement in the official Play Console Help before applying for production access.
				</p>
			</article>
		</main>
	);
}
