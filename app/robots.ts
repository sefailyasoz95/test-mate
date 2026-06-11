import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://testmate.softwarify.co";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			// Keep private app surfaces out of the index.
			disallow: ["/dashboard", "/admin", "/auth", "/auth-error", "/payment", "/tester-login"],
		},
		sitemap: `${SITE}/sitemap.xml`,
		host: SITE,
	};
}
