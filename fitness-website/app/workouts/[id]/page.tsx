// "use client";

// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { useState } from "react";
// import {
//   ArrowLeftCircle,
//   CalendarDays,
//   Utensils,
//   Zap,
//   ShoppingCart,
//   Clock,
//   ChefHat,
//   Check,
//   Printer,
//   Share2,
//   Bookmark,
//   BookmarkCheck,
//   Info,
//   Flame, // Added Flame icon
// } from "lucide-react";
// import { toast } from "@/components/ui/use-toast"; // Using Shadcn's toast

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter // Added CardFooter
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added AlertTitle
// import { Progress } from "@/components/ui/progress";

// // --- Mock Data (Should match meal-plans-list.tsx and include details) ---
// const mockMealPlanDetails: Record<string, any> = {
//   '1': {
//     id: "1",
//     title: "High Protein Meal Plan",
//     description: "Designed for muscle building and strength gain. Focuses on lean proteins, complex carbs, and healthy fats.",
//     category: "Muscle Building",
//     difficulty: "Intermediate",
//     prepTime: "Avg. 30 min/meal",
//     calories: 2500, // Use numbers for calculations
//     protein: 180,
//     carbs: 250,
//     fat: 80,
//     fiber: 35,
//     image: "https://media.istockphoto.com/id/1295633127/photo/grilled-chicken-meat-and-fresh-vegetable-salad-of-tomato-avocado-lettuce-and-spinach-healthy.jpg?s=612x612&w=0&k=20&c=Qa3tiqUCO4VpVMQDXLXG47znCmHr_ZIdoynViJ8kW0E=",
//     dietType: "Omnivore",
//     duration: "7 Days",
//     servings: "1 Person",
//     dailyPlan: [ /* ... Full 7-day plan data from previous example ... */ ],
//     groceryList: [ /* ... Full grocery list data from previous example ... */ ],
//     tips: [ /* ... Tips data ... */ ],
//     benefits: [ /* ... Benefits data ... */ ],
//     // NOTE: Make sure to copy the full 'dailyPlan', 'groceryList', 'tips', 'benefits'
//     // arrays from the "Code 2" example in your previous message for this plan (ID 1).
//     // I've omitted them here for brevity but they are needed.
//   },
//   '2': {
//     id: "2",
//     title: "Vegetarian Weight Loss",
//     description: "A plant-based plan focused on whole foods to support healthy weight loss while maintaining energy and nutrition.",
//     category: "Weight Loss",
//     difficulty: "Beginner",
//     prepTime: "Avg. 20 min/meal",
//     calories: 1800,
//     protein: 100,
//     carbs: 180,
//     fat: 60,
//     fiber: 40,
//     image: "https://cdn.prod.website-files.com/63ed08484c069d0492f5b0bc/642c5de2f6aa2bd4c9abbe86_6406876a4676d1734a14a9a3_Bowl-of-vegetables-and-fruits-for-a-vegetarian-diet-vegetarian-weight-loss-plan.jpeg",
//     dietType: "Vegetarian",
//     duration: "7 Days",
//     servings: "1 Person",
//     dailyPlan: [ /* ... Full 7-day plan data from previous example ... */ ],
//     groceryList: [ /* ... Full grocery list data from previous example ... */ ],
//     tips: [ /* ... Tips data ... */ ],
//     benefits: [ /* ... Benefits data ... */ ],
//   },
//     '3': {
//     id: "3",
//     title: "Keto Meal Plan",
//     category: "Weight Loss",
//     difficulty: "Advanced",
//     prepTime: "Avg. 40 min/meal",
//     calories: 2000,
//     protein: 140,
//     carbs: 30, // Very low carb
//     fat: 155,
//     fiber: 20,
//     image: "https://hellomealsonme.com/blogs/wp-content/uploads/2024/02/7-Day-Keto-Friendly-Meal-Plan.jpg",
//     dietType: "Keto",
//     duration: "7 Days",
//     servings: "1 Person",
//     description: "High fat, moderate protein, very low carb plan designed to induce and maintain ketosis for effective fat burning.",
//     dailyPlan: [ /* ... Full 7-day plan data from previous example ... */ ],
//     groceryList: [ /* ... Full grocery list data from previous example ... */ ],
//     tips: [ /* ... Tips data ... */ ],
//     benefits: [ /* ... Benefits data ... */ ],
//   },
//   '4': {
//     id: "4",
//     title: "Vegan Performance",
//     category: "Performance",
//     difficulty: "Intermediate",
//     prepTime: "Avg. 35 min/meal",
//     calories: 2200,
//     protein: 120,
//     carbs: 280,
//     fat: 65,
//     fiber: 50,
//     image: "https://www.canfitpro.com/wp-content/uploads/2018/08/vegah-square_2.jpg",
//     dietType: "Vegan",
//     duration: "7 Days",
//     servings: "1 Person",
//     description: "Plant-based fuel optimized for athletic performance with complete proteins and nutrient timing.",
//     dailyPlan: [ /* ... Full 7-day plan data from previous example ... */ ],
//     groceryList: [ /* ... Full grocery list data from previous example ... */ ],
//     tips: [ /* ... Tips data ... */ ],
//     benefits: [ /* ... Benefits data ... */ ],
//   },
//   '5': {
//     id: "5",
//     title: "Mediterranean Diet",
//     category: "Health",
//     difficulty: "Beginner",
//     prepTime: "Avg. 25 min/meal",
//     calories: 2100,
//     protein: 110,
//     carbs: 230,
//     fat: 85,
//     fiber: 38,
//     image: "https://media.sunbasket.com/2022/07/62abeaa1-3aff-4296-abce-e14c5507986c.webp",
//     dietType: "Mediterranean",
//     duration: "7 Days",
//     servings: "1 Person",
//     description: "Heart-healthy Mediterranean approach focusing on olive oil, fish, whole grains, and fresh produce.",
//     dailyPlan: [ /* ... Full 7-day plan data from previous example ... */ ],
//     groceryList: [ /* ... Full grocery list data from previous example ... */ ],
//     tips: [ /* ... Tips data ... */ ],
//     benefits: [ /* ... Benefits data ... */ ],
//   },
//   '6': {
//     id: "6",
//     title: "Paleo Meal Plan",
//     category: "Health",
//     difficulty: "Intermediate",
//     prepTime: "Avg. 35 min/meal",
//     calories: 2300,
//     protein: 150,
//     carbs: 160,
//     fat: 110,
//     fiber: 35,
//     image: "https://cdn-prod.medicalnewstoday.com/content/images/articles/324/324405/chicken-salad-in-bowl-top-down-view-with-olive-oil-in-jar.jpg",
//     dietType: "Paleo",
//     duration: "7 Days",
//     servings: "1 Person",
//     description: "Based on foods presumed to have been eaten by early humans - meat, fish, vegetables, fruits, nuts, and seeds.",
//     dailyPlan: [ /* ... Full 7-day plan data from previous example ... */ ],
//     groceryList: [ /* ... Full grocery list data from previous example ... */ ],
//     tips: [ /* ... Tips data ... */ ],
//     benefits: [ /* ... Benefits data ... */ ],
//   },
// };
// // --- End Mock Data ---


// // Helper to calculate macro percentage
// const calculatePercentage = (macroGrams: number, gramsPerCal: number, totalCalories: number) => {
//   if (!totalCalories || totalCalories === 0) return 0;
//   return Math.round(((macroGrams * gramsPerCal) / totalCalories) * 100);
// };

// export default function MealPlanDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const planId = params.id as string;
//   const [isSaved, setIsSaved] = useState(false); // Example state for saved status
//   const [activeDay, setActiveDay] = useState(0); // For daily meal tab

//   // Fetch plan details (using mock data here)
//   const plan = mockMealPlanDetails[planId] || null;

//   // Placeholder function for "Use Plan"
//   const handleUsePlan = () => {
//     // TODO: Implement actual logic:
//     // 1. Update user's active meal plan in Firestore/state management.
//     // 2. Navigate to the nutrition tracking tab or dashboard.
//     console.log(`Using plan ID: ${plan.id}, Title: ${plan.title}`);
//     toast({
//       title: "Plan Selected",
//       description: `${plan.title} has been set as your active plan.`,
//     });
//     // Optional: Redirect after setting the plan
//     // router.push('/profile?tab=nutrition');
//   };

//   // Placeholder function for "Save Plan"
//   const handleSave = () => {
//     // TODO: Implement actual save/unsave logic in Firestore
//     setIsSaved(!isSaved);
//     toast({
//       title: isSaved ? "Plan Unsaved" : "Plan Saved",
//       description: `${plan.title} ${isSaved ? 'removed from' : 'added to'} your saved plans.`,
//     });
//   };

//   // Print handler
//   const handlePrint = () => {
//     window.print();
//   };

//   // Share handler
//   const handleShare = async () => {
//     const shareData = {
//       title: plan.title,
//       text: plan.description,
//       url: window.location.href,
//     };
//     try {
//       if (navigator.share) {
//         await navigator.share(shareData);
//         toast({ title: "Shared successfully!" });
//       } else {
//         // Fallback for browsers without navigator.share
//         await navigator.clipboard.writeText(window.location.href);
//         toast({ title: "Link Copied!", description: "Plan link copied to clipboard." });
//       }
//     } catch (err) {
//       console.error("Error sharing:", err);
//       toast({ title: "Sharing Failed", description: "Could not share the plan.", variant: "destructive" });
//     }
//   };


//   // --- Render Logic ---

//   if (!plan) {
//     return (
//       <main className="container mx-auto py-8 px-4 md:px-6 text-center">
//          {/* Back Button */}
//          <div className="mb-4 text-left">
//            <Button variant="outline" size="sm" asChild>
//              <Link href="/nutrition">← Back to Plans</Link>
//            </Button>
//          </div>
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold">Meal Plan Not Found</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground mb-4">
//               Sorry, we couldn't find the meal plan with ID: <span className="font-mono">{planId}</span>
//             </p>
//             <Button asChild>
//               <Link href="/nutrition">Browse Meal Plans</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       </main>
//     );
//   }

//   // Calculate macro percentages
//   const proteinPercent = calculatePercentage(plan.protein, 4, plan.calories);
//   const carbPercent = calculatePercentage(plan.carbs, 4, plan.calories);
//   const fatPercent = calculatePercentage(plan.fat, 9, plan.calories);

//   return (
//     <main className="container mx-auto py-8 px-4 md:px-6 space-y-6">
//       {/* Back Button */}
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={() => router.back()}
//         className="flex items-center gap-1 text-muted-foreground hover:text-foreground print:hidden"
//       >
//         <ArrowLeftCircle className="h-4 w-4" /> Back to Plans
//       </Button>

//       {/* --- Header Card --- */}
//       <Card className="overflow-hidden border-primary/20 border-2">
//         <div className="grid md:grid-cols-2">
//           {/* Image Section */}
//           <div className="relative h-64 md:h-full min-h-[300px]">
//             <Image
//               src={plan.image || "/placeholder.svg"} // Use placeholder if no image
//               alt={plan.title}
//               fill
//               className="object-cover"
//               sizes="(max-width: 768px) 100vw, 50vw"
//               priority // Load image faster
//             />
//           </div>

//           {/* Details Section */}
//           <div className="p-6 flex flex-col justify-between">
//             <div> {/* Top content */}
//               <div className="flex items-start justify-between mb-2">
//                 <Badge className="mb-2 bg-primary/90 text-primary-foreground">{plan.dietType}</Badge>
//                  {/* Action Buttons */}
//                 <div className="flex gap-1 print:hidden">
//                   <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8" title={isSaved ? "Unsave Plan" : "Save Plan"}>
//                     {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8" title="Share Plan">
//                     <Share2 className="h-5 w-5" />
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={handlePrint} className="h-8 w-8" title="Print Plan">
//                     <Printer className="h-5 w-5" />
//                   </Button>
//                 </div>
//               </div>
//               <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
//               <p className="text-muted-foreground mb-4">{plan.description}</p>

//               {/* Quick Info */}
//               <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4 text-muted-foreground">
//                 <div className="flex items-center gap-2">
//                   <Zap className="h-4 w-4 text-primary/80" />
//                   <span>{plan.calories} kcal/day</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-4 w-4 text-primary/80" />
//                   <span>{plan.prepTime}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <CalendarDays className="h-4 w-4 text-primary/80" />
//                   <span>{plan.duration}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <ChefHat className="h-4 w-4 text-primary/80" />
//                   <span>{plan.difficulty}</span>
//                 </div>
//                  <div className="flex items-center gap-2 col-span-2">
//                     <Utensils className="h-4 w-4 text-primary/80" />
//                     <span>P: {plan.protein}g • C: {plan.carbs}g • F: {plan.fat}g • Fiber: {plan.fiber}g</span>
//                  </div>
//               </div>

//                {/* Macro Breakdown Mini */}
//               <div className="bg-muted/50 rounded-lg p-3 mb-4">
//                  <h3 className="font-semibold mb-1.5 text-xs text-muted-foreground uppercase tracking-wider">Daily Macros</h3>
//                  <div className="grid grid-cols-3 gap-2 text-center">
//                      <div>
//                        <div className="text-xs">Protein</div>
//                        <div className="font-bold text-green-600">{proteinPercent}%</div>
//                      </div>
//                      <div>
//                        <div className="text-xs">Carbs</div>
//                        <div className="font-bold text-blue-600">{carbPercent}%</div>
//                      </div>
//                      <div>
//                        <div className="text-xs">Fat</div>
//                        <div className="font-bold text-orange-600">{fatPercent}%</div>
//                      </div>
//                  </div>
//                </div>
//             </div>

//              {/* Use Plan Button */}
//             <Button size="lg" className="w-full mt-4 print:hidden" onClick={handleUsePlan}>
//               Use This Plan
//             </Button>
//           </div>
//         </div>
//       </Card>

//       {/* --- Main Content Tabs --- */}
//       <Tabs defaultValue="overview" className="w-full">
//         <TabsList className="grid w-full grid-cols-4 print:hidden">
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           <TabsTrigger value="meals">Daily Meals</TabsTrigger>
//           <TabsTrigger value="grocery">Grocery List</TabsTrigger>
//           <TabsTrigger value="tips">Tips & Benefits</TabsTrigger>
//         </TabsList>

//         {/* --- Overview Tab --- */}
//         <TabsContent value="overview" className="space-y-4 mt-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Plan Overview</CardTitle>
//               <CardDescription>Everything you need to know about this meal plan</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Nutrition Breakdown */}
//               <div>
//                 <h3 className="font-semibold mb-3 text-lg">Nutrition Breakdown</h3>
//                 <div className="space-y-3">
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span>Protein ({plan.protein}g)</span>
//                       <span className="text-muted-foreground">{proteinPercent}% of calories</span>
//                     </div>
//                     <Progress value={proteinPercent} className="h-2 [&>div]:bg-green-500" />
//                   </div>
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span>Carbohydrates ({plan.carbs}g)</span>
//                       <span className="text-muted-foreground">{carbPercent}% of calories</span>
//                     </div>
//                     <Progress value={carbPercent} className="h-2 [&>div]:bg-blue-500" />
//                   </div>
//                   <div>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span>Fat ({plan.fat}g)</span>
//                       <span className="text-muted-foreground">{fatPercent}% of calories</span>
//                     </div>
//                     <Progress value={fatPercent} className="h-2 [&>div]:bg-orange-500" />
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               {/* Quick Facts */}
//               <div>
//                 <h3 className="font-semibold mb-3 text-lg">Quick Facts</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {[
//                     { icon: Utensils, label: "Meal Frequency", value: `${plan.dailyPlan?.[0]?.meals?.length || 'N/A'} meals/snacks per day` },
//                     { icon: Clock, label: "Time Commitment", value: `${plan.prepTime} per meal` },
//                     { icon: ChefHat, label: "Difficulty Level", value: `${plan.difficulty} cooking skills` },
//                     { icon: CalendarDays, label: "Duration", value: `${plan.duration} complete plan` },
//                     { icon: Flame, label: "Fiber Intake", value: `${plan.fiber}g per day` }, // Added Fiber
//                   ].map((fact, index) => (
//                     <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
//                       <div className="bg-primary/10 p-2 rounded-full mt-1">
//                         <fact.icon className="h-4 w-4 text-primary" />
//                       </div>
//                       <div>
//                         <div className="font-medium text-sm">{fact.label}</div>
//                         <div className="text-xs text-muted-foreground">{fact.value}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Sample Day Preview */}
//               {plan.dailyPlan && plan.dailyPlan.length > 0 && plan.dailyPlan[0].meals?.length > 0 && (
//                 <>
//                   <Separator />
//                   <div>
//                     <h3 className="font-semibold mb-3 text-lg">Sample Day Preview ({plan.dailyPlan[0].day})</h3>
//                     <p className="text-sm text-muted-foreground mb-3">Here's a glimpse of what a typical day looks like:</p>
//                     <div className="space-y-2">
//                        {/* Show first 3-4 meals */}
//                       {plan.dailyPlan[0].meals.slice(0, 4).map((meal: any, idx: number) => (
//                         <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
//                           <div>
//                             <div className="font-medium text-sm">{meal.name}</div>
//                             <div className="text-xs text-muted-foreground">{meal.time}</div>
//                           </div>
//                           <div className="text-right">
//                             <div className="font-semibold text-sm">{meal.calories} cal</div>
//                             <div className="text-xs text-muted-foreground">P: {meal.protein}g</div>
//                           </div>
//                         </div>
//                       ))}
//                       {plan.dailyPlan[0].meals.length > 4 && (
//                           <div className="text-center text-sm text-muted-foreground p-2">...and more</div>
//                       )}
//                       {/* Button to switch to Daily Meals tab */}
//                       <Button variant="outline" className="w-full" onClick={() => (document.querySelector('button[data-radix-collection-item][value="meals"]') as HTMLElement)?.click()}>
//                         View Full Week Plan
//                       </Button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* --- Daily Meals Tab --- */}
//         <TabsContent value="meals" className="space-y-4 mt-4">
//           {plan.dailyPlan && plan.dailyPlan.length > 0 ? (
//             <>
//               {/* Day Selector */}
//               <Card className="print:hidden">
//                 <CardContent className="pt-6">
//                    <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center md:text-left">Select Day:</h3>
//                   <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
//                     {plan.dailyPlan.map((dayData: any, index: number) => (
//                       <Button
//                         key={index}
//                         variant={activeDay === index ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => setActiveDay(index)}
//                         className="whitespace-nowrap flex-shrink-0"
//                       >
//                         {dayData.day}
//                       </Button>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Selected Day's Meals */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>{plan.dailyPlan[activeDay].day}'s Meal Schedule</CardTitle>
//                   <CardDescription>Complete nutrition breakdown for the selected day.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {plan.dailyPlan[activeDay].meals.map((meal: any, index: number) => (
//                       <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
//                         <div className="flex justify-between items-start mb-2 gap-4">
//                           <div className="flex-1">
//                             <h3 className="font-semibold">{meal.name}</h3>
//                             <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
//                               <Clock className="h-3 w-3" />
//                               {meal.time}
//                             </p>
//                           </div>
//                           <div className="text-right flex-shrink-0">
//                             <div className="font-bold text-lg">{meal.calories} cal</div>
//                             <div className="text-xs text-muted-foreground">P: {meal.protein}g</div>
//                           </div>
//                         </div>
//                          {/* Optional: Add more details if available in your data */}
//                          {/* <p className="text-xs text-muted-foreground mt-1">
//                             Carbs: {meal.carbs}g • Fat: {meal.fat}g
//                          </p> */}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Daily Totals Calculation */}
//                   <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
//                      <h3 className="font-semibold mb-3 text-lg">Daily Totals for {plan.dailyPlan[activeDay].day}</h3>
//                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                         {(['calories', 'protein'] as const).map(macro => {
//                           const total = plan.dailyPlan[activeDay].meals.reduce((sum: number, meal: any) => sum + (meal[macro] || 0), 0);
//                           const target = plan[macro]; // Get target from main plan data
//                           const unit = macro === 'calories' ? 'kcal' : 'g';
//                           const colorClass = macro === 'protein' ? 'text-green-600' : 'text-foreground';
//                           return (
//                             <div key={macro}>
//                               <div className="text-xs text-muted-foreground capitalize">{macro}</div>
//                               <div className={`text-2xl font-bold ${colorClass}`}>
//                                 {Math.round(total)}{unit}
//                               </div>
//                                <div className="text-xs text-muted-foreground">Target: {target}{unit}</div>
//                             </div>
//                           );
//                         })}
//                          {/* You can add Carb/Fat totals similarly if needed */}
//                      </div>
//                    </div>
//                 </CardContent>
//               </Card>
//             </>
//           ) : (
//              <Card>
//                <CardContent className="py-8 text-center">
//                  <Utensils className="h-10 w-10 mx-auto text-muted-foreground mb-3"/>
//                  <p className="text-muted-foreground">Detailed daily meal plan coming soon.</p>
//                </CardContent>
//              </Card>
//           )}
//         </TabsContent>

//         {/* --- Grocery List Tab --- */}
//         <TabsContent value="grocery" className="space-y-4 mt-4">
//           {plan.groceryList && plan.groceryList.length > 0 ? (
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between print:hidden">
//                   <div>
//                     <CardTitle>Weekly Grocery List</CardTitle>
//                     <CardDescription>Everything you need for {plan.duration}</CardDescription>
//                   </div>
//                   <Button variant="outline" size="sm" onClick={handlePrint}>
//                     <Printer className="h-4 w-4 mr-2" />
//                     Print List
//                   </Button>
//                 </div>
//                  {/* Title for printing */}
//                  <div className="hidden print:block text-center mb-4">
//                     <h1 className="text-2xl font-bold">{plan.title} - Grocery List</h1>
//                  </div>
//               </CardHeader>
//               <CardContent>
//                 <Alert className="mb-6 print:hidden">
//                   <ShoppingCart className="h-4 w-4" />
//                    <AlertTitle>Shopping Tip</AlertTitle>
//                   <AlertDescription>
//                     This list covers all meals for {plan.duration}. Adjust quantities based on your needs and check your pantry first!
//                   </AlertDescription>
//                 </Alert>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
//                   {plan.groceryList.map((category: any, index: number) => (
//                     <div key={index} className="border-b pb-4 mb-4 md:border-none md:pb-0 md:mb-0">
//                       <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
//                         {/* Simple category indicator */}
//                         {category.category}
//                       </h3>
//                       <ul className="space-y-2">
//                         {category.items.map((item: string, idx: number) => (
//                           <li key={idx} className="flex items-start gap-2 text-sm">
//                              {/* Basic checkbox for print */}
//                              <span className="hidden print:inline-block border border-gray-400 w-4 h-4 mt-0.5 mr-2 flex-shrink-0"></span>
//                             {/* Check icon for web view */}
//                              <Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 print:hidden" />
//                             <span>{item}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           ) : (
//              <Card>
//                <CardContent className="py-8 text-center">
//                   <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3"/>
//                  <p className="text-muted-foreground">Grocery list coming soon.</p>
//                </CardContent>
//              </Card>
//           )}
//         </TabsContent>

//         {/* --- Tips & Benefits Tab --- */}
//         <TabsContent value="tips" className="space-y-4 mt-4">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Tips Card */}
//             {plan.tips && plan.tips.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Success Tips</CardTitle>
//                   <CardDescription>Make the most of this meal plan</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-3">
//                     {plan.tips.map((tip: string, index: number) => (
//                       <li key={index} className="flex items-start gap-3">
//                         <div className="bg-primary/10 p-1 rounded-full mt-0.5 flex-shrink-0">
//                           <Check className="h-3 w-3 text-primary" />
//                         </div>
//                         <span className="text-sm text-muted-foreground">{tip}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Benefits Card */}
//             {plan.benefits && plan.benefits.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Key Benefits</CardTitle>
//                   <CardDescription>Why this plan works</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-3">
//                     {plan.benefits.map((benefit: string, index: number) => (
//                       <li key={index} className="flex items-start gap-3">
//                         <div className="bg-green-100 dark:bg-green-900/50 p-1 rounded-full mt-0.5 flex-shrink-0">
//                           <Zap className="h-3 w-3 text-green-600 dark:text-green-400" />
//                         </div>
//                         <span className="text-sm text-muted-foreground">{benefit}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           {/* Additional Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Important Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert variant="default" className="border-blue-500/50 dark:border-blue-500/30">
//                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
//                  <AlertTitle className="text-blue-700 dark:text-blue-300">Customization</AlertTitle>
//                 <AlertDescription>
//                   This meal plan provides general guidance. Adjust portion sizes and specific foods based on your individual needs, preferences, and any dietary restrictions.
//                 </AlertDescription>
//               </Alert>
//               <Alert variant="destructive">
//                  <Info className="h-4 w-4"/>
//                  <AlertTitle>Consultation</AlertTitle>
//                 <AlertDescription>
//                   Before starting any new nutrition plan, especially if you have medical conditions or specific health goals, consult with a registered dietitian or healthcare provider.
//                 </AlertDescription>
//               </Alert>
//                <Alert variant="default" className="border-green-500/50 dark:border-green-500/30">
//                  <Info className="h-4 w-4 text-green-600 dark:text-green-400"/>
//                   <AlertTitle className="text-green-700 dark:text-green-300">Flexibility</AlertTitle>
//                 <AlertDescription>
//                   Feel free to swap similar foods within the same category (e.g., different vegetables, lean proteins) to maintain variety and accommodate your tastes.
//                 </AlertDescription>
//               </Alert>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* --- Bottom Action Bar --- */}
//       <Card className="print:hidden sticky bottom-4 z-40 shadow-lg border-primary/20 border-2">
//          <CardContent className="pt-6">
//            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
//              <div className="text-sm text-muted-foreground text-center sm:text-left">
//                Ready to start your nutrition journey with the <strong className="text-foreground">{plan.title}</strong>?
//              </div>
//              <div className="flex gap-2 flex-shrink-0">
//                <Button variant="outline" onClick={handleSave}>
//                  {isSaved ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
//                  {isSaved ? "Saved" : "Save Plan"}
//                </Button>
//                <Button onClick={handleUsePlan}>
//                  Use This Plan
//                </Button>
//              </div>
//            </div>
//          </CardContent>
//        </Card>

//     </main>
//   );
// }

//app\workouts\[id]\page.tsx
"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock workout details data - in a real app, you would fetch this from an API
const mockDetails = {
  1: {
    title: "Full Body HIIT",
    steps: [
      "Warm up for 5 minutes",
      "Perform 30 seconds of burpees",
      "Rest for 15 seconds",
      "Repeat for 8 rounds",
      "Cool down for 5 minutes",
    ],
    youtubeUrl: "https://www.youtube.com/embed/J212vz33gU4",
    gifUrl: "https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/9015.mp4",
    gifUrl1:"https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/9046.mp4",
    gifUrl2:"https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/2006.mp4",
    gifUrl3:"https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/5006.mp4",
    gifUrl4:"https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/5001.mp4",
  },
  2: {
    title: "Core Strength Builder",
    steps: [
      "Start with a 1-minute plank",
      "Perform 20 crunches",
      "Do 15 Russian twists on each side",
      "Rest for 30 seconds",
      "Repeat 3 times",
    ],
    youtubeUrl: "https://www.youtube.com/embed/fMrzBkHA_94?si=jovZwyhY_ftmrMIS",
    gifUrl: "https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/2006.mp4",
  },
  3: {
    title: "Upper Body Power",
    steps: [
      "Warm up with arm circles",
      "4 sets of 10 push-ups",
      "3 sets of 12 dumbbell rows per arm",
      "3 sets of 10 shoulder presses",
      "Cool down and stretch",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
  4: {
    title: "Yoga Flow",
    steps: [
      "Begin in mountain pose",
      "Flow through 5 sun salutations",
      "Hold warrior poses for 30 seconds each side",
      "Practice balance poses",
      "End with 5 minutes of meditation",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
  5: {
    title: "Cardio Blast",
    steps: [
      "Warm up for 3 minutes",
      "30 seconds of jumping jacks",
      "30 seconds of high knees",
      "30 seconds of butt kicks",
      "15 seconds rest",
      "Repeat 10 times",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
  6: {
    title: "Lower Body Focus",
    steps: [
      "Warm up with leg swings",
      "4 sets of 12 squats",
      "3 sets of 10 lunges per leg",
      "3 sets of 15 glute bridges",
      "Stretch all major leg muscles",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
  7: {
    title: "HIIT Tabata",
    steps: [
      "20 seconds of squat jumps",
      "10 seconds rest",
      "20 seconds of mountain climbers",
      "10 seconds rest",
      "Repeat for 8 rounds",
      "Rest 1 minute",
      "Complete 4 sets",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
  8: {
    title: "Pilates Core",
    steps: [
      "Begin with breathing exercises",
      "Perform the hundred",
      "Roll-ups for 10 reps",
      "Single leg circles",
      "Spine stretch forward",
      "End with relaxation",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
  9: {
    title: "Endurance Run",
    steps: [
      "5 minute warm-up walk",
      "Run at moderate pace for 20 minutes",
      "Increase pace for 10 minutes",
      "Sprint intervals: 30 seconds sprint, 1 minute jog (5 rounds)",
      "5 minute cool-down",
    ],
    youtubeUrl: "",
    gifUrl: "",
  },
}

export default function WorkoutDetailsPage() {
  const params = useParams()
  const workoutId = Number(params.id)

  // Get workout details or provide fallback for unknown workouts
  const details = mockDetails[workoutId as keyof typeof mockDetails] || {
    title: "Unknown Workout",
    steps: ["Workout details not found"],
    youtubeUrl: "",
    gifUrl: "",
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/workouts" className="flex items-center gap-1 text-sm hover:underline">
          <ArrowLeftCircle className="h-5 w-5" /> Back to Workouts
        </Link>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl font-bold">{details.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 pl-4">
              {details.steps.map((step, i) => (
                <li key={i} className="mb-2">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {details.youtubeUrl && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Video Tutorial</h3>
              <div className="relative pt-[56.25%] rounded-lg overflow-hidden">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-md"
                  src={details.youtubeUrl}
                  title={`${details.title} tutorial`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {details.gifUrl && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Exercise Demonstration</h3>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <video className="w-full rounded-md" src={details.gifUrl} autoPlay loop muted controls />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional workout information card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Tips for Maximum Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 pl-4">
            <li>Focus on proper form rather than speed</li>
            <li>Stay hydrated throughout your workout</li>
            <li>Breathe properly - exhale during exertion</li>
            <li>If you feel pain (not muscle fatigue), stop immediately</li>
            <li>Allow for proper rest between workout sessions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

