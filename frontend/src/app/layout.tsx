import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fit-Promo",
  description: "AI-powered beauty promotional image generation by target segment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <header className="border-b border-border/60 bg-background/90 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-foreground tracking-tight">
                Fit-Promo
              </h1>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                AI 뷰티 프로모션 이미지 생성
              </span>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
