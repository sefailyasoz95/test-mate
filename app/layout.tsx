import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initFirebase } from "@/lib/firebase/config";
import { cn } from "@/lib/utils";

export const metadata = {
	icons: {
		icon: "/testmate_icon.png",
		shortcut: "/testmate_icon.png",
		apple: "/testmate_icon.png",
	},
	title: "TestMate - Instant App Testing Solution | Streamline Your App Testing",
	description:
		"Meet Google Play's 12-tester requirement instantly with pre-verified tester accounts. Save time and launch faster with our trusted testing solution.",
	keywords:
		"app testing, google play testing, android app testers, mobile app testing, beta testing, app store requirements, test automation",
	authors: [{ name: "Softwarify" }],
	creator: "Softwarify",
	publisher: "Softwarify",
	robots: "index, follow",
	alternates: {
		canonical: process.env.NEXT_PUBLIC_APP_URL,
	},
	openGraph: {
		type: "website",
		title: "TestMate - Instant App Testing Solution | Streamline Your App Testing",
		description:
			"Meet Google Play's 12-tester requirement instantly with pre-verified tester accounts. Save time and launch faster with our trusted testing solution.",
		siteName: "TestMate by Softwarify",
		url: process.env.NEXT_PUBLIC_APP_URL,
		images: [
			{
				url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`,
				width: 1200,
				height: 630,
				alt: "TestMate - App Testing Solution by Softwarify",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "TestMate - Instant App Testing Solution by Softwarify",
		description: "Meet Google Play's 12-tester requirement instantly with pre-verified tester accounts",
		images: [`${process.env.NEXT_PUBLIC_APP_URL}/twitter-image.jpg`],
		site: "@softwarify",
		creator: "@softwarify",
	},
	other: {
		"business:contact_data:website": "https://softwarify.co",
		"business:contact_data:instagram": "http://instagram.com/softwarify",
		"business:contact_data:linkedin": "http://linkedin.com/company/softwarify",
	},
};

const geistSans = Geist({
	subsets: ["latin"],
});

export default async function RootLayout({ children }: any) {
	// Initialize Firebase
	await initFirebase();

	return (
		<html lang='en' suppressHydrationWarning>
			<body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.className)}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
					<Toaster />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
