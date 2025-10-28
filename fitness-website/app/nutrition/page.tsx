"use client";

import { useState } from "react";
import { Filter, Search } from "lucide-react"; // Import Search icon
import { Toaster } from "sonner"; // Import the Toaster for feedback

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"; // Use Checkbox for filters
import { Label } from "@/components/ui/label"; // Use Label with Checkbox

// Import your components
import MealPlansList from "@/components/meal-plans-list";
import NutritionCalculator from "@/components/NutritionCalculator";

export default function NutritionPage() {
  // States for search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dietTypes, setDietTypes] = useState<string[]>([]);
  const [calorieRanges, setCalorieRanges] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilter = (filterStateSetter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    filterStateSetter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    // Filtering happens automatically in MealPlansList based on props
  };

  const resetFilters = () => {
    setDietTypes([]);
    setCalorieRanges([]);
    setGoals([]);
  };

  // Define filter options for easier mapping
  const dietOptions = ["Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Omnivore"];
  const calorieOptions = ["Under 1500", "1500-2000", "2000-2500", "Over 2500"];
  const goalOptions = ["Weight Loss", "Muscle Building", "Performance", "Health", "Maintenance"];

  return (
    <main className="container mx-auto py-6 sm:py-8 px-4 md:px-6">
      {/* --- Add Sonner Toaster --- */}
      <Toaster position="top-right" richColors />

      {/* Page Heading */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Nutrition Center</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Discover meal plans or calculate your needs</p>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative w-full md:flex-grow max-w-lg">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meal plans by name..."
            className="pl-8 w-full text-sm sm:text-base"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filter Button */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto text-sm sm:text-base">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {/* Show count of active filters */}
              {(dietTypes.length + calorieRanges.length + goals.length > 0) && (
                <Badge variant="secondary" className="ml-2 rounded-full px-1.5 py-0.5 text-xs">
                  {dietTypes.length + calorieRanges.length + goals.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>

          {/* Filter Dialog Content */}
          <DialogContent className="max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-4 sm:p-6">
              <DialogTitle className="text-lg sm:text-xl">Filter Meal Plans</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 pt-0">
              {/* Dietary Preferences */}
              <Card className="border-none shadow-none">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  {dietOptions.map((diet) => (
                    <div key={diet} className="flex items-center space-x-2">
                       <Checkbox
                        id={`diet-${diet}`}
                        checked={dietTypes.includes(diet)}
                        onCheckedChange={() => toggleFilter(setDietTypes, diet)}
                      />
                      <Label htmlFor={`diet-${diet}`} className="text-sm font-normal cursor-pointer">
                        {diet}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Calorie Range */}
              <Card className="border-none shadow-none">
                 <CardHeader className="p-4">
                  <CardTitle className="text-base">Calorie Range (per day)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  {calorieOptions.map((range) => (
                     <div key={range} className="flex items-center space-x-2">
                       <Checkbox
                        id={`cal-${range}`}
                        checked={calorieRanges.includes(range)}
                        onCheckedChange={() => toggleFilter(setCalorieRanges, range)}
                      />
                      <Label htmlFor={`cal-${range}`} className="text-sm font-normal cursor-pointer">
                        {range}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Goals */}
              <Card className="border-none shadow-none">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Primary Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  {goalOptions.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={`goal-${goal}`}
                        checked={goals.includes(goal)}
                        onCheckedChange={() => toggleFilter(setGoals, goal)}
                      />
                      <Label htmlFor={`goal-${goal}`} className="text-sm font-normal cursor-pointer">
                        {goal}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between mt-4 border-t pt-4">
              <Button variant="ghost" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Meal Plans / Nutrition Calculator */}
      <Tabs defaultValue="meal-plans" className="mb-6 sm:mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meal-plans" className="text-sm sm:text-base">Meal Plans</TabsTrigger>
          <TabsTrigger value="calculator" className="text-sm sm:text-base">Nutrition Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="meal-plans">
          {/* Show currently applied filters */}
          {(dietTypes.length + calorieRanges.length + goals.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4 mb-4 items-center">
              <span className="text-sm font-medium mr-2">Active Filters:</span>
              {dietTypes.map((diet) => (
                <Badge key={diet} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter(setDietTypes, diet)}>
                  {diet} <span className="ml-1 text-muted-foreground">×</span>
                </Badge>
              ))}
              {calorieRanges.map((range) => (
                <Badge key={range} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter(setCalorieRanges, range)}>
                  {range} <span className="ml-1 text-muted-foreground">×</span>
                </Badge>
              ))}
              {goals.map((goal) => (
                <Badge key={goal} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter(setGoals, goal)}>
                  {goal} <span className="ml-1 text-muted-foreground">×</span>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
                Clear All
              </Button>
            </div>
          )}

          <MealPlansList
            searchTerm={searchTerm}
            dietTypes={dietTypes}
            calorieRanges={calorieRanges}
            goals={goals}
          />
        </TabsContent>

        <TabsContent value="calculator">
          <div className="mt-4">
            <NutritionCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}