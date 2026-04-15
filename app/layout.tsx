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
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-center gap-6 md:gap-10">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Auto Builder
            </Link>
            <Link href="/manual" className="text-sm font-medium transition-colors hover:text-primary">
              Manual Builder
            </Link>
            <Link href="/my-sessions" className="text-sm font-medium transition-colors hover:text-primary">
              My Sessions
            </Link>
            <Link href="/favorites" className="text-sm font-medium transition-colors hover:text-primary">
              Favorites
            </Link>
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </Link>
          </div>
        </nav>
        <main className="container py-6">
          {children}
        </main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
