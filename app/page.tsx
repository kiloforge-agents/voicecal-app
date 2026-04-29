import VoiceTracker from "./components/VoiceTracker";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-16 pt-10 sm:pt-16">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-white"
              aria-hidden
            >
              <rect x="9" y="2" width="6" height="13" rx="3" />
              <path d="M19 11a7 7 0 0 1-14 0" />
              <line x1="12" y1="18" x2="12" y2="22" />
            </svg>
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
            VoiceCal
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Track calories with your voice.
        </h1>
        <p className="max-w-xl text-neutral-400">
          Tap the mic, say what you ate, and VoiceCal logs it instantly. No
          typing, no databases to scroll, no accounts.
        </p>
      </header>
      <VoiceTracker />
      <footer className="mt-16 text-center text-xs text-neutral-600">
        Estimates only — not medical advice. All data stored locally in your
        browser.
      </footer>
    </main>
  );
}
