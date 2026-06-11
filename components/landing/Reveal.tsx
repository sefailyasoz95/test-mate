"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
	up: { y: 28 },
	down: { y: -28 },
	left: { x: 28 },
	right: { x: -28 },
	none: {},
};

export function Reveal({
	children,
	delay = 0,
	direction = "up",
	className,
	once = true,
}: {
	children: ReactNode;
	delay?: number;
	direction?: Direction;
	className?: string;
	once?: boolean;
}) {
	const variants: Variants = {
		hidden: { opacity: 0, ...offset[direction], filter: "blur(6px)" },
		show: {
			opacity: 1,
			x: 0,
			y: 0,
			filter: "blur(0px)",
			transition: { duration: 0.7, ease: EASE, delay },
		},
	};

	return (
		<motion.div
			className={className}
			variants={variants}
			initial="hidden"
			whileInView="show"
			viewport={{ once, margin: "-80px" }}>
			{children}
		</motion.div>
	);
}

/** Staggered container — children should be <Reveal> or motion items. */
export function RevealGroup({
	children,
	className,
	stagger = 0.08,
}: {
	children: ReactNode;
	className?: string;
	stagger?: number;
}) {
	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-80px" }}
			variants={{
				hidden: {},
				show: { transition: { staggerChildren: stagger } },
			}}>
			{children}
		</motion.div>
	);
}

export function RevealItem({
	children,
	className,
	direction = "up",
}: {
	children: ReactNode;
	className?: string;
	direction?: Direction;
}) {
	const variants: Variants = {
		hidden: { opacity: 0, ...offset[direction], filter: "blur(6px)" },
		show: {
			opacity: 1,
			x: 0,
			y: 0,
			filter: "blur(0px)",
			transition: { duration: 0.6, ease: EASE },
		},
	};
	return (
		<motion.div className={className} variants={variants}>
			{children}
		</motion.div>
	);
}
