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
  title: "Playbeat TV — Free Live TV & Streaming, No Login",
  description:
    "Turn up the moment. Watch 7,985+ public free-to-air TV channels free in your browser — live news, sports, movies, series and anime. No login, no tracking, no ads, powered by the open-source iptv-org index.",
  keywords: [
    "Playbeat TV",
    "free live TV",
    "open streaming",
    "IPTV",
    "free-to-air channels",
    "iptv-org",
    "no login streaming",
  ],
  authors: [{ name: "Playbeat TV" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Playbeat TV — Free Live TV & Streaming, No Login",
    description:
      "7,985+ public free-to-air channels in your browser. No login, no tracking — only open-source, copyright-safe sources.",
    url: "https://chat.z.ai",
    siteName: "Playbeat TV",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playbeat TV — Free Live TV & Streaming, No Login",
    description:
      "7,985+ public free-to-air channels in your browser. No login, no tracking — only open-source, copyright-safe sources.",
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
