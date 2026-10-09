import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PTE_UI_BOOTSTRAP_SCRIPT } from "@pte/ui";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PTE Prep | Clearer exam operations",
  description:
    "Plan learners, exam access, and PTE exam days from one clear organization workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${inter.className} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PTE_UI_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
