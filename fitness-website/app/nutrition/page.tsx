import { Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MealPlansList from "@/components/meal-plans-list"
import NutritionCalculator from "@/components/nutrition-calculator"

export default function NutritionPage() {
  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrition Plans</h1>
          <p className="text-muted-foreground">Fuel your body with the right nutrition</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search meal plans..." className="pl-8 w-full" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="meal-plans" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          <TabsTrigger value="calculator">Nutrition Calculator</TabsTrigger>
        </TabsList>
        <TabsContent value="meal-plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>Filter by diet type</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Vegetarian
                </Button>
                <Button variant="outline" size="sm">
                  Vegan
                </Button>
                <Button variant="outline" size="sm">
                  Keto
                </Button>
                <Button variant="outline" size="sm">
                  Paleo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Calorie Range</CardTitle>
                <CardDescription>Filter by daily calories</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Under 1500
                </Button>
                <Button variant="outline" size="sm">
                  1500-2000
                </Button>
                <Button variant="outline" size="sm">
                  2000-2500
                </Button>
                <Button variant="outline" size="sm">
                  Over 2500
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Goals</CardTitle>
                <CardDescription>Filter by fitness goal</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Weight Loss
                </Button>
                <Button variant="outline" size="sm">
                  Muscle Gain
                </Button>
                <Button variant="outline" size="sm">
                  Maintenance
                </Button>
                <Button variant="outline" size="sm">
                  Performance
                </Button>
              </CardContent>
            </Card>
          </div>

          <MealPlansList />
        </TabsContent>
        <TabsContent value="calculator">
          <NutritionCalculator />
        </TabsContent>
      </Tabs>
    </main>
  )
}

