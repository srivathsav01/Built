import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { LoadingProvider } from '@/lib/context/LoadingContext'
import GlobalLoader from '@/components/GlobalLoader'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "built.",
  description: "A fitness companion app to track and analyze your body composition data.",
  authors: [{ name: 'Srivathsav M' }],
  creator: 'Srivathsav M'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <LoadingProvider>
            <GlobalLoader />
            <Header />
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
