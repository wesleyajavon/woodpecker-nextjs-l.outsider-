'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, ShoppingBag, BarChart3, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AdminDropdownProps {
  className?: string;
}

export default function AdminDropdown({ className }: AdminDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adminLinks = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'upload',
      label: t('admin.upload'),
      href: '/admin/upload',
      icon: Upload,
    },
    {
      id: 'manage',
      label: t('admin.beats'),
      href: '/admin/manage',
      icon: Music,
    },
    {
      id: 'orders',
      label: t('admin.orders'),
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      id: 'stats',
      label: t('admin.stats'),
      href: '/admin/stats',
      icon: BarChart3,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300',
          'hover:bg-card/30 border border-border/20',
          'text-foreground hover:text-primary',
          isOpen && 'bg-card/30 text-primary'
        )}
      >
        {/* <Upload className="h-4 w-4" /> */}
        <span className="hidden sm:block text-sm">{t('nav.admin')}</span>
        <ChevronDown 
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 bg-card/95 backdrop-blur-xl border border-border/20 rounded-lg shadow-lg z-[5001] overflow-hidden"
          >
            <div className="py-2">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200',
                      'hover:bg-card/50 text-foreground hover:text-primary',
                      'border-l-2 border-transparent hover:border-primary/50'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
