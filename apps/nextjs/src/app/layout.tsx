import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { env } from "~/env.mjs";

import "~/styles/globals.css";

import { headers } from "next/headers";

import { TRPCReactProvider } from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

/**
 * Since we're passing `headers()` to the `TRPCReactProvider` we need to
 * make the entire app dynamic. You can move the `TRPCReactProvider` further
 * down the tree (e.g. /dashboard and onwards) to make part of the app statically rendered.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(
    `https://${env.VERCEL_URL}` ?? `http://localhost:${env.PORT}`,
  ),
  title: "Studenture",
  description: "Connect with startups worldwide.",
  openGraph: {
    title: "Studenture",
    description: "Connect with startups worldwide.",
    images:
      "https://testing.studenture.com/_next/static/media/studenture_icon.eceddbeb.svg",
    url: "https://testing.studenture.com",
    siteName: "Studenture",
  },
  twitter: {
    images:
      "https://testing.studenture.com/_next/static/media/studenture_icon.eceddbeb.svg",
    card: "summary_large_image",
    title: "Studenture",
    site: "@joinstudenture",
    creator: "@nvalidptr",
  },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={["font-sans", fontSans.variable].join(" ")}>
        <TRPCReactProvider headers={headers()}>
          {props.children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
