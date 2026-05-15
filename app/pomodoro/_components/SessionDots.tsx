"use client";

import { motion } from "framer-motion";

interface SessionDotsProps {
    completed: number;
    total: number;
    color: string;
}

export default function SessionDots({ completed, total, color }: SessionDotsProps) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <motion.div key={i} className="rounded-full transition-all duration-500"
                    style={{
                        width: i < completed ? 10 : 7,
                        height: i < completed ? 10 : 7,
                        backgroundColor: i < completed ? color : "rgba(255,255,255,0.2)",
                    }}
                    animate={{ scale: i === completed - 1 ? [1, 1.5, 1] : 1 }}
                    transition={{ duration: 0.4 }}
                />
            ))}
        </div>
    );
}