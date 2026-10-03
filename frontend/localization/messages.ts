export const LOCALES = ["en", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export type Messages = {
  languageSettings: {
    backLabel: string;
    heading: string;
    legend: string;
  };
};

const en: Messages = {
  languageSettings: {
    backLabel: "Back to Settings",
    heading: "Language",
    legend: "Choose your language",
  },
};

const pl: Messages = {
  languageSettings: {
    backLabel: "Wróć do ustawień",
    heading: "Język",
    legend: "Wybierz język",
  },
};

export const messages: Record<Locale, Messages> = { en, pl };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function getDeviceLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const preferredLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  return preferredLanguages.some((language) => language.toLowerCase().startsWith("pl"))
    ? "pl"
    : "en";
}
