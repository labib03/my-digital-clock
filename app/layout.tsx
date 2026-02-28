import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

export const viewport: Viewport = {
    themeColor: "#111827",
};

export const metadata: Metadata = {
    title: "Mawaqit",
    description: "A premium digital clock and Pomodoro timer.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Mawaqit",
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: [
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    },
};

import { LanguageProvider } from "@/components/shared/LanguageContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased min-h-screen flex flex-col">
                <LanguageProvider>
                    {children}
                    <PWAInstallPrompt />
                </LanguageProvider>
            </body>
        </html>
    );
}
