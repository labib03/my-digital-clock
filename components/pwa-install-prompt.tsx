"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed as PWA
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => setIsInstalled(true));

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsInstalled(true);
        }
        setIsVisible(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => setIsVisible(false);

    if (isInstalled || !isVisible) return null;

    return (
        <div className="pwa-install-banner" role="banner" aria-label="Install app prompt">
            <div className="pwa-install-content">
                <div className="pwa-install-icon">⏱</div>
                <div className="pwa-install-text">
                    <p className="pwa-install-title">Install Mawaqit</p>
                    <p className="pwa-install-subtitle">Add to home screen for quick access</p>
                </div>
            </div>
            <div className="pwa-install-actions">
                <button
                    id="pwa-install-btn"
                    className="pwa-btn pwa-btn-primary"
                    onClick={handleInstall}
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
    );
}
