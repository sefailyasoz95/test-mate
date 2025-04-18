import React from "react";

const PrivacyPolicy = () => {
	return (
		<div className='max-w-3xl mx-auto p-6 text-gray-800 dark:text-white'>
			<h1 className='text-3xl font-bold text-center mb-6'>Privacy Policy</h1>
			<p className='text-sm text-gray-500 text-center mb-6'>
				Effective Date: February 15th, 2025 | Last Updated: February 19th, 2025
			</p>

			<p className='mb-4'>
				Welcome to <strong>TestMate</strong>, a service provided by <strong>Softwarify</strong>. Your privacy is
				important to us, and we are committed to protecting your personal data.
			</p>

			<h2 className='text-xl font-semibold mt-6'>1. Information We Collect</h2>
			<ul className='list-disc list-inside space-y-2 mt-2'>
				<li>
					<strong>Google Account Information:</strong> We receive your email and name when you sign in with Google.
				</li>
				<li>
					<strong>Transaction Data:</strong> We collect payment details via our secure payment provider (e.g., Stripe).
				</li>
				<li>
					<strong>App Testing Data:</strong> We store data related to tester accounts and app assignments.
				</li>
			</ul>

			<h2 className='text-xl font-semibold mt-6'>2. How We Use Your Information</h2>
			<ul className='list-disc list-inside space-y-2 mt-2'>
				<li>To provide and manage our services.</li>
				<li>To process transactions securely.</li>
				<li>To improve our platform and user experience.</li>
				<li>To communicate important service updates.</li>
			</ul>
			<p className='mt-2'>
				We <strong>do not</strong> sell, rent, or share your data with third parties.
			</p>

			<h2 className='text-xl font-semibold mt-6'>3. Data Security</h2>
			<p className='mt-2'>We take security seriously and implement industry-standard measures, including:</p>
			<ul className='list-disc list-inside space-y-2 mt-2'>
				<li>Secure authentication via Google OAuth.</li>
				<li>Encrypted storage for sensitive data.</li>
				<li>Regular security monitoring and updates.</li>
			</ul>

			<h2 className='text-xl font-semibold mt-6'>4. Third-Party Services</h2>
			<p className='mt-2'>
				We use third-party services like Google OAuth for authentication and Stripe for payments. Your data is handled
				securely.
			</p>
			<p className='mt-2'>For more details, review their privacy policies:</p>
			<ul className='list-disc list-inside mt-2'>
				<li>
					<a href='https://policies.google.com/privacy' className='text-blue-500 hover:underline'>
						Google Privacy Policy
					</a>
				</li>
				<li>
					<a href='https://stripe.com/privacy' className='text-blue-500 hover:underline'>
						Stripe Privacy Policy
					</a>
				</li>
			</ul>

			<h2 className='text-xl font-semibold mt-6'>5. Your Rights & Control Over Your Data</h2>
			<ul className='list-disc list-inside space-y-2 mt-2'>
				<li>Request access to your personal data.</li>
				<li>Request deletion of your account and data.</li>
				<li>Opt out of marketing communications.</li>
			</ul>
			<p className='mt-2'>
				To make a request, contact us at{" "}
				<a href='mailto:sio@softwarify.co' className='text-blue-500 hover:underline'>
					sio@softwarify.co
				</a>
				.
			</p>
			<h2 className='text-xl font-semibold mt-6'>6. About app features</h2>
			<ul className='list-disc list-inside space-y-2 mt-2'>
				<li>TestMate does not make any promises for passing the Google Play Store test requirements.</li>
				<li>
					We do our best by opening apps daily, if you bought active test package we do provide feedbacks by testing
					your app.
				</li>
				<li>Something about your app may cause a rejection from the Play Store, we are not responsible for that.</li>
			</ul>
			<h2 className='text-xl font-semibold mt-6'>7. Changes to This Privacy Policy</h2>
			<p className='mt-2'>We may update this Privacy Policy periodically. Any changes will be posted on this page.</p>

			<h2 className='text-xl font-semibold mt-6'>8. Contact Us</h2>
			<p className='mt-2'>If you have any questions, feel free to contact us:</p>
			<p>
				Email:{" "}
				<a href='mailto:sio@softwarify.co' className='text-blue-500 hover:underline'>
					sio@softwarify.co
				</a>
			</p>
			<p>
				Website:{" "}
				<a href='https://softwarify.co/' className='text-blue-500 hover:underline'>
					https://softwarify.co/
				</a>
			</p>

			<p className='mt-6 font-semibold'>
				By using <strong>TestMate</strong>, you agree to this Privacy Policy. Thank you for trusting us! 🚀
			</p>
		</div>
	);
};

export default PrivacyPolicy;
