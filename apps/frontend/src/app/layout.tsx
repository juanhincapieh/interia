import type { Metadata } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";
import { CopilotKitProviderShell } from "@/components/copilot/CopilotKitProviderShell";
import "./globals.css";
// v2 owns its own stylesheet. Do NOT import @copilotkit/react-ui/styles.css —
// v1's .copilotKitButton / .copilotKitSidebar / .copilotKitWindow rules
// collide with v2's same-name selectors (different DOM, different positioning)
// and break the sidebar layout when both are loaded.
import "@copilotkit/react-core/v2/styles.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Interia — Interactive Interior AI",
  description: "Upload a photo of your room and let Interia turn it into an editable design state.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className={`${inter.variable} ${jetbrains.variable} subpixel-antialiased`}>
        <CopilotKitProviderShell>{children}</CopilotKitProviderShell>
      </body>
    </html>
  );
}
