# Cartoon Cruisers

Een leuke kinderapp die foto's omzet naar Pixar-stijl cartoon-characters op scooters.

## Features

- Camera-integratie voor selfies via getUserMedia
- AI-powered cartoon-conversie via Gemini 2.5 Flash
- 3 scenes: stad, strand, bergen
- Toeter-winkel met geluidseffecten
- Ouderlijke-toestemming gate
- Privacy-first: foto's worden nooit opgeslagen

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Gemini 2.5 Flash (image generation)

## Lokaal draaien

```bash
npm install
cp .env.example .env.local
# Vul je GEMINI_API_KEY in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Beschrijving |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key voor Gemini 2.5 Flash |

Haal een API key op via [Google AI Studio](https://aistudio.google.com/apikey).

## Deploy naar Vercel

1. Push het project naar een Git repository (GitHub/GitLab/Bitbucket)
2. Ga naar [vercel.com/new](https://vercel.com/new)
3. Importeer de repository
4. Voeg de environment variable toe:
   - `GEMINI_API_KEY` = je Gemini API key
5. Klik **Deploy**

Of via de Vercel CLI:

```bash
npm i -g vercel
vercel --prod
# Stel GEMINI_API_KEY in via: vercel env add GEMINI_API_KEY
```

## Projectstructuur

```
src/
  app/
    layout.tsx          # Root layout met Fredoka font
    page.tsx            # App shell met navigatie
    globals.css         # Animaties en base styles
    api/transform/
      route.ts          # Gemini API endpoint (2-staps cartoon generatie)
  components/
    ui.tsx              # Gedeelde UI componenten
    ParentalConsent.tsx # Ouderlijke toestemming scherm
    screens/
      WelcomeScreen.tsx
      SceneScreen.tsx
      PhotoScreen.tsx   # Camera + galerij
      LoadingScreen.tsx # Cartoon generatie met voortgang
      ResultScreen.tsx  # Resultaat + delen/bewaren
      HornShopScreen.tsx
  lib/
    constants.ts        # Kleuren, scenes, toeters
    audio.ts            # Web Audio toetergeluiden
```
