import React from "react";

const PricingCard = ({ title, price, features, isPopular = false }: any) => {
	return (
		<div
			className={`relative group hover:scale-105 transition-all duration-300 rounded-2xl overflow-hidden ${isPopular ? "bg-gradient-to-br from-primary/10 to-primary/5" : "bg-card"}`}>
			{isPopular && (
				<div className='absolute top-4 right-4'>
					<span className='px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full'>Most Popular</span>
				</div>
			)}
			<div
				className={`p-8 space-y-6 border border-border ${isPopular ? "border-primary/20" : ""} rounded-2xl backdrop-blur-sm`}>
				<div className='space-y-2'>
					<h3 className='text-2xl font-bold tracking-tight'>{title}</h3>
					<div className='flex items-baseline'>
						<span className='text-4xl font-extrabold tracking-tight'>${price}</span>
						<span className='ml-2 text-sm text-muted-foreground'>/month</span>
					</div>
				</div>
				<ul className='space-y-3'>
					{features.map((feature: string, index: number) => (
						<li key={index} className='flex items-center text-muted-foreground hover:text-foreground transition-colors'>
							<svg
								className={`w-5 h-5 mr-3 ${isPopular ? "text-primary" : "text-muted-foreground"}`}
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
							</svg>
							<span className='text-sm'>{feature}</span>
						</li>
					))}
				</ul>
				<button
					className={`w-full py-3 px-4 rounded-xl font-semibold transition-all 
            ${
							isPopular
								? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
								: "bg-secondary text-secondary-foreground hover:bg-secondary/90"
						}`}>
					Select Plan
				</button>
			</div>
		</div>
	);
};

export default PricingCard;
