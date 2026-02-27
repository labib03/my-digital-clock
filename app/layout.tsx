import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: "Mawaqit",
    description: "A clean clock.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased min-h-screen flex flex-col">
                {children}
            </body>
        </html>
    );
}
