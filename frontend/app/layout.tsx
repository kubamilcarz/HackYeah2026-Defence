import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { EmergencyModeProvider } from "@/components/emergency/EmergencyModeProvider";
import { LocalizationProvider } from "@/components/localization/LocalizationProvider";
import { DocumentLanguage } from "@/components/localization/DocumentLanguage";
import { OfflineResilienceProvider } from "@/components/offline/OfflineResilienceProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Plan: 0",
    template: "%s | Plan: 0",
  },
  description: "Plan: 0 emergency readiness.",
  applicationName: "Plan: 0",
  icons: {
    apple: "/app-icon-180.png",
    icon: [
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <LocalizationProvider>
          <DocumentLanguage />
          <AccessibilityProvider>
            <OfflineResilienceProvider>
              <EmergencyModeProvider>
                {children}
                <AccessibilityMenu />
              </EmergencyModeProvider>
            </OfflineResilienceProvider>
          </AccessibilityProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
