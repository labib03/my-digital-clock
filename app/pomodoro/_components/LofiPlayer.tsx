"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Station {
    id: string;
    name: string;
    mood: string;
    emoji: string;
    custom?: boolean;
}

// ─── Default stations (only 1 guaranteed to work as a baseline) ───────────────
const DEFAULT_STATIONS: Station[] = [
    { id: "jfKfPfyJRdk", name: "Lofi Hip Hop", mood: "Beats to relax/study", emoji: "☕" },
];

// ─── YouTube URL → ID parser ──────────────────────────────────────────────────
function parseYouTubeId(input: string): string | null {
    const trimmed = input.trim();
    // Direct 11-char video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
        const url = new URL(trimmed);
        if (url.searchParams.get("v")) return url.searchParams.get("v");      // watch?v=
        if (url.hostname === "youtu.be") return url.pathname.slice(1);          // youtu.be/
        if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1].split("?")[0]; // /shorts/
        if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1].split("?")[0];  // /embed/
    } catch { /* not a URL */ }
    return null;
}

// ─── YouTube IFrame types ─────────────────────────────────────────────────────
interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    cueVideoById: (videoId: string) => void;
    loadVideoById: (videoId: string) => void;
    setVolume: (volume: number) => void;
    getVolume: () => number;
    destroy: () => void;
}

declare global {
    interface Window {
        YT: {
            Player: new (elementId: string, config: object) => YTPlayer;
            PlayerState: { PLAYING: number; PAUSED: number; BUFFERING: number; ENDED: number; UNSTARTED: number };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

// ─── Waveform visual ──────────────────────────────────────────────────────────
function Waveform({ color }: { color: string }) {
    return (
        <div className="flex items-center gap-[2px]" aria-hidden="true">
            {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
                <motion.div key={i} className="w-[3px] rounded-full"
                    style={{ backgroundColor: color, height: 14 }}
                    animate={{ scaleY: [h, 1, h * 0.5, 0.9, h] }}
                    transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                />
            ))}
        </div>
    );
}

// ─── LofiPlayer ───────────────────────────────────────────────────────────────
interface LofiPlayerProps {
    isDark: boolean;
    accentColor: string;
}

const STORAGE_KEY = "pomodoro-lofi-stations";

export default function LofiPlayer({ isDark, accentColor }: LofiPlayerProps) {
    const playerRef = useRef<YTPlayer | null>(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [volume, setVolume] = useState(60);
    const [expanded, setExpanded] = useState(true);

    // ── Stations (default + custom from localStorage) ──────────────────────
    const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
    const [stationIdx, setStationIdx] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [addError, setAddError] = useState("");

    // Load custom stations from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const custom: Station[] = JSON.parse(saved);
                setStations([...DEFAULT_STATIONS, ...custom]);
            }
        } catch { /* ignore */ }
    }, []);

    const persistCustom = (all: Station[]) => {
        const custom = all.filter(s => s.custom);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    };

    const station = stations[stationIdx] ?? stations[0];
    const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200";
    const inputCls = isDark
        ? "bg-white/5 border-white/10 placeholder:text-white/30 focus:border-white/30"
        : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-gray-400";

    // ── YouTube IFrame API init ────────────────────────────────────────────
    const initPlayer = useCallback(() => {
        if (!window.YT?.Player) return;
        if (playerRef.current) return;
        new window.YT.Player("yt-lofi-hidden", {
            videoId: DEFAULT_STATIONS[0].id,
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, rel: 0, iv_load_policy: 3 },
            events: {
                onReady: (event: { target: YTPlayer }) => {
                    playerRef.current = event.target;
                    event.target.setVolume(60);
                    setReady(true);
                },
                onStateChange: (event: { data: number }) => {
                    const s = window.YT.PlayerState;
                    setPlaying(event.data === s.PLAYING);
                    setBuffering(event.data === s.BUFFERING);
                },
            },
        });
    }, []);

    useEffect(() => {
        if (window.YT?.Player) { initPlayer(); return; }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prev === "function") prev();
            initPlayer();
        };
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const s = document.createElement("script");
            s.src = "https://www.youtube.com/iframe_api";
            s.async = true;
            document.head.appendChild(s);
        }
        return () => {
            playerRef.current?.destroy();
            playerRef.current = null;
        };
    }, [initPlayer]);

    // ── Controls ───────────────────────────────────────────────────────────
    const togglePlay = () => {
        if (!playerRef.current || !ready) return;
        playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    };

    const changeStation = (idx: number) => {
        setStationIdx(idx);
        if (!playerRef.current) return;
        const vid = stations[idx]?.id;
        if (!vid) return;
        if (playing) playerRef.current.loadVideoById(vid);
        else playerRef.current.cueVideoById(vid);
    };

    const handleVolume = (val: number) => {
        setVolume(val);
        playerRef.current?.setVolume(val);
    };

    // ── Add custom station ─────────────────────────────────────────────────
    const handleAddStation = () => {
        setAddError("");
        const videoId = parseYouTubeId(urlInput);
        if (!videoId) { setAddError("Invalid YouTube URL or video ID"); return; }
        const name = nameInput.trim() || "Custom Station";
        const newStation: Station = { id: videoId, name, mood: "Custom", emoji: "🎵", custom: true };
        const updated = [...stations, newStation];
        setStations(updated);
        persistCustom(updated);
        setUrlInput("");
        setNameInput("");
        setShowAddForm(false);
        // Auto-switch to new station
        changeStation(updated.length - 1);
        setStationIdx(updated.length - 1);
    };

    const removeStation = (idx: number) => {
        if (!stations[idx]?.custom) return;
        const updated = stations.filter((_, i) => i !== idx);
        setStations(updated);
        persistCustom(updated);
        if (stationIdx >= updated.length) {
            setStationIdx(0);
            changeStation(0);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <>
            {/* Hidden YouTube iframe target */}
            <div id="yt-lofi-hidden"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", top: -9999 }}
            />

            <div className={`w-full rounded-2xl border ${cardBg} overflow-hidden transition-colors duration-300`}>

                {/* ── Header (collapse toggle + play/pause) ── */}
                <div
                    role="button" tabIndex={0}
                    onClick={() => setExpanded(e => !e)}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && setExpanded(e => !e)}
                    className="w-full flex items-center justify-between px-4 py-3 gap-3 cursor-pointer hover:opacity-80 transition-opacity select-none"
                    aria-label="Toggle lofi player" aria-expanded={expanded}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-12 flex items-center justify-center">
                            {playing
                                ? <Waveform color={accentColor} />
                                : <div className="flex items-center gap-[2px]">
                                    {[10, 14, 8, 12, 6].map((h, i) => (
                                        <div key={i} className="w-[3px] rounded-full opacity-30" style={{ height: h, backgroundColor: "currentColor" }} />
                                    ))}
                                </div>
                            }
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold tracking-wide leading-tight">
                                {playing ? station.name : "Lofi Radio"}
                            </p>
                            <p className="text-[10px] opacity-40 leading-tight mt-0.5">
                                {playing ? station.mood : "Click ▶ to play"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={e => { e.stopPropagation(); togglePlay(); }}
                            disabled={!ready} whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md disabled:opacity-30"
                            style={{ backgroundColor: accentColor }}>
                            {buffering
                                ? <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" /></svg>
                                : playing
                                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            }
                        </motion.button>
                        <motion.svg animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-30 flex-shrink-0">
                            <polyline points="6 9 12 15 18 9" />
                        </motion.svg>
                    </div>
                </div>

                {/* ── Expanded panel ── */}
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                            <div className="px-4 pb-4 flex flex-col gap-3"
                                style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB"}` }}>

                                {/* Volume */}
                                <div className="flex items-center gap-3 pt-3">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40 flex-shrink-0">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    </svg>
                                    <div className="relative flex-1 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                                        <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${volume}%`, backgroundColor: accentColor }} />
                                        <input type="range" min={0} max={100} value={volume}
                                            onChange={e => handleVolume(Number(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Volume" />
                                    </div>
                                    <span className="text-[10px] opacity-30 w-6 text-right geo-nums">{volume}</span>
                                </div>

                                {/* Stations list */}
                                <div className="flex flex-col gap-1">
                                    {stations.map((s, i) => {
                                        const active = stationIdx === i;
                                        return (
                                            <div key={`${s.id}-${i}`} className="flex items-center gap-1.5">
                                                <button onClick={() => changeStation(i)}
                                                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${active
                                                            ? "text-white shadow-md"
                                                            : isDark
                                                                ? "border-white/10 hover:bg-white/5"
                                                                : "border-gray-200 hover:bg-gray-50"
                                                        }`}
                                                    style={active ? { backgroundColor: accentColor, borderColor: accentColor } : {}}>
                                                    <span className="text-sm flex-shrink-0">{s.emoji}</span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`font-semibold truncate leading-tight ${active ? "text-white" : ""}`} style={{ fontSize: 10 }}>{s.name}</p>
                                                        <p className={`truncate leading-tight ${active ? "opacity-75" : "opacity-40"}`} style={{ fontSize: 9 }}>{s.mood}</p>
                                                    </div>
                                                    {active && playing && <Waveform color="white" />}
                                                </button>
                                                {/* Remove button for custom stations */}
                                                {s.custom && (
                                                    <button onClick={() => removeStation(i)}
                                                        className="w-6 h-6 rounded-lg flex items-center justify-center opacity-30 hover:opacity-70 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
                                                        aria-label="Remove station">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add custom station */}
                                <AnimatePresence>
                                    {showAddForm ? (
                                        <motion.div key="form"
                                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                            className="flex flex-col gap-2">
                                            <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                                                placeholder="YouTube URL or video ID..."
                                                className={`text-xs px-3 py-2 rounded-lg border outline-none transition w-full ${inputCls}`} />
                                            <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                                                placeholder="Station name (optional)"
                                                className={`text-xs px-3 py-2 rounded-lg border outline-none transition w-full ${inputCls}`} />
                                            {addError && <p className="text-[10px] text-red-400">{addError}</p>}
                                            <div className="flex gap-2">
                                                <button onClick={handleAddStation}
                                                    className="flex-1 py-1.5 rounded-lg text-white text-[10px] font-bold cursor-pointer transition active:scale-95"
                                                    style={{ backgroundColor: accentColor }}>
                                                    Add Station
                                                </button>
                                                <button onClick={() => { setShowAddForm(false); setAddError(""); }}
                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border transition ${isDark ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.button key="btn"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            onClick={() => setShowAddForm(true)}
                                            className={`w-full py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-80 cursor-pointer transition flex items-center justify-center gap-1.5 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                            Add YouTube station
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                <p className="text-[9px] opacity-20 text-center">
                                    Streams via YouTube · paste any YouTube URL or video ID
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
