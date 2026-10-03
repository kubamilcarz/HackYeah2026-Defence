import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { LocalizationProvider } from "@/components/localization/LocalizationProvider";
import { DocumentLanguage } from "@/components/localization/DocumentLanguage";
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
};

const preferenceScript = `
  (() => {
    const themes = ["system", "light", "dark", "hc-black-white", "hc-black-yellow", "grayscale"];
    const scales = [25, 50, 75, 100, 112.5, 125, 150, 175, 200];
    const defaultPreferences = { appearance: "system", textScale: 100, underlineLinks: false };

    try {
      const stored = window.localStorage.getItem("plan-0-accessibility-preferences");
      const parsed = stored ? JSON.parse(stored) : defaultPreferences;
      const appearance = themes.includes(parsed.appearance)
        ? parsed.appearance
        : defaultPreferences.appearance;
      const textScale = scales.includes(parsed.textScale)
        ? parsed.textScale
        : defaultPreferences.textScale;
      const underlineLinks = typeof parsed.underlineLinks === "boolean"
        ? parsed.underlineLinks
        : defaultPreferences.underlineLinks;
      const theme = appearance === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        : appearance;
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.dataset.textScale = String(textScale);
      root.dataset.underlineLinks = String(underlineLinks);
      root.style.colorScheme = theme === "dark" || theme.startsWith("hc-") ? "dark" : "light";
    } catch {
      // Use stylesheet defaults when browser storage is unavailable.
    }
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="accessibility-preferences" strategy="beforeInteractive">
          {preferenceScript}
        </Script>
        <LocalizationProvider>
          <DocumentLanguage />
          <AccessibilityProvider>
            {children}
            <AccessibilityMenu />
          </AccessibilityProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
