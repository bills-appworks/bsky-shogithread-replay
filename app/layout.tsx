/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */
import type { Metadata } from "next";
import Script from 'next/script';
import { Klee_One, Noto_Sans_JP } from 'next/font/google';
import "@/app/globals.css";

const kleeOne = Klee_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

// common.tsでのローディングのみだと失敗するケースがある
const notoSansJP = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="ja">
      <body
        className={`${kleeOne.className} antialiased text-black`}
      >
        {children}
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

              gtag('config', 'G-GLV44TDZ0X');
            `,
          }}
        />
      </body>
    </html>
  );
}
