import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mainstream Basketball Club | Develop. Compete. Belong.",
    template: "%s | Mainstream Basketball Club",
  },
  description:
    "Mainstream Basketball Club develops players, builds community through basketball, and creates opportunities to compete, grow, and connect.",
  openGraph: {
    title: "Mainstream Basketball Club",
    description:
      "Developing players and building community through basketball.",
    type: "website",
    images: [{ url: "/logo.jpg", alt: "Mainstream Basketball Club" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mainstream Basketball Club",
    description:
      "Developing players and building community through basketball.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
