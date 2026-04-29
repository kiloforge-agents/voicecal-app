# VoiceCal — Voice-Activated Calorie Tracker

Track calories hands-free. Tap the mic, say what you ate, and VoiceCal parses, estimates, and logs it instantly.

## Features

- 🎙️ **Voice logging** via the browser's Web Speech API — no server, no API key.
- 🧠 **Smart parser** that understands quantities and units like _"two eggs"_, _"200 grams of chicken"_, _"a slice of pizza"_, _"300ml of orange juice"_.
- 📊 **Daily dashboard** with calorie total, progress against your goal, and a category breakdown.
- 📝 **Manual fallback** — type entries when voice isn't available.
- 🔒 **Local-first** — everything is stored in `localStorage`. No accounts, no tracking.
- 🎯 **Editable daily goal**.

## Tech

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- TypeScript

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> Voice recognition works best in Chrome, Edge, or Safari. Firefox doesn't currently support `SpeechRecognition`; the manual text input still works there.

## Build

```bash
npm run build
npm start
```
