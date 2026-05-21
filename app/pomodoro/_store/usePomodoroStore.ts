import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Phase, SoundOption, DEFAULT_SETTINGS, Task } from '../_components/types';

interface PomodoroState {
    // Settings
    customFocus: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLong: number;
    sound: SoundOption;

    // Session
    phase: Phase;
    running: boolean;
    timeLeft: number;
    sessionsDone: number;

    // UI
    isDark: boolean;
    showSettings: boolean;
    isFullscreen: boolean;

    // Tasks
    tasks: Task[];
    claimedTasks: Task[];
    activeTaskName: string | null;

    // Actions
    setCustomFocus: (val: number) => void;
    setShortBreakDuration: (val: number) => void;
    setLongBreakDuration: (val: number) => void;
    setSessionsUntilLong: (val: number) => void;
    setSound: (val: SoundOption) => void;

    setPhase: (p: Phase) => void;
    setRunning: (val: boolean) => void;
    setTimeLeft: (val: number | ((prev: number) => number)) => void;
    tick: () => void;
    advancePhase: () => void;
    resetSession: () => void;
    resetTimer: () => void;

    setIsDark: (val: boolean | ((prev: boolean) => boolean)) => void;
    setShowSettings: (val: boolean | ((prev: boolean) => boolean)) => void;
    setIsFullscreen: (val: boolean) => void;

    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    toggleTask: (id: string) => void;
    toggleActive: (id: string) => void;
    removeTask: (id: string) => void;
    claimTask: (id: string) => void;
    clearClaimedTasks: () => void;
    resetQuests: () => void;
    setActiveTaskName: (name: string | null) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
    persist(
        (set, get) => ({
            // Initial Settings
            customFocus: DEFAULT_SETTINGS.focusDuration,
            shortBreakDuration: DEFAULT_SETTINGS.shortBreakDuration,
            longBreakDuration: DEFAULT_SETTINGS.longBreakDuration,
            sessionsUntilLong: DEFAULT_SETTINGS.sessionsUntilLong,
            sound: "off",

            // Initial Session
            phase: "focus",
            running: false,
            timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
            sessionsDone: 0,

            // Initial UI
            isDark: false,
            showSettings: false,
            isFullscreen: false,

            // Initial Tasks
            tasks: [],
            claimedTasks: [],
            activeTaskName: null,

            // Setters for Settings
            setCustomFocus: (val) => set((state) => {
                const updates: Partial<PomodoroState> = { customFocus: val };
                if (!state.running && state.phase === "focus") {
                    updates.timeLeft = val * 60;
                }
                return updates;
            }),
            setShortBreakDuration: (val) => set((state) => {
                const updates: Partial<PomodoroState> = { shortBreakDuration: val };
                if (!state.running && state.phase === "short") {
                    updates.timeLeft = val * 60;
                }
                return updates;
            }),
            setLongBreakDuration: (val) => set((state) => {
                const updates: Partial<PomodoroState> = { longBreakDuration: val };
                if (!state.running && state.phase === "long") {
                    updates.timeLeft = val * 60;
                }
                return updates;
            }),
            setSessionsUntilLong: (val) => set({ sessionsUntilLong: val }),
            setSound: (val) => set({ sound: val }),

            // Session Actions
            setPhase: (p) => set((state) => {
                let newTimeLeft = state.customFocus * 60;
                if (p === "short") newTimeLeft = state.shortBreakDuration * 60;
                if (p === "long") newTimeLeft = state.longBreakDuration * 60;
                return { phase: p, timeLeft: newTimeLeft, running: false };
            }),
            setRunning: (val) => set({ running: val }),
            setTimeLeft: (val) => set((state) => ({
                timeLeft: typeof val === "function" ? val(state.timeLeft) : val
            })),
            tick: () => set((state) => ({
                timeLeft: state.timeLeft <= 1 ? 0 : state.timeLeft - 1
            })),
            advancePhase: () => set((state) => {
                // If it was focus, increment sessionsDone and choose break
                if (state.phase === "focus") {
                    const nextSessionsDone = state.sessionsDone + 1;
                    const isLongBreak = nextSessionsDone % state.sessionsUntilLong === 0;
                    
                    // Increment completedPomodoros for active task if exists
                    const updatedTasks = state.tasks.map(t => 
                        t.isActive ? { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 } : t
                    );

                    return {
                        sessionsDone: nextSessionsDone,
                        phase: isLongBreak ? "long" : "short",
                        timeLeft: isLongBreak ? state.longBreakDuration * 60 : state.shortBreakDuration * 60,
                        running: false,
                        tasks: updatedTasks
                    };
                } else {
                    // Back to focus
                    return {
                        phase: "focus",
                        timeLeft: state.customFocus * 60,
                        running: false
                    };
                }
            }),
            resetSession: () => set((state) => ({
                sessionsDone: 0,
                phase: "focus",
                timeLeft: state.customFocus * 60,
                running: false
            })),
            resetTimer: () => set((state) => {
                let t = state.customFocus * 60;
                if (state.phase === "short") t = state.shortBreakDuration * 60;
                if (state.phase === "long") t = state.longBreakDuration * 60;
                return { timeLeft: t, running: false };
            }),

            // UI Actions
            setIsDark: (val) => set((state) => ({
                isDark: typeof val === "function" ? val(state.isDark) : val
            })),
            setShowSettings: (val) => set((state) => ({
                showSettings: typeof val === "function" ? val(state.showSettings) : val
            })),
            setIsFullscreen: (val) => set({ isFullscreen: val }),

            // Tasks Actions
            addTask: (task) => set((state) => ({ tasks: [{ ...task, id: Date.now().toString() }, ...state.tasks] })),
            updateTask: (id, updates) => set((state) => {
                const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
                const active = updatedTasks.find(t => t.isActive && !t.done);
                return { tasks: updatedTasks, activeTaskName: active ? active.text : null };
            }),
            toggleTask: (id) => set((state) => {
                const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, done: !t.done, isActive: !t.done ? false : t.isActive } : t);
                const active = updatedTasks.find(t => t.isActive && !t.done);
                return { tasks: updatedTasks, activeTaskName: active ? active.text : null };
            }),
            toggleActive: (id) => set((state) => {
                const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, isActive: !t.isActive } : { ...t, isActive: false });
                const active = updatedTasks.find(t => t.isActive && !t.done);
                return { tasks: updatedTasks, activeTaskName: active ? active.text : null };
            }),
            removeTask: (id) => set((state) => {
                const filtered = state.tasks.filter(t => t.id !== id);
                const active = filtered.find(t => t.isActive && !t.done);
                return { tasks: filtered, activeTaskName: active ? active.text : null };
            }),
            claimTask: (id) => set((state) => {
                const task = state.tasks.find(t => t.id === id);
                if (!task) return state;
                const completedTask = { ...task, done: true, isActive: false };
                const filtered = state.tasks.filter(t => t.id !== id);
                const active = filtered.find(t => t.isActive && !t.done);
                return { 
                    tasks: filtered, 
                    claimedTasks: [completedTask, ...state.claimedTasks],
                    activeTaskName: active ? active.text : null
                };
            }),
            clearClaimedTasks: () => set({ claimedTasks: [] }),
            resetQuests: () => set({ tasks: [], claimedTasks: [], activeTaskName: null }),
            setActiveTaskName: (name) => set({ activeTaskName: name }),
        }),
        {
            name: 'pomodoro-storage',
            partialize: (state) => ({
                customFocus: state.customFocus,
                shortBreakDuration: state.shortBreakDuration,
                longBreakDuration: state.longBreakDuration,
                sessionsUntilLong: state.sessionsUntilLong,
                sound: state.sound,
                phase: state.phase,
                timeLeft: state.timeLeft,
                sessionsDone: state.sessionsDone,
                isDark: state.isDark,
                tasks: state.tasks,
                claimedTasks: state.claimedTasks,
                activeTaskName: state.activeTaskName,
            }),
        }
    )
);
