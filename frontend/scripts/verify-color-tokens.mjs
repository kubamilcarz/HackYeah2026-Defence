import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const themes = {
  light: ":root",
  dark: ':root[data-theme="dark"]',
  grayscale: ':root[data-theme="grayscale"]',
  highContrastWhite: ':root[data-theme="hc-black-white"]',
  highContrastYellow: ':root[data-theme="hc-black-yellow"]',
};

const checks = [
  ["light primary content", "light", "--content-primary", "--surface-canvas", 4.5],
  ["light muted content", "light", "--content-muted", "--surface-canvas", 4.5],
  ["light link", "light", "--content-link", "--surface-raised", 4.5],
  ["light primary action", "light", "--action-primary-content", "--action-primary", 4.5],
  ["light pressed action", "light", "--action-primary-pressed-content", "--action-primary-pressed", 4.5],
  ["light selected action", "light", "--action-selected-content", "--action-selected", 4.5],
  ["light destructive action", "light", "--action-danger-pressed-content", "--action-danger-pressed", 4.5],
  ["light destructive hover", "light", "--action-danger-hover-content", "--action-danger-hover", 4.5],
  ["light success feedback", "light", "--feedback-success-foreground", "--feedback-success-background", 4.5],
  ["light warning feedback", "light", "--feedback-warning-foreground", "--feedback-warning-background", 4.5],
  ["light danger feedback", "light", "--feedback-danger-foreground", "--feedback-danger-background", 4.5],
  ["light info feedback", "light", "--feedback-info-foreground", "--feedback-info-background", 4.5],
  ["dark primary content", "dark", "--content-primary", "--surface-raised", 4.5],
  ["dark link", "dark", "--content-link", "--surface-canvas", 4.5],
  ["dark primary action", "dark", "--action-primary-content", "--action-primary", 4.5],
  ["dark selected action", "dark", "--action-selected-content", "--action-selected", 4.5],
  ["dark destructive action", "dark", "--action-danger-pressed-content", "--action-danger-pressed", 4.5],
  ["dark destructive hover", "dark", "--action-danger-hover-content", "--action-danger-hover", 4.5],
  ["dark success feedback", "dark", "--feedback-success-foreground", "--feedback-success-background", 4.5],
  ["dark warning feedback", "dark", "--feedback-warning-foreground", "--feedback-warning-background", 4.5],
  ["dark danger feedback", "dark", "--feedback-danger-foreground", "--feedback-danger-background", 4.5],
  ["dark info feedback", "dark", "--feedback-info-foreground", "--feedback-info-background", 4.5],
  ["light focus ring", "light", "--focus-ring", "--surface-raised", 3],
  ["dark focus ring", "dark", "--focus-ring", "--surface-raised", 3],
  ["grayscale primary action", "grayscale", "--action-primary-content", "--action-primary", 4.5],
  ["grayscale selected action", "grayscale", "--action-selected-content", "--action-selected", 4.5],
  ["grayscale destructive action", "grayscale", "--action-danger-pressed-content", "--action-danger-pressed", 4.5],
  ["high-contrast white action", "highContrastWhite", "--action-primary-content", "--action-primary", 4.5],
  ["high-contrast white selected action", "highContrastWhite", "--action-selected-content", "--action-selected", 4.5],
  ["high-contrast white destructive action", "highContrastWhite", "--action-danger-pressed-content", "--action-danger-pressed", 4.5],
  ["high-contrast yellow action", "highContrastYellow", "--action-primary-content", "--action-primary", 4.5],
  ["high-contrast yellow selected action", "highContrastYellow", "--action-selected-content", "--action-selected", 4.5],
  ["high-contrast yellow destructive action", "highContrastYellow", "--action-danger-pressed-content", "--action-danger-pressed", 4.5],
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function declarationsFor(selector) {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`Missing theme selector: ${selector}`);

  return Object.fromEntries(
    [...match[1].matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, value]) => [
      name,
      value,
    ]),
  );
}

function relativeLuminance(hex) {
  const channels = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index + 1, index + 3), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const tokenMaps = Object.fromEntries(
  Object.entries(themes).map(([name, selector]) => [name, declarationsFor(selector)]),
);

const failures = checks.flatMap(([name, theme, foregroundToken, backgroundToken, minimum]) => {
  const tokens = tokenMaps[theme];
  const foreground = tokens[foregroundToken];
  const background = tokens[backgroundToken];

  if (!foreground || !background) {
    return [`${name}: missing ${!foreground ? foregroundToken : backgroundToken}`];
  }

  const ratio = contrastRatio(foreground, background);
  return ratio >= minimum
    ? []
    : [`${name}: ${ratio.toFixed(2)}:1 is below ${minimum}:1 (${foreground} on ${background})`];
});

if (failures.length > 0) {
  console.error("Color token verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${checks.length} color token contrast pairings.`);
}
