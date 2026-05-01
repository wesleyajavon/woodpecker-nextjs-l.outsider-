"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedTextProps {
    text?: string;
    className?: string;
    shadowColors?: {
        first?: string;
        second?: string;
        third?: string;
        fourth?: string;
        glow?: string;
    };
}

export function TextRewind({
    text = "L.OUTSIDER",
    className = "",
    shadowColors = {
        first: "#22f2a6",
        second: "#3ad7ff",
        third: "#1b2b52",
        fourth: "#0a1026",
        glow: "#22f2a6",
    },
}: AnimatedTextProps) {
    const textShadowStyle = {
        textShadow: `15px 15px 0px ${shadowColors.first}, 
                     25px 25px 0px ${shadowColors.second}, 
                     35px 35px 0px ${shadowColors.third}, 
                     45px 45px 0px ${shadowColors.fourth}, 
                     60px 60px 15px ${shadowColors.glow}`,
    };

    const regularShadowStyle = {
        textShadow: "0 4px 8px rgba(0, 0, 0, 0.35), 0 8px 20px rgba(0, 0, 0, 0.28), 0 0 24px rgba(34, 242, 166, 0.32), 0 0 52px rgba(58, 215, 255, 0.18)",
    };

    return (
        <div className="w-full text-center">
            <motion.div
                className={cn(
                    "w-full text-center cursor-pointer text-4xl sm:text-6xl lg:text-7xl font-bold",
                    "transition-all duration-300 ease-in-out tracking-[0.08em] uppercase",
                    "bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent",
                    "hover:scale-105 transform-gpu",
                    "leading-normal py-6 sm:py-8 lg:py-12 overflow-visible",
                    className
                )}
                style={regularShadowStyle}
                whileHover={textShadowStyle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                {text}
            </motion.div>
        </div>
    );
}

