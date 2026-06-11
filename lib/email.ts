import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = "TestMate <noreply@testmate.softwarify.co>";
/**
 * Notify a tester that they've been assigned to a new app to test.
 * No-ops (and logs) if RESEND_API_KEY is missing so cycle start never fails
 * just because email isn't configured.
 */
export async function sendAssignmentEmail(params: { to: string; appName: string; optInLink: string | null }) {
	const { to, appName, optInLink } = params;
	if (!resend) {
		console.warn("[email] RESEND_API_KEY missing — skipping assignment email to", to);
		return false;
	}

	const cta = optInLink
		? `<p><a href="${optInLink}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Open in TestMate</a></p>`
		: `<p>Log in to TestMate to opt in and start testing.</p>`;

	try {
		// Resend returns API errors in `error` — it does NOT throw on a 4xx,
		// so we must inspect the result, not just rely on try/catch.
		const { data, error } = await resend.emails.send({
			from: FROM,
			to,
			subject: `You've been assigned a new app to test: ${appName}`,
			html: `
				<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto">
					<h2 style="margin:0 0 12px">New testing assignment</h2>
					<p>You've been matched to <strong>${appName}</strong>.</p>
					<p>Open the app, opt in to the closed test, and test it for at least a few minutes each day for 14 days.</p>
					${cta}
					<p style="color:#888;font-size:12px;margin-top:24px">You're receiving this because you joined the TestMate tester pool.</p>
				</div>
			`,
		});
		if (error) {
			console.error("[email] Resend rejected assignment email to", to, "→", error);
			return false;
		}
		console.log("[email] assignment email sent to", to, "id:", data?.id);
		return true;
	} catch (err) {
		console.error("[email] failed to send assignment email to", to, err);
		return false;
	}
}

/**
 * Notify the app owner (buyer) that their test report is ready.
 * No-ops (and logs) if RESEND_API_KEY is missing so sending the report from
 * the admin panel never hard-fails just because email isn't configured.
 */
export async function sendReportReadyEmail(params: {
	to: string;
	appName: string;
	reportTitle: string | null;
	reportLink: string | null;
}) {
	const { to, appName, reportTitle, reportLink } = params;
	if (!resend) {
		console.warn("[email] RESEND_API_KEY missing — skipping report email to", to);
		return false;
	}

	const cta = reportLink
		? `<p><a href="${reportLink}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:8px;text-decoration:none">View your report</a></p>`
		: `<p>Log in to TestMate to view your full report.</p>`;

	try {
		const { data, error } = await resend.emails.send({
			from: FROM,
			to,
			subject: `Your TestMate report for ${appName} is ready`,
			html: `
				<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto">
					<h2 style="margin:0 0 12px">Your test report is ready</h2>
					<p>We've finished compiling the report for <strong>${appName}</strong>${
						reportTitle ? `: <em>${reportTitle}</em>` : ""
					}.</p>
					<p>It includes a summary of what our testers found, along with screenshots and recordings.</p>
					${cta}
					<p style="color:#888;font-size:12px;margin-top:24px">You're receiving this because you ordered a test on TestMate.</p>
				</div>
			`,
		});
		if (error) {
			console.error("[email] Resend rejected report email to", to, "→", error);
			return false;
		}
		console.log("[email] report email sent to", to, "id:", data?.id);
		return true;
	} catch (err) {
		console.error("[email] failed to send report email to", to, err);
		return false;
	}
}
