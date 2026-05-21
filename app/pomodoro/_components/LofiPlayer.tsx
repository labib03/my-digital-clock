"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/shared/LanguageContext";
import { Radio, Play, Pause, ChevronDown, Plus, X } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Station {
    id: string;
    name: string;
    mood: string;
    emoji: string;
    custom?: boolean;
}

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
        YT: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}

// ─── YouTube URL Parser ───────────────────────────────────────────────────────
function parseYouTubeId(input: string): string | null {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
        const url = new URL(trimmed);
        if (url.searchParams.get("v")) return url.searchParams.get("v");
        if (url.hostname === "youtu.be") return url.pathname.slice(1);
        if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/shorts/")[1].split("?")[0];
        if (url.pathname.startsWith("/embed/")) return url.pathname.split("/embed/")[1].split("?")[0];
    } catch { }
    return null;
}

function Waveform({ color }: { color: string }) {
    return (
        <div className="flex items-center gap-[3px]" aria-hidden="true">
            {[0.5, 1, 0.5].map((h, i) => (
                <motion.div key={i} className="w-[4.5px] rounded-full"
                    style={{ backgroundColor: color, height: 16 }}
                    animate={{ scaleY: [h, 1, h * 0.5, 1, h] }}
                    transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                />
            ))}
        </div>
    );
}

interface LofiPlayerProps {
    isDark: boolean;
    accentColor: string;
    onExpandedChange?: (expanded: boolean) => void;
}

const STORAGE_KEY = "pomodoro-lofi-stations";

export default function LofiPlayer({ isDark, accentColor, onExpandedChange }: LofiPlayerProps) {
    const { t } = useLanguage();
    const playerRef = useRef<YTPlayer | null>(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [volume, setVolume] = useState(60);
    const [expanded, setExpanded] = useState(false);

    const DEFAULT_STATIONS: Station[] = [
        { id: "jfKfPfyJRdk", name: t('lofiHipHop'), mood: t('beatsToRelax'), emoji: "☕" },
    ];

    const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
    const [stationIdx, setStationIdx] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [nameInput, setNameInput] = useState("");

    const gamePanel = isDark
        ? "bg-[#1E1E24] border-[3px] border-[#0F0F13] shadow-[0_4px_0_#0F0F13]"
        : "bg-white border-[3px] border-[#E2E8F0] shadow-[0_4px_0_#CBD5E1]";

    // Memuat stasiun dari localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const custom: Station[] = JSON.parse(saved);
                setStations([...DEFAULT_STATIONS, ...custom]);
            }
        } catch { }
    }, []);

    const persistCustom = (all: Station[]) => {
        const custom = all.filter(s => s.custom);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    };

    const initPlayer = useCallback(() => {
        if (!window.YT || !window.YT.Player) return;
        if (playerRef.current) return;

        playerRef.current = new window.YT.Player("yt-lofi-hidden", {
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
    }, [DEFAULT_STATIONS]);

    useEffect(() => {
        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
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
        }
    }, [initPlayer]);

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

    const handleAddStation = () => {
        const videoId = parseYouTubeId(urlInput);
        if (!videoId) return;
        const name = nameInput.trim() || "Custom Station";
        const newStation: Station = { id: videoId, name, mood: "User Upload", emoji: "🎵", custom: true };
        const updated = [...stations, newStation];
        setStations(updated);
        persistCustom(updated);
        setUrlInput("");
        setNameInput("");
        setShowAddForm(false);
        changeStation(updated.length - 1);
    };

    const removeStation = (idx: number) => {
        if (!stations[idx]?.custom) return;
        const updated = stations.filter((_, i) => i !== idx);
        setStations(updated);
        persistCustom(updated);
        if (stationIdx >= updated.length) setStationIdx(0);
    };

    const station = stations[stationIdx] ?? stations[0];

    return (
        <>
            <div id="yt-lofi-hidden" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", top: -9999 }} />

            <div className={`w-full rounded-3xl ${gamePanel} overflow-hidden transition-colors duration-300`}>
                <div onClick={() => {
                    const next = !expanded;
                    setExpanded(next);
                    if (onExpandedChange) onExpandedChange(next);
                }}
                    className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none">

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-12 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/10 border-2 border-black/10 dark:border-white/10">
                            {playing ? <Waveform color={accentColor} /> : <Radio size={24} className="opacity-40" />}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black tracking-wide leading-tight uppercase">
                                {playing ? station.name : "Tavern Radio"}
                            </p>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">
                                {playing ? station.mood : "Comms Offline"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={e => { e.stopPropagation(); togglePlay(); }}
                            disabled={!ready}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-[0_3px_0_rgba(0,0,0,0.3)] disabled:opacity-50 active:scale-95 active:shadow-none active:translate-y-[3px] transition-all"
                            style={{ backgroundColor: accentColor }}>
                            {buffering
                                ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                : playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />
                            }
                        </motion.button>
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }} className="opacity-30 p-1">
                            <ChevronDown size={20} strokeWidth={3} />
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                            className="overflow-hidden bg-black/5 dark:bg-white/5 border-t-2 border-dashed border-black/10 dark:border-white/10"
                        >
                            <div className="p-5 flex flex-col gap-4">
                                {/* Volume Slider */}
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">VOL</span>
                                    <div className="relative flex-1 h-3 rounded-full bg-black/10 dark:bg-white/10 border-2 border-black/5 dark:border-white/5">
                                        <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${volume}%`, backgroundColor: accentColor }} />
                                        <input type="range" min={0} max={100} value={volume} onChange={e => { setVolume(Number(e.target.value)); playerRef.current?.setVolume(Number(e.target.value)); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                {/* Station List */}
                                <div className="flex flex-col gap-2 mt-2">
                                    {stations.map((s, i) => {
                                        const isActive = stationIdx === i;
                                        return (
                                            <div key={s.id} className="flex items-center gap-2">
                                                <button onClick={() => changeStation(i)}
                                                    className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-all text-left ${isActive ? 'border-transparent text-white' : (isDark ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5')}`}
                                                    style={isActive ? { backgroundColor: accentColor } : {}}>
                                                    <span className="text-sm">{s.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black uppercase truncate">{s.name}</p>
                                                        <p className={`text-[8px] font-bold uppercase truncate ${isActive ? 'opacity-70' : 'opacity-40'}`}>{s.mood}</p>
                                                    </div>
                                                </button>
                                                {s.custom && (
                                                    <button onClick={() => removeStation(i)} className="w-8 h-8 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
                                                        <X size={14} strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add Custom Form */}
                                {showAddForm ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="YouTube URL..." className="text-[10px] font-bold px-3 py-2 rounded-lg bg-black/10 dark:bg-white/10 outline-none" />
                                        <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Station Name..." className="text-[10px] font-bold px-3 py-2 rounded-lg bg-black/10 dark:bg-white/10 outline-none" />
                                        <div className="flex gap-2">
                                            <button onClick={handleAddStation} className="flex-1 py-2 rounded-lg bg-green-500 text-white text-[10px] font-black uppercase">Add</button>
                                            <button onClick={() => setShowAddForm(false)} className="flex-1 py-2 rounded-lg bg-black/20 text-[10px] font-black uppercase">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowAddForm(true)} className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl opacity-40 hover:opacity-100 transition-opacity mt-2">
                                        <Plus size={14} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase">Add Station</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}