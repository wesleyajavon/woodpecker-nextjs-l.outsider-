'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Music, Sparkles, Upload, Home, Menu, X, ShoppingBag, BarChart3 } from 'lucide-react';
import { FloatingNav } from './ui/floating-navbar';
import { useCartCount } from '@/hooks/useCart';
import { useIsAdmin } from '@/hooks/useUser';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const cartCount = useCartCount();
  const { t } = useTranslation();
  const { status } = useSession();
  const isAdmin = useIsAdmin();
  const showAdminNav = status === 'authenticated' && isAdmin;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const navItems = [
    { 
      name: t('nav.home'), 
      link: '/', 
      icon: <Home className="h-4 w-4" />
    },
    { 
      name: t('nav.beats'), 
      link: '/beats', 
      icon: <Music className="h-4 w-4" />
    },
    { 
      name: t('nav.contact'), 
      link: '/contact', 
      icon: <Sparkles className="h-4 w-4" />
    },
  ];

  return (
    <>
      {/* Desktop Floating Navigation */}
      <div className="hidden md:block">
        <FloatingNav navItems={navItems} />
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[5000] transition-all duration-300",
            isScrolled 
              ? "bg-background/90 backdrop-blur-lg border-b border-primary/15" 
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="signal-glow flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-4 w-4" />
              </div>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Language Switcher */}
              <LanguageSwitcher variant="icon-only" />
              
              {/* Cart */}
              <Link href="/cart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="signal-glow relative rounded-lg bg-primary p-2 text-primary-foreground transition-all duration-300"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <motion.div
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-300 text-xs text-background"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.div>
                  )}
                </motion.button>
              </Link>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg border border-primary/20 bg-card/60 p-2 text-foreground backdrop-blur-lg"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[4999] bg-background/70 backdrop-blur-sm"
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 z-[5000] h-full w-80 max-w-[85vw] border-l border-primary/20 bg-background/95 shadow-2xl shadow-primary/10 backdrop-blur-xl"
              >
                <div className="flex flex-col h-full">
                  {/* Menu Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border/20">
                    <h2 className="text-xl font-bold text-foreground">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Navigation Items */}
                  <nav className="flex-1 px-6 py-4">
                    <div className="space-y-2">
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                          >
                            <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                              {item.icon}
                            </div>
                            <span className="font-medium text-foreground">{item.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                      
                      {showAdminNav && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: navItems.length * 0.1 }}
                          className="border-t border-border/20 pt-4 mt-4"
                        >
                          <div className="px-4 py-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              {t('nav.admin')}
                            </h3>
                            <div className="space-y-2">
                              <Link
                                href="/admin/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                                  <BarChart3 className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">Dashboard</span>
                              </Link>
                              <Link
                                href="/admin/upload"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                                  <Upload className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">{t('admin.upload')}</span>
                              </Link>
                              <Link
                                href="/admin/manage"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div className="rounded-lg bg-cyan-300/10 p-2 text-cyan-300 transition-colors group-hover:bg-cyan-300/20">
                                  <Music className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">{t('admin.beats')}</span>
                              </Link>
                              <Link
                                href="/admin/orders"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
                                  <ShoppingBag className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">{t('admin.orders')}</span>
                              </Link>
                              <Link
                                href="/admin/stats"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                              >
                                <div className="rounded-lg bg-cyan-300/10 p-2 text-cyan-300 transition-colors group-hover:bg-cyan-300/20">
                                  <BarChart3 className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">{t('admin.stats')}</span>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </nav>

                  {/* Menu Footer */}
                  <div className="p-6 border-t border-border/20">
                    {/* Auth Button */}
                    <div className="w-full">
                      <AuthButton 
                        variant="mobile" 
                        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Fixed Elements */}
      <div className="hidden md:flex fixed top-4 right-4 z-[5001] items-center space-x-3">
        <LanguageSwitcher variant="icon-only" />
        {/* <ThemeToggle /> */}
        
        <Link href="/cart">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="signal-glow relative rounded-xl bg-primary p-3 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <motion.div
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300 text-xs text-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.div>
            )}
          </motion.button>
        </Link>
      </div>

      {/* Mobile spacing */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default Navigation;