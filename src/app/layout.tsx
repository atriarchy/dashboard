import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "react-hot-toast";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import { env } from "@/env";
import { NavigationBlockerProvider } from "@/app/_components/navigation-block";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Atriarchy Release Dashboard",
  description:
    "The Atriarchy Release Dashboard streamlines communication, collaboration, and tracking throughout the release pipeline for Atriarchy community projects.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  other: {
    ["theme-color"]: "#171717",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <Head>
        {env.NODE_ENV == "production" && (
          <script
            defer
            src="https://analytics.atriarchy.work/script.js"
            data-website-id="6cdd7703-0720-4693-86da-dd6f67440a2a"
          ></script>
        )}
      </Head>
      <body className="bg-neutral-900">
        <TRPCReactProvider>
          <NavigationBlockerProvider>
            <div>
              <Toaster />
            </div>
            {children}
            {env.NODE_ENV == "production" && (
              <>
                <Analytics />
                <SpeedInsights />
              </>
            )}
          </NavigationBlockerProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
