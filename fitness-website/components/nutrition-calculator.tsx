"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export default function NutritionCalculator() {
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [gender, setGender] = useState("male")
  const [activityLevel, setActivityLevel] = useState("moderate")
  const [goal, setGoal] = useState("maintain")

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }

    return Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers])
  }

  // Calculate target calories based on goal
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

  // Calculate macronutrients
  const calculateMacros = () => {
    const targetCalories = calculateTargetCalories()

    let proteinPercentage, carbPercentage, fatPercentage

    switch (goal) {
      case "lose":
        proteinPercentage = 0.4 // 40%
        carbPercentage = 0.3 // 30%
        fatPercentage = 0.3 // 30%
        break
      case "maintain":
        proteinPercentage = 0.3 // 30%
        carbPercentage = 0.4 // 40%
        fatPercentage = 0.3 // 30%
        break
      case "gain":
        proteinPercentage = 0.3 // 30%
        carbPercentage = 0.5 // 50%
        fatPercentage = 0.2 // 20%
        break
      default:
        proteinPercentage = 0.3
        carbPercentage = 0.4
        fatPercentage = 0.3
    }

    const proteinCalories = targetCalories * proteinPercentage
    const carbCalories = targetCalories * carbPercentage
    const fatCalories = targetCalories * fatPercentage

    const proteinGrams = Math.round(proteinCalories / 4) // 4 calories per gram
    const carbGrams = Math.round(carbCalories / 4) // 4 calories per gram
    const fatGrams = Math.round(fatCalories / 9) // 9 calories per gram

    return {
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
    }
  }

  const tdee = calculateTDEE()
  const targetCalories = calculateTargetCalories()
  const macros = calculateMacros()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Calculator</CardTitle>
          <CardDescription>Calculate your daily calorie needs and macronutrients</CardDescription>
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
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="gain">Gain Muscle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Results</CardTitle>
          <CardDescription>Based on your inputs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Basal Metabolic Rate (BMR)</div>
            <div className="text-3xl font-bold">{calculateBMR()} calories</div>
            <div className="text-sm text-muted-foreground">Calories your body needs at complete rest</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Daily Energy Expenditure (TDEE)</div>
            <div className="text-3xl font-bold">{tdee} calories</div>
            <div className="text-sm text-muted-foreground">Calories you burn daily with your activity level</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Target Daily Calories</div>
            <div className="text-3xl font-bold text-primary">{targetCalories} calories</div>
            <div className="text-sm text-muted-foreground">Recommended daily intake for your goal</div>
          </div>

          <div className="pt-4">
            <h3 className="font-medium mb-4">Recommended Macronutrients</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span className="font-medium">
                    {macros.protein}g ({Math.round(macros.protein * 4)} cal)
                  </span>
                </div>
                <Slider value={[(macros.protein / (macros.protein + macros.carbs + macros.fat)) * 100]} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Carbohydrates</span>
                  <span className="font-medium">
                    {macros.carbs}g ({Math.round(macros.carbs * 4)} cal)
                  </span>
                </div>
                <Slider value={[(macros.carbs / (macros.protein + macros.carbs + macros.fat)) * 100]} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Fat</span>
                  <span className="font-medium">
                    {macros.fat}g ({Math.round(macros.fat * 9)} cal)
                  </span>
                </div>
                <Slider value={[(macros.fat / (macros.protein + macros.carbs + macros.fat)) * 100]} disabled />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Generate Meal Plan</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

