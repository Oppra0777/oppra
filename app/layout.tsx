import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// One family, one weight range: the landing page never renders monospace text,
// so a second font would only add a render-blocking preload.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "Oppra — Your team. One loop. | Join the Waitlist",
  description:
    "Bring your tasks, teams, and reports together with Oppra. A simpler way to manage team and field operations, online or offline. Join the waitlist for launch updates.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Oppra — Your team. One loop.",
    description: "A better way to work is coming. Join the Oppra waitlist and be first in the loop.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={geistSans.variable}>
      {/*
        Browser extensions stamp attributes onto <body> before React hydrates —
        Grammarly adds data-new-gr-c-s-check-loaded and data-gr-ext-installed —
        which React reports as a hydration mismatch even though the app renders
        identically on both sides. suppressHydrationWarning applies only to this
        element's own attributes and text, not to its descendants, so genuine
        mismatches inside the page still surface.
      */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
