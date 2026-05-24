import type { Metadata, Viewport } from "next";
import "./globals.css";

const metadataBase =
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.length > 0
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Doodle Duel",
    template: "%s | Doodle Duel",
  },
  description:
    "A daily drawing challenge where the community votes and ranks art in TinderArt.",
  applicationName: "Doodle Duel",
  appleWebApp: {
    capable: true,
    title: "Doodle Duel",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f1e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
