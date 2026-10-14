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
  title: "OpenStream — Free Live TV, No Login",
  description:
    "Watch 7,985+ public free-to-air TV channels in your browser. Open streaming app with no login, no tracking, and no ads — built from the awesome-zhuiju-free repository's copyright-safe subset, powered by the open-source iptv-org index.",
  keywords: [
    "free live TV",
    "open streaming",
    "IPTV",
    "free-to-air channels",
    "iptv-org",
    "no login streaming",
  ],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "OpenStream — Free Live TV, No Login",
    description:
      "7,985+ public free-to-air channels in your browser. No login, no tracking — only open-source, copyright-safe sources.",
    url: "https://chat.z.ai",
    siteName: "OpenStream",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenStream — Free Live TV, No Login",
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
