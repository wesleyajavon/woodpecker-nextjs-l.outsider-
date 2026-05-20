import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';

type ContactInfoProps = React.ComponentProps<'div'> & {
  icon: LucideIcon;
  label: string;
  value: string;
};

type ContactCardProps = React.ComponentProps<'div'> & {
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

  const defaultTitle = title || t('contact.cardtitle');
  const defaultDescription = description || t('contact.cardsubtitle');

  return (
    <div
      className={cn('grid gap-5 lg:grid-cols-5 lg:gap-6', className)}
      {...props}
    >
      <div className={cn(catalogPanelClass, 'space-y-6 p-6 sm:p-8 lg:col-span-2')}>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {defaultTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {defaultDescription}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {contactInfo?.map((info, index) => (
            <ContactInfo key={index} {...info} />
          ))}
        </div>
      </div>

      <div
        className={cn(
          catalogPanelClass,
          'p-6 sm:p-8 lg:col-span-3',
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
    <div
      className={cn(
        'rounded-lg border border-white/8 bg-white/[0.02] p-4 transition-colors hover:border-white/12 hover:bg-white/[0.04]',
        className,
      )}
      {...props}
    >
      <div className="mb-3 inline-flex rounded-lg border border-white/8 bg-white/[0.03] p-2 text-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-sm text-foreground',
          isEmail ? 'break-all' : 'truncate',
        )}
      >
        {value}
      </p>
    </div>
  );
}
