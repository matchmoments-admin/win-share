import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "WinPost — Celebration Posts for Service Businesses",
    template: "%s | WinPost",
  },
  description:
    "Generate branded celebration posts for social media in 30 seconds. Just Financed! Just Cleaned! Just Delivered!",
  keywords: [
    "social media posts",
    "celebration posts",
    "branded content",
    "mortgage broker marketing",
    "service business marketing",
    "social media marketing",
  ],
  openGraph: {
    title: "WinPost — Celebration Posts for Service Businesses",
    description:
      "Generate branded celebration posts for social media in 30 seconds.",
    type: "website",
    siteName: "WinPost",
  },
  twitter: {
    card: "summary_large_image",
    title: "WinPost — Celebration Posts for Service Businesses",
    description:
      "Generate branded celebration posts for social media in 30 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
