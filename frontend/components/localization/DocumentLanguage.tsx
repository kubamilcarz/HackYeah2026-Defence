"use client";

import { useEffect } from "react";
import { useLocalization } from "./LocalizationProvider";

export function DocumentLanguage() {
  const { locale } = useLocalization();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
