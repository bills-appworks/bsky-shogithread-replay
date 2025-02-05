/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */
// Next.js
import type { Metadata } from "next";
import Script from 'next/script';
// Google Fonts
import { Klee_One, Noto_Sans_JP } from 'next/font/google';
// Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import "@/app/globals.css";

const kleeOne = Klee_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

// common.tsでのローディングのみだと失敗するケースがある場合の暫定対策
const notoSansJP = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

// Font Awesome用
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Re:将棋thread",
  description: "将棋threadの対局スレッドから棋譜を再生",
  metadataBase: new URL(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://re-shogithread.bills-appworks.net'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/*<!-- Google tag (gtag.js) -->*/}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-GLV44TDZ0X" />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-GLV44TDZ0X', {
                'cookie_flags': 'SameSite=None;Secure'
              });
            `,
          }}
        />
      </head>
      <body
        className={`${kleeOne.className} antialiased text-black`}
      >
        {children}
      </body>
    </html>
  );
}
