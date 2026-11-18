import type { Metadata } from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "next-themes";
import Navbar from "@/components/navbar";
import React from "react";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "MathViz", template: "%s · MathViz" },
  description: "Tracez, analysez et partagez des fonctions mathématiques en 2D, 3D et N dimensions.",
};

export default function RootLayout({children} : { children: React.ReactNode; }) {
  return (
    <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange storageKey="math-viz-theme">
                <Navbar />
                {children}
            </ThemeProvider>
        </body>
    </html>
  );
}

