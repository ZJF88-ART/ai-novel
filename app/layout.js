import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Novel Studio - AI辅助网文创作工具",
  description: "免费AI网文创作工具，支持世界观设定、AI续写、多平台切换、中英文界面。DeepSeek/智谱/Agnes AI驱动，助你从设定到成稿全流程提效。",
  keywords: "AI写小说,网文创作,AI续写,小说大纲生成,AI写作工具,DeepSeek写作,网文助手",
  openGraph: {
    title: "AI Novel Studio - AI辅助网文创作工具",
    description: "免费AI网文创作工具，支持世界观设定、AI续写、多平台切换",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
