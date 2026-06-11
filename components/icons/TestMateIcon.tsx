import Image from "next/image";
import { cn } from "@/lib/utils";

const TestMateIcon = ({ size = 32, className }: { size?: number; className?: string }) => {
	return (
		<Image
			src='/icon-192.png'
			alt='TestMate'
			width={size}
			height={size}
			priority
			className={cn("rounded-lg", className)}
		/>
	);
};

export default TestMateIcon;
