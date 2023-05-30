/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getBuildConfig } from "./config/build";

const buildConfig = getBuildConfig();

export const metadata = {
  title: "AvanaAI",
  description: "Your personal Avana Chat Bot.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a799ff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffbddc" },
  ],
  appleWebApp: {
    title: "AvanaAI",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="version" content={buildConfig.commitId} />
        <link rel="manifest" href="/site.webmanifest" />
        <script src="/serviceWorkerRegister.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
