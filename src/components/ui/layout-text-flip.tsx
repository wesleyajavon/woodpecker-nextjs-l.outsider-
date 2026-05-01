"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}: {
  text: string;
  words: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const regularShadowStyle = {
    textShadow: "0 4px 8px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.22), 0 0 24px rgba(34, 242, 166, 0.28), 0 0 48px rgba(58, 215, 255, 0.16)",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, words.length]);

  return (
    <>
      <motion.span
        layoutId="subtext"
        className="text-2xl font-bold tracking-tight drop-shadow-lg md:text-4xl text-foreground"
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className="signal-glow relative w-fit overflow-hidden rounded-md border border-primary/20 px-4 py-2 font-sans text-2xl font-bold tracking-tight text-black shadow-sm ring shadow-black/10 ring-primary/15 drop-shadow-lg backdrop-blur-md md:text-4xl dark:text-white dark:shadow-sm dark:ring-1"
        style={regularShadowStyle}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
            className={cn("inline-block whitespace-nowrap bg-gradient-to-r from-white via-primary to-cyan-200 bg-clip-text text-transparent font-bold cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 transform-gpu")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence >
      </motion.span >
    </>
  );
};
