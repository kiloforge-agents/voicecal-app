"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseTranscript, ParsedItem } from "@/lib/parse";
import { LogEntry } from "@/lib/types";
import {
  loadGoal,
  loadLog,
  saveGoal,
  saveLog,
  isToday,
} from "@/lib/storage";
import { FOODS } from "@/lib/foods";

type Status = "idle" | "listening" | "denied" | "unsupported" | "error";

type Toast = {
  id: number;
  text: string;
  kind: "ok" | "warn" | "error";
};

export default function VoiceTracker() {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [goal, setGoal] = useState(2000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("2000");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [manual, setManual] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const toastIdRef = useRef(0);

  // Load persisted state on mount.
  useEffect(() => {
    setLog(loadLog());
    const g = loadGoal();
    setGoal(g);
    setGoalDraft(String(g));
  }, []);

  // Persist log changes.
  useEffect(() => {
    saveLog(log);
  }, [log]);

  // Detect speech-recognition support.
  const supported = useMemo(() => {
    if (typeof window === "undefined") return true;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!supported) setStatus("unsupported");
  }, [supported]);

  const pushToast = useCallback((text: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const commitItems = useCallback(
    (items: ParsedItem[], rawText: string) => {
      if (items.length === 0) {
        pushToast(`Couldn't recognize a food in: "${rawText}"`, "warn");
        return;
      }
      const now = Date.now();
      const newEntries: LogEntry[] = items.map((it, i) => ({
        id: `${now}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: now,
        description: it.description,
        calories: it.calories,
        category: it.food.category,
        raw: rawText,
      }));
      setLog((prev) => [...newEntries, ...prev]);
      const total = items.reduce((s, it) => s + it.calories, 0);
      const summary =
        items.length === 1
          ? `Logged ${items[0].description} — ${items[0].calories} kcal`
          : `Logged ${items.length} items — ${total} kcal total`;
      pushToast(summary, "ok");
    },
    [pushToast]
  );

  const handleFinalTranscript = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const items = parseTranscript(trimmed);
      commitItems(items, trimmed);
    },
    [commitItems]
  );

  const startListening = useCallback(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    setErrorMsg(null);

    // Stop any previous instance.
    recognitionRef.current?.abort();

    const Ctor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;

    r.onstart = () => {
      setStatus("listening");
      setInterim("");
    };
    r.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setTranscript(finalText.trim());
        setInterim("");
        handleFinalTranscript(finalText);
      }
    };
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setStatus("denied");
        setErrorMsg(
          "Microphone access was blocked. Enable it in your browser settings, then try again."
        );
      } else if (e.error === "no-speech") {
        setErrorMsg("Didn't catch that — try again and speak clearly.");
        setStatus("idle");
      } else if (e.error === "aborted") {
        setStatus("idle");
      } else {
        setStatus("error");
        setErrorMsg(`Speech error: ${e.error}`);
      }
    };
    r.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
      setInterim("");
    };

    try {
      r.start();
      recognitionRef.current = r;
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't start the microphone. Please refresh and retry.");
    }
  }, [handleFinalTranscript, supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const submitManual = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const t = manual.trim();
      if (!t) return;
      setTranscript(t);
      handleFinalTranscript(t);
      setManual("");
    },
    [manual, handleFinalTranscript]
  );

  const removeEntry = useCallback((id: string) => {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearToday = useCallback(() => {
    setLog((prev) => prev.filter((e) => !isToday(e.timestamp)));
    pushToast("Cleared today's log", "ok");
  }, [pushToast]);

  const todayEntries = useMemo(
    () => log.filter((e) => isToday(e.timestamp)),
    [log]
  );

  const totalToday = useMemo(
    () => todayEntries.reduce((s, e) => s + e.calories, 0),
    [todayEntries]
  );

  const remaining = goal - totalToday;
  const pct = Math.max(0, Math.min(100, (totalToday / goal) * 100));

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of todayEntries) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.calories);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [todayEntries]);

  const saveGoalEdit = () => {
    const v = parseInt(goalDraft, 10);
    if (Number.isFinite(v) && v >= 500 && v <= 10000) {
      setGoal(v);
      saveGoal(v);
      pushToast(`Daily goal set to ${v} kcal`, "ok");
    } else {
      pushToast("Enter a goal between 500 and 10,000", "warn");
    }
    setEditingGoal(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero / mic */}
      <section className="flex flex-col items-center text-center">
        <button
          type="button"
          aria-label={status === "listening" ? "Stop listening" : "Start voice logging"}
          onClick={status === "listening" ? stopListening : startListening}
          disabled={!supported}
          className={[
            "relative inline-flex h-32 w-32 items-center justify-center rounded-full",
            "transition-all duration-300 select-none",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/50",
            status === "listening"
              ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-[0_0_60px_rgba(244,63,94,0.5)] pulse-ring"
              : "bg-gradient-to-br from-rose-600 to-fuchsia-700 hover:scale-105 shadow-[0_0_40px_rgba(244,63,94,0.35)]",
            !supported && "opacity-40 cursor-not-allowed",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <MicIcon className="h-14 w-14 text-white" />
        </button>

        <div className="mt-6 min-h-[3.5rem] max-w-2xl">
          {status === "listening" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-end gap-1 h-6" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="eq-bar inline-block w-1 h-full bg-rose-400"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
              <p className="text-rose-200 font-medium">
                {interim || "Listening — say what you ate…"}
              </p>
            </div>
          ) : transcript ? (
            <p className="text-neutral-300">
              <span className="text-neutral-500">You said:</span>{" "}
              <span className="italic">&ldquo;{transcript}&rdquo;</span>
            </p>
          ) : (
            <p className="text-neutral-400">
              Tap the mic and say something like{" "}
              <span className="text-rose-300">&ldquo;I had two eggs and a slice of toast&rdquo;</span>
              .
            </p>
          )}
        </div>

        {status === "unsupported" && (
          <p className="mt-3 text-amber-300 text-sm max-w-md">
            Voice input isn&apos;t supported in this browser. Use the text box
            below — Chrome, Edge, or Safari recommended for voice.
          </p>
        )}
        {errorMsg && status !== "listening" && (
          <p className="mt-3 text-amber-300 text-sm max-w-md">{errorMsg}</p>
        )}

        {/* Manual fallback */}
        <form
          onSubmit={submitManual}
          className="mt-6 flex w-full max-w-xl gap-2"
        >
          <input
            type="text"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Or type it: '1 banana and a coffee'"
            className="flex-1 rounded-full border border-neutral-800 bg-neutral-900/70 px-5 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          />
          <button
            type="submit"
            className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-400 transition"
          >
            Log
          </button>
        </form>
      </section>

      {/* Daily summary */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-wider text-neutral-400">
              Today
            </p>
            <p className="mt-1 text-4xl font-bold text-white">
              {totalToday.toLocaleString()}{" "}
              <span className="text-lg font-medium text-neutral-400">
                / {goal.toLocaleString()} kcal
              </span>
            </p>
            <p
              className={[
                "mt-1 text-sm",
                remaining >= 0 ? "text-emerald-400" : "text-rose-400",
              ].join(" ")}
            >
              {remaining >= 0
                ? `${remaining.toLocaleString()} kcal remaining`
                : `${Math.abs(remaining).toLocaleString()} kcal over goal`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editingGoal ? (
              <>
                <input
                  type="number"
                  min={500}
                  max={10000}
                  step={50}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  className="w-28 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={saveGoalEdit}
                  className="rounded-md bg-rose-500 px-3 py-1.5 text-sm font-medium hover:bg-rose-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoal(false);
                    setGoalDraft(String(goal));
                  }}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditingGoal(true)}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Edit goal
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className={[
              "h-full transition-[width] duration-700",
              remaining >= 0
                ? "bg-gradient-to-r from-rose-500 to-fuchsia-500"
                : "bg-gradient-to-r from-amber-500 to-rose-600",
            ].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {byCategory.map(([cat, kcal]) => (
              <span
                key={cat}
                className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-300"
              >
                <span className="capitalize">{cat}</span>{" "}
                <span className="text-rose-300 font-semibold">
                  {kcal} kcal
                </span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Today's log */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-white">
            Today&apos;s entries
          </h2>
          {todayEntries.length > 0 && (
            <button
              type="button"
              onClick={clearToday}
              className="text-xs text-neutral-400 hover:text-rose-400"
            >
              Clear today
            </button>
          )}
        </div>
        <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900/50">
          {todayEntries.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-500">
              No entries yet today. Speak up — your mic is ready.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {todayEntries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white capitalize">
                      {e.description}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {new Date(e.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {e.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-rose-300">
                      {e.calories} kcal
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${e.description}`}
                      onClick={() => removeEntry(e.id)}
                      className="rounded-full p-1 text-neutral-500 hover:bg-neutral-800 hover:text-rose-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Examples */}
      <section className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Try saying
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "I had two eggs and a slice of toast",
            "200 grams of chicken breast",
            "One banana and a cup of coffee",
            "A slice of pizza and a diet coke",
            "300ml of orange juice",
            "Half an avocado",
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTranscript(s);
                handleFinalTranscript(s);
              }}
              className="text-left rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-300 hover:border-rose-500/50 hover:bg-neutral-900 transition"
            >
              <span className="text-rose-300">&ldquo;</span>
              {s}
              <span className="text-rose-300">&rdquo;</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          {FOODS.length}+ foods recognized · units like grams, ml, cups, slices
          all work · all data stays in your browser.
        </p>
      </section>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur",
              t.kind === "ok" &&
                "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40",
              t.kind === "warn" &&
                "bg-amber-500/20 text-amber-200 border border-amber-500/40",
              t.kind === "error" &&
                "bg-rose-500/20 text-rose-200 border border-rose-500/40",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
