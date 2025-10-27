"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calculator, Utensils, TrendingDown, TrendingUp, Minus, RefreshCw, Download, Trash2 } from "lucide-react"

const MEAL_DATABASE = {
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
}

export default function NutritionCalculator() {
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [gender, setGender] = useState("male")
  const [activityLevel, setActivityLevel] = useState("moderate")
  const [goal, setGoal] = useState("maintain")
  const [activeTab, setActiveTab] = useState("calculator")
  const [mealPlan, setMealPlan] = useState(null)
  const [savedProfiles, setSavedProfiles] = useState([])
  const [profileName, setProfileName] = useState("")

  // Load saved profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = () => {
    try {
      const stored = localStorage.getItem("nutrition_profiles")
      if (stored) {
        setSavedProfiles(JSON.parse(stored))
      }
    } catch (error) {
      console.log("No saved profiles found")
    }
  }

  const saveProfile = () => {
    if (!profileName.trim()) {
      alert("Please enter a profile name")
      return
    }

    const profile = {
      name: profileName,
      age,
      weight,
      height,
      gender,
      activityLevel,
      goal,
      timestamp: Date.now()
    }

    try {
      const newProfiles = [...savedProfiles, profile]
      localStorage.setItem("nutrition_profiles", JSON.stringify(newProfiles))
      setSavedProfiles(newProfiles)
      setProfileName("")
      alert("Profile saved successfully!")
    } catch (error) {
      alert("Failed to save profile")
    }
  }

  const loadProfile = (profile) => {
    setAge(profile.age)
    setWeight(profile.weight)
    setHeight(profile.height)
    setGender(profile.gender)
    setActivityLevel(profile.activityLevel)
    setGoal(profile.goal)
    setActiveTab("calculator")
  }

  const deleteProfile = (profileToDelete) => {
    try {
      const newProfiles = savedProfiles.filter(p => p.timestamp !== profileToDelete.timestamp)
      localStorage.setItem("nutrition_profiles", JSON.stringify(newProfiles))
      setSavedProfiles(newProfiles)
    } catch (error) {
      console.error("Failed to delete profile")
    }
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    if (gender === "male") {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161)
    }
  }

  // Calculate TDEE
  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }
    return Math.round(bmr * activityMultipliers[activityLevel])
  }

  // Calculate target calories
  const calculateTargetCalories = () => {
    const tdee = calculateTDEE()
    switch (goal) {
      case "lose":
        return Math.round(tdee * 0.8)
      case "maintain":
        return tdee
      case "gain":
        return Math.round(tdee * 1.15)
      default:
        return tdee
    }
  }

  // Calculate BMI
  const calculateBMI = () => {
    if (height === 0) return "0.0"; // Avoid division by zero
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    if (isNaN(bmi) || !isFinite(bmi)) return "0.0";
    return bmi.toFixed(1)
  }

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { category: "Normal", color: "text-green-600" }
    if (bmi < 30) return { category: "Overweight", color: "text-orange-600" }
    return { category: "Obese", color: "text-red-600" }
  }

  // Calculate macros
  const calculateMacros = () => {
    const targetCalories = calculateTargetCalories()
    let proteinPercentage, carbPercentage, fatPercentage

    switch (goal) {
      case "lose":
        proteinPercentage = 0.4
        carbPercentage = 0.3
        fatPercentage = 0.3
        break
      case "maintain":
        proteinPercentage = 0.3
        carbPercentage = 0.4
        fatPercentage = 0.3
        break
      case "gain":
        proteinPercentage = 0.3
        carbPercentage = 0.5
        fatPercentage = 0.2
        break
      default:
        proteinPercentage = 0.3
        carbPercentage = 0.4
        fatPercentage = 0.3
    }

    const proteinGrams = Math.round((targetCalories * proteinPercentage) / 4)
    const carbGrams = Math.round((targetCalories * carbPercentage) / 4)
    const fatGrams = Math.round((targetCalories * fatPercentage) / 9)

    return { protein: proteinGrams, carbs: carbGrams, fat: fatGrams }
  }

  // Generate meal plan
  const generateMealPlan = () => {
    const targetCalories = calculateTargetCalories()
    const targetMacros = calculateMacros()

    // Distribute calories: 25% breakfast, 35% lunch, 35% dinner, 5% snacks
    const calorieDistribution = {
      breakfast: targetCalories * 0.25,
      lunch: targetCalories * 0.35,
      dinner: targetCalories * 0.35,
      snacks: targetCalories * 0.05
    }

    const selectMeal = (meals, targetCals) => {
      // FIX: Handle empty meal array
      if (!meals || meals.length === 0) {
        return { name: "N/A", protein: 0, carbs: 0, fat: 0, calories: 0 };
      }
      const sorted = [...meals].sort((a, b) =>
        Math.abs(a.calories - targetCals) - Math.abs(b.calories - targetCals)
      )
      return sorted[Math.floor(Math.random() * Math.min(3, sorted.length))]
    }

    const breakfast = selectMeal(MEAL_DATABASE.breakfast, calorieDistribution.breakfast)
    const lunch = selectMeal(MEAL_DATABASE.lunch, calorieDistribution.lunch)
    const dinner = selectMeal(MEAL_DATABASE.dinner, calorieDistribution.dinner)
    const snack = selectMeal(MEAL_DATABASE.snacks, calorieDistribution.snacks)

    const plan = {
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
    }

    setMealPlan(plan)
    setActiveTab("meals")
  }

  const exportMealPlan = () => {
    if (!mealPlan) return

    const text = `
DAILY MEAL PLAN
Generated: ${new Date().toLocaleDateString()}

TARGET NUTRITION:
Calories: ${mealPlan.targets.calories} kcal
Protein: ${mealPlan.targets.protein}g
Carbs: ${mealPlan.targets.carbs}g
Fat: ${mealPlan.targets.fat}g

MEALS:
Breakfast: ${mealPlan.meals.breakfast.name}
- Calories: ${mealPlan.meals.breakfast.calories} | Protein: ${mealPlan.meals.breakfast.protein}g | Carbs: ${mealPlan.meals.breakfast.carbs}g | Fat: ${mealPlan.meals.breakfast.fat}g

Lunch: ${mealPlan.meals.lunch.name}
- Calories: ${mealPlan.meals.lunch.calories} | Protein: ${mealPlan.meals.lunch.protein}g | Carbs: ${mealPlan.meals.lunch.carbs}g | Fat: ${mealPlan.meals.lunch.fat}g

Dinner: ${mealPlan.meals.dinner.name}
- Calories: ${mealPlan.meals.dinner.calories} | Protein: ${mealPlan.meals.dinner.protein}g | Carbs: ${mealPlan.meals.dinner.carbs}g | Fat: ${mealPlan.meals.dinner.fat}g

Snack: ${mealPlan.meals.snack.name}
- Calories: ${mealPlan.meals.snack.calories} | Protein: ${mealPlan.meals.snack.protein}g | Carbs: ${mealPlan.meals.snack.carbs}g | Fat: ${mealPlan.meals.snack.fat}g

DAILY TOTALS:
Calories: ${mealPlan.totals.calories} kcal
Protein: ${mealPlan.totals.protein}g
Carbs: ${mealPlan.totals.carbs}g
Fat: ${mealPlan.totals.fat}g
    `.trim()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meal-plan-${new Date().toISOString().split('T')[0]}.txt`
    
    // FIX: More robust download for all browsers
    document.body.appendChild(a) 
    a.click()
    document.body.removeChild(a) 
    URL.revokeObjectURL(url)
  }
  
  // Helper function to safely calculate progress
  const getProgressValue = (value, target) => {
    if (target === 0 || !target || isNaN(target)) return 0;
    const progress = (value / target) * 100;
    return isNaN(progress) ? 0 : progress;
  }

  const tdee = calculateTDEE()
  const targetCalories = calculateTargetCalories()
  const macros = calculateMacros()
  const bmi = calculateBMI()
  const bmiInfo = getBMICategory(parseFloat(bmi))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nutrition Calculator Pro</h1>
          <p className="text-gray-600">Calculate your daily nutrition needs and generate personalized meal plans</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calculator">
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="meals">
              <Utensils className="w-4 h-4 mr-2" />
              Meal Plan
            </TabsTrigger>
            <TabsTrigger value="profiles">
              <RefreshCw className="w-4 h-4 mr-2" />
              Profiles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Enter your details to calculate nutrition needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <RadioGroup id="gender" value={gender} onValueChange={setGender} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number.parseInt(e.target.value) || 0)}
                        min="15"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number.parseInt(e.target.value) || 0)}
                        min="30"
                        max="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number.parseInt(e.target.value) || 0)}
                        min="100"
                        max="250"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                        <SelectItem value="veryActive">Very Active (hard exercise daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Fitness Goal</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">
                          <div className="flex items-center">
                            <TrendingDown className="w-4 h-4 mr-2" />
                            Lose Weight
                          </div>
                        </SelectItem>
                        <SelectItem value="maintain">
                          <div className="flex items-center">
                            <Minus className="w-4 h-4 mr-2" />
                            Maintain Weight
                          </div>
                        </SelectItem>
                        <SelectItem value="gain">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Gain Muscle
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <Label htmlFor="profileName">Save Profile (Optional)</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="profileName"
                        placeholder="Profile name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                      <Button onClick={saveProfile} variant="outline">Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Results</CardTitle>
                    <CardDescription>Based on your inputs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">BMI</div>
                        <div className={`text-3xl font-bold ${bmiInfo.color}`}>{bmi}</div>
                        <div className="text-sm text-gray-600">{bmiInfo.category}</div>
                      </div>

                      <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">BMR</div>
                        <div className="text-3xl font-bold text-green-700">{calculateBMR()}</div>
                        <div className="text-sm text-gray-600">cal/day</div>
                      </div>
                    </div>

                    <div className="space-y-2 p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Daily Energy Expenditure</div>
                      <div className="text-3xl font-bold text-purple-700">{tdee} calories</div>
                      <div className="text-sm text-gray-600">With your activity level</div>
                    </div>

                    <div className="space-y-2 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <div className="text-sm text-gray-600">Target Daily Calories</div>
                      <div className="text-4xl font-bold text-indigo-700">{targetCalories}</div>
                      <div className="text-sm text-gray-600">For your {goal === "lose" ? "weight loss" : goal === "gain" ? "muscle gain" : "maintenance"} goal</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Macronutrients</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Protein</span>
                        <span className="text-gray-600">{macros.protein}g ({Math.round(macros.protein * 4)} cal)</span>
                      </div>
                      <Progress value={getProgressValue(macros.protein * 4, targetCalories)} className="h-3" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Carbohydrates</span>
                        <span className="text-gray-600">{macros.carbs}g ({Math.round(macros.carbs * 4)} cal)</span>
                      </div>
                      <Progress value={getProgressValue(macros.carbs * 4, targetCalories)} className="h-3" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Fat</span>
                        <span className="text-gray-600">{macros.fat}g ({Math.round(macros.fat * 9)} cal)</span>
                      </div>
                      <Progress value={getProgressValue(macros.fat * 9, targetCalories)} className="h-3" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={generateMealPlan} size="lg">
                      <Utensils className="w-4 h-4 mr-2" />
                      Generate Meal Plan
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meals">
            {mealPlan ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Your Daily Meal Plan</CardTitle>
                        <CardDescription>Personalized nutrition for your goals</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={generateMealPlan} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button onClick={exportMealPlan} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {Object.entries(mealPlan.meals).map(([type, meal]) => (
                        <Card key={type} className="bg-gradient-to-br from-white to-gray-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg capitalize">{type}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="font-medium text-gray-900">{meal.name}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Calories</span>
                                <span className="font-medium">{meal.calories}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Protein</span>
                                <span className="font-medium">{meal.protein}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Carbs</span>
                                <span className="font-medium">{meal.carbs}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fat</span>
                                <span className="font-medium">{meal.fat}g</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Daily Totals</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium">Calories</span>
                            <span className="text-xl font-bold text-blue-700">{mealPlan.totals.calories}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="font-medium">Protein</span>
                            <span className="text-xl font-bold text-green-700">{mealPlan.totals.protein}g</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="font-medium">Carbs</span>
                            <span className="text-xl font-bold text-orange-700">{mealPlan.totals.carbs}g</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="font-medium">Fat</span>
                            <span className="text-xl font-bold text-purple-700">{mealPlan.totals.fat}g</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Target vs Actual</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Calories</span>
                              <span>{mealPlan.totals.calories} / {mealPlan.targets.calories}</span>
                            </div>
                            <Progress value={getProgressValue(mealPlan.totals.calories, mealPlan.targets.calories)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Protein</span>
                              <span>{mealPlan.totals.protein}g / {mealPlan.targets.protein}g</span>
                            </div>
                            <Progress value={getProgressValue(mealPlan.totals.protein, mealPlan.targets.protein)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Carbs</span>
                              <span>{mealPlan.totals.carbs}g / {mealPlan.targets.carbs}g</span>
                            </div>
                            <Progress value={getProgressValue(mealPlan.totals.carbs, mealPlan.targets.carbs)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Fat</span>
                              <span>{mealPlan.totals.fat}g / {mealPlan.targets.fat}g</span>
                            </div>
                            <Progress value={getProgressValue(mealPlan.totals.fat, mealPlan.targets.fat)} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Utensils className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Meal Plan Generated Yet</h3>
                  <p className="text-gray-600 mb-6">Go to the Calculator tab and click "Generate Meal Plan"</p>
                  <Button onClick={() => setActiveTab("calculator")}>
                    Go to Calculator
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FIX: This <TabsContent> block is now a direct child of the main <Tabs> component,
            which corrects the original layout bug.
          */}
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Saved Profiles</CardTitle>
                <CardDescription>Quickly load your saved configurations</CardDescription>
              </CardHeader>
              <CardContent>
                {savedProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedProfiles.map((profile) => (
                      <Card key={profile.timestamp} className="bg-gradient-to-br from-white to-gray-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(profile.timestamp).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium">{profile.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weight:</span>
                            <span className="font-medium">{profile.weight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Height:</span>
                            <span className="font-medium">{profile.height} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-medium capitalize">{profile.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goal:</span>
                            <span className="font-medium capitalize">{profile.goal}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button
                            onClick={() => loadProfile(profile)}
                            className="flex-1"
                            size="sm"
                          >
                            Load
                          </Button>
                          <Button
                            onClick={() => deleteProfile(profile)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <RefreshCw className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Saved Profiles</h3>
                    <p className="text-gray-600 mb-6">Save a profile from the Calculator tab to see it here</p>
                    <Button onClick={() => setActiveTab("calculator")}>
                      Go to Calculator
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}