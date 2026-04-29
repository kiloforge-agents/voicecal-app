// Calorie database. Values are kcal per the given unit.
// Sourced from generally-accepted nutrition averages — meant for quick logging,
// not medical accuracy.

export type FoodEntry = {
  name: string;
  // canonical singular noun (no plural, lowercase)
  aliases?: string[];
  // calories per default serving, when no quantity/unit given
  perServing: number;
  // calories per gram (used when user says "200g of …")
  perGram?: number;
  // calories per milliliter (used when user says "300ml of …")
  perMl?: number;
  // human-readable description of the default serving
  servingLabel: string;
  category:
    | "fruit"
    | "veg"
    | "grain"
    | "protein"
    | "dairy"
    | "snack"
    | "drink"
    | "meal"
    | "dessert"
    | "fat"
    | "other";
};

export const FOODS: FoodEntry[] = [
  // Fruits
  { name: "apple", perServing: 95, perGram: 0.52, servingLabel: "1 medium", category: "fruit" },
  { name: "banana", perServing: 105, perGram: 0.89, servingLabel: "1 medium", category: "fruit" },
  { name: "orange", perServing: 62, perGram: 0.47, servingLabel: "1 medium", category: "fruit" },
  { name: "strawberry", aliases: ["strawberries"], perServing: 4, perGram: 0.32, servingLabel: "1 berry", category: "fruit" },
  { name: "blueberry", aliases: ["blueberries"], perServing: 1, perGram: 0.57, servingLabel: "1 berry", category: "fruit" },
  { name: "grape", aliases: ["grapes"], perServing: 3, perGram: 0.69, servingLabel: "1 grape", category: "fruit" },
  { name: "watermelon", perServing: 46, perGram: 0.3, servingLabel: "1 cup", category: "fruit" },
  { name: "mango", perServing: 99, perGram: 0.6, servingLabel: "1 cup", category: "fruit" },
  { name: "pineapple", perServing: 82, perGram: 0.5, servingLabel: "1 cup", category: "fruit" },
  { name: "peach", perServing: 59, perGram: 0.39, servingLabel: "1 medium", category: "fruit" },
  { name: "pear", perServing: 101, perGram: 0.57, servingLabel: "1 medium", category: "fruit" },
  { name: "avocado", perServing: 234, perGram: 1.6, servingLabel: "1 medium", category: "fruit" },

  // Vegetables
  { name: "carrot", aliases: ["carrots"], perServing: 25, perGram: 0.41, servingLabel: "1 medium", category: "veg" },
  { name: "broccoli", perServing: 55, perGram: 0.34, servingLabel: "1 cup", category: "veg" },
  { name: "spinach", perServing: 7, perGram: 0.23, servingLabel: "1 cup", category: "veg" },
  { name: "salad", perServing: 150, servingLabel: "1 bowl", category: "veg" },
  { name: "tomato", aliases: ["tomatoes"], perServing: 22, perGram: 0.18, servingLabel: "1 medium", category: "veg" },
  { name: "potato", aliases: ["potatoes"], perServing: 161, perGram: 0.77, servingLabel: "1 medium baked", category: "veg" },
  { name: "sweet potato", perServing: 112, perGram: 0.86, servingLabel: "1 medium", category: "veg" },
  { name: "cucumber", perServing: 16, perGram: 0.16, servingLabel: "1 cup", category: "veg" },

  // Grains / starches
  { name: "rice", perServing: 206, perGram: 1.3, servingLabel: "1 cup cooked", category: "grain" },
  { name: "brown rice", perServing: 216, perGram: 1.12, servingLabel: "1 cup cooked", category: "grain" },
  { name: "pasta", perServing: 220, perGram: 1.31, servingLabel: "1 cup cooked", category: "grain" },
  { name: "bread", perServing: 80, perGram: 2.65, servingLabel: "1 slice", category: "grain" },
  { name: "toast", perServing: 80, perGram: 2.65, servingLabel: "1 slice", category: "grain" },
  { name: "bagel", perServing: 250, servingLabel: "1 medium", category: "grain" },
  { name: "oatmeal", aliases: ["oats", "porridge"], perServing: 150, perGram: 0.68, servingLabel: "1 cup cooked", category: "grain" },
  { name: "cereal", perServing: 110, servingLabel: "1 cup", category: "grain" },
  { name: "tortilla", perServing: 140, servingLabel: "1 medium", category: "grain" },
  { name: "quinoa", perServing: 222, perGram: 1.2, servingLabel: "1 cup cooked", category: "grain" },

  // Protein
  { name: "egg", aliases: ["eggs"], perServing: 78, servingLabel: "1 large", category: "protein" },
  { name: "chicken breast", aliases: ["chicken"], perServing: 165, perGram: 1.65, servingLabel: "100g", category: "protein" },
  { name: "steak", aliases: ["beef"], perServing: 271, perGram: 2.71, servingLabel: "100g", category: "protein" },
  { name: "salmon", perServing: 208, perGram: 2.08, servingLabel: "100g", category: "protein" },
  { name: "tuna", perServing: 132, perGram: 1.32, servingLabel: "100g", category: "protein" },
  { name: "shrimp", aliases: ["prawn", "prawns"], perServing: 99, perGram: 0.99, servingLabel: "100g", category: "protein" },
  { name: "tofu", perServing: 144, perGram: 0.76, servingLabel: "100g", category: "protein" },
  { name: "bacon", perServing: 43, servingLabel: "1 strip", category: "protein" },
  { name: "sausage", perServing: 210, servingLabel: "1 link", category: "protein" },
  { name: "turkey", perServing: 135, perGram: 1.35, servingLabel: "100g", category: "protein" },
  { name: "ham", perServing: 145, perGram: 1.45, servingLabel: "100g", category: "protein" },
  { name: "pork", perServing: 242, perGram: 2.42, servingLabel: "100g", category: "protein" },
  { name: "lamb", perServing: 294, perGram: 2.94, servingLabel: "100g", category: "protein" },

  // Dairy
  { name: "milk", perServing: 149, perMl: 0.62, servingLabel: "1 cup", category: "dairy" },
  { name: "almond milk", perServing: 39, perMl: 0.16, servingLabel: "1 cup", category: "dairy" },
  { name: "cheese", perServing: 113, perGram: 4.0, servingLabel: "1 slice (28g)", category: "dairy" },
  { name: "yogurt", aliases: ["yoghurt"], perServing: 150, perGram: 0.59, servingLabel: "1 cup", category: "dairy" },
  { name: "greek yogurt", aliases: ["greek yoghurt"], perServing: 100, perGram: 0.59, servingLabel: "1 cup", category: "dairy" },
  { name: "butter", perServing: 102, perGram: 7.17, servingLabel: "1 tbsp", category: "fat" },

  // Fats / nuts
  { name: "olive oil", perServing: 119, perMl: 8.84, servingLabel: "1 tbsp", category: "fat" },
  { name: "peanut butter", perServing: 188, perGram: 5.88, servingLabel: "2 tbsp", category: "fat" },
  { name: "almond", aliases: ["almonds"], perServing: 7, perGram: 5.79, servingLabel: "1 nut", category: "fat" },
  { name: "walnut", aliases: ["walnuts"], perServing: 26, perGram: 6.54, servingLabel: "1 nut", category: "fat" },
  { name: "cashew", aliases: ["cashews"], perServing: 9, perGram: 5.53, servingLabel: "1 nut", category: "fat" },

  // Snacks / desserts
  { name: "chips", aliases: ["crisps"], perServing: 152, perGram: 5.36, servingLabel: "1 oz bag", category: "snack" },
  { name: "cookie", aliases: ["cookies", "biscuit", "biscuits"], perServing: 150, servingLabel: "1 medium", category: "dessert" },
  { name: "chocolate", perServing: 155, perGram: 5.46, servingLabel: "1 oz", category: "dessert" },
  { name: "ice cream", perServing: 137, perGram: 2.07, servingLabel: "1/2 cup", category: "dessert" },
  { name: "cake", perServing: 235, servingLabel: "1 slice", category: "dessert" },
  { name: "donut", aliases: ["doughnut"], perServing: 250, servingLabel: "1 medium", category: "dessert" },
  { name: "muffin", perServing: 265, servingLabel: "1 medium", category: "dessert" },
  { name: "candy", aliases: ["sweets"], perServing: 100, servingLabel: "small handful", category: "dessert" },
  { name: "popcorn", perServing: 31, perGram: 3.87, servingLabel: "1 cup popped", category: "snack" },
  { name: "granola bar", perServing: 130, servingLabel: "1 bar", category: "snack" },
  { name: "protein bar", perServing: 200, servingLabel: "1 bar", category: "snack" },

  // Drinks
  { name: "water", perServing: 0, perMl: 0, servingLabel: "any", category: "drink" },
  { name: "coffee", perServing: 2, perMl: 0.01, servingLabel: "1 cup black", category: "drink" },
  { name: "latte", perServing: 190, perMl: 0.6, servingLabel: "12 oz", category: "drink" },
  { name: "cappuccino", perServing: 120, perMl: 0.4, servingLabel: "12 oz", category: "drink" },
  { name: "tea", perServing: 2, perMl: 0.01, servingLabel: "1 cup", category: "drink" },
  { name: "orange juice", aliases: ["oj"], perServing: 112, perMl: 0.45, servingLabel: "1 cup", category: "drink" },
  { name: "apple juice", perServing: 114, perMl: 0.46, servingLabel: "1 cup", category: "drink" },
  { name: "soda", aliases: ["coke", "pepsi", "cola"], perServing: 140, perMl: 0.42, servingLabel: "12 oz can", category: "drink" },
  { name: "diet soda", aliases: ["diet coke"], perServing: 0, perMl: 0, servingLabel: "12 oz can", category: "drink" },
  { name: "beer", perServing: 153, perMl: 0.43, servingLabel: "12 oz", category: "drink" },
  { name: "wine", perServing: 125, perMl: 0.83, servingLabel: "5 oz glass", category: "drink" },
  { name: "smoothie", perServing: 250, perMl: 0.83, servingLabel: "16 oz", category: "drink" },

  // Composite meals
  { name: "pizza", perServing: 285, servingLabel: "1 slice", category: "meal" },
  { name: "burger", aliases: ["hamburger", "cheeseburger"], perServing: 354, servingLabel: "1 medium", category: "meal" },
  { name: "hot dog", aliases: ["hotdog"], perServing: 290, servingLabel: "1 with bun", category: "meal" },
  { name: "sandwich", perServing: 350, servingLabel: "1 medium", category: "meal" },
  { name: "burrito", perServing: 450, servingLabel: "1 medium", category: "meal" },
  { name: "taco", aliases: ["tacos"], perServing: 170, servingLabel: "1 medium", category: "meal" },
  { name: "sushi roll", aliases: ["sushi"], perServing: 200, servingLabel: "1 roll (8 pieces)", category: "meal" },
  { name: "salad bowl", perServing: 350, servingLabel: "1 bowl", category: "meal" },
  { name: "soup", perServing: 150, perMl: 0.5, servingLabel: "1 cup", category: "meal" },
  { name: "ramen", perServing: 380, servingLabel: "1 bowl", category: "meal" },
  { name: "pasta dish", perServing: 450, servingLabel: "1 plate", category: "meal" },
  { name: "fries", aliases: ["french fries", "chips fries"], perServing: 365, perGram: 3.12, servingLabel: "medium order", category: "snack" },
];

export function findFood(query: string): FoodEntry | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // exact name or alias
  for (const f of FOODS) {
    if (f.name === q) return f;
    if (f.aliases?.includes(q)) return f;
  }
  // multi-word: check if query *contains* any food name (longest first)
  const sorted = [...FOODS].sort((a, b) => b.name.length - a.name.length);
  for (const f of sorted) {
    const needles = [f.name, ...(f.aliases ?? [])];
    for (const n of needles) {
      const re = new RegExp(`\\b${n.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (re.test(q)) return f;
    }
  }
  return null;
}
