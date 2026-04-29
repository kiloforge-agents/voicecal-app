import { LogEntry } from "./types";

const KEY_LOG = "voicecal:log";
const KEY_GOAL = "voicecal:goal";

export function loadLog(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_LOG);
    if (!raw) return [];
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

export function saveLog(entries: LogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_LOG, JSON.stringify(entries));
}

export function loadGoal(): number {
  if (typeof window === "undefined") return 2000;
  try {
    const raw = localStorage.getItem(KEY_GOAL);
    return raw ? parseInt(raw, 10) || 2000 : 2000;
  } catch {
    return 2000;
  }
}

export function saveGoal(goal: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_GOAL, String(goal));
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isToday(ts: number): boolean {
  return dayKey(ts) === dayKey(Date.now());
}
