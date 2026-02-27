"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { PHASES, SESSIONS_UNTIL_LONG, type Phase, type SoundOption } from "./_components/types";
import { playBell, createNoiseNode } from "./_components/audio";

import PomodoroHeader from "./_components/PomodoroHeader";
import SettingsPanel from "./_components/SettingsPanel";
import TimerSection from "./_components/TimerSection";
import TaskPanel from "./_components/TaskPanel";

// ─── Pomodoro Page (orchestration only — no JSX details) ─────────────────────

export default function PomodoroPage() {
    // ── State ──────────────────────────────────────────────────────────────
    const [phase, setPhase] = useState<Phase>("focus");
    const [timeLeft, setTimeLeft] = useState(PHASES.focus.duration);
    const [running, setRunning] = useState(false);
    const [sessionsDone, setSessionsDone] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [customFocus, setCustomFocus] = useState(25);
    const [showSettings, setShowSettings] = useState(false);
    const [sound, setSound] = useState<SoundOption>("off");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // ── Refs ───────────────────────────────────────────────────────────────
    const workerRef = useRef<Worker | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const noiseGainRef = useRef<GainNode | null>(null);

    // ── Derived ────────────────────────────────────────────────────────────
    const current = PHASES[phase];
    const totalTime = phase === "focus" ? customFocus * 60 : current.duration;
    const pct = timeLeft / totalTime;
    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    // ── Web Worker Timer ───────────────────────────────────────────────────
    useEffect(() => {
        workerRef.current = new Worker("/timer.worker.js");
        workerRef.current.onmessage = () =>
            setTimeLeft(t => (t <= 1 ? 0 : t - 1));
        return () => workerRef.current?.terminate();
    }, []);

    useEffect(() => {
        if (timeLeft === 0 && running) advancePhase();
    }, [timeLeft]);

    const stopWorker = useCallback(() => {
        workerRef.current?.postMessage({ type: "STOP" });
        setRunning(false);
    }, []);

    const startWorker = useCallback(() => {
        workerRef.current?.postMessage({ type: "START" });
        setRunning(true);
    }, []);

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

    const ringBell = useCallback(() => {
        try {
            const ctx = getAudioCtx();
            if (ctx.state === "suspended") ctx.resume();
            playBell(ctx);
        } catch { }
    }, []);

    // ── Phase Logic ────────────────────────────────────────────────────────
    const advancePhase = useCallback(() => {
        stopWorker();
        ringBell();
        if (phase === "focus") {
            const next = sessionsDone + 1;
            setSessionsDone(next);
            if (next % SESSIONS_UNTIL_LONG === 0) {
                setPhase("long"); setTimeLeft(PHASES.long.duration);
            } else {
                setPhase("short"); setTimeLeft(PHASES.short.duration);
            }
        } else {
            setPhase("focus"); setTimeLeft(customFocus * 60);
        }
    }, [phase, sessionsDone, stopWorker, ringBell, customFocus]);

    const handleReset = () => {
        stopWorker();
        setTimeLeft(phase === "focus" ? customFocus * 60 : PHASES[phase].duration);
    };

    const handleResetSession = () => {
        stopWorker();
        setSessionsDone(0);
        setPhase("focus");
        setTimeLeft(customFocus * 60);
    };

    const switchPhase = (p: Phase) => {
        stopWorker();
        setPhase(p);
        setTimeLeft(p === "focus" ? customFocus * 60 : PHASES[p].duration);
    };

    // ── Document title ─────────────────────────────────────────────────────
    useEffect(() => {
        document.title = running
            ? `${fmt(timeLeft)} — ${current.label}`
            : "Pomodoro · Mawaqit";
        return () => { document.title = "Mawaqit"; };
    }, [timeLeft, running, current.label]);

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
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // ── Theme tokens — mirrors clock page exactly ──────────────────────────
    const bg = isDark ? "bg-[#0A0A0A]" : "bg-[#F2F3F5]";
    const text = isDark ? "text-[#F5F5F5]" : "text-[#111827]";
    const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className={`h-screen overflow-hidden ${bg} ${text} flex flex-col transition-colors duration-300`}>

            <PomodoroHeader
                isDark={isDark}
                cardBg={cardBg}
                isFullscreen={isFullscreen}
                onToggleSettings={() => setShowSettings(s => !s)}
                onToggleTheme={() => setIsDark(d => !d)}
                onToggleFullscreen={toggleFullscreen}
            />

            <SettingsPanel
                show={showSettings}
                isDark={isDark}
                cardBg={cardBg}
                customFocus={customFocus}
                sound={sound}
                accentColor={current.color}
                onFocusChange={setCustomFocus}
                onSoundChange={setSound}
            />

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                <TimerSection
                    isDark={isDark}
                    cardBg={cardBg}
                    phase={phase}
                    timeLeft={timeLeft}
                    running={running}
                    pct={pct}
                    sessionsDone={sessionsDone}
                    customFocus={customFocus}
                    fmt={fmt}
                    onSwitchPhase={switchPhase}
                    onReset={handleReset}
                    onResetSession={handleResetSession}
                    onPlayPause={running ? stopWorker : startWorker}
                    onSkip={advancePhase}
                />
                <TaskPanel
                    isDark={isDark}
                    accentColor={current.color}
                    customFocus={customFocus}
                />
            </main>
        </div>
    );
}
