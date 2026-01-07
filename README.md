# 🌟 Lumi - Die spielerische Lern-App

Lumi ist eine mobile Lernplattform für Kinder im Alter von 4 bis 8 Jahren. Sie kombiniert das intuitive "Short-Video-Format" (bekannt von TikTok/Reels) mit pädagogisch wertvollen Inhalten und einem integrierten Belohnungssystem (Gems & Lumis).

## 🚀 Kern-Features

- **Vertikaler Lern-Feed**: Kurze, kindgerechte Lernvideos mit Snap-Scrolling.
- **Interaktive Quiz-Loops**: Alle 3 Videos erscheint ein Quiz-Overlay, das Wissen abfragt und Belohnungen ausschüttet.
- **KI-gestütztes Curator Dashboard**: Experten können Videos hochladen, während eine KI (via `aiAnalyzer`) automatisch Quizfragen und Kategorien generiert.
- **Parental Gate**: Ein mathematisches Sicherheitsschloss schützt den Admin-Bereich und die Kuratorenprofile.
- **Multi-Welt-System**: Kategorisierung in Astro (Weltraum), Word (Sprache), Math (Zahlen), Wild (Natur) und Body (Körper).

## 🛠 Tech-Stack

- **Frontend**: React Native mit [Expo](https://expo.dev/)
- **Backend & Datenbank**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Video-Engine**: `expo-av`
- **KI-Integration**: OpenAI / Gemini (über den `aiAnalyzer` Service)
- **Navigation**: React Navigation (Stack)

## 📁 Projektstruktur

```text
/
├── assets/              # Bilder, Fonts und Lumi-Icons
├── components/          # Wiederverwendbare UI (QuizOverlay, ParentalGate)
├── hooks/               # Custom Hooks (useLumiBalance für Realtime-Daten)
├── screens/             # Haupt-Screens (Feed, Dashboard, Profile, LumiBox)
├── services/            # API-Clients (supabase.js, aiAnalyzer.js)
├── supabase/            # SQL-Skripte (schema.sql) und Datenbank-Dumps
├── App.js               # Zentraler Navigator
└── app.json             # Expo-Konfiguration