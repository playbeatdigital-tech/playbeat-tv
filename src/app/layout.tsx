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
  title: "追剧免费资源 — 影视合集预览",
  description:
    "awesome-zhuiju-free 精选索引的可浏览预览面板：9 大分类共 119 个免费追剧资源，含每日可用性检测状态、风险标记与维护者评分。",
  keywords: ["追剧", "免费资源", "影视合集", "TVBox", "预览面板"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "追剧免费资源 — 影视合集预览",
    description: "9 大分类共 119 个免费追剧资源，含每日可用性检测状态、风险标记与维护者评分",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "追剧免费资源 — 影视合集预览",
    description: "9 大分类共 119 个免费追剧资源，含每日可用性检测状态、风险标记与维护者评分",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
