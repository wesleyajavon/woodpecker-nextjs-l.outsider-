'use client';
import React, { useState, useEffect } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FrameIcon, InstagramIcon, YoutubeIcon } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}


export function Footer() {
	const [currentYear, setCurrentYear] = useState(2025);
	const { t } = useTranslation();

	const footerLinks: FooterSection[] = [
		{
			label: t('footer.sections.products'),
			links: [
				{ title: t('footer.links.beats'), href: '/beats' },
			],
		},
		{
			label: t('footer.sections.company'),
			links: [
				{ title: t('footer.links.contact'), href: '/contact' },
				{ title: t('footer.links.recruiters'), href: '/recruiters' },
			],
		},
		{
			label: t('footer.sections.support'),
			links: [
				{ title: t('footer.links.faq'), href: '/faq' },
				{ title: t('footer.links.terms'), href: '/terms' },
				{ title: t('footer.links.licenses'), href: '/licenses' },
				{ title: t('footer.links.privacy'), href: '/privacy' },
			],
		},
		{
			label: t('footer.sections.social'),
			links: [
				{ title: t('footer.links.instagram'), href: 'https://www.instagram.com/_l.outsider._/', icon: InstagramIcon },
				{ title: t('footer.links.youtube'), href: 'https://www.youtube.com/@l.outsider', icon: YoutubeIcon },
			],
		},
	];

	useEffect(() => {
		setCurrentYear(new Date().getFullYear());
	}, []);

	return (
		<footer className="sm:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-3xl sm:rounded-t-4xl border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
			<div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

			<div className="grid w-full gap-6 sm:gap-8 xl:grid-cols-3 xl:gap-8">
				<AnimatedContainer className="space-y-3 sm:space-y-4">
					<FrameIcon className="size-6 sm:size-8" />
					<p className="text-muted-foreground mt-6 sm:mt-8 text-xs sm:text-sm md:mt-0">
						{t('footer.copyright', { year: currentYear.toString() })}
					</p>
				</AnimatedContainer>

				<div className="mt-6 sm:mt-10 grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
							<div className="mb-6 sm:mb-10 md:mb-0">
								<h3 className="text-xs sm:text-sm font-medium">{section.label}</h3>
								<ul className="text-muted-foreground mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												href={link.href}
												className="hover:text-foreground inline-flex items-center transition-all duration-300 py-1 touch-manipulation"
											>
												{link.icon && <link.icon className="me-1.5 sm:me-1 size-3.5 sm:size-4" />}
												<span className="text-xs sm:text-sm">{link.title}</span>
											</a>
										</li>
									))}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>
		</footer>
	);
};

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(2px)', translateY: -4, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ 
				delay, 
				duration: 0.6,
				ease: 'easeOut'
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
};