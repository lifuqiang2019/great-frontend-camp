import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BaiduAnalytics from "@/components/BaiduAnalytics";
import { Toaster } from 'sonner';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "大前端 - 沙包那么大，也可以装下一个人",
  description: "大前端 - 沙包那么大，也可以装下一个人",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BaiduAnalytics />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
