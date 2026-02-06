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
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface AdminSidebarProps {
  beatId?: string;
}

export default function AdminSidebar({ beatId }: AdminSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Navigation principale
  const mainLinks = [
    {
      id: 'dashboard',
      label: t('admin.backToDashboard'),
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />   
    },
    {
      id: 'upload',
      label: t('admin.upload'),
      href: '/admin/upload',
      icon: <Upload className="w-5 h-5" />
    },
    {
      id: 'beats',
      label: t('admin.beats'),
      href: '/admin/manage',
      icon: <Music className="w-5 h-5" />
    },
    {
      id: 'orders',
      label: t('admin.orders'),
      href: '/admin/orders',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      id: 'stats',
      label: t('admin.stats'),
      href: '/admin/stats',
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  // Navigation spécifique au beat (si beatId fourni)
  const beatLinks = beatId ? [
    {
      id: 'beat-management',
      label: t('admin.beatManagement'),
      href: `/admin/beats/${beatId}`,
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'beat-edit-files',
      label: t('admin.editFiles'),
      href: `/admin/beats/${beatId}/edit`,
      icon: <Upload className="w-5 h-5" />
    }
  ] : [];

  const isActive = (href: string) => {
    if (!pathname) return false;
    
    // Gestion des pages admin
    if (href === '/admin/dashboard' && pathname === '/admin/dashboard') return true;
    if (href === '/admin/upload' && pathname === '/admin/upload') return true;
    if (href === '/admin/manage' && pathname === '/admin/manage') return true;
    if (href === '/admin/orders' && pathname === '/admin/orders') return true;
    if (href === '/admin/stats' && pathname === '/admin/stats') return true;
    if (href === '/admin/users' && pathname === '/admin/users') return true;
    
    // Gestion des pages de beat spécifiques
    if (beatId && href === `/admin/beats/${beatId}` && pathname === `/admin/beats/${beatId}`) return true;
    if (beatId && href === `/admin/beats/${beatId}/edit` && pathname === `/admin/beats/${beatId}/edit`) return true;
    
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          title={isOpen ? t('admin.closeMenu') : t('admin.openMenu')}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden md:flex md:flex-col md:shrink-0"
        animate={{ width: isCollapsed ? "80px" : "320px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full bg-gradient-to-b from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-r border-border/20">
          {/* Header */}
          <div className="p-6 border-b border-border/20 relative">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4 pr-12"
            >

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h2
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-lg font-semibold text-foreground whitespace-nowrap overflow-hidden flex-1"
                  >
                    {t('admin.title')}
                  </motion.h2>
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground pr-12"
                >
                  {t('admin.dashboard')}
                </motion.p>
              )}
            </AnimatePresence>
            
            {/* Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-purple-500/30 hover:text-indigo-300 hover:border-indigo-500/50 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-20"
              title={isCollapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
            >
              {isCollapsed ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Navigation principale */}
          <div className="p-6">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3"
                >
                  {t('admin.navigation')}
                </motion.h3>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {mainLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link href={link.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                        isActive(link.href)
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/20",
                        isCollapsed ? "justify-center" : ""
                      )}
                      title={isCollapsed ? link.label : undefined}
                    >
                      <div className={cn(
                        "transition-colors duration-200",
                        isActive(link.href) ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {link.icon}
                      </div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {link.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation spécifique au beat */}
          {beatLinks.length > 0 && (
            <div className="p-6 border-t border-border/20">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3"
                  >
                    {t('admin.beatActions')}
                  </motion.h3>
                )}
              </AnimatePresence>
              <div className="space-y-1">
                {beatLinks.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link href={link.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                          isActive(link.href)
                            ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/20",
                          isCollapsed ? "justify-center" : ""
                        )}
                        title={isCollapsed ? link.label : undefined}
                      >
                        <div className={cn(
                          "transition-colors duration-200",
                          isActive(link.href) ? "text-purple-400" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {link.icon}
                        </div>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="text-sm font-medium whitespace-nowrap overflow-hidden"
                            >
                              {link.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* File types info */}
          {beatId && (
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-auto p-6 border-t border-border/20"
                >
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {t('admin.fileTypes')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Music className="w-3 h-3 text-blue-400" />
                      <span>{t('upload.previewAudio')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileAudio className="w-3 h-3 text-green-400" />
                      <span>{t('upload.masterAudio')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon className="w-3 h-3 text-purple-400" aria-hidden />
                      <span>{t('upload.artwork')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Archive className="w-3 h-3 text-orange-400" />
                      <span>{t('upload.stems')}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-r border-border/20 z-50 md:hidden"
            >
              {/* Mobile Header */}
              <div className="p-6 border-b border-border/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {t('admin.title')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-card/20 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('admin.dashboard')}
                </p>
              </div>

              {/* Mobile Navigation */}
              <div className="p-6 space-y-6">
                {/* Main Navigation */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {t('admin.navigation')}
                  </h3>
                  <div className="space-y-1">
                    {mainLinks.map((link) => (
                      <Link key={link.id} href={link.href} onClick={() => setIsOpen(false)}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                            isActive(link.href)
                              ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30"
                              : "text-muted-foreground hover:text-foreground hover:bg-card/20"
                          )}
                        >
                          <div className={cn(
                            "transition-colors duration-200",
                            isActive(link.href) ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {link.icon}
                          </div>
                          <span className="text-sm font-medium">{link.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Beat Navigation */}
                {beatLinks.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      {t('admin.beatActions')}
                    </h3>
                    <div className="space-y-1">
                      {beatLinks.map((link) => (
                        <Link key={link.id} href={link.href} onClick={() => setIsOpen(false)}>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                              isActive(link.href)
                                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-card/20"
                            )}
                          >
                            <div className={cn(
                              "transition-colors duration-200",
                              isActive(link.href) ? "text-purple-400" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {link.icon}
                            </div>
                            <span className="text-sm font-medium">{link.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Types */}
                {beatId && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      {t('admin.fileTypes')}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Music className="w-3 h-3 text-blue-400" />
                        <span>{t('upload.previewAudio')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileAudio className="w-3 h-3 text-green-400" />
                        <span>{t('upload.masterAudio')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ImageIcon className="w-3 h-3 text-purple-400" aria-hidden />
                        <span>{t('upload.artwork')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Archive className="w-3 h-3 text-orange-400" />
                        <span>{t('upload.stems')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}