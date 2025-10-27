"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calculator, Utensils, TrendingDown, TrendingUp, Minus, RefreshCw, Download, Trash2, Loader2, Save } from "lucide-react"; // Added Loader2, Save
import { toast } from "sonner"; // Use sonner

// --- Interfaces for type safety ---
interface Macros {
    protein: number;
    carbs: number;
    fat: number;
}

interface Meal {
    name: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}

interface MealPlanResult {
    meals: {
        breakfast: Meal;
        lunch: Meal;
        dinner: Meal;
        snack: Meal;
    };
    totals: Macros & { calories: number };
    targets: Macros & { calories: number };
}

interface SavedProfile {
    name: string;
    age: number;
    weight: number;
    height: number;
    gender: "male" | "female";
    activityLevel: string;
    goal: "lose" | "maintain" | "gain";
    timestamp: number;
}

// --- Mock Meal Database ---
const MEAL_DATABASE: Record<'breakfast' | 'lunch' | 'dinner' | 'snacks', Meal[]> = {
  breakfast: [
    { name: "Oatmeal with berries", protein: 12, carbs: 45, fat: 8, calories: 300 },
    { name: "Greek yogurt with granola", protein: 20, carbs: 35, fat: 10, calories: 320 },
    { name: "Scrambled eggs with toast", protein: 18, carbs: 30, fat: 15, calories: 330 },
    { name: "Protein smoothie", protein: 25, carbs: 40, fat: 8, calories: 340 },
    { name: "Whole grain pancakes", protein: 15, carbs: 50, fat: 12, calories: 380 }
  ],
  lunch: [
    { name: "Grilled chicken salad", protein: 35, carbs: 20, fat: 12, calories: 340 },
    { name: "Tuna wrap with veggies", protein: 30, carbs: 40, fat: 10, calories: 380 },
    { name: "Quinoa bowl with chickpeas", protein: 18, carbs: 55, fat: 14, calories: 420 },
    { name: "Turkey sandwich on whole grain", protein: 28, carbs: 45, fat: 12, calories: 410 },
    { name: "Salmon with brown rice", protein: 32, carbs: 50, fat: 15, calories: 470 }
  ],
  dinner: [
    { name: "Lean beef with sweet potato", protein: 40, carbs: 45, fat: 18, calories: 520 },
    { name: "Grilled fish with vegetables", protein: 35, carbs: 30, fat: 12, calories: 380 },
    { name: "Chicken stir-fry with rice", protein: 38, carbs: 55, fat: 15, calories: 520 },
    { name: "Lentil curry with quinoa", protein: 20, carbs: 60, fat: 10, calories: 420 },
    { name: "Turkey meatballs with pasta", protein: 35, carbs: 50, fat: 16, calories: 490 }
  ],
  snacks: [
    { name: "Protein bar", protein: 20, carbs: 25, fat: 8, calories: 250 },
    { name: "Apple with peanut butter", protein: 5, carbs: 30, fat: 10, calories: 230 },
    { name: "Cottage cheese with fruit", protein: 15, carbs: 20, fat: 5, calories: 180 },
    { name: "Mixed nuts (handful)", protein: 6, carbs: 8, fat: 16, calories: 200 },
    { name: "Protein shake", protein: 24, carbs: 10, fat: 3, calories: 160 }
  ]
};

// --- Local Storage Key ---
const PROFILES_STORAGE_KEY = "healthmate_nutrition_profiles_v1";

export default function NutritionCalculator() {
  // --- State Variables ---
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [activeTab, setActiveTab] = useState("calculator");
  const [mealPlan, setMealPlan] = useState<MealPlanResult | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [profileName, setProfileName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false); // Loading state

  // --- Load saved profiles on mount ---
  useEffect(() => {
    loadProfiles();
  }, []);

  // --- Profile Management ---
  const loadProfiles = () => {
    try {
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (stored) {
        setSavedProfiles(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Could not load saved profiles:", error);
      // If parsing fails, clear corrupted data
      localStorage.removeItem(PROFILES_STORAGE_KEY);
    }
  };

  const saveProfile = () => {
    if (!profileName.trim()) {
      toast.warning("Please enter a profile name");
      return;
    }

    const profile: SavedProfile = {
      name: profileName,
      age,
      weight,
      height,
      gender,
      activityLevel,
      goal,
      timestamp: Date.now()
    };

    try {
      // Prevent duplicate names (optional)
      if (savedProfiles.some(p => p.name.toLowerCase() === profileName.trim().toLowerCase())) {
        toast.warning(`A profile named "${profileName}" already exists.`);
        return;
      }

      const newProfiles = [...savedProfiles, profile];
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(newProfiles));
      setSavedProfiles(newProfiles);
      setProfileName(""); // Clear input after save
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Could not save profile. Storage might be full.");
    }
  };

  const loadProfile = (profile: SavedProfile) => {
    setIsLoadingProfile(true); // Start loading indication
    setAge(profile.age);
    setWeight(profile.weight);
    setHeight(profile.height);
    setGender(profile.gender);
    setActivityLevel(profile.activityLevel);
    setGoal(profile.goal);
    setActiveTab("calculator"); // Switch back to calculator tab
    toast.info(`Loaded profile: ${profile.name}`);
    setTimeout(() => setIsLoadingProfile(false), 300); // Simulate loading & remove spinner
  };

  const deleteProfile = (profileToDelete: SavedProfile) => {
    try {
      const newProfiles = savedProfiles.filter(p => p.timestamp !== profileToDelete.timestamp);
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(newProfiles));
      setSavedProfiles(newProfiles);
      toast.success(`Profile "${profileToDelete.name}" deleted.`);
    } catch (error) {
      console.error("Failed to delete profile:", error);
      toast.error("Could not delete profile.");
    }
  };

  // --- Calculation Logic ---

  // Calculate BMR (Mifflin-St Jeor)
  const calculateBMR = (): number => {
    if (!weight || !height || !age) return 0;
    if (gender === "male") {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  // Calculate TDEE
  const calculateTDEE = (): number => {
    const bmr = calculateBMR();
    if (bmr === 0) return 0;
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55)); // Default to moderate if invalid
  };

  // Calculate target calories based on goal
  const calculateTargetCalories = (): number => {
    const tdee = calculateTDEE();
    if (tdee === 0) return 0;
    switch (goal) {
      case "lose": return Math.max(1200, Math.round(tdee * 0.8)); // Add a minimum calorie floor
      case "maintain": return tdee;
      case "gain": return Math.round(tdee * 1.15);
      default: return tdee;
    }
  };

  // Calculate BMI
  const calculateBMI = (): string => {
    if (!height || height === 0 || !weight) return "0.0";
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    if (isNaN(bmi) || !isFinite(bmi)) return "0.0";
    return bmi.toFixed(1);
  };

  // Get BMI Category and color
  const getBMICategory = (bmiValue: number): { category: string; color: string } => {
     if (isNaN(bmiValue)) return { category: "N/A", color: "text-gray-600" };
     if (bmiValue < 18.5) return { category: "Underweight", color: "text-blue-600" };
     if (bmiValue < 25) return { category: "Normal", color: "text-green-600" };
     if (bmiValue < 30) return { category: "Overweight", color: "text-orange-600" };
     return { category: "Obese", color: "text-red-600" };
  };

  // Calculate macros based on goal
  const calculateMacros = (): Macros => {
    const targetCalories = calculateTargetCalories();
    if (targetCalories === 0) return { protein: 0, carbs: 0, fat: 0 };

    let proteinPercentage: number, carbPercentage: number, fatPercentage: number;

    // Goal-based macro splits (adjust as needed)
    switch (goal) {
      case "lose": [proteinPercentage, carbPercentage, fatPercentage] = [0.40, 0.30, 0.30]; break;
      case "maintain": [proteinPercentage, carbPercentage, fatPercentage] = [0.30, 0.40, 0.30]; break;
      case "gain": [proteinPercentage, carbPercentage, fatPercentage] = [0.30, 0.50, 0.20]; break;
      default: [proteinPercentage, carbPercentage, fatPercentage] = [0.30, 0.40, 0.30];
    }

    const proteinGrams = Math.round((targetCalories * proteinPercentage) / 4);
    const carbGrams = Math.round((targetCalories * carbPercentage) / 4);
    const fatGrams = Math.round((targetCalories * fatPercentage) / 9);

    return { protein: proteinGrams, carbs: carbGrams, fat: fatGrams };
  };

  // --- Meal Plan Generation ---
  const generateMealPlan = () => {
    const targetCalories = calculateTargetCalories();
    const targetMacros = calculateMacros();

    if (targetCalories <= 0) {
        toast.warning("Please enter valid details to calculate targets before generating a plan.");
        return;
    }

    // Simple calorie distribution (can be refined)
    const calorieDistribution = {
      breakfast: targetCalories * 0.25,
      lunch: targetCalories * 0.35,
      dinner: targetCalories * 0.35,
      snacks: targetCalories * 0.05
    };

    // Helper to select a meal close to target calories
    const selectMeal = (meals: Meal[], targetCals: number): Meal => {
      if (!meals || meals.length === 0) {
        return { name: "N/A - No meals available", protein: 0, carbs: 0, fat: 0, calories: 0 }; // Default if empty
      }
      // Find meal closest to target calories
      const sorted = [...meals].sort((a, b) =>
        Math.abs(a.calories - targetCals) - Math.abs(b.calories - targetCals)
      );
      // Pick randomly from the top 3 closest (or fewer if less than 3 available)
      return sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
    };

    const breakfast = selectMeal(MEAL_DATABASE.breakfast, calorieDistribution.breakfast);
    const lunch = selectMeal(MEAL_DATABASE.lunch, calorieDistribution.lunch);
    const dinner = selectMeal(MEAL_DATABASE.dinner, calorieDistribution.dinner);
    const snack = selectMeal(MEAL_DATABASE.snacks, calorieDistribution.snacks);

    const plan: MealPlanResult = {
      meals: { breakfast, lunch, dinner, snack },
      totals: {
        calories: breakfast.calories + lunch.calories + dinner.calories + snack.calories,
        protein: breakfast.protein + lunch.protein + dinner.protein + snack.protein,
        carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs,
        fat: breakfast.fat + lunch.fat + dinner.fat + snack.fat
      },
      targets: {
        calories: targetCalories,
        ...targetMacros
      }
    };

    setMealPlan(plan);
    setActiveTab("meals"); // Switch to meal plan tab
    toast.success("Meal plan generated!");
  };

  // --- Export Meal Plan ---
  const exportMealPlan = () => {
    if (!mealPlan) return;

    // Use template literals for cleaner formatting
    const text = `
HEALTHMATE DAILY MEAL PLAN
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
------------------------------------------
YOUR TARGET NUTRITION:
Calories: ${mealPlan.targets.calories} kcal
Protein:  ${mealPlan.targets.protein}g
Carbs:    ${mealPlan.targets.carbs}g
Fat:      ${mealPlan.targets.fat}g
------------------------------------------
MEAL PLAN:

** Breakfast: ${mealPlan.meals.breakfast.name} **
   Calories: ${mealPlan.meals.breakfast.calories} | Protein: ${mealPlan.meals.breakfast.protein}g | Carbs: ${mealPlan.meals.breakfast.carbs}g | Fat: ${mealPlan.meals.breakfast.fat}g

** Lunch: ${mealPlan.meals.lunch.name} **
   Calories: ${mealPlan.meals.lunch.calories} | Protein: ${mealPlan.meals.lunch.protein}g | Carbs: ${mealPlan.meals.lunch.carbs}g | Fat: ${mealPlan.meals.lunch.fat}g

** Dinner: ${mealPlan.meals.dinner.name} **
   Calories: ${mealPlan.meals.dinner.calories} | Protein: ${mealPlan.meals.dinner.protein}g | Carbs: ${mealPlan.meals.dinner.carbs}g | Fat: ${mealPlan.meals.dinner.fat}g

** Snack: ${mealPlan.meals.snack.name} **
   Calories: ${mealPlan.meals.snack.calories} | Protein: ${mealPlan.meals.snack.protein}g | Carbs: ${mealPlan.meals.snack.carbs}g | Fat: ${mealPlan.meals.snack.fat}g
------------------------------------------
PLANNED TOTALS:
Calories: ${mealPlan.totals.calories} kcal
Protein:  ${mealPlan.totals.protein}g
Carbs:    ${mealPlan.totals.carbs}g
Fat:      ${mealPlan.totals.fat}g
------------------------------------------
Note: This is a sample plan. Adjust portions and foods based on preferences.
    `.trim();

    try {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HealthMate-MealPlan-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a); // Append to body for Firefox compatibility
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url);
        toast.success("Meal plan exported!");
    } catch (error) {
        console.error("Failed to export meal plan:", error);
        toast.error("Could not export meal plan.");
    }
  };

  // --- Helper Functions ---
  const getProgressValue = (value?: number, target?: number): number => {
    if (!value || !target || target === 0 || isNaN(target) || isNaN(value)) return 0;
    const progress = (value / target) * 100;
    return Math.min(isNaN(progress) ? 0 : progress, 150); // Allow showing >100% up to 150%
  };

   // --- Memoized Calculation Results ---
   // Use useMemo to avoid recalculating on every render
   const tdee = React.useMemo(calculateTDEE, [weight, height, age, gender, activityLevel]);
   const targetCalories = React.useMemo(calculateTargetCalories, [tdee, goal]);
   const macros = React.useMemo(calculateMacros, [targetCalories, goal]);
   const bmi = React.useMemo(calculateBMI, [weight, height]);
   const bmiValue = parseFloat(bmi);
   const bmiInfo = React.useMemo(() => getBMICategory(bmiValue), [bmiValue]);


  // --- Render ---
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 p-4 md:p-8 rounded-lg shadow-md">
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger value="calculator">
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="meals">
              <Utensils className="w-4 h-4 mr-2" />
              Meal Plan
            </TabsTrigger>
            <TabsTrigger value="profiles">
              <Save className="w-4 h-4 mr-2" />
              Profiles
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Enter details to calculate nutrition needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={gender} onValueChange={(value: "male" | "female") => setGender(value)} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
                    </RadioGroup>
                  </div>
                  {/* Age, Weight, Height */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label htmlFor="age">Age</Label><Input id="age" type="number" value={age} onChange={(e) => setAge(Number.parseInt(e.target.value) || 0)} min="15" max="100" /></div>
                    <div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" value={weight} onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)} min="30" max="300" step="0.1"/></div>
                    <div className="space-y-2"><Label htmlFor="height">Height (cm)</Label><Input id="height" type="number" value={height} onChange={(e) => setHeight(Number.parseInt(e.target.value) || 0)} min="100" max="250"/></div>
                  </div>
                  {/* Activity Level */}
                  <div className="space-y-2">
                    <Label htmlFor="activity">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (office job)</SelectItem>
                        <SelectItem value="light">Light (1-3 days/week exercise)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-5 days/week exercise)</SelectItem>
                        <SelectItem value="active">Active (6-7 days/week exercise)</SelectItem>
                        <SelectItem value="veryActive">Very Active (hard daily exercise/physical job)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Goal */}
                  <div className="space-y-2">
                    <Label htmlFor="goal">Fitness Goal</Label>
                    <Select value={goal} onValueChange={(value: "lose" | "maintain" | "gain") => setGoal(value)}>
                      <SelectTrigger><SelectValue placeholder="Select your goal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose"><div className="flex items-center"><TrendingDown className="w-4 h-4 mr-2" /> Lose Weight</div></SelectItem>
                        <SelectItem value="maintain"><div className="flex items-center"><Minus className="w-4 h-4 mr-2" /> Maintain Weight</div></SelectItem>
                        <SelectItem value="gain"><div className="flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Gain Muscle</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Save Profile */}
                  <div className="pt-4 border-t dark:border-gray-700">
                    <Label htmlFor="profileName">Save Current Settings (Optional)</Label>
                    <div className="flex gap-2 mt-2">
                      <Input id="profileName" placeholder="Enter profile name..." value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                      <Button onClick={saveProfile} variant="outline"><Save className="w-4 h-4 mr-2"/> Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Area */}
              <div className="space-y-6">
                {/* Summary Results */}
                 <Card className="bg-white dark:bg-gray-800 shadow-lg">
                   <CardHeader>
                     <CardTitle>Your Estimated Needs</CardTitle>
                     <CardDescription>Based on the information provided</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     <div className="grid grid-cols-2 gap-4 text-center">
                        {/* BMI */}
                       <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                         <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">BMI</div>
                         <div className={`text-3xl font-bold ${bmiInfo.color}`}>{bmi}</div>
                         <div className={`text-xs font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</div>
                       </div>
                       {/* BMR */}
                       <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                         <div className="text-sm text-green-800 dark:text-green-300 font-medium">Basal Metabolic Rate</div>
                         <div className="text-3xl font-bold text-green-700 dark:text-green-400">{calculateBMR()}</div>
                         <div className="text-xs text-muted-foreground">kcal / day</div>
                       </div>
                     </div>
                     {/* TDEE */}
                     <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-center">
                         <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">Total Daily Energy Expenditure (TDEE)</div>
                         <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{tdee}</div>
                         <div className="text-xs text-muted-foreground">kcal / day (includes activity)</div>
                     </div>
                     {/* Target Calories */}
                     <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 text-center">
                         <div className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">Target Daily Calories</div>
                         <div className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">{targetCalories}</div>
                         <div className="text-xs text-muted-foreground">For your goal ({goal})</div>
                     </div>
                   </CardContent>
                 </Card>

                {/* Macros Card */}
                <Card className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardHeader>
                    <CardTitle>Recommended Macronutrients</CardTitle>
                    <CardDescription>Approximate daily targets for your goal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Protein */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-green-700 dark:text-green-400">Protein</span>
                        <span className="text-muted-foreground">{macros.protein}g ({Math.round(macros.protein * 4)} kcal)</span>
                      </div>
                      <Progress value={getProgressValue(macros.protein * 4, targetCalories)} className="h-2 [&>div]:bg-green-500" />
                    </div>
                    {/* Carbs */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-400">Carbohydrates</span>
                        <span className="text-muted-foreground">{macros.carbs}g ({Math.round(macros.carbs * 4)} kcal)</span>
                      </div>
                      <Progress value={getProgressValue(macros.carbs * 4, targetCalories)} className="h-2 [&>div]:bg-blue-500" />
                    </div>
                    {/* Fat */}
                     <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-orange-700 dark:text-orange-400">Fat</span>
                        <span className="text-muted-foreground">{macros.fat}g ({Math.round(macros.fat * 9)} kcal)</span>
                      </div>
                      <Progress value={getProgressValue(macros.fat * 9, targetCalories)} className="h-2 [&>div]:bg-orange-500" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={generateMealPlan} size="lg" disabled={targetCalories <= 0}>
                      <Utensils className="w-4 h-4 mr-2" />
                      Generate Sample Meal Plan
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Meal Plan Tab */}
          <TabsContent value="meals">
            {mealPlan ? (
              <div className="space-y-6">
                <Card className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <CardTitle>Your Generated Sample Meal Plan</CardTitle>
                        <CardDescription>A day of eating based on your targets</CardDescription>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button onClick={generateMealPlan} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                        </Button>
                        <Button onClick={exportMealPlan} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Meals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {Object.entries(mealPlan.meals).map(([type, meal]) => (
                        <Card key={type} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 border dark:border-gray-700 flex flex-col">
                          <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base font-semibold capitalize">{type}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 flex-grow">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{meal.name}</p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex justify-between"><span>Calories:</span> <span className="font-medium">{meal.calories}</span></div>
                              <div className="flex justify-between"><span>Protein:</span> <span className="font-medium">{meal.protein}g</span></div>
                              <div className="flex justify-between"><span>Carbs:</span> <span className="font-medium">{meal.carbs}g</span></div>
                              <div className="flex justify-between"><span>Fat:</span> <span className="font-medium">{meal.fat}g</span></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Totals vs Targets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-700">
                      {/* Planned Totals */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Planned Totals</h3>
                        <div className="space-y-2">
                           {Object.entries(mealPlan.totals).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-muted/50 dark:bg-gray-700/50 rounded-md text-sm">
                              <span className="font-medium capitalize">{key}</span>
                              <span className="font-semibold">{Math.round(value)}{key === 'calories' ? ' kcal' : 'g'}</span>
                            </div>
                           ))}
                        </div>
                      </div>
                      {/* Target vs Actual */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Target vs Planned</h3>
                         <div className="space-y-2">
                            {Object.keys(mealPlan.targets).map((key) => {
                                const targetValue = mealPlan.targets[key as keyof typeof mealPlan.targets];
                                const actualValue = mealPlan.totals[key as keyof typeof mealPlan.totals];
                                const progress = getProgressValue(actualValue, targetValue);
                                let progressColor = "bg-primary"; // Default blue
                                if (key === 'protein') progressColor = "bg-green-500";
                                if (key === 'carbs') progressColor = "bg-blue-500";
                                if (key === 'fat') progressColor = "bg-orange-500";

                                // Adjust color if significantly over/under
                                if (progress > 115 || progress < 85) progressColor = "bg-yellow-500";
                                if (progress > 130 || progress < 70) progressColor = "bg-red-500";


                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                        <span className="capitalize">{key}</span>
                                        <span>{Math.round(actualValue)} / {Math.round(targetValue)} {key === 'calories' ? 'kcal' : 'g'}</span>
                                        </div>
                                        <Progress value={Math.min(progress, 100)} /* Cap visual at 100% */ className={`h-1.5 [&>div]:${progressColor}`} />
                                    </div>
                                );
                            })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Utensils className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Meal Plan Generated</h3>
                  <p className="text-muted-foreground mb-6 text-center">Go to the Calculator tab, enter your details, and click "Generate Sample Meal Plan".</p>
                  <Button onClick={() => setActiveTab("calculator")}>Go to Calculator</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle>Saved Profiles</CardTitle>
                <CardDescription>Quickly load your saved configurations</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfile && (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading profile...</span>
                    </div>
                )}
                {!isLoadingProfile && savedProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sort profiles by name for consistency */}
                    {[...savedProfiles].sort((a,b) => a.name.localeCompare(b.name)).map((profile) => (
                      <Card key={profile.timestamp} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80 border dark:border-gray-700">
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="text-base font-semibold">{profile.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Saved: {new Date(profile.timestamp).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs text-muted-foreground">
                          <div><span className="font-medium text-foreground dark:text-gray-300">Goal:</span> <span className="capitalize">{profile.goal}</span></div>
                          <div><span className="font-medium text-foreground dark:text-gray-300">Stats:</span> {profile.age}y, {profile.weight}kg, {profile.height}cm, <span className="capitalize">{profile.gender}</span></div>
                          <div><span className="font-medium text-foreground dark:text-gray-300">Activity:</span> <span className="capitalize">{profile.activityLevel}</span></div>
                        </CardContent>
                        <CardFooter className="flex gap-2 pt-2 pb-4 px-4">
                          <Button onClick={() => loadProfile(profile)} className="flex-1" size="sm">
                            <RefreshCw className="w-3 h-3 mr-1.5" /> Load
                          </Button>
                          <Button onClick={() => deleteProfile(profile)} variant="outline" size="icon" className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete profile</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : !isLoadingProfile ? ( // Only show "No profiles" if not loading
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Save className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Saved Profiles</h3>
                    <p className="text-muted-foreground mb-6">Use the "Save Current Settings" option in the Calculator tab to save configurations here.</p>
                    <Button onClick={() => setActiveTab("calculator")}>Go to Calculator</Button>
                  </div>
                ) : null }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}