"use client";

import { motion } from "framer-motion";

export default function ThemeDecoration({ isDark }: { isDark: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
                opacity: isDark ? 0.4 : 0.7,
                scale: 1
            }}
            transition={{
                duration: 1.2,
                ease: "easeOut"
            }}
            className="fixed bottom-0 left-0 w-40 sm:w-56 lg:w-72 pointer-events-none z-0"
        >
            <img
                src="/assets/totoro-decoration.png"
                alt="Totoro Decoration"
                className={`w-full h-auto transition-opacity duration-1000`}
            />
        </motion.div>
    );
}
