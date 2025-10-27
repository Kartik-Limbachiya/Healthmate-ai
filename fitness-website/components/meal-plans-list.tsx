"use client";

import Link from "next/link";
import Image from "next/image";
// *** Import useEffect ***
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Utensils, BarChart, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Import centralized data and action ---
import { allMealPlans, MealPlan } from "@/lib/meal-plan-data";
import { setActiveMealPlan } from "@/lib/nutrition-actions";
import { auth } from "@/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

// Helper function (keep as is)
const checkCalorieRange = (calories: number, ranges: string[]) => {
  if (ranges.length === 0) return true;
  return ranges.some((range) => {
    if (range === "Under 1500") return calories < 1500;
    if (range === "1500-2000") return calories >= 1500 && calories <= 2000;
    if (range === "2000-2500") return calories >= 2000 && calories <= 2500;
    if (range === "Over 2500") return calories > 2500;
    return false;
  });
};

interface MealPlansListProps {
  searchTerm?: string;
  dietTypes?: string[];
  calorieRanges?: string[];
  goals?: string[];
}

export default function MealPlansList({
  searchTerm = "",
  dietTypes = [],
  calorieRanges = [],
  goals = [],
}: MealPlansListProps) {
  const router = useRouter();
  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  // *** Initialize isLoggedIn state without the listener ***
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPending, startTransition] = useTransition();

  // *** Use useEffect for the auth listener ***
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Update state when auth changes
      // In a real app, you'd fetch the user's saved plans here IF the user exists
      if (user) {
        // fetchSavedPlans(user.uid); // Example function call
      } else {
        setSavedPlans([]); // Clear saved plans if logged out
      }
    });

    // Cleanup function: Unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // Filter logic (keep as is)
  const filteredMealPlans = allMealPlans.filter((plan) => {
    const matchesSearch =
      searchTerm === "" ||
      plan.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiet =
      dietTypes.length === 0 || dietTypes.includes(plan.dietType);
    const matchesCalories = checkCalorieRange(plan.calories, calorieRanges);
    const matchesGoal = goals.length === 0 || goals.includes(plan.category);

    return matchesSearch && matchesDiet && matchesCalories && matchesGoal;
  });

  // handleUsePlan (keep as is)
  const handleUsePlan = (planId: string, planTitle: string) => {
     if (!isLoggedIn) {
      toast.error("Please log in to use a meal plan.");
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const result = await setActiveMealPlan(planId);
      if (result.success) {
         setTimeout(() => {
          router.push("/profile?tab=nutrition");
        }, 1000);
      }
    });
  };

   // handleSavePlan (keep as is)
   const handleSavePlan = (planId: string, planTitle: string) => {
    if (!isLoggedIn) {
      toast.error("Please log in to save a meal plan.");
       router.push("/login");
      return;
    }
    setSavedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
     const isSaving = !savedPlans.includes(planId);
    toast.info(isSaving ? `"${planTitle}" saved (demo)` : `"${planTitle}" unsaved (demo)`);
  };


  // Rest of the component rendering (keep as is)...
  if (filteredMealPlans.length === 0) {
    return <p className="mt-8 text-center text-muted-foreground">No meal plans found matching your criteria.</p>;
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMealPlans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={plan.image || "/placeholder.svg"}
                alt={plan.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground">{plan.dietType}</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 bg-background/80 hover:bg-background/90 text-primary rounded-full h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  handleSavePlan(plan.id, plan.title);
                }}
                title={savedPlans.includes(plan.id) ? "Unsave Plan" : "Save Plan"}
              >
                {savedPlans.includes(plan.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                 ) : (
                    <Bookmark className="h-4 w-4" />
                 )}
              </Button>
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                 <p className="text-white text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                   View plan details
                 </p>
               </div>
            </div>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                <Link href={`/nutrition/${plan.id}`} className="hover:underline stretched-link">
                  {plan.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 flex-grow">
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-primary/80" />
                  {plan.prepTime} prep
                </div>
                <div className="flex items-center">
                  <Utensils className="mr-1 h-4 w-4 text-primary/80" />
                  {plan.calories} cal
                </div>
                <div className="flex items-center">
                  <BarChart className="mr-1 h-4 w-4 text-primary/80" />
                  {plan.category}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0 pb-4 px-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/nutrition/${plan.id}`}>View Details</Link>
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUsePlan(plan.id, plan.title);
                }}
                disabled={isPending}
              >
                 {isPending ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Applying...
                   </>
                 ) : (
                   "Use Plan"
                 )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}