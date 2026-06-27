import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { homeSeo } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const seo = homeSeo();

export const metadata: Metadata = {
  metadataBase: new URL("https://playbeat-arena.example.com"),
  title: {
    default: seo.title,
    template: "%s | PlayBeat Arena",
  },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: "PlayBeat Arena" }],
  creator: "PlayBeat Arena",
  publisher: "PlayBeat Arena",
  applicationName: "PlayBeat Arena",
  category: "Sports Streaming",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://playbeat-arena.example.com",
    siteName: "PlayBeat Arena",
    title: seo.ogTitle,
    description: seo.ogDescription,
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "PlayBeat Arena — Live Sports Streaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.ogTitle,
    description: seo.ogDescription,
    images: ["/logo.svg"],
    creator: "@playbeat",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "google-site-verification-token",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD structured data for richer search results
const jsonLd = seo.jsonLd;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
