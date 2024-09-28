import type { Metadata } from "next";
//import localFont from "next/font/local";
import { Klee_One, Noto_Sans_JP } from 'next/font/google';
import "./globals.css";

/*
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
*/
const kleeOne = Klee_One({
  weight: '400',
  subsets: ['latin'],
});

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Re:将棋thread",
  description: "将棋threadの対局スレッドから棋譜を再生",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
/*        className={`${geistSans.variable} ${geistMono.variable} antialiased`} */
        className={`${kleeOne.className}`}
      >
        {children}
      </body>
    </html>
  );
}
