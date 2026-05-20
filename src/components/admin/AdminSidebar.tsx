'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Music,
  FileAudio,
  Image as ImageIcon,
  Archive,
  Settings,
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface AdminSidebarProps {
  beatId?: string;
}

const linkClass = (active: boolean, collapsed: boolean) =>
  cn(
    'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
    active
      ? 'border-white/12 bg-white text-black'
      : 'border-transparent text-muted-foreground hover:border-white/8 hover:bg-white/[0.04] hover:text-foreground',
    collapsed && 'justify-center px-2',
  );

export default function AdminSidebar({ beatId }: AdminSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainLinks = [
    { id: 'dashboard', label: t('admin.backToDashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'upload', label: t('admin.upload'), href: '/admin/upload', icon: Upload },
    { id: 'beats', label: t('admin.beats'), href: '/admin/manage', icon: Music },
    { id: 'orders', label: t('admin.orders'), href: '/admin/orders', icon: ShoppingCart },
    { id: 'stats', label: t('admin.stats'), href: '/admin/stats', icon: BarChart3 },
  ];

  const beatLinks = beatId
    ? [
        { id: 'beat-management', label: t('admin.beatManagement'), href: `/admin/beats/${beatId}`, icon: Settings },
        { id: 'beat-edit-files', label: t('admin.editFiles'), href: `/admin/beats/${beatId}/edit`, icon: Upload },
      ]
    : [];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === pathname) return true;
    if (beatId && href === `/admin/beats/${beatId}/edit` && pathname === href) return true;
    return false;
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="border-b border-white/6 p-5">
        <div className={cn('flex items-center gap-3', isCollapsed && !mobile && 'justify-center')}>
          {!isCollapsed || mobile ? (
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t('admin.title')}
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                {t('admin.dashboard')}
              </p>
            </div>
          ) : null}
          {mobile ? (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              title={isCollapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
            >
              {isCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <div>
          {(!isCollapsed || mobile) && (
            <p className="mb-3 px-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('admin.navigation')}
            </p>
          )}
          <div className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => mobile && setIsOpen(false)}
                  title={isCollapsed && !mobile ? link.label : undefined}
                >
                  <div className={linkClass(active, isCollapsed && !mobile)}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {(!isCollapsed || mobile) && <span>{link.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {beatLinks.length > 0 && (
          <div className="border-t border-white/6 pt-4">
            {(!isCollapsed || mobile) && (
              <p className="mb-3 px-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {t('admin.beatActions')}
              </p>
            )}
            <div className="space-y-1">
              {beatLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => mobile && setIsOpen(false)}
                    title={isCollapsed && !mobile ? link.label : undefined}
                  >
                    <div className={linkClass(active, isCollapsed && !mobile)}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {(!isCollapsed || mobile) && <span>{link.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {beatId && (!isCollapsed || mobile) && (
          <div className="border-t border-white/6 pt-4">
            <p className="mb-3 px-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('admin.fileTypes')}
            </p>
            <div className="space-y-2 px-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Music className="h-3 w-3" />
                <span>{t('upload.previewAudio')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileAudio className="h-3 w-3" />
                <span>{t('upload.masterAudio')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-3 w-3" aria-hidden />
                <span>{t('upload.artwork')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Archive className="h-3 w-3" />
                <span>{t('upload.stems')}</span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-background/90 text-foreground backdrop-blur-sm hover:bg-white/[0.04]"
          title={isOpen ? t('admin.closeMenu') : t('admin.openMenu')}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <motion.aside
        className="relative z-20 hidden shrink-0 flex-col border-r border-white/6 bg-background/80 backdrop-blur-md md:flex"
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.25 }}
      >
        <SidebarContent />
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-white/6 bg-background md:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
