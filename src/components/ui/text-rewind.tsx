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
        first: "#8b5cf6",
        second: "#ec4899",
        third: "#f59e0b",
        fourth: "#ef4444",
        glow: "#8b5cf6",
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
        textShadow: "0 4px 8px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(245, 158, 11, 0.2)",
    };

    return (
        <div className="w-full text-center">
            <motion.div
                className={cn(
                    "w-full text-center cursor-pointer text-4xl sm:text-6xl lg:text-7xl font-bold",
                    "transition-all duration-300 ease-in-out tracking-wider",
                    "bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent",
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

