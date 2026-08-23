import type { Metadata } from "next";
import { Cairo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BAIGR Creative OS — نظام التشغيل الإبداعي بالذكاء الاصطناعي",
  description:
    "منظومة توليد المحتوى بالذكاء الاصطناعي — تُدار بالكامل من تيليجرام. اختر النوع، النموذج، القياس، والجودة، ودع النظام يبني ويوجّه وينتج المحتوى تلقائيًا.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans text-fg antialiased selection:bg-gold/30">
        {children}
      </body>
    </html>
  );
}
