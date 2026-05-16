"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "./types";
import { useLanguage } from "@/components/shared/LanguageContext";
import { Gift, Sword, Trash2, Plus, Check, Frown } from "lucide-react";

interface TaskListProps {
    isDark: boolean;
    accentColor: string;
}

export default function TaskList({ isDark, accentColor }: TaskListProps) {
    const { t } = useLanguage();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [claimedTasks, setClaimedTasks] = useState<Task[]>([]);
    const [input, setInput] = useState("");

    const gamePanel = isDark
        ? "bg-[#1E1E24] border-[3px] border-[#0F0F13] shadow-[0_4px_0_#0F0F13]"
        : "bg-white border-[3px] border-[#E2E8F0] shadow-[0_4px_0_#CBD5E1]";

    const taskRowBg = isDark ? "bg-[#2A2A35] border-2 border-[#0F0F13]" : "bg-gray-50 border-2 border-[#E2E8F0]";

    useEffect(() => {
        const saved = localStorage.getItem("pomodoro-tasks");
        const savedClaimed = localStorage.getItem("pomodoro-claimed-tasks");

        if (saved) setTasks(JSON.parse(saved));
        if (savedClaimed) {
            try {
                setClaimedTasks(JSON.parse(savedClaimed));
            } catch (e) {
                setClaimedTasks([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
        localStorage.setItem("pomodoro-claimed-tasks", JSON.stringify(claimedTasks));
    }, [tasks, claimedTasks]);

    const addTask = () => {
        if (!input.trim()) return;
        setTasks(prev => [{ id: Date.now().toString(), text: input.trim(), done: false }, ...prev]);
        setInput("");
    };

    const toggleTask = (id: string) =>
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    const removeTask = (id: string) =>
        setTasks(prev => prev.filter(t => t.id !== id));

    const claimTask = (id: string) => {
        const taskToClaim = tasks.find(t => t.id === id);
        if (taskToClaim) {
            setTasks(prev => prev.filter(t => t.id !== id));
            setClaimedTasks(prev => [{ ...taskToClaim, done: true }, ...prev]);
        }
    };

    const resetQuests = () => {
        setTasks([]);
        setClaimedTasks([]);
    };

    const claimedCount = claimedTasks.length;
    const totalQuests = tasks.length + claimedCount;
    const progressPct = totalQuests === 0 ? 0 : (claimedCount / totalQuests) * 100;

    return (
        <div className={`w-full rounded-3xl ${gamePanel} p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 transition-colors duration-300`}>

            {/* Quest Progress Bar */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                        <Sword size={16} /> Daily Quests
                    </p>
                    <span className="text-[10px] sm:text-xs font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">
                        {claimedCount} / {totalQuests} Claimed
                    </span>
                </div>
                <div className={`h-4 sm:h-5 rounded-full p-0.5 border-2 ${isDark ? 'bg-black/20 border-white/5' : 'bg-black/5 border-black/5'} flex items-center relative overflow-hidden`}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: accentColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Input Quest Baru */}
            <form onSubmit={e => { e.preventDefault(); addTask(); }} className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter new quest..."
                    className={`flex-1 text-xs sm:text-sm font-bold px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition ${isDark
                        ? "bg-[#0F0F13] border-[#2A2A35] placeholder:text-white/20 focus:border-white/20"
                        : "bg-gray-100 border-gray-200 placeholder:text-gray-400 focus:border-gray-400"}`}
                />
                <button type="submit"
                    className="w-11 sm:w-12 rounded-xl text-white flex items-center justify-center transition-transform active:scale-90 border-b-4 border-black/20"
                    style={{ backgroundColor: accentColor }}>
                    <Plus strokeWidth={3} />
                </button>
            </form>

            {/* Active Task List */}
            <motion.div layout className="flex flex-col gap-2 overflow-hidden pb-1">
                <AnimatePresence mode="wait">
                    {tasks.length === 0 && claimedTasks.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full flex flex-col items-center justify-center gap-3 py-8 text-center"
                        >
                            <Frown size={32} className="opacity-20" />
                            <p className="text-xs font-bold opacity-30 uppercase tracking-widest">
                                No active quests
                            </p>
                        </motion.div>
                    ) : (
                        /* Membungkus daftar tugas dalam motion.div untuk menjaga stabilitas layout */
                        <motion.div
                            key="list-container"
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col gap-2"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {tasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                                        transition={{ duration: 0.2 }}
                                        className={`w-full flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3 sm:py-2.5 rounded-2xl ${taskRowBg}`}
                                    >
                                        {/* ... Isi komponen task sama seperti sebelumnya ... */}
                                        <div className="flex-1 flex items-center gap-3 pl-1">
                                            <button onClick={() => toggleTask(task.id)}
                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${task.done ? 'border-transparent' : (isDark ? 'border-white/20' : 'border-black/20')}`}
                                                style={{ backgroundColor: task.done ? accentColor : 'transparent' }}>
                                                {task.done && <Check size={14} strokeWidth={4} color="white" />}
                                            </button>
                                            <span className={`text-xs sm:text-sm font-bold transition-all`}>
                                                {task.text}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 justify-end">
                                            <button onClick={() => removeTask(task.id)} className="w-8 h-8 flex items-center justify-center opacity-30 hover:opacity-100 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>

                                            <AnimatePresence mode="wait">
                                                {task.done ? (
                                                    <motion.button key="claim"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        onClick={() => claimTask(task.id)}
                                                        className="px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase text-yellow-900 bg-yellow-400 shadow-[0_3px_0_#A16207] active:scale-95 active:shadow-none active:translate-y-[3px] transition-all relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                                                        <span className="relative z-10">CLAIM</span>
                                                    </motion.button>
                                                ) : (
                                                    <motion.button key="go"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        onClick={() => toggleTask(task.id)}
                                                        className="px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase bg-black/10 dark:bg-white/10 opacity-50 hover:opacity-100 active:scale-95 transition-all">
                                                        GO
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Claimed Rewards Section */}
            <AnimatePresence>
                {claimedTasks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        // Ditambahkan overflow-x-hidden di sini
                        className="flex flex-col gap-3 mt-2 pt-4 border-t-2 border-dashed border-black/10 dark:border-white/10 overflow-x-hidden overflow-y-hidden"
                    >
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                            <Gift size={14} /> Claimed Rewards
                        </p>
                        <div className="flex flex-col gap-2">
                            <AnimatePresence initial={false}>
                                {claimedTasks.map(task => (
                                    <motion.div key={task.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        // Ditambahkan w-full di sini
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl opacity-60 ${taskRowBg}`}>

                                        <div className="w-5 h-5 rounded border-2 border-transparent flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
                                            <Check size={12} strokeWidth={4} color="white" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold line-through truncate opacity-70 flex-1 pl-1">
                                            {task.text}
                                        </span>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.1, duration: 0.2 }}
                                            className="ml-auto text-[10px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md flex-shrink-0">
                                            +EXP
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {totalQuests > 0 && (
                <button onClick={resetQuests} className="text-[10px] font-bold opacity-30 hover:opacity-100 uppercase tracking-widest mt-2 transition-opacity self-center">
                    Reset Quest Board
                </button>
            )}
        </div>
    );
}