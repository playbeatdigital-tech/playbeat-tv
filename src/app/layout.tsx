import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awesome Zhuiju Free — Movie Collection Preview",
  description:
    "A browsable preview panel for the awesome-zhuiju-free curated index: 119 free movie & TV resources across 9 categories, with daily availability checks, risk flags, and maintainer ratings.",
  keywords: ["free streaming", "movie collection", "IPTV", "TVBox", "preview panel"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Awesome Zhuiju Free — Movie Collection Preview",
    description:
      "119 free movie & TV resources across 9 categories, with daily availability checks, risk flags, and maintainer ratings",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awesome Zhuiju Free — Movie Collection Preview",
    description:
      "119 free movie & TV resources across 9 categories, with daily availability checks, risk flags, and maintainer ratings",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
