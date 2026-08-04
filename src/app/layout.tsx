import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ReloCompass — Your Global Relocation Assistant",
  description:
    "AI-powered platform helping students and professionals from India & Nepal relocate abroad with confidence. Find accommodation, jobs, community, and essential relocation services.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReloCompass",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E2A45",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
