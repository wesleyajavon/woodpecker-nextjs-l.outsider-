"use client";
import React, { JSX, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import AuthButton from "@/components/AuthButton";
import AdminDropdown from "@/components/AdminDropdown";


export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);

  // Always show navigation when pathname changes
  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current! - scrollYProgress.getPrevious()!;
      const currentScroll = scrollYProgress.get();

      // Check if page is actually scrollable (height > viewport)
      const isPageScrollable = document.documentElement.scrollHeight > window.innerHeight;

      // Only apply scroll-based hiding if page is actually scrollable
      if (isPageScrollable) {
        if (direction < 0) {
          setVisible(true);
        } else if (direction > 0 && currentScroll > 0.3) {
          setVisible(false);
        }
      }
      // If page is not scrollable, keep navigation visible
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-border/20 rounded-full bg-background/80 backdrop-blur-xl shadow-lg z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4",
          className
        )}
      >
        {navItems.map((navItem, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative items-center flex space-x-1 text-foreground hover:text-muted-foreground transition-colors"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        
        {/* Admin Dropdown */}
        <AdminDropdown />
        
        <div className="border border-border/20 rounded-full hover:bg-muted/50 transition-colors">
          <AuthButton variant="floating" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
