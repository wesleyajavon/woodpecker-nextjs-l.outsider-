'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Music, Sparkles, Upload, Home, Menu, X, ShoppingBag, BarChart3 } from 'lucide-react';
import { FloatingNav } from './ui/floating-navbar';
import { useCartCount } from '@/hooks/useCart';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const cartCount = useCartCount();
  const { t } = useTranslation();
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
              ? "bg-background/95 backdrop-blur-lg border-b border-border/20" 
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
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
                  className="relative p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg transition-all duration-300"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
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
                className="p-2 rounded-lg bg-card/50 backdrop-blur-lg border border-border/20 text-foreground"
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[4999]"
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-l border-border/20 z-[5000] shadow-2xl"
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
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                              {item.icon}
                            </div>
                            <span className="font-medium text-foreground">{item.name}</span>
                          </Link>
                        </motion.div>
                      ))}
                      
                      {/* Admin Section */}
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
                              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
                                <BarChart3 className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground">Dashboard</span>
                            </Link>
                            <Link
                              href="/admin/upload"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                                <Upload className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground">{t('admin.upload')}</span>
                            </Link>
                            <Link
                              href="/admin/manage"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                <Music className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground">{t('admin.beats')}</span>
                            </Link>
                            <Link
                              href="/admin/orders"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                <ShoppingBag className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground">{t('admin.orders')}</span>
                            </Link>
                            <Link
                              href="/admin/stats"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                                <BarChart3 className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground">{t('admin.stats')}</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
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
            className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
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