"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "./types";

// ─── TaskList ─────────────────────────────────────────────────────────────────

interface TaskListProps {
    isDark: boolean;
    accentColor: string;
}

export default function TaskList({ isDark, accentColor }: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState("");

    const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200";
    const taskRowBg = isDark ? "bg-white/5 hover:bg-white/10" : "bg-white hover:bg-gray-50";

    useEffect(() => {
        const saved = localStorage.getItem("pomodoro-tasks");
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (!input.trim()) return;
        setTasks(prev => [...prev, { id: Date.now().toString(), text: input.trim(), done: false }]);
        setInput("");
    };

    const toggleTask = (id: string) =>
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    const removeTask = (id: string) =>
        setTasks(prev => prev.filter(t => t.id !== id));

    const clearDone = () => setTasks(prev => prev.filter(t => !t.done));
    const clearAll = () => setTasks([]);

    const hasDone = tasks.some(t => t.done);
    const hasAny = tasks.length > 0;

    return (
        <div className={`w-full rounded-2xl border ${cardBg} p-4 flex flex-col gap-3`}>

            {/* Header row: label + action buttons */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-widest font-bold opacity-40">This Session</p>
                {/* Buttons stay in DOM always — only opacity/scale animates, no layout shift */}
                <div className="flex items-center gap-2">
                    <motion.button
                        onClick={clearDone}
                        disabled={!hasDone}
                        animate={{ opacity: hasDone ? 1 : 0, scale: hasDone ? 1 : 0.85 }}
                        transition={{ duration: 0.18 }}
                        className="text-[10px] font-semibold uppercase tracking-widest cursor-pointer px-2.5 py-1 rounded-full border whitespace-nowrap"
                        style={{
                            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                            pointerEvents: hasDone ? "auto" : "none",
                        }}>
                        Clear done
                    </motion.button>
                    <motion.button
                        onClick={clearAll}
                        disabled={!hasAny}
                        animate={{ opacity: hasAny ? 1 : 0, scale: hasAny ? 1 : 0.85 }}
                        transition={{ duration: 0.18 }}
                        className="text-[10px] font-semibold uppercase tracking-widest cursor-pointer px-2.5 py-1 rounded-full text-red-500 border border-red-400/30 whitespace-nowrap"
                        style={{ pointerEvents: hasAny ? "auto" : "none" }}>
                        Clear all
                    </motion.button>
                </div>
            </div>

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); addTask(); }} className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Add a task..."
                    className={`flex-1 text-sm px-3 py-2 rounded-lg border outline-none transition ${isDark
                        ? "bg-white/5 border-white/10 placeholder:text-white/30 focus:border-white/30"
                        : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-gray-400"}`}
                />
                <button type="submit"
                    className="px-3 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition active:scale-95"
                    style={{ backgroundColor: accentColor }}>
                    Add
                </button>
            </form>

            {/* Task list */}
            <div className="flex flex-col gap-1.5">
                <AnimatePresence>
                    {tasks.length === 0 && (
                        <motion.p
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-xs opacity-30 text-center py-4">
                            No tasks yet. Add one above!
                        </motion.p>
                    )}
                    {tasks.map(task => (
                        <motion.div key={task.id}
                            layout
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 12 }}
                            transition={{ duration: 0.18 }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${taskRowBg}`}
                            onClick={() => toggleTask(task.id)}>

                            {/* Checkbox */}
                            <div
                                className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center"
                                style={{
                                    borderColor: task.done ? accentColor : isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
                                    backgroundColor: task.done ? accentColor : "transparent",
                                }}>
                                {task.done && (
                                    <svg width="9" height="9" viewBox="0 0 12 12" fill="white">
                                        <polyline points="2,6 5,9 10,3" strokeWidth="2.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`flex-1 text-sm transition-all select-none ${task.done ? "line-through opacity-30" : "opacity-80"}`}>
                                {task.text}
                            </span>

                            {/* Remove — stop propagation so row click doesn't also toggle */}
                            <button
                                onClick={e => { e.stopPropagation(); removeTask(task.id); }}
                                className="opacity-0 group-hover:opacity-40 hover:!opacity-70 cursor-pointer transition-all p-1 flex-shrink-0 rounded-md hover:bg-black/5"
                                aria-label="Remove task">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
