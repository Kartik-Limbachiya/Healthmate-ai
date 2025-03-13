"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock nutrition data
const nutritionData = {
  dailyGoals: {
    calories: 2200,
    protein: 150,
    carbs: 220,
    fat: 70,
  },
  today: {
    calories: 1650,
    protein: 110,
    carbs: 180,
    fat: 50,
  },
  meals: [
    {
      id: 1,
      name: "Breakfast",
      time: "7:30 AM",
      calories: 450,
      protein: 30,
      carbs: 45,
      fat: 15,
      items: [
        { name: "Oatmeal with berries", calories: 280 },
        { name: "Greek yogurt", calories: 120 },
        { name: "Black coffee", calories: 5 },
      ],
    },
    {
      id: 2,
      name: "Lunch",
      time: "12:30 PM",
      calories: 650,
      protein: 40,
      carbs: 70,
      fat: 20,
      items: [
        { name: "Grilled chicken salad", calories: 420 },
        { name: "Whole grain bread", calories: 120 },
        { name: "Apple", calories: 80 },
        { name: "Water", calories: 0 },
      ],
    },
    {
      id: 3,
      name: "Snack",
      time: "3:30 PM",
      calories: 200,
      protein: 15,
      carbs: 20,
      fat: 5,
      items: [
        { name: "Protein shake", calories: 150 },
        { name: "Banana", calories: 105 },
      ],
    },
    {
      id: 4,
      name: "Dinner",
      time: "7:00 PM",
      calories: 550,
      protein: 35,
      carbs: 45,
      fat: 20,
      items: [
        { name: "Salmon", calories: 280 },
        { name: "Brown rice", calories: 150 },
        { name: "Steamed vegetables", calories: 80 },
        { name: "Olive oil", calories: 40 },
      ],
    },
  ],
}

export default function NutritionTracking() {
  const [view, setView] = useState("daily")

  // Calculate percentages for progress bars
  const caloriesPercent = Math.round((nutritionData.today.calories / nutritionData.dailyGoals.calories) * 100)
  const proteinPercent = Math.round((nutritionData.today.protein / nutritionData.dailyGoals.protein) * 100)
  const carbsPercent = Math.round((nutritionData.today.carbs / nutritionData.dailyGoals.carbs) * 100)
  const fatPercent = Math.round((nutritionData.today.fat / nutritionData.dailyGoals.fat) * 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Nutrition Tracking</h2>
          <p className="text-muted-foreground">Monitor your daily nutrition intake</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Meal
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="meals">Meal Plans</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <TabsContent value="daily" className="space-y-6">
          {/* Daily Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nutritionData.today.calories} / {nutritionData.dailyGoals.calories}
                </div>
                <Progress value={caloriesPercent} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{caloriesPercent}% of daily goal</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Protein</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nutritionData.today.protein}g / {nutritionData.dailyGoals.protein}g
                </div>
                <Progress value={proteinPercent} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{proteinPercent}% of daily goal</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nutritionData.today.carbs}g / {nutritionData.dailyGoals.carbs}g
                </div>
                <Progress value={carbsPercent} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{carbsPercent}% of daily goal</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nutritionData.today.fat}g / {nutritionData.dailyGoals.fat}g
                </div>
                <Progress value={fatPercent} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{fatPercent}% of daily goal</div>
              </CardContent>
            </Card>
          </div>

          {/* Meals List */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
              <CardDescription>Your food intake for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nutritionData.meals.map((meal) => (
                  <div key={meal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium">{meal.name}</h3>
                        <p className="text-sm text-muted-foreground">{meal.time}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{meal.calories} cal</div>
                        <div className="text-sm text-muted-foreground">
                          P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 mt-3">
                      {meal.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>{item.calories} cal</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Meal
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Nutrition Overview</CardTitle>
              <CardDescription>Your nutrition trends for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 border rounded-md">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Weekly Nutrition Chart</h3>
                <p className="text-muted-foreground mb-4">
                  A chart would be implemented here showing nutrition trends over the week
                </p>
                <Button>View Detailed Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Meal Plans</CardTitle>
              <CardDescription>Your custom and recommended meal plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">High Protein Plan</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    2,400 calories • 180g protein • 220g carbs • 80g fat
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm">Use Today</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Weight Loss Plan</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    1,800 calories • 150g protein • 150g carbs • 60g fat
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm">Use Today</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Maintenance Plan</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    2,200 calories • 150g protein • 220g carbs • 70g fat
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button size="sm">Use Today</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 border-dashed flex items-center justify-center">
                  <Button variant="ghost">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Meal Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

