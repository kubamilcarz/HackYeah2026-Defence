"use client";

import { useLocalization } from "@/components/localization/LocalizationProvider";

type PlaceholderScreenProps = { page: keyof ReturnType<typeof useLocalization>["messages"]["placeholders"] };

export function PlaceholderScreen({ page }: PlaceholderScreenProps) {
  const { messages } = useLocalization();
  const { description, title } = messages.placeholders[page];
  return (
    <main className="placeholder-screen">
      <div className="placeholder-screen__content">
        <p className="type-caption placeholder-screen__eyebrow">PLAN:0</p>
        <h1 className="type-h1">{title}</h1>
        <p className="type-body placeholder-screen__description">{description}</p>
        <p className="type-caption placeholder-screen__status" role="status">{messages.common.comingSoon}</p>
      </div>
    </main>
  );
}
