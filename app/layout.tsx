import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grassroots Football Session Planner",
  description: "Quickly plan and export training sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-muted/30`}>
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container flex h-16 items-center justify-between gap-6 px-4 md:px-8 mx-auto">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground p-1.5 rounded-lg font-black text-xl">FP</span>
              <span className="font-bold tracking-tight hidden sm:inline-block italic">Session Planner</span>
            </div>
            <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
              <Link href="/" className="text-sm font-semibold transition-all hover:text-primary relative group">
                Auto Builder
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/manual" className="text-sm font-semibold transition-all hover:text-primary relative group">
                Manual Builder
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/my-sessions" className="text-sm font-semibold transition-all hover:text-primary relative group">
                My Sessions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/favorites" className="text-sm font-semibold transition-all hover:text-primary relative group">
                Favorites
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/admin" className="text-sm font-semibold transition-all hover:text-primary relative group">
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            </div>
          </div>
        </nav>
        <main className="container max-w-7xl mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
