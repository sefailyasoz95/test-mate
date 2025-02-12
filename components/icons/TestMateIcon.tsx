import React from "react";

const TestMateIcon = () => {
	return (
		<svg
			className='scale-75 mt-2 -mr-5'
			width='100'
			height='100'
			viewBox='0 0 100 100'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			{/* Head */}
			<circle cx='50' cy='30' r='15' fill='#3DDC84' />

			{/* Antennas */}
			<line x1='42' y1='15' x2='38' y2='10' stroke='#3DDC84' strokeWidth='2' strokeLinecap='round' />
			<line x1='58' y1='15' x2='62' y2='10' stroke='#3DDC84' strokeWidth='2' strokeLinecap='round' />

			{/* Eyes */}
			<circle cx='45' cy='28' r='2' fill='white' />
			<circle cx='55' cy='28' r='2' fill='white' />

			{/* Body */}
			<circle cx='50' cy='55' r='20' fill='#3DDC84' />

			{/* Arms holding the phone */}
			<rect x='35' y='45' width='8' height='20' rx='4' fill='#0cba6f' />
			<rect x='57' y='45' width='8' height='20' rx='4' fill='#0cba6f' />

			{/* Phone */}
			<rect x='40' y='50' width='20' height='30' rx='2' fill='#2D2D2D' />
			<rect x='42' y='52' width='16' height='26' rx='1' fill='#4CAF50' opacity='0.3' />
		</svg>
	);
};

export default TestMateIcon;
