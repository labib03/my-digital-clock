"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const INSTALLED_KEY = "pwa-is-installed";

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const checkEligibility = useCallback(() => {
        if (typeof window === "undefined") return false;

        // 1. Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
            localStorage.setItem(INSTALLED_KEY, "true");
            return false;
        }

        if (localStorage.getItem(INSTALLED_KEY) === "true") return false;

        // 2. Check dismissal cool-down (24 hours)
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
            const lastDismissed = parseInt(dismissedAt, 10);
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (now - lastDismissed < oneDay) return false;
        }

        return true;
    }, []);

    const executeInstall = useCallback(async () => {
        if (!deferredPrompt) return;

        setShowConfirm(false);
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setIsInstalled(true);
            localStorage.setItem(INSTALLED_KEY, "true");
            window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: false }));
        }

        setIsVisible(false);
        setDeferredPrompt(null);
    }, [deferredPrompt]);

    const handleInstallRequest = useCallback(() => {
        if (deferredPrompt) {
            setShowConfirm(true);
        }
    }, [deferredPrompt]);

    useEffect(() => {
        const handleGlobalTrigger = () => handleInstallRequest();
        window.addEventListener("trigger-pwa-install", handleGlobalTrigger);

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            if (checkEligibility()) setIsVisible(true);
            window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: true }));
        };

        const installHandler = () => {
            setIsInstalled(true);
            localStorage.setItem(INSTALLED_KEY, "true");
            window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: false }));
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", installHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", installHandler);
            window.removeEventListener("trigger-pwa-install", handleGlobalTrigger);
        };
    }, [checkEligibility, handleInstallRequest]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    };

    if (isInstalled) return null;

    return (
        <>
            {/* ── Custom Confirmation Dialog ── */}
            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-[340px] bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <div className="flex flex-col items-center text-center gap-5">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold tracking-tight text-white">Install Mawaqit</h3>
                                    <p className="text-sm text-white/50 leading-relaxed font-medium">
                                        Unduh aplikasi Mawaqit ke perangkat Anda untuk akses lebih cepat dan pengalaman offline yang lebih baik.
                                    </p>
                                </div>
                                <div className="flex flex-col w-full gap-3 mt-2">
                                    <button
                                        onClick={executeInstall}
                                        className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg cursor-pointer"
                                    >
                                        Install Now
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold text-sm hover:text-white/70 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Bottom Install Banner ── */}
            <AnimatePresence>
                {isVisible && !showConfirm && (
                    <div className="pwa-install-banner" role="banner" aria-label="Install app prompt">
                        <div className="pwa-install-content">
                            <div className="pwa-install-icon-wrapper">⏱</div>
                            <div className="pwa-install-text">
                                <p className="pwa-install-title">Install Mawaqit</p>
                                <p className="pwa-install-subtitle">Add to home screen for quick access</p>
                            </div>
                        </div>
                        <div className="pwa-install-actions">
                            <button
                                id="pwa-install-btn"
                                className="pwa-btn pwa-btn-primary"
                                onClick={handleInstallRequest}
                            >
                                Install
                            </button>
                            <button
                                id="pwa-dismiss-btn"
                                className="pwa-btn pwa-btn-ghost"
                                onClick={handleDismiss}
                                aria-label="Dismiss install prompt"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
