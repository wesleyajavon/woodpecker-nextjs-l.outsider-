"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { motion } from "motion/react";
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
  const gradientColor = mounted && theme === 'light' ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 100%)';
  const transparentColor = mounted && theme === 'light' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)';

  const movingMap: Record<Direction, string> = {
    TOP: `radial-gradient(20.7% 50% at 50% 0%, ${gradientColor} 0%, ${transparentColor} 100%)`,
    LEFT: `radial-gradient(16.6% 43.1% at 0% 50%, ${gradientColor} 0%, ${transparentColor} 100%)`,
    BOTTOM: `radial-gradient(20.7% 50% at 50% 100%, ${gradientColor} 0%, ${transparentColor} 100%)`,
    RIGHT: `radial-gradient(16.2% 41.199999999999996% at 100% 50%, ${gradientColor} 0%, ${transparentColor} 100%)`,
  };

  const highlight =
    "radial-gradient(75% 181.15942028985506% at 50% 50%, #8b5cf6 0%, rgba(139, 92, 246, 0) 100%)";

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
        "relative flex rounded-full border content-center bg-card text-foreground hover:cursor-pointer hover:bg-background/10 transition duration-500 dark:bg-foreground/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-foreground z-10 bg-card px-4 py-2 rounded-[inherit]",
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
      <div className="bg-theme-gradient absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
