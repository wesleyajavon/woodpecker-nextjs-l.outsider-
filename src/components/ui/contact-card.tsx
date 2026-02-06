import React from 'react';
import { cn } from '@/lib/utils';
import {
	LucideIcon,
	PlusIcon,
} from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

type ContactInfoProps = React.ComponentProps<'div'> & {
	icon: LucideIcon;
	label: string;
	value: string;
};

type ContactCardProps = React.ComponentProps<'div'> & {
	// Content props
	title?: string;
	description?: string;
	contactInfo?: ContactInfoProps[];
	formSectionClassName?: string;
};

export function ContactCard({
	title,
	description,
	contactInfo,
	className,
	formSectionClassName,
	children,
	...props
}: ContactCardProps) {
	const { t } = useTranslation();
	
	// Utiliser les traductions par défaut si aucun titre/description n'est fourni
	const defaultTitle = title || t('contact.cardtitle');
	const defaultDescription = description || t('contact.cardsubtitle');
	return (
		<div
			className={cn(
				'bg-card border relative grid h-full w-full shadow sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 rounded-xl overflow-hidden',
				className,
			)}
			{...props}
		>
			<PlusIcon className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 h-4 w-4 sm:h-6 sm:w-6" />
			<PlusIcon className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 h-4 w-4 sm:h-6 sm:w-6" />
			<PlusIcon className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 h-4 w-4 sm:h-6 sm:w-6" />
			<PlusIcon className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 h-4 w-4 sm:h-6 sm:w-6" />
			<div className="flex flex-col justify-between lg:col-span-2">
				<div className="relative h-full space-y-3 sm:space-y-4 px-3 py-6 sm:px-4 sm:py-8 md:p-8">
					{defaultTitle && (
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
							{defaultTitle}
						</h1>
					)}
					{defaultDescription && (
						<p className="text-muted-foreground max-w-xl text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
							{defaultDescription}
						</p>
					)}
					<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
						{contactInfo?.map((info, index) => (
							<ContactInfo key={index} {...info} />
						))}
					</div>
				</div>
			</div>
			<div
				className={cn(
					'bg-muted/40 flex h-full w-full items-center border-t p-4 sm:p-5 md:col-span-1 md:border-t-0 md:border-l',
					formSectionClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}

function ContactInfo({
	icon: Icon,
	label,
	value,
	className,
	...props
}: ContactInfoProps) {
	const isEmail = value.includes('@');
	return (
		<div className={cn('flex items-start sm:items-center gap-2 sm:gap-3 py-2 sm:py-3', className)} {...props}>
			<div className="bg-muted/40 rounded-lg p-2 sm:p-3 flex-shrink-0">
				<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
			</div>
			<div className="min-w-0 flex-1 overflow-hidden">
				<p className="font-medium text-sm sm:text-base truncate">{label}</p>
				<p
					className={cn(
						'text-muted-foreground text-xs sm:text-sm',
						isEmail ? 'break-all' : 'truncate'
					)}
				>
					{value}
				</p>
			</div>
		</div>
	);
}
