"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// *** Import useEffect ***
import { useState, useTransition, useEffect } from "react";
import {
  ArrowLeftCircle,
  CalendarDays,
  Utensils,
  Zap,
  ShoppingCart,
  Clock,
  ChefHat,
  Check,
  Printer,
  Share2,
  Bookmark,
  BookmarkCheck,
  Info,
  Flame,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Removed CardFooter import as it's not used here directly
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// --- Import our new centralized data and actions ---
import { getMealPlanById, MealPlan, Meal } from "@/lib/meal-plan-data";
import { setActiveMealPlan } from "@/lib/nutrition-actions";
import { auth } from "@/firebase-config"; // Keep this
import { onAuthStateChanged } from "firebase/auth"; // Keep this

// Helper to calculate macro percentage
const calculatePercentage = (macroGrams: number, gramsPerCal: number, totalCalories: number) => {
  if (!totalCalories || totalCalories === 0) return 0;
  return Math.round(((macroGrams * gramsPerCal) / totalCalories) * 100);
};

export default function MealPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [isSaved, setIsSaved] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  // *** Initialize state without listener ***
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPending, startTransition] = useTransition();

  // *** Use useEffect for the auth listener ***
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Update state when auth changes
    });

    // Cleanup function: Unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // Fetch plan details (using our new function)
  const plan = getMealPlanById(planId);

  // --- Production-Level "Use Plan" Handler ---
  const handleUsePlan = () => {
    if (!isLoggedIn) {
      toast.error("Please log in to use a meal plan.");
      router.push("/login"); // Redirect to login if not logged in
      return;
    }
    startTransition(async () => {
      const result = await setActiveMealPlan(planId);
      if (result.success) {
        // Redirect to the nutrition tracking page
        setTimeout(() => {
          router.push("/profile?tab=nutrition");
        }, 1000); // Wait 1 sec for toast to be read
      }
      // Error toasts handled inside the action
    });
  };

  // Placeholder function for "Save Plan"
  const handleSave = () => {
     if (!isLoggedIn) {
      toast.error("Please log in to save a meal plan.");
       router.push("/login"); // Redirect to login if not logged in
      return;
    }
    // TODO: Implement actual save/unsave logic in Firestore
    setIsSaved(!isSaved);
    toast.info(isSaved ? "Plan unsaved (demo)" : "Plan saved (demo)");
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Share handler
  const handleShare = async () => {
    if (!plan) return;
    const shareData = {
      title: plan.title,
      text: plan.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied!", { description: "Plan link copied to clipboard." });
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Sharing Failed", { description: "Could not share the plan." });
    }
  };


  // --- Render Logic ---

  if (!plan) {
    return (
      <main className="container mx-auto py-8 px-4 md:px-6 text-center">
         <div className="mb-4 text-left">
           <Button variant="outline" size="sm" asChild>
             <Link href="/nutrition">← Back to Plans</Link>
           </Button>
         </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Meal Plan Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sorry, we couldn't find the meal plan with ID: <span className="font-mono">{planId}</span>
            </p>
            <Button asChild>
              <Link href="/nutrition">Browse Meal Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Calculate macro percentages
  const proteinPercent = calculatePercentage(plan.protein, 4, plan.calories);
  const carbPercent = calculatePercentage(plan.carbs, 4, plan.calories);
  const fatPercent = calculatePercentage(plan.fat, 9, plan.calories);

  return (
    <main className="container mx-auto py-8 px-4 md:px-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground print:hidden"
      >
        <ArrowLeftCircle className="h-4 w-4" /> Back to Plans
      </Button>

      {/* --- Header Card --- */}
      <Card className="overflow-hidden border-primary/20 border-2">
        <div className="grid md:grid-cols-2">
          {/* Image Section */}
          <div className="relative h-64 md:h-full min-h-[300px]">
            <Image
              src={plan.image || "/placeholder.svg"}
              alt={plan.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Details Section */}
          <div className="p-6 flex flex-col justify-between">
            <div> {/* Top content */}
              <div className="flex items-start justify-between mb-2">
                <Badge className="mb-2 bg-primary/90 text-primary-foreground">{plan.dietType}</Badge>
                <div className="flex gap-1 print:hidden">
                  <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8" title={isSaved ? "Unsave Plan" : "Save Plan"}>
                    {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8" title="Share Plan">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handlePrint} className="h-8 w-8" title="Print Plan">
                    <Printer className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
              <p className="text-muted-foreground mb-4">{plan.description}</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4 text-muted-foreground">
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary/80" /> <span>{plan.calories} kcal/day</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary/80" /> <span>{plan.prepTime}</span></div>
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary/80" /> <span>{plan.duration}</span></div>
                <div className="flex items-center gap-2"><ChefHat className="h-4 w-4 text-primary/80" /> <span>{plan.difficulty}</span></div>
                 <div className="flex items-center gap-2 col-span-2">
                    <Utensils className="h-4 w-4 text-primary/80" />
                    <span>P: {plan.protein}g • C: {plan.carbs}g • F: {plan.fat}g • Fiber: {plan.fiber}g</span>
                 </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                 <h3 className="font-semibold mb-1.5 text-xs text-muted-foreground uppercase tracking-wider">Daily Macros</h3>
                 <div className="grid grid-cols-3 gap-2 text-center">
                     <div>
                       <div className="text-xs">Protein</div>
                       <div className="font-bold text-green-600">{proteinPercent}%</div>
                     </div>
                     <div>
                       <div className="text-xs">Carbs</div>
                       <div className="font-bold text-blue-600">{carbPercent}%</div>
                     </div>
                     <div>
                       <div className="text-xs">Fat</div>
                       <div className="font-bold text-orange-600">{fatPercent}%</div>
                     </div>
                 </div>
               </div>
            </div>

            <Button size="lg" className="w-full mt-4 print:hidden" onClick={handleUsePlan} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Use This Plan"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* --- Main Content Tabs --- */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meals">Daily Meals</TabsTrigger>
          <TabsTrigger value="grocery">Grocery List</TabsTrigger>
          <TabsTrigger value="tips">Tips & Benefits</TabsTrigger>
        </TabsList>

        {/* --- Overview Tab --- */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Overview</CardTitle>
              <CardDescription>Everything you need to know about this meal plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Nutrition Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein ({plan.protein}g)</span>
                      <span className="text-muted-foreground">{proteinPercent}% of calories</span>
                    </div>
                    <Progress value={proteinPercent} className="h-2 [&>div]:bg-green-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbohydrates ({plan.carbs}g)</span>
                      <span className="text-muted-foreground">{carbPercent}% of calories</span>
                    </div>
                    <Progress value={carbPercent} className="h-2 [&>div]:bg-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat ({plan.fat}g)</span>
                      <span className="text-muted-foreground">{fatPercent}% of calories</span>
                    </div>
                    <Progress value={fatPercent} className="h-2 [&>div]:bg-orange-500" />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 text-lg">Quick Facts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Utensils, label: "Meal Frequency", value: `${plan.dailyPlan?.[0]?.meals?.length || 'N/A'} meals/snacks per day` },
                    { icon: Clock, label: "Time Commitment", value: `${plan.prepTime} per meal` },
                    { icon: ChefHat, label: "Difficulty Level", value: `${plan.difficulty} cooking skills` },
                    { icon: CalendarDays, label: "Duration", value: `${plan.duration} complete plan` },
                    { icon: Flame, label: "Fiber Intake", value: `${plan.fiber}g per day` },
                  ].map((fact, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <fact.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{fact.label}</div>
                        <div className="text-xs text-muted-foreground">{fact.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {plan.dailyPlan && plan.dailyPlan.length > 0 && plan.dailyPlan[0].meals?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Sample Day Preview ({plan.dailyPlan[0].day})</h3>
                    <p className="text-sm text-muted-foreground mb-3">Here's a glimpse of what a typical day looks like:</p>
                    <div className="space-y-2">
                      {plan.dailyPlan[0].meals.slice(0, 4).map((meal: Meal, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <div>
                            <div className="font-medium text-sm">{meal.name}</div>
                            <div className="text-xs text-muted-foreground">{meal.time}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{meal.calories} cal</div>
                            <div className="text-xs text-muted-foreground">P: {meal.protein}g</div>
                          </div>
                        </div>
                      ))}
                      {plan.dailyPlan[0].meals.length > 4 && (
                          <div className="text-center text-sm text-muted-foreground p-2">...and more</div>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => (document.querySelector('button[data-radix-collection-item][value="meals"]') as HTMLElement)?.click()}>
                        View Full Week Plan
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Daily Meals Tab --- */}
        <TabsContent value="meals" className="space-y-4 mt-4">
          {plan.dailyPlan && plan.dailyPlan.length > 0 ? (
            <>
              <Card className="print:hidden">
                <CardContent className="pt-6">
                   <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center md:text-left">Select Day:</h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
                    {plan.dailyPlan.map((dayData, index: number) => (
                      <Button
                        key={index}
                        variant={activeDay === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveDay(index)}
                        className="whitespace-nowrap flex-shrink-0"
                      >
                        {dayData.day}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{plan.dailyPlan[activeDay].day}'s Meal Schedule</CardTitle>
                  <CardDescription>Complete nutrition breakdown for the selected day.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.dailyPlan[activeDay].meals.map((meal, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{meal.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {meal.time}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-lg">{meal.calories} cal</div>
                            <div className="text-xs text-muted-foreground">P: {meal.protein}g</div>
                          </div>
                        </div>
                         <p className="text-xs text-muted-foreground mt-1">
                            Carbs: {meal.carbs || 'N/A'}g • Fat: {meal.fat || 'N/A'}g
                         </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                     <h3 className="font-semibold mb-3 text-lg">Daily Totals for {plan.dailyPlan[activeDay].day}</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(['calories', 'protein', 'carbs', 'fat'] as const).map(macro => {
                          const total = plan.dailyPlan[activeDay].meals.reduce((sum: number, meal: any) => sum + (meal[macro] || 0), 0);
                          const target = plan[macro as keyof typeof plan];
                          const unit = macro === 'calories' ? 'kcal' : 'g';
                          let colorClass = 'text-foreground';
                          if (macro === 'protein') colorClass = 'text-green-600';
                          if (macro === 'carbs') colorClass = 'text-blue-600';
                          if (macro === 'fat') colorClass = 'text-orange-600';

                          return (
                            <div key={macro}>
                              <div className="text-xs text-muted-foreground capitalize">{macro}</div>
                              <div className={`text-2xl font-bold ${colorClass}`}>
                                {Math.round(total)}{unit}
                              </div>
                               <div className="text-xs text-muted-foreground">Target: {target}{unit}</div>
                            </div>
                          );
                        })}
                     </div>
                   </div>
                </CardContent>
              </Card>
            </>
          ) : (
             <Card>
               <CardContent className="py-8 text-center">
                 <Utensils className="h-10 w-10 mx-auto text-muted-foreground mb-3"/>
                 <p className="text-muted-foreground">Detailed daily meal plan coming soon.</p>
               </CardContent>
             </Card>
          )}
        </TabsContent>

        {/* --- Grocery List Tab --- */}
        <TabsContent value="grocery" className="space-y-4 mt-4">
          {plan.groceryList && plan.groceryList.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between print:hidden">
                  <div>
                    <CardTitle>Weekly Grocery List</CardTitle>
                    <CardDescription>Everything you need for {plan.duration}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print List
                  </Button>
                </div>
                 <div className="hidden print:block text-center mb-4">
                    <h1 className="text-2xl font-bold">{plan.title} - Grocery List</h1>
                 </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 print:hidden">
                  <ShoppingCart className="h-4 w-4" />
                   <AlertTitle>Shopping Tip</AlertTitle>
                  <AlertDescription>
                    This list covers all meals for {plan.duration}. Adjust quantities based on your needs and check your pantry first!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {plan.groceryList.map((category, index: number) => (
                    <div key={index} className="border-b pb-4 mb-4 md:border-none md:pb-0 md:mb-0">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                        {category.category}
                      </h3>
                      <ul className="space-y-2">
                        {category.items.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                             <span className="hidden print:inline-block border border-gray-400 w-4 h-4 mt-0.5 mr-2 flex-shrink-0"></span>
                             <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 print:hidden" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card>
               <CardContent className="py-8 text-center">
                  <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3"/>
                 <p className="text-muted-foreground">Grocery list coming soon.</p>
               </CardContent>
             </Card>
          )}
        </TabsContent>

        {/* --- Tips & Benefits Tab --- */}
        <TabsContent value="tips" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.tips && plan.tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Success Tips</CardTitle>
                  <CardDescription>Make the most of this meal plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full mt-0.5 flex-shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {plan.benefits && plan.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Benefits</CardTitle>
                  <CardDescription>Why this plan works</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-green-100 dark:bg-green-900/50 p-1 rounded-full mt-0.5 flex-shrink-0">
                          <Zap className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="default" className="border-blue-500/50 dark:border-blue-500/30">
                 <Info className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
                 <AlertTitle className="text-blue-700 dark:text-blue-300">Customization</AlertTitle>
                <AlertDescription>
                  This meal plan provides general guidance. Adjust portion sizes and specific foods based on your individual needs, preferences, and any dietary restrictions.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                 <Info className="h-4 w-4"/>
                 <AlertTitle>Consultation</AlertTitle>
                <AlertDescription>
                  Before starting any new nutrition plan, especially if you have medical conditions or specific health goals, consult with a registered dietitian or healthcare provider.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Bottom Action Bar --- */}
      <Card className="print:hidden sticky bottom-4 z-40 shadow-lg border-primary/20 border-2">
         <CardContent className="pt-6">
           <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
             <div className="text-sm text-muted-foreground text-center sm:text-left">
               Ready to start your nutrition journey with the <strong className="text-foreground">{plan.title}</strong>?
             </div>
             <div className="flex gap-2 flex-shrink-0">
               <Button variant="outline" onClick={handleSave}>
                 {isSaved ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                 {isSaved ? "Saved" : "Save Plan"}
               </Button>
               <Button onClick={handleUsePlan} disabled={isPending}>
                 {isPending ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Applying...
                   </>
                 ) : (
                   "Use This Plan"
                 )}
               </Button>
             </div>
           </div>
         </CardContent>
       </Card>
    </main>
  );
}