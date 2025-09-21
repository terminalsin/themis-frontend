import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "white" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col min-h-screen">
            <main className="container mx-auto w-full min-w-full flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-8 paper-texture">
              <div className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="serif-display italic text-stone-200 text-sm tracking-wide mb-2 animate-in fade-in-0 blur-in duration-700 delay-500">
                  <span className="opacity-70">Crafted with</span>
                  <span className="text-stone-100 mx-1 animate-pulse">♡</span>
                  <span className="opacity-70">& passion</span>
                </div>
                <div className="serif-body italic text-xs text-stone-300 tracking-wider animate-in fade-in-0 blur-in duration-700 delay-700">
                  <span className="opacity-60">powered by</span>
                  <span className="mx-2 opacity-40">·</span>
                  <Link
                    isExternal
                    href="https://www.ai21.com"
                    className="hover:text-stone-700 transition-all duration-300 hover:tracking-wide opacity-70 hover:opacity-100"
                  >
                    AI21
                  </Link>
                  <span className="mx-2 opacity-40">·</span>
                  <Link
                    isExternal
                    href="https://gemini.google.com"
                    className="hover:text-stone-700 transition-all duration-300 hover:tracking-wide opacity-70 hover:opacity-100"
                  >
                    Gemini
                  </Link>
                  <span className="mx-2 opacity-40">·</span>
                  <Link
                    isExternal
                    href="https://brightdata.com"
                    className="hover:text-stone-700 transition-all duration-300 hover:tracking-wide opacity-70 hover:opacity-100"
                  >
                    BrightData
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
