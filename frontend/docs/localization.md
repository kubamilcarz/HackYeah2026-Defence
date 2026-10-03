# PLAN:0 localization

## Current contract

PLAN:0 supports English (`en`) and Polish (`pl`). The selected language is a
browser-profile-local preference stored as `plan-0-locale` in `localStorage`.
It is not synchronized to an account, a backend, another browser, or another
device. The selected value is synchronized between tabs for the same origin.

On a first visit, PLAN:0 chooses Polish when a value in `navigator.languages`
starts with `pl`; all other preferences use English. An explicit language
selection overrides that default. Invalid saved values and unavailable storage
fall back safely to the browser-language decision.

Routes remain stable and do not have locale prefixes. Do not add locale
cookies, Next.js proxy locale redirects, or a `[locale]` route segment while
this device-local behavior is the product requirement.

## Adding localized UI

- Add copy to the typed English catalog in `localization/messages.ts`, then add
  the matching Polish value. The Polish catalog must retain the English
  catalog's shape.
- Client components use `useLocalization()` to read `locale`, `messages`, and
  `setLocale`. Do not read or write the locale storage key elsewhere.
- Use the selected locale with the platform `Intl` APIs for dates, times,
  numbers, lists, and plurals. Keep values and identifiers separate from their
  displayed localized text.
- Localize visible labels, accessible names, instructions, validation feedback,
  statuses, and page metadata together when a screen is migrated.

## Staged rollout and language metadata

All currently implemented product screens use the selected catalog. After
hydration, the root document `lang` is synchronized with the selected locale;
the native language names on the language screen retain their own language
tags.
