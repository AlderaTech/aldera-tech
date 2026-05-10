import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SessionProvider } from "@/components/shared/session-provider";
import { getSiteSettings } from "@/lib/public-settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(appUrl),
    title: {
      default: settings.seoTitle,
      template: `%s | ${settings.brandName}`,
    },
    description: settings.seoDescription,
    keywords: [
      "solvo tech",
      "pengembangan web indonesia",
      "partner teknologi indonesia",
      "jasa pembuatan website",
      "ui/ux design",
      "pengembangan aplikasi mobile",
    ],
    authors: [{ name: settings.brandName }],
    creator: settings.brandName,
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: appUrl,
      siteName: settings.brandName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: `${settings.brandName} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.brandName,
      description: settings.seoDescription,
      images: ["/logo.png"],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/logo.png",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
