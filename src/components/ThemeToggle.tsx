'use client';

import { Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force dark theme on mount
    setTheme('dark');
  }, [setTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        // Always set to dark theme, no toggle
        setTheme('dark');
      }}
      className="relative p-3 rounded-xl transition-all duration-300 bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer"
      aria-label="Dark theme (locked)"
      title="Dark theme is locked"
    >
      <motion.div
        initial={{ rotate: 0, opacity: 1 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Moon className="h-5 w-5" />
      </motion.div>
    </motion.button>
  );
}
