import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://testmate.softwarify.co";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	return [
		{ url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
		{
			url: `${SITE}/google-play-12-testers-14-days`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{ url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
	];
}
