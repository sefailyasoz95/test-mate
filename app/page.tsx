import Hero from "@/components/hero";
import TestMateIcon from "@/components/icons/TestMateIcon";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Home() {
	return (
		<div className='flex flex-col relative'>
			<nav className='fixed top-0 left-0 w-full backdrop-blur-lg z-10'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16 items-center'>
						<div className='flex items-center'>
							<TestMateIcon />
							<Link href='/' className='text-xl font-bold'>
								TestMate
							</Link>
						</div>
						<div className='flex items-center gap-4'>
							<ThemeSwitcher />
						</div>
					</div>
				</div>
			</nav>
			<Hero />
		</div>
	);
}
