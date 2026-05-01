"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Adapt colors based on theme, but use default dark theme colors during SSR
  const gradientColor = mounted && theme === 'light' ? 'hsl(158, 89%, 42%)' : 'hsl(158, 89%, 54%)';
  const transparentColor = mounted && theme === 'light' ? 'rgba(5, 8, 23, 0)' : 'rgba(34, 242, 166, 0)';

  const movingMap: Record<Direction, string> = {
    TOP: `radial-gradient(20.7% 50% at 50% 0%, ${gradientColor} 0%, ${transparentColor} 100%)`,
    LEFT: `radial-gradient(16.6% 43.1% at 0% 50%, ${gradientColor} 0%, ${transparentColor} 100%)`,
    BOTTOM: `radial-gradient(20.7% 50% at 50% 100%, ${gradientColor} 0%, ${transparentColor} 100%)`,
    RIGHT: `radial-gradient(16.2% 41.199999999999996% at 100% 50%, ${gradientColor} 0%, ${transparentColor} 100%)`,
  };

  const highlight =
    "radial-gradient(75% 181.15942028985506% at 50% 50%, #22f2a6 0%, rgba(34, 242, 166, 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const rotateDirection = (currentDirection: Direction): Direction => {
        const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
        const currentIndex = directions.indexOf(currentDirection);
        const nextIndex = clockwise
          ? (currentIndex - 1 + directions.length) % directions.length
          : (currentIndex + 1) % directions.length;
        return directions[nextIndex];
      };
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration, clockwise]);
  return (
    <Tag
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-min w-fit flex-col flex-nowrap items-center justify-center gap-10 overflow-visible rounded-full border border-primary/25 bg-card text-foreground decoration-clone p-px transition duration-500 hover:cursor-pointer hover:bg-background/10 dark:bg-primary/10",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "z-10 w-auto rounded-[inherit] bg-card/95 px-4 py-2 text-foreground",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit] "
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="absolute inset-[2px] z-1 flex-none rounded-[100px] bg-[var(--theme-gradient)]" />
    </Tag>
  );
}
