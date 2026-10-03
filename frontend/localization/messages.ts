export const LOCALES = ["en", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

const en = {
  common: { backToSettings: "Back to Settings", comingSoon: "Coming soon" },
  navigation: { brandLabel: "PLAN:0 home", primary: "Primary navigation", home: "Home", map: "Map", family: "Family", plan: "Plan", supplies: "Supplies", alerts: "Alerts", settings: "Settings" },
  home: {
    title: "Prepare together, act with clarity",
    intro: "Build the information your household may need before a crisis makes it harder to think clearly.",
    emergency: { title: "In an emergency", description: "Follow local authority instructions and contact emergency services when needed. PLAN:0 does not replace official guidance.", action: "Open important numbers" },
    setup: {
      heading: "Build your household plan",
      description: "Start with the details that make it easier to contact one another and decide what to do next.",
      readiness: { label: "Plan setup", description: "Start with the people and places your household depends on.", progressSummary: "4 essentials to add", action: "Build your plan" },
      family: { title: "People to contact", membersLabel: "Saved people", summary: "No people or emergency contacts saved", addAction: "Add a family member", manageAction: "Manage people" },
      essentials: { title: "Essential information", meetingPlace: "Meeting place", contactPlan: "Contact plan", healthInformation: "Health information", notSet: "Not set", action: "Add essential info" },
    },
    quickAccess: {
      heading: "When you need something fast",
      description: "Use official and current sources for urgent decisions.",
      numbers: { title: "Important numbers", description: "Call services or open official resources" },
      map: { title: "Map nearby places", description: "Find saved and essential locations" },
    },
  },
  languageSettings: { backLabel: "Back to Settings", heading: "Language", legend: "Choose your language" },
  placeholders: {
    home: { title: "Home", description: "Your household readiness overview will appear here." },
    alerts: { title: "Alerts", description: "Alerts from connected, trusted sources will appear here when they are available. Follow official local instructions during an emergency." },
    plan: { title: "Plan", description: "Your personalized preparedness plan and next steps will appear here." },
    supplies: { title: "Supplies", description: "Your household supplies and readiness resources will appear here." },
    about: { title: "About PLAN:0", description: "Application version and project information will appear here." },
    announcementsAlerts: { title: "Announcements & alerts", description: "Announcements from official and trusted sources will appear here when they are available. Follow official local instructions during an emergency." },
    guides: { title: "Guides", description: "Preparedness guides tailored to your household will appear here." },
    notifications: { title: "Notifications", description: "Notification delivery preferences will be available here." },
    preferences: { title: "Preferences", description: "Application preferences will be available here." },
    profile: { title: "My profile", description: "Your account and household profile details will appear here." },
  },
  family: { title: "Family", members: "Family members", addPerson: "Add person", emergencyContacts: "Emergency contacts", noEmergencyContacts: "No emergency contacts yet", emergencyContactsDescription: "Add your first emergency contact so your household can find the right person quickly.", addContact: "Add contact", medicalInformation: "Medical information", noMedicalInformation: "No medical information yet", medicalInformationDescription: "Add relevant health information for household members to keep it together with your plan.", addMedicalInformation: "Add medical information", addNotes: "Add notes" },
  settings: { title: "Settings", pagesLabel: "Settings pages", accountAndApp: "Account & app", resources: "Resources", accessibility: "Accessibility", madeFor: "Made for HackYeah 2026.", profile: "My profile", notifications: "Notifications", preferences: "Preferences", language: "Language", about: "About PLAN:0", guides: "Guides", importantNumbers: "Important numbers", announcementsAlerts: "Announcements & alerts" },
  importantNumbers: {
    title: "Important numbers",
    filtersLabel: "Number category",
    filters: { all: "All", services: "Services", family: "Family", medical: "Medical" },
    emergencyHeading: "Emergency numbers",
    otherHeading: "Other important numbers",
    call: "Call",
    tapToCall: "Tap to call",
    officialSite: "Official website",
    openOfficialSite: "Open official website in a new tab",
    emptyState: "There are no numbers in this category yet.",
    numbers: { emergency: "Emergency number", fire: "Fire service", police: "Police", ambulance: "Medical emergency service" },
    resources: { rcb: "Government Centre for Security", energy: "Energy emergency service", gas: "Gas emergency service" },
  },
  accessibility: { launcher: "Accessibility preferences", title: "Accessibility", close: "Close accessibility preferences", display: "Display", displayDescription: "Choose the appearance that is most comfortable for you.", displayMode: "Display mode", appearance: { system: "Use device setting", light: "Light", dark: "Dark", hcBlackWhite: "High contrast — black / white", hcBlackYellow: "High contrast — black / yellow", grayscale: "Grayscale" }, textSize: "Text size", textSizeDescription: "Adjust text across PLAN:0 without changing your browser zoom.", decreaseTextSize: "Decrease text size", increaseTextSize: "Increase text size", resetTextSize: "Reset text size", textSizeValue: "Text size: {value}%", links: "Links", linksDescription: "Make links easier to identify in every appearance mode.", underlineLinks: "Underline links", readAloud: "Read aloud", readAloudDescription: "Use your browser to read the current page aloud.", readThisPage: "Read this page", pause: "Pause", resume: "Resume", stop: "Stop", stopReading: "Stop reading", readyToRead: "Ready to read this page aloud.", reading: "Reading this page aloud.", readingPaused: "Reading paused.", noReadableContent: "No readable page content was found.", finishedReading: "Finished reading this page.", readUnavailable: "Read aloud is unavailable right now.", readUnsupported: "Read aloud is not supported by this browser.", reset: "Reset", resetDescription: "Restore the default appearance, text size, and link treatment.", resetSettings: "Reset settings" },
  map: { ariaLabel: "Map of nearby important locations", centerOnLocation: "Center map on my location", searchAndLocations: "Map search and locations", resizePanel: "Resize map panel. Current size: {size}. Use the up and down arrow keys to change its size.", sizes: { compact: "compact", browse: "browse", expanded: "expanded" }, search: "Search places and addresses", filterLocations: "Filter map locations", all: "All", shelters: "Shelters", hospitals: "Hospitals", pharmacies: "Pharmacies", meetingPlaces: "Meeting places", locationUnavailable: "Location is not available in this browser. Search for an address or place instead.", requestingLocation: "Requesting your location…", centeredOnLocation: "Map centered on your current location.", locationDenied: "We could not access your location. Search for an address or place instead.", mapLoading: "Loading map…", mapNotConfigured: "Mapbox is not configured. Add a public Mapbox access token to view the map.", mapUnavailable: "Mapbox could not be loaded. Please try again later.", selectLocation: "Select a location on the map or from the list.", locations: "Locations", showLocation: "Show {title}", clearSearch: "Clear search" },
} as const;

export type Messages = DeepStrings<typeof en>;

const pl: Messages = {
  common: { backToSettings: "Wróć do ustawień", comingSoon: "Wkrótce" },
  navigation: { brandLabel: "Start PLAN:0", primary: "Główna nawigacja", home: "Start", map: "Mapa", family: "Rodzina", plan: "Plan", supplies: "Zapasy", alerts: "Alerty", settings: "Ustawienia" },
  home: {
    title: "Przygotuj się razem, działaj spokojnie",
    intro: "Zbierz informacje, których Twoje gospodarstwo może potrzebować, zanim kryzys utrudni spokojne działanie.",
    emergency: { title: "W sytuacji zagrożenia", description: "Stosuj się do instrukcji lokalnych władz i w razie potrzeby skontaktuj się ze służbami ratunkowymi. PLAN:0 nie zastępuje oficjalnych komunikatów.", action: "Otwórz ważne numery" },
    setup: {
      heading: "Zbuduj plan gospodarstwa",
      description: "Zacznij od informacji, które ułatwią kontakt z bliskimi i podjęcie kolejnych kroków.",
      readiness: { label: "Konfiguracja planu", description: "Zacznij od osób i miejsc, na których polega Twoje gospodarstwo.", progressSummary: "4 ważne elementy do dodania", action: "Zbuduj plan" },
      family: { title: "Osoby do kontaktu", membersLabel: "Zapisane osoby", summary: "Nie zapisano jeszcze osób ani kontaktów alarmowych", addAction: "Dodaj członka rodziny", manageAction: "Zarządzaj osobami" },
      essentials: { title: "Niezbędne informacje", meetingPlace: "Miejsce spotkania", contactPlan: "Plan kontaktu", healthInformation: "Informacje medyczne", notSet: "Nie ustawiono", action: "Dodaj ważne informacje" },
    },
    quickAccess: {
      heading: "Gdy potrzebujesz czegoś szybko",
      description: "W pilnych decyzjach korzystaj z oficjalnych i aktualnych źródeł.",
      numbers: { title: "Ważne numery", description: "Zadzwoń do służb lub otwórz oficjalne źródła" },
      map: { title: "Mapa pobliskich miejsc", description: "Znajdź zapisane i ważne lokalizacje" },
    },
  },
  languageSettings: { backLabel: "Wróć do ustawień", heading: "Język", legend: "Wybierz język" },
  placeholders: {
    home: { title: "Start", description: "W tym miejscu pojawi się przegląd gotowości Twojego gospodarstwa domowego." },
    alerts: { title: "Alerty", description: "Gdy będą dostępne, pojawią się tutaj alerty z połączonych, zaufanych źródeł. Podczas zagrożenia stosuj się do instrukcji lokalnych władz." },
    plan: { title: "Plan", description: "W tym miejscu pojawi się spersonalizowany plan przygotowania i kolejne kroki." },
    supplies: { title: "Zapasy", description: "W tym miejscu pojawią się zapasy i zasoby gotowości Twojego gospodarstwa domowego." },
    about: { title: "O PLAN:0", description: "W tym miejscu pojawią się informacje o wersji aplikacji i projekcie." },
    announcementsAlerts: { title: "Komunikaty i alerty", description: "Gdy będą dostępne, pojawią się tutaj komunikaty z oficjalnych i zaufanych źródeł. Podczas zagrożenia stosuj się do instrukcji lokalnych władz." },
    guides: { title: "Poradniki", description: "W tym miejscu pojawią się poradniki przygotowane dla Twojego gospodarstwa domowego." },
    notifications: { title: "Powiadomienia", description: "W tym miejscu będą dostępne ustawienia dostarczania powiadomień." },
    preferences: { title: "Preferencje", description: "W tym miejscu będą dostępne preferencje aplikacji." },
    profile: { title: "Mój profil", description: "W tym miejscu pojawią się dane Twojego konta i profilu gospodarstwa domowego." },
  },
  family: { title: "Rodzina", members: "Członkowie rodziny", addPerson: "Dodaj osobę", emergencyContacts: "Kontakty alarmowe", noEmergencyContacts: "Brak kontaktów alarmowych", emergencyContactsDescription: "Dodaj pierwszy kontakt alarmowy, aby Twoje gospodarstwo domowe szybko znalazło właściwą osobę.", addContact: "Dodaj kontakt", medicalInformation: "Informacje medyczne", noMedicalInformation: "Brak informacji medycznych", medicalInformationDescription: "Dodaj istotne informacje o zdrowiu członków gospodarstwa domowego, aby przechowywać je razem z planem.", addMedicalInformation: "Dodaj informacje medyczne", addNotes: "Dodaj notatki" },
  settings: { title: "Ustawienia", pagesLabel: "Strony ustawień", accountAndApp: "Konto i aplikacja", resources: "Zasoby", accessibility: "Dostępność", madeFor: "Stworzone na HackYeah 2026.", profile: "Mój profil", notifications: "Powiadomienia", preferences: "Preferencje", language: "Język", about: "O PLAN:0", guides: "Poradniki", importantNumbers: "Ważne numery", announcementsAlerts: "Komunikaty i alerty" },
  importantNumbers: {
    title: "Ważne numery",
    filtersLabel: "Kategoria numerów",
    filters: { all: "Wszystkie", services: "Służby", family: "Rodzina", medical: "Medyczne" },
    emergencyHeading: "Numery alarmowe",
    otherHeading: "Inne ważne numery",
    call: "Zadzwoń pod",
    tapToCall: "Dotknij, aby zadzwonić",
    officialSite: "Oficjalna strona",
    openOfficialSite: "Otwórz oficjalną stronę w nowej karcie",
    emptyState: "W tej kategorii nie ma jeszcze numerów.",
    numbers: { emergency: "Numer alarmowy", fire: "Straż pożarna", police: "Policja", ambulance: "Pogotowie ratunkowe" },
    resources: { rcb: "RCB", energy: "Pogotowie energetyczne", gas: "Pogotowie gazowe" },
  },
  accessibility: { launcher: "Preferencje dostępności", title: "Dostępność", close: "Zamknij preferencje dostępności", display: "Wyświetlanie", displayDescription: "Wybierz wygląd najbardziej komfortowy dla siebie.", displayMode: "Tryb wyświetlania", appearance: { system: "Użyj ustawień urządzenia", light: "Jasny", dark: "Ciemny", hcBlackWhite: "Wysoki kontrast — czerń / biel", hcBlackYellow: "Wysoki kontrast — czerń / żółty", grayscale: "Skala szarości" }, textSize: "Rozmiar tekstu", textSizeDescription: "Dostosuj tekst w PLAN:0 bez zmieniania powiększenia przeglądarki.", decreaseTextSize: "Zmniejsz rozmiar tekstu", increaseTextSize: "Zwiększ rozmiar tekstu", resetTextSize: "Przywróć rozmiar tekstu", textSizeValue: "Rozmiar tekstu: {value}%", links: "Łącza", linksDescription: "Ułatw rozpoznawanie łączy w każdym trybie wyglądu.", underlineLinks: "Podkreślaj łącza", readAloud: "Czytaj na głos", readAloudDescription: "Użyj przeglądarki, aby przeczytać bieżącą stronę na głos.", readThisPage: "Czytaj tę stronę", pause: "Wstrzymaj", resume: "Wznów", stop: "Zatrzymaj", stopReading: "Zatrzymaj czytanie", readyToRead: "Gotowe do przeczytania tej strony na głos.", reading: "Trwa czytanie strony na głos.", readingPaused: "Czytanie wstrzymane.", noReadableContent: "Nie znaleziono treści strony do przeczytania.", finishedReading: "Zakończono czytanie strony.", readUnavailable: "Czytanie na głos jest teraz niedostępne.", readUnsupported: "Czytanie na głos nie jest obsługiwane przez tę przeglądarkę.", reset: "Resetuj", resetDescription: "Przywróć domyślny wygląd, rozmiar tekstu i sposób wyświetlania łączy.", resetSettings: "Zresetuj ustawienia" },
  map: { ariaLabel: "Mapa pobliskich ważnych miejsc", centerOnLocation: "Wyśrodkuj mapę na mojej lokalizacji", searchAndLocations: "Wyszukiwanie na mapie i miejsca", resizePanel: "Zmień rozmiar panelu mapy. Bieżący rozmiar: {size}. Użyj strzałek w górę i w dół, aby zmienić jego rozmiar.", sizes: { compact: "zwarty", browse: "przegląd", expanded: "rozszerzony" }, search: "Szukaj miejsc i adresów", filterLocations: "Filtruj miejsca na mapie", all: "Wszystkie", shelters: "Schronienia", hospitals: "Szpitale", pharmacies: "Apteki", meetingPlaces: "Miejsca spotkań", locationUnavailable: "Lokalizacja nie jest dostępna w tej przeglądarce. Zamiast tego wyszukaj adres lub miejsce.", requestingLocation: "Trwa pobieranie Twojej lokalizacji…", centeredOnLocation: "Mapa została wyśrodkowana na Twojej bieżącej lokalizacji.", locationDenied: "Nie udało się uzyskać dostępu do Twojej lokalizacji. Zamiast tego wyszukaj adres lub miejsce.", mapLoading: "Trwa ładowanie mapy…", mapNotConfigured: "Mapbox nie jest skonfigurowany. Dodaj publiczny token dostępu Mapbox, aby wyświetlić mapę.", mapUnavailable: "Nie udało się załadować Mapbox. Spróbuj ponownie później.", selectLocation: "Wybierz miejsce na mapie lub z listy.", locations: "Miejsca", showLocation: "Pokaż: {title}", clearSearch: "Wyczyść wyszukiwanie" },
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
