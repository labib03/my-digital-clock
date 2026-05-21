"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/shared/LanguageContext";
import {
  Gift,
  Sword,
  Trash2,
  Plus,
  Check,
  Frown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { usePomodoroStore } from "../_store/usePomodoroStore";
import { PHASES } from "./types";

export default function TaskList({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { t } = useLanguage();

  const {
    isDark,
    phase,
    tasks,
    claimedTasks,
    addTask,
    toggleTask,
    removeTask,
    claimTask,
    toggleActive,
    resetQuests,
  } = usePomodoroStore();

  const [input, setInput] = useState("");
  const [estimate, setEstimate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const accentColor = PHASES[phase].color;

  const gamePanel = isDark
    ? "bg-[#1E1E24] border-[3px] border-[#0F0F13] shadow-[0_4px_0_#0F0F13]"
    : "bg-white border-[3px] border-[#E2E8F0] shadow-[0_4px_0_#CBD5E1]";

  const taskRowBg = isDark
    ? "bg-[#2A2A35] border-2 border-[#0F0F13]"
    : "bg-gray-50 border-2 border-[#E2E8F0]";

  const handleAddTask = () => {
    if (!input.trim()) return;
    addTask({
      id: Date.now().toString(),
      text: input.trim(),
      done: false,
      estimatedPomodoros: estimate,
      completedPomodoros: 0,
      isActive: false,
    });
    setInput("");
    setEstimate(1);
  };

  const claimedCount = claimedTasks.length;
  const totalQuests = tasks.length + claimedCount;
  const progressPct =
    totalQuests === 0 ? 0 : (claimedCount / totalQuests) * 100;

  const innerContent = (
    <>
      {/* 1. Header (Always Visible) */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-[0_2px_0_rgba(0,0,0,0.2)]"
              style={{ backgroundColor: accentColor }}>
              <Sword className="w-5 h-5 opacity-90" />
            </div>
            <div>
              <h3 className="font-bold text-sm lg:text-base leading-none mb-1 opacity-80 uppercase tracking-widest">Daily Quests</h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider">{claimedCount}/{totalQuests} Claimed</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-50 hover:opacity-100"
            title="Expand to Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Always Visible) */}
        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 2. Body (Hidden when collapsed unless fullscreen) */}
      {!(isCollapsed && !isFullscreen) && (
        <>
          {/* Input Quest Baru */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddTask();
            }}
            className="flex gap-2 shrink-0"
          >
            <input
              type="number"
              min="1"
              max="10"
              value={estimate}
              onChange={(e) => setEstimate(parseInt(e.target.value) || 1)}
              className={`w-14 sm:w-16 text-center text-xs sm:text-sm font-bold px-2 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition ${
                isDark
                  ? "bg-[#0F0F13] border-[#2A2A35] focus:border-white/20"
                  : "bg-gray-100 border-gray-200 focus:border-gray-400"
              }`}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter new quest..."
              className={`flex-1 text-xs sm:text-sm font-bold px-4 py-2.5 sm:py-3 rounded-xl border-2 outline-none transition ${
                isDark
                  ? "bg-[#0F0F13] border-[#2A2A35] placeholder:text-white/20 focus:border-white/20"
                  : "bg-gray-100 border-gray-200 placeholder:text-gray-400 focus:border-gray-400"
              }`}
            />
            <button
              type="submit"
              className="w-11 sm:w-12 rounded-xl text-white flex items-center justify-center transition-transform active:scale-90 border-b-4 border-black/20"
              style={{ backgroundColor: accentColor }}
            >
              <Plus strokeWidth={3} />
            </button>
          </form>

          {/* Unified Scrollable Area for All Tasks */}
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pr-1 pb-1 gap-2">
            {/* Active Task List */}
            <motion.div layout className="flex flex-col gap-2 shrink-0">
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 && claimedTasks.length === 0 ? (
                  <motion.div
                    key="empty"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-6 sm:py-10 opacity-30 font-bold text-sm w-full"
                  >
                    No active quests. Add one to begin your journey!
                  </motion.div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      key={task.id}
                      className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-2xl ${taskRowBg} transition-colors w-full origin-top shrink-0`}
                      style={{
                        borderColor: task.isActive ? accentColor : undefined,
                      }}
                    >
                      {/* Checkbox area */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-colors ${task.done ? "text-white border-transparent" : "border-black/20 dark:border-white/20"}`}
                          style={{
                            backgroundColor: task.done
                              ? accentColor
                              : "transparent",
                          }}
                        >
                          {task.done && <Check size={14} strokeWidth={4} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => !task.done && toggleActive(task.id)}
                            className={`text-left w-full truncate font-bold text-sm sm:text-base ${task.done ? "line-through opacity-40" : "hover:opacity-80 transition-opacity"}`}
                          >
                            {task.text}
                          </button>
                          {/* Progress Pip */}
                          <div className="flex items-center gap-1 mt-1.5 opacity-60">
                            {Array.from({
                              length: Math.max(
                                task.estimatedPomodoros || 1,
                                task.completedPomodoros || 0,
                              ),
                            }).map((_, i) => {
                              const isCompleted =
                                i < (task.completedPomodoros || 0);
                              const isOvertime =
                                i >= (task.estimatedPomodoros || 1);
                              return (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isCompleted ? "" : "bg-black/10 dark:bg-white/10"}`}
                                  style={{
                                    backgroundColor: isCompleted
                                      ? isOvertime
                                        ? "#ef4444"
                                        : accentColor
                                      : undefined,
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Mobile action buttons */}
                        <div className="flex sm:hidden gap-2">
                          {task.done ? (
                            <button
                              onClick={() => claimTask(task.id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: accentColor }}
                            >
                              <Gift size={14} strokeWidth={2.5} />
                            </button>
                          ) : null}
                          <button
                            onClick={() => removeTask(task.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* Desktop action buttons */}
                      <div className="hidden sm:flex items-center gap-2 ml-auto">
                        {task.done ? (
                          <button
                            onClick={() => claimTask(task.id)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform active:scale-95 flex items-center gap-2"
                            style={{ backgroundColor: accentColor }}
                          >
                            <Gift size={14} strokeWidth={2.5} /> Claim
                          </button>
                        ) : null}
                        <button
                          onClick={() => removeTask(task.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>

            {/* Completed/Claimed Quests */}
            {claimedTasks.length > 0 && (
              <div className="mt-2 border-t border-black/5 dark:border-white/5 pt-4 shrink-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 px-2">
                  Completed Quests
                </p>
                <div className="flex flex-col gap-2">
                  {claimedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${taskRowBg} opacity-50 shrink-0`}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex flex-shrink-0 items-center justify-center text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold line-through truncate w-full">
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Quests Button */}
          {totalQuests > 0 && (
            <button
              onClick={resetQuests}
              className="mt-1 shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-red-500 mx-auto"
            >
              <Trash2 size={12} /> Clear All Quests
            </button>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      {/* Original Box */}
      <div
        className={`w-full ${isCollapsed ? '' : 'flex-1 min-h-[250px]'} shrink-0 rounded-3xl ${gamePanel} p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 transition-all duration-300 ${isFullscreen ? "opacity-0 pointer-events-none" : ""}`}
      >
        {!isFullscreen && innerContent}
      </div>

      {/* Modal Box */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 lg:p-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsFullscreen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-2xl h-full max-h-[85vh] rounded-3xl ${gamePanel} p-5 sm:p-8 flex flex-col gap-5 sm:gap-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]`}
              >
                {innerContent}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
