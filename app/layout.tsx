import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "TimeSpot | Global Clock",
    description: "A clean dashboard clock experience.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased min-h-screen flex items-center justify-center p-4 lg:p-12">
                {children}
            </body>
        </html>
    );
}
