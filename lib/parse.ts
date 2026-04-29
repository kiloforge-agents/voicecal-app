import { findFood, FoodEntry } from "./foods";

export type ParsedItem = {
  food: FoodEntry;
  // calories for this logged item
  calories: number;
  // human-readable description e.g. "2 apples" or "200g chicken breast"
  description: string;
  // raw matched chunk
  raw: string;
};

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  half: 0.5,
  quarter: 0.25,
  dozen: 12,
  couple: 2,
  few: 3,
};

const FILLER = new Set([
  "i",
  "ate",
  "had",
  "drank",
  "drink",
  "ate the",
  "had the",
  "just",
  "for",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "today",
  "now",
  "the",
  "a",
  "an",
  "some",
  "of",
  "with",
  "and",
  "then",
  "also",
  "plus",
]);

function stripFiller(text: string): string {
  // remove leading "I ate", "I had", "I drank" etc.
  let t = text.toLowerCase().trim();
  t = t.replace(/[.,!?;:]/g, " ");
  t = t.replace(/\s+/g, " ");
  t = t.replace(/^(i\s+)?(just\s+)?(ate|had|drank|consumed|finished)\s+/i, "");
  t = t.replace(/^(log|add|track|record)\s+/i, "");
  return t.trim();
}

// Split on ", ", " and ", " then ", " plus "
function splitChunks(text: string): string[] {
  return text
    .split(/\s*(?:,|\band\b|\bthen\b|\bplus\b|\bwith\b)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Quantity = {
  count?: number;
  grams?: number;
  ml?: number;
  ounces?: number;
};

// Parse a numeric/word quantity at the *start* of a chunk.
function parseQuantity(chunk: string): { qty: Quantity; rest: string } {
  const tokens = chunk.split(/\s+/);
  const qty: Quantity = {};
  let consumed = 0;

  // Handle "1.5", "2", "200" etc.
  const numMatch = tokens[0]?.match(/^(\d+(?:\.\d+)?)$/);
  let num: number | undefined;

  if (numMatch) {
    num = parseFloat(numMatch[1]);
    consumed = 1;
  } else if (tokens[0] && NUMBER_WORDS[tokens[0]] !== undefined) {
    num = NUMBER_WORDS[tokens[0]];
    consumed = 1;
  }

  // Look for a unit immediately after the number.
  if (num !== undefined) {
    const unitTok = tokens[1]?.toLowerCase();
    const unitFromCombined = tokens[0]?.toLowerCase().match(/^(\d+(?:\.\d+)?)(g|kg|ml|l|oz)$/);

    if (unitFromCombined) {
      const v = parseFloat(unitFromCombined[1]);
      const u = unitFromCombined[2];
      if (u === "g") qty.grams = v;
      else if (u === "kg") qty.grams = v * 1000;
      else if (u === "ml") qty.ml = v;
      else if (u === "l") qty.ml = v * 1000;
      else if (u === "oz") qty.ounces = v;
      consumed = 1;
    } else if (unitTok === "grams" || unitTok === "gram" || unitTok === "g") {
      qty.grams = num;
      consumed = 2;
    } else if (unitTok === "kilograms" || unitTok === "kilo" || unitTok === "kilos" || unitTok === "kg") {
      qty.grams = num * 1000;
      consumed = 2;
    } else if (unitTok === "milliliters" || unitTok === "milliliter" || unitTok === "ml") {
      qty.ml = num;
      consumed = 2;
    } else if (unitTok === "liters" || unitTok === "liter" || unitTok === "litre" || unitTok === "litres" || unitTok === "l") {
      qty.ml = num * 1000;
      consumed = 2;
    } else if (unitTok === "ounces" || unitTok === "ounce" || unitTok === "oz") {
      qty.ounces = num;
      consumed = 2;
    } else if (
      unitTok === "cups" ||
      unitTok === "cup" ||
      unitTok === "slice" ||
      unitTok === "slices" ||
      unitTok === "piece" ||
      unitTok === "pieces" ||
      unitTok === "bowl" ||
      unitTok === "bowls" ||
      unitTok === "plate" ||
      unitTok === "plates" ||
      unitTok === "serving" ||
      unitTok === "servings" ||
      unitTok === "glass" ||
      unitTok === "glasses" ||
      unitTok === "can" ||
      unitTok === "cans" ||
      unitTok === "bottle" ||
      unitTok === "bottles"
    ) {
      qty.count = num;
      consumed = 2;
    } else {
      qty.count = num;
      consumed = 1;
    }
  }

  const rest = tokens.slice(consumed).join(" ").trim();
  return { qty, rest };
}

function calcCalories(food: FoodEntry, qty: Quantity): { kcal: number; label: string } {
  if (qty.grams !== undefined && food.perGram !== undefined) {
    return { kcal: Math.round(qty.grams * food.perGram), label: `${qty.grams}g ${food.name}` };
  }
  if (qty.ounces !== undefined && food.perGram !== undefined) {
    const g = qty.ounces * 28.3495;
    return { kcal: Math.round(g * food.perGram), label: `${qty.ounces}oz ${food.name}` };
  }
  if (qty.ml !== undefined && food.perMl !== undefined) {
    return { kcal: Math.round(qty.ml * food.perMl), label: `${qty.ml}ml ${food.name}` };
  }
  if (qty.count !== undefined) {
    const n = qty.count;
    return {
      kcal: Math.round(n * food.perServing),
      label: `${n} ${pluralize(food.name, n)}`,
    };
  }
  // No quantity found — assume 1 serving.
  return { kcal: food.perServing, label: `1 ${food.name}` };
}

function pluralize(name: string, n: number): string {
  if (n <= 1) return name;
  // Very simple pluralization rules — most foods are already in singular form.
  if (/(ch|sh|s|x|z)$/.test(name)) return name + "es";
  if (/y$/.test(name) && !/[aeiou]y$/.test(name)) return name.slice(0, -1) + "ies";
  return name + "s";
}

export function parseTranscript(text: string): ParsedItem[] {
  const cleaned = stripFiller(text);
  if (!cleaned) return [];

  const chunks = splitChunks(cleaned);
  const items: ParsedItem[] = [];

  for (const chunk of chunks) {
    if (!chunk) continue;
    // Filter out filler words from the chunk before parsing.
    const filtered = chunk
      .split(/\s+/)
      .filter((tok) => !FILLER.has(tok))
      .join(" ");
    if (!filtered) continue;

    const { qty, rest } = parseQuantity(filtered);
    const search = rest || filtered;
    const food = findFood(search);
    if (!food) continue;

    const { kcal, label } = calcCalories(food, qty);
    items.push({
      food,
      calories: kcal,
      description: label,
      raw: chunk,
    });
  }

  return items;
}
