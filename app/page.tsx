import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Cta } from "@/components/landing/Cta";

export default function Home() {
	return (
		<div className="relative flex min-h-screen flex-col">
			<Navbar />
			<main>
				<Hero />
				<Stats />
				<HowItWorks />
				<Features />
				<Pricing />
				<Faq />
				<Cta />
			</main>
		</div>
	);
}
