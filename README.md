# 🛡️ PLAN:0 — Cyfrowy Asystent Gotowości Kryzysowej Rodziny

[![HackYeah 2026](https://img.shields.io/badge/Hackathon-HackYeah%202026-blueviolet?style=for-the-badge)](https://hackyeah.pl/)
[![Kategoria](https://img.shields.io/badge/Kategoria-Obronność%20%2F%20Defence-crimson?style=for-the-badge)](#)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20PWA-black?style=for-the-badge&logo=next.js)](frontend/)
[![Django 6](https://img.shields.io/badge/Backend-Django%206%20%2B%20DRF-092E20?style=for-the-badge&logo=django)](backend/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Dost%C4%99pno%C5%9B%C4%87-WCAG%202.2%20AA-059669?style=for-the-badge)](#-dostępność-a11y-i-inkluzywność)
[![Offline First](https://img.shields.io/badge/Architektura-Offline--First%20PWA-orange?style=for-the-badge)](#-bezpieczeństwo-i-offline-first)

> **PLAN:0** to nowoczesna, responsywna aplikacja PWA wspomagająca budowanie odporności cywilnej i przygotowanie gospodarstw domowych na sytuacje kryzysowe — od przerw w dostawie prądu (blackout), przez klęski żywiołowe (powódź, pożar), po skażenia chemiczne, militarne zagrożenia i ewakuację.
> 
> *Bo w sytuacji kryzysowej nie ma czasu na improwizację — liczy się PLAN:0.*

---

## 📑 Spis Treści
- [Problem i Misja](#-problem-i-misja)
- [Kluczowe Funkcjonalności](#-kluczowe-funkcjonalności)
- [Architektura Systemu](#-architektura-systemu)
- [Stack Technologiczny](#-stack-technologiczny)
- [Instalacja i Uruchomienie](#-instalacja-i-uruchomienie)
  - [Wymagania wstępne](#wymagania-wstępne)
  - [1. Backend (Django)](#1-backend-django-drf)
  - [2. Frontend (Next.js PWA)](#2-frontend-nextjs-pwa)
- [Baza Danych Schronów i Integracje](#-baza-danych-schronów-i-integracje)
- [Bezpieczeństwo i Offline-First](#-bezpieczeństwo-i-offline-first)
- [Dostępność (A11y) i Inkluzywność](#-dostępność-a11y-i-inkluzywność)
- [Ważna Informacja Prawna](#-ważna-informacja-prawna-disclaimer)

---

## 🎯 Problem i Misja

W obliczu współczesnych zagrożeń hybrydowych, militarnych oraz klimatycznych, kluczowym filarem bezpieczeństwa państwa jest **odporność społeczeństwa i obrona cywilna**. 
Większość obywateli:
- ❌ Nie ma spakowanego plecaka ewakuacyjnego (tzw. bug-out bag na 72 godziny).
- ❌ Nie wie, gdzie w ich najbliższej okolicy znajduje się najbliższy schron lub miejsce ukrycia.
- ❌ Nie posiada ustalonego z rodziną planu łączności i punktu zbiórki na wypadek braku sieci komórkowej.
- ❌ Nie rozpoznaje sygnałów alarmowych syren państwowych.

**PLAN:0** zamienia chaos informacyjny w prosty, ustrukturyzowany i spersonalizowany proces przygotowania, który działa nawet wtedy, gdy zgaśnie światło i padnie internet.

---

## ✨ Kluczowe Funkcjonalności

### 🤖 1. Spersonalizowany Plan Kryzysowy napędzany AI
Aplikacja nie serwuje generycznych list PDF. Na podstawie unikalnego profilu Twojego domostwa (liczba domowników, dzieci, osoby starsze, niepełnosprawności, zwierzęta domowe, typ zabudowy) moduł sztucznej inteligencji (**OpenAI Structured Outputs**) generuje precyzyjny, spersonalizowany harmonogram działań, priorytetów i podziału ról.

### 📍 2. Mapa Schronów i Miejsc Ukrycia PSP
- Integracja z oficjalną bazą punktów schronienia **Państwowej Straży Pożarnej (PSP)**.
- Interaktywna mapa (Mapbox GL) wyszukująca najbliższe schrony, ukrycia doraźne, szpitale oraz dyżurujące apteki w zadanym promieniu.
- Wyznaczanie odległości, wskazówki nawigacyjne i dostępność architektoniczna.

### 🎒 3. Plecak Ewakuacyjny (72h) & Zapasy Domowe
- **Checklista plecaka ucieczkowego**: kontrola wagi, kategoryzacja (dokumenty, apteczka, woda, odzież, narzędzia, racje).
- **Zarządzanie zapasami domowymi**: kalkulator wody (3 litry/osobę/dzień), zapas żywności długoterminowej, źródła energii i łączności (baterie, powerbanki, radio analogowe).
- Monitorowanie stopnia gotowości gospodarstwa domowego (wskaźnik Readiness Score).

### 🚨 4. Błyskawiczny Tryb Kryzysowy (Crisis Mode)
- **Aktywacja jednym kliknięciem** w sytuacji zagrożenia.
- Interfejs o skrajnie wysokim kontraście i dużych elementach dotykowych — zredukowany do kluczowych informacji, zaprojektowany do obsługi w stresie i przy drżących dłoniach.
- Natychmiastowe wybieranie numerów alarmowych (112, 999, 998, 997).
- Karty medyczne i kontakty ICE (In Case of Emergency) domowników dostępne natychmiast, bez konieczności odblokowywania zaawansowanych ekranów.

### 👨‍👩‍👧‍👦 5. Plan Zbiórki i Łączności Rodziny
- Ustalenie **podstawowego i zapasowego punktu zbiórki** poza miejscem zamieszkania.
- Procedury kontaktu na wypadek przeciążenia stacji bazowych GSM (kontakt pośredni poza rejonem kryzysu, protokoły SMS).
- Przypisane role i odpowiedzialności dla każdego członka rodziny.

### 📢 6. Baza Sygnałów Alarmowych i Poradniki Zagrożeń
- Dźwiękowy i wizualny przewodnik po sygnałach syren alarmowych w Polsce (Ogłoszenie alarmu vs Odwołanie alarmu).
- Poradniki postępowania krok-po-kroku: skażenie chemiczne, powódź, blackout, ewakuacja, zagrożenie militarne/nalot.

### 📄 7. Eksport Planu do Druku / PDF
- Jedno kliknięcie generuje czytelny, kompletny dokument PDF z planem rodziny, danymi medycznymi i kontaktami gotowy do włożenia do plecaka ewakuacyjnego w wersji papierowej.

---

## 🏗️ Architektura Systemu

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAN:0 — EKOSYSTEM                       │
└─────────────────────────────────────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│       FRONTEND (PWA)         │        │       BACKEND (API)          │
│ Next.js 16 + React 19 + TS   │        │ Django 6.1 + REST Framework  │
│ Tailwind CSS v4 + Mapbox GL  │        │ SQLite + Baza PSP + OpenAI   │
│                              │        │                              │
│ • Service Worker (Offline)   │◄──────►│ • /api/personalized-plan/    │
│ • IndexedDB / LocalStorage   │  REST  │ • /api/places/ & /shelters/  │
│ • Tryb Kryzysowy (Stress-UI) │        │ • /api/llm/process/          │
│ • Eksport do PDF (jsPDF)     │        │ • /api/health/               │
│ • WCAG 2.2 AA Controls       │        │ • OpenAPI / Swagger UI       │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## 💻 Stack Technologiczny

| Warstwa | Technologia | Zastosowanie |
|---|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, React 19) | Nowoczesna, superszybka architektura PWA |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + Phosphor Icons | Design system o wysokiej dostępności i czytelności |
| **Mapy** | [Mapbox GL JS](https://www.mapbox.com/) | Interaktywna wizualizacja schronów i punktów zbiórki |
| **Generowanie PDF**| [jsPDF](https://github.com/parallax/jsPDF) | Eksport fizycznych kart kryzysowych do druku |
| **Backend API** | [Django 6.1](https://www.djangoproject.com/) + [DRF](https://www.django-rest-framework.org/) | RESTful API, geolokacja i logika biznesowa |
| **Sztuczna Inteligencja** | [OpenAI API](https://openai.com/) (Structured Outputs) | Deterministyczne, walidowane schematem plany ratunkowe |
| **Baza Danych** | SQLite + CSV PSP (`punkty_schronienia_clean.csv`) | Baza punktów schronienia PSP bez zbędnego narzutu |
| **Dokumentacja API** | `drf-spectacular` (OpenAPI 3 / Swagger / Redoc) | Interaktywna dokumentacja endpointów |

---

## 🚀 Instalacja i Uruchomienie

### Wymagania wstępne
- **Node.js** >= 20.x oraz **npm**
- **Python** >= 3.12 oraz **pip** / **venv**
- *(Opcjonalnie)* Klucz `OPENAI_API_KEY` (dla generowania planu AI) oraz `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

---

### 1. Backend (Django + DRF)

1. Przejdź do katalogu backendu:
   ```bash
   cd backend
   ```

2. Utwórz i aktywuj wirtualne środowisko Pythona:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   # Na Windows: .venv\Scripts\activate
   ```

3. Zainstaluj zależności:
   ```bash
   pip install -r requirements.txt
   ```

4. Skonfiguruj zmienne środowiskowe:
   ```bash
   cp .env.example .env
   ```
   > 💡 *Wskazówka:* W pliku `.env` możesz ustawić `OPENAI_API_KEY`. W trybie developerskim dostępny jest również tryb mockowania mapy (`MAP_PLACES_MOCK=True`).

5. Zastosuj migracje bazy danych:
   ```bash
   python manage.py migrate
   ```

6. Uruchom serwer developerski:
   ```bash
   python manage.py runserver 8000
   ```
   Serwer backendu działa pod adresem: `http://127.0.0.1:8000/`  
   - Dokumentacja Swagger: `http://127.0.0.1:8000/api/docs/`  
   - Healthcheck: `http://127.0.0.1:8000/api/health/`

---

### 2. Frontend (Next.js PWA)

1. W nowym oknie terminala przejdź do katalogu frontendu:
   ```bash
   cd frontend
   ```

2. Zainstaluj pakiety:
   ```bash
   npm install
   ```

3. Skonfiguruj zmienne środowiskowe:
   ```bash
   cp .env.example .env.local
   ```
   Domyślny adres API: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

4. Uruchom serwer developerski:
   ```bash
   npm run dev
   ```

5. Otwórz w przeglądarce: [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Baza Danych Schronów i Integracje

System korzysta ze zintegrowanej bazy danych Państwowej Straży Pożarnej (PSP) zawierającej:
- **Miejsca Doraźnego Schronienia (MDS)**
- **Ukrycia (U)**
- **Schrony (S)**

Endpointy API udostępniają:
- `GET /api/shelters/` — filtrowanie schronów po koordynatach geograficznych, odległości oraz typie obiektu.
- `GET /api/places/?lat={lat}&lon={lon}&types=shelter,hospital,pharmacy` — agregacja schronów, szpitali i aptek w okolicy.
- `POST /api/personalized-plan/` — silnik generowania planu kryzysowego na podstawie ankiety gospodarstwa domowego.

---

## 📴 Bezpieczeństwo i Offline-First

W prawdziwym kryzysie stacje bazowe telefonii komórkowej ulegają awarii lub przeciążeniu w pierwszych minutach.
Dlatego **PLAN:0** został zaprojektowany w oparciu o paradygmat **Local-First / Offline-Resilience**:
1. **Lokalny zapis**: Wszystkie wprowadzone dane rodziny, leki, zapasy i kontakty są zapisywane bezpośrednio w pamięci urządzenia użytkownika.
2. **PWA & Service Worker**: Aplikację można zainstalować na telefonie (iOS/Android/Desktop), po czym uruchamia się i działa w pełni bez aktywnego połączenia z siecią.
3. **Prywatność (Privacy by Design)**: Wrażliwe dane medyczne domowników nie wymagają wysyłania do zewnętrznej chmury; plany są bezpiecznie przechowywane lokalnie.

---

## ♿ Dostępność (A11y) i Inkluzywność

Kryzys dotyka każdego — niezależnie od wieku, sprawności sensorycznej czy motorycznej. PLAN:0 spełnia wytyczne **WCAG 2.2 na poziomie AA**:
- 👁️ **Wsparcie dla osób słabowidzących**: Dedykowany tryb wysokiego kontrastu, skalowanie czcionki, wyraźne obramowania kontrolek.
- ⌨️ **Pełna obsługa klawiaturą**: Prawidłowy focus ring, logiczna kolejność tabulacji, skip-linki.
- 🔊 **Czytniki ekranu**: Pełne wsparcie dla VoiceOver / NVDA / TalkBack dzięki semantycznemu HTML5 i atrybutom ARIA.
- 🌐 **Wielojęzyczność**: Pełne wsparcie dla języka polskiego i angielskiego (i18n).

---

## ⚖️ Ważna Informacja Prawna (Disclaimer)

> [!IMPORTANT]
> **PLAN:0 stanowi narzędzie wspomagania decyzji i edukacji w zakresie prewencji kryzysowej.**  
> W trakcie trwającego realnego zagrożenia życia i zdrowia, **bezwzględne pierwszeństwo mają oficjalne komunikaty i polecenia lokalnych władz, służb ratunkowych, Państwowej Straży Pożarnej, Policji oraz komunikaty Alert RCB**.  
> Aplikacja nie gwarantuje bezpieczeństwa ani dostępności danego schronu w czasie rzeczywistym i nie zastępuje oficjalnych wytycznych obrony cywilnej.

---

<div align="center">
  <sub>Stworzone z myślą o bezpieczeństwie i obronności w ramach <b>HackYeah 2026</b> 🇵🇱</sub>
</div>
