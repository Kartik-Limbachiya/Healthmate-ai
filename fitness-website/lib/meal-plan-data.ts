// This mock data should ideally come from your backend/CMS,
// but for a production-level frontend, centralizing it is key.

// Define a type for our meal plan objects for type-safety
export interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs?: number; // Optional
  fat?: number; // Optional
}

export interface DailyPlan {
  day: string;
  meals: Meal[];
}

export interface GroceryListCategory {
  category: string;
  items: string[];
}

export interface MealPlan {
  id: string;
  title: string;
  description: string;
  category: "Muscle Building" | "Weight Loss" | "Performance" | "Health";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  prepTime: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image: string;
  dietType: "Omnivore" | "Vegetarian" | "Keto" | "Vegan" | "Mediterranean" | "Paleo";
  duration: string;
  servings: string;
  dailyPlan: DailyPlan[];
  groceryList: GroceryListCategory[];
  tips: string[];
  benefits: string[];
}


export const allMealPlans: MealPlan[] = [
  {
    id: "1",
    title: "High Protein Meal Plan",
    description: "Designed for muscle building and strength gain. Focuses on lean proteins, complex carbs, and healthy fats.",
    category: "Muscle Building",
    difficulty: "Intermediate",
    prepTime: "Avg. 30 min/meal",
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 80,
    fiber: 35,
    image: "https://media.istockphoto.com/id/1295633127/photo/grilled-chicken-meat-and-fresh-vegetable-salad-of-tomato-avocado-lettuce-and-spinach-healthy.jpg?s=612x612&w=0&k=20&c=Qa3tiqUCO4VpVMQDXLXG47znCmHr_ZIdoynViJ8kW0E=",
    dietType: "Omnivore",
    duration: "7 Days",
    servings: "1 Person",
    dailyPlan: [
      {
        day: "Monday",
        meals: [
          { name: "Oatmeal with Protein Powder & Berries", time: "8:00 AM", calories: 450, protein: 40, carbs: 55, fat: 10 },
          { name: "Greek Yogurt with Almonds", time: "11:00 AM", calories: 250, protein: 20, carbs: 15, fat: 13 },
          { name: "Chicken Salad Sandwich on Whole Wheat", time: "2:00 PM", calories: 600, protein: 50, carbs: 45, fat: 20 },
          { name: "Protein Shake", time: "5:00 PM (Post-Workout)", calories: 200, protein: 30, carbs: 20, fat: 0 },
          { name: "Salmon with Quinoa & Asparagus", time: "8:00 PM", calories: 700, protein: 40, carbs: 65, fat: 27 },
          { name: "Casein Pudding", time: "10:00 PM", calories: 300, protein: 40, carbs: 20, fat: 5 },
        ],
      },
      // Add full plans for Tuesday - Sunday for this plan
      {
        day: "Tuesday",
        meals: [
           { name: "Scrambled Eggs with Spinach & Feta", time: "8:00 AM", calories: 400, protein: 35, carbs: 10, fat: 25 },
           { name: "Cottage Cheese with Pineapple", time: "11:00 AM", calories: 200, protein: 25, carbs: 20, fat: 2 },
           { name: "Lean Beef Stir-fry with Brown Rice", time: "2:00 PM", calories: 650, protein: 50, carbs: 60, fat: 20 },
           { name: "Protein Bar", time: "5:00 PM", calories: 250, protein: 20, carbs: 25, fat: 10 },
           { name: "Turkey Meatballs with Zucchini Noodles", time: "8:00 PM", calories: 600, protein: 45, carbs: 30, fat: 33 },
           { name: "Greek Yogurt", time: "10:00 PM", calories: 400, protein: 25, carbs: 40, fat: 15 },
        ]
      }
      // ... etc for other days
    ],
    groceryList: [
      { category: "Protein", items: ["Chicken Breast (1.5kg)", "Salmon (600g)", "Lean Beef (500g)", "Turkey Mince (500g)", "Eggs (2 dozen)", "Greek Yogurt (1kg tub)", "Cottage Cheese (500g)", "Protein Powder (Whey & Casein)", "Protein Bars"] },
      { category: "Carbs", items: ["Rolled Oats (1kg)", "Quinoa (500g)", "Whole Wheat Bread (1 loaf)", "Brown Rice (1kg)", "Zucchini (for noodles)", "Pineapple"] },
      { category: "Fats", items: ["Avocado", "Almonds (200g)", "Olive Oil", "Feta Cheese"] },
      { category: "Produce", items: ["Berries (frozen)", "Spinach (large bag)", "Asparagus (1 bunch)", "Stir-fry vegetables (frozen)", "Onions", "Garlic", "Lemons"] },
    ],
    tips: [
      "Drink at least 3 liters of water per day.",
      "Adjust portion sizes based on your specific TDEE and results.",
      "Meal prep your lunches and dinners on Sunday to save time.",
      "Don't skip the post-workout shake, it's crucial for recovery."
    ],
    benefits: [
      "Optimized for muscle protein synthesis with high protein intake.",
      "Sustained energy from complex carbs.",
      "Improved recovery and strength.",
      "Promotes satiety, reducing cravings."
    ],
  },
  {
    id: "2",
    title: "Vegetarian Weight Loss",
    description: "A plant-based plan focused on whole foods to support healthy weight loss while maintaining energy and nutrition.",
    category: "Weight Loss",
    difficulty: "Beginner",
    prepTime: "Avg. 20 min/meal",
    calories: 1800,
    protein: 100,
    carbs: 180,
    fat: 60,
    fiber: 40,
    image: "https://cdn.prod.website-files.com/63ed08484c069d0492f5b0bc/642c5de2f6aa2bd4c9abbe86_6406876a4676d1734a14a9a3_Bowl-of-vegetables-and-fruits-for-a-vegetarian-diet-vegetarian-weight-loss-plan.jpeg",
    dietType: "Vegetarian",
    duration: "7 Days",
    servings: "1 Person",
    dailyPlan: [
       {
        day: "Monday",
        meals: [
          { name: "Tofu Scramble with Spinach", time: "8:00 AM", calories: 350, protein: 30, carbs: 20, fat: 17 },
          { name: "Apple with Peanut Butter", time: "11:00 AM", calories: 200, protein: 8, carbs: 25, fat: 8 },
          { name: "Large Lentil Soup with Whole Grain Bread", time: "2:00 PM", calories: 500, protein: 25, carbs: 80, fat: 10 },
          { name: "Handful of Almonds", time: "5:00 PM", calories: 150, protein: 5, carbs: 5, fat: 13 },
          { name: "Black Bean Burgers on Lettuce Wrap", time: "8:00 PM", calories: 400, protein: 20, carbs: 45, fat: 12 },
          { name: "Greek Yogurt", time: "10:00 PM", calories: 200, protein: 12, carbs: 25, fat: 5 },
        ],
      },
       // ... (Add full plans for other days)
    ],
    groceryList: [
      { category: "Protein", items: ["Firm Tofu (2 blocks)", "Canned Lentils (4 cans)", "Canned Black Beans (3 cans)", "Canned Chickpeas (3 cans)", "Greek Yogurt (1kg tub)", "Eggs (1 dozen)", "Tempeh (1 block)"] },
      { category: "Carbs", items: ["Quinoa (500g)", "Whole Grain Bread (1 loaf)", "Brown Rice (1kg)", "Sweet Potatoes (1kg)", "Rolled Oats (500g)"] },
      { category: "Fats", items: ["Avocado (3)", "Almonds (200g)", "Olive Oil", "Peanut Butter (1 jar)"] },
      { category: "Produce", items: ["Spinach (large bag)", "Apples (7)", "Mixed Greens", "Tomatoes", "Onions", "Garlic", "Berries", "Lemons", "Cucumbers"] },
    ],
    tips: [
      "Focus on whole, unprocessed foods to maximize nutrient density.",
      "Stay hydrated! Drink a glass of water before each meal.",
      "Don't be afraid of healthy fats from nuts and avocado; they help with satiety.",
      "Prep your lunches in advance to avoid unhealthy impulse buys."
    ],
    benefits: [
      "High in fiber, promoting fullness and digestive health.",
      "Rich in micronutrients from diverse plant sources.",
      "Supports healthy and sustainable weight loss without feeling deprived.",
      "Naturally low in saturated fats."
    ],
  },
  {
    id: "3",
    title: "Keto Meal Plan",
    category: "Weight Loss",
    difficulty: "Advanced",
    prepTime: "Avg. 40 min/meal",
    calories: 2000,
    protein: 140,
    carbs: 30, // Very low carb
    fat: 155,
    fiber: 20,
    image: "https://hellomealsonme.com/blogs/wp-content/uploads/2024/02/7-Day-Keto-Friendly-Meal-Plan.jpg",
    dietType: "Keto",
    duration: "7 Days",
    servings: "1 Person",
    description: "High fat, moderate protein, very low carb plan designed to induce and maintain ketosis for effective fat burning.",
    dailyPlan: [ /* ... Add Keto meals ... */ ],
    groceryList: [ /* ... Add Keto groceries ... */ ],
    tips: [ /* ... Add Keto tips ... */ ],
    benefits: [ /* ... Add Keto benefits ... */ ],
  },
  {
    id: "44",
    title: "Vegan Performance",
    category: "Performance",
    difficulty: "Intermediate",
    prepTime: "Avg. 35 min/meal",
    calories: 2200,
    protein: 120,
    carbs: 280,
    fat: 65,
    fiber: 50,
    image: "https://www.canfitpro.com/wp-content/uploads/2018/08/vegah-square_2.jpg",
    dietType: "Vegan",
    duration: "7 Days",
    servings: "1 Person",
    description: "Plant-based fuel optimized for athletic performance with complete proteins and nutrient timing.",
    dailyPlan: [ /* ... Add Vegan meals ... */ ],
    groceryList: [ /* ... Add Vegan groceries ... */ ],
    tips: [ /* ... Add Vegan tips ... */ ],
    benefits: [ /* ... Add Vegan benefits ... */ ],
  },
  {
    id: "5",
    title: "Mediterranean Diet",
    category: "Health",
    difficulty: "Beginner",
    prepTime: "Avg. 25 min/meal",
    calories: 2100,
    protein: 110,
    carbs: 230,
    fat: 85,
    fiber: 38,
    image: "https://media.sunbasket.com/2022/07/62abeaa1-3aff-4296-abce-e14c5507986c.webp",
    dietType: "Mediterranean",
    duration: "7 Days",
    servings: "1 Person",
    description: "Heart-healthy Mediterranean approach focusing on olive oil, fish, whole grains, and fresh produce.",
    dailyPlan: [ /* ... Add Med meals ... */ ],
    groceryList: [ /* ... Add Med groceries ... */ ],
    tips: [ /* ... Add Med tips ... */ ],
    benefits: [ /* ... Add Med benefits ... */ ],
  },
  {
    id: "6",
    title: "Paleo Meal Plan",
    category: "Health",
    difficulty: "Intermediate",
    prepTime: "Avg. 35 min/meal",
    calories: 2300,
    protein: 150,
    carbs: 160,
    fat: 110,
    fiber: 35,
    image: "https://cdn-prod.medicalnewstoday.com/content/images/articles/324/324405/chicken-salad-in-bowl-top-down-view-with-olive-oil-in-jar.jpg",
    dietType: "Paleo",
    duration: "7 Days",
    servings: "1 Person",
    description: "Based on foods presumed to have been eaten by early humans - meat, fish, vegetables, fruits, nuts, and seeds.",
    dailyPlan: [ /* ... Add Paleo meals ... */ ],
    groceryList: [ /* ... Add Paleo groceries ... */ ],
    tips: [ /* ... Add Paleo tips ... */ ],
    benefits: [ /* ... Add Paleo benefits ... */ ],
  },
];

/**
 * Helper function to get a single plan by its ID.
 * We'll use this in the [id]/page.tsx component.
 * @param id The ID of the meal plan to retrieve.
 * @returns {MealPlan | null} The found meal plan or null.
 */
export const getMealPlanById = (id: string): MealPlan | null => {
  return allMealPlans.find(plan => plan.id === id) || null;
}