"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { PHASES } from "./_components/types";
import { playBell, createNoiseNode } from "./_components/audio";
import { usePomodoroStore } from "./_store/usePomodoroStore";
import { useLanguage } from "@/components/shared/LanguageContext";

import PomodoroHeader from "./_components/PomodoroHeader";
import SettingsPanel from "./_components/SettingsPanel";
import TimerSection from "./_components/TimerSection";
import TaskPanel from "./_components/TaskPanel";
import ThemeDecoration from "./_components/ThemeDecoration";

export default function PomodoroPage() {
    const { t } = useLanguage();
    
    const { 
        isDark, setIsFullscreen,
        phase, running, setRunning,
        timeLeft, tick, advancePhase, resetTimer, resetSession,
        sound
    } = usePomodoroStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // ── Refs ───────────────────────────────────────────────────────────────
    const workerRef = useRef<Worker | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const noiseGainRef = useRef<GainNode | null>(null);

    const stopWorker = useCallback(() => {
        workerRef.current?.postMessage({ type: "STOP" });
        setRunning(false);
    }, [setRunning]);

    const startWorker = useCallback(() => {
        workerRef.current?.postMessage({ type: "START" });
        setRunning(true);
    }, [setRunning]);

    // ── Web Worker Timer ───────────────────────────────────────────────────
    useEffect(() => {
        workerRef.current = new Worker("/timer.worker.js");
        workerRef.current.onmessage = () => {
            tick();
        };
        return () => workerRef.current?.terminate();
    }, [tick]);

    useEffect(() => {
        if (timeLeft === 0 && running) {
            ringBell();
            advancePhase();
        }
    }, [timeLeft, running, advancePhase]);

    // ── Audio ──────────────────────────────────────────────────────────────
    const getAudioCtx = () => {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        return audioCtxRef.current;
    };

    const stopNoise = () => {
        noiseNodeRef.current?.stop();
        noiseNodeRef.current = null;
        noiseGainRef.current = null;
    };

    const startNoise = useCallback((type: "white" | "brown") => {
        stopNoise();
        const ctx = getAudioCtx();
        const node = createNoiseNode(ctx, type);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        node.connect(gain);
        gain.connect(ctx.destination);
        node.start();
        noiseNodeRef.current = node;
        noiseGainRef.current = gain;
    }, []);

    useEffect(() => {
        if (sound === "off") { stopNoise(); return; }
        if (running && phase === "focus") startNoise(sound);
        else stopNoise();
    }, [sound, running, phase, startNoise]);

    const ringBell = () => {
        try {
            const ctx = getAudioCtx();
            if (ctx.state === "suspended") ctx.resume();
            playBell(ctx);
        } catch { }
    };

    // ── Handlers that need worker access ────────────────────────────────────
    const handleSkip = useCallback(() => {
        stopWorker();
        advancePhase();
    }, [stopWorker, advancePhase]);

    const handleReset = useCallback(() => {
        stopWorker();
        resetTimer();
    }, [stopWorker, resetTimer]);
    
    const handleResetSession = useCallback(() => {
        stopWorker();
        resetSession();
    }, [stopWorker, resetSession]);

    // ── Document title ─────────────────────────────────────────────────────
    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    useEffect(() => {
        const getPhaseLabel = () => {
            if (phase === "focus") return t('focus');
            if (phase === "short") return t('shortBreak');
            if (phase === "long") return t('longBreak');
            return "";
        };
        document.title = running
            ? `${fmt(timeLeft)} — ${getPhaseLabel()}`
            : "Pomodoro · Mawaqit";
        return () => { document.title = "Mawaqit"; };
    }, [timeLeft, running, phase, t]);

    // ── Fullscreen Logic ───────────────────────────────────────────────────
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, [setIsFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, [setIsFullscreen]);

    // Hydration safe render
    if (!mounted) return null;

    // ── Theme tokens ───────────────────────────────────────────────────────
    const bg = isDark ? "bg-[#0A0A0A]" : "bg-[#F2F3F5]";
    const text = isDark ? "text-[#F5F5F5]" : "text-[#111827]";
    const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200";

    return (
        <div className={`h-screen overflow-hidden ${bg} ${text} flex flex-col transition-colors duration-300`}>
            <ThemeDecoration />
            <PomodoroHeader
                cardBg={cardBg}
                onToggleFullscreen={toggleFullscreen}
            />
            <SettingsPanel cardBg={cardBg} />
            <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0 scroll-smooth">
                <TimerSection 
                    onPlayPause={running ? stopWorker : startWorker} 
                    onReset={handleReset}
                    onResetSession={handleResetSession}
                    onSkip={handleSkip}
                />
                <TaskPanel />
            </main>
        </div>
    );
}
