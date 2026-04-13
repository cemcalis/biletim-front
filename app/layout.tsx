import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: " Near East Way ",
  description: "Kurumsal seyahat planlamasında güvenin adresi. Modern araç filosu, üst düzey konfor ve kesintisiz müşteri desteği.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${sourceSans.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

