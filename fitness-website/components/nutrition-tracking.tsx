"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Utensils, Apple, Edit, Loader2, Info } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, isToday } from "date-fns";
import Link from "next/link"; // Ensure Link is imported
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// --- Firebase Imports ---
import { auth, db } from "@/firebase-config";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";

// --- Centralized Meal Plan Data ---
import { getMealPlanById } from "@/lib/meal-plan-data";

// --- Simplified Food Database ---
const foodDatabase = [
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Brown Rice (100g, cooked)", calories: 112, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  // ... (add more food items as needed)
];

// --- Interfaces ---
interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
}

interface MealLog {
  id: string;
  userId: string;
  name: string;
  time: string;
  date: Date;
  items: MealItem[];
  createdAt: Timestamp;
}

// --- Default Goals ---
const DEFAULT_GOALS: NutritionGoals = {
  calories: 2200,
  protein: 150,
  carbs: 220,
  fat: 70,
  fiber: 30,
};

export default function NutritionTracking() {
  // ---- Component State ----
  const [view, setView] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [dailyGoals, setDailyGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [activeMealPlanId, setActiveMealPlanId] = useState<string | null>(null);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Weekly View State
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<Record<string, NutritionGoals>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  // Dialog States
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [newMeal, setNewMeal] = useState<{ name: string; time: string; items: MealItem[] }>({
    name: "Breakfast",
    time: format(new Date().setHours(8, 0), "HH:mm"),
    items: [],
  });
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState("");
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editGoalsOpen, setEditGoalsOpen] = useState(false);
  const [tempGoals, setTempGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [isSavingGoals, setIsSavingGoals] = useState(false);

  // ------------------------------------------------------------------
  // 1. Authentication and Initial Data Fetch
  // ------------------------------------------------------------------
  useEffect(() => {
    console.log("Setting up auth listener..."); // Log setup
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Auth state changed: User logged in", user.uid); // Log login
        setUserId(user.uid);
        await fetchUserData(user.uid);
        await fetchMealsForDate(user.uid, selectedDate);
      } else {
        console.log("Auth state changed: User logged out"); // Log logout
        setUserId(null);
        setMeals([]);
        setDailyGoals(DEFAULT_GOALS);
        setActiveMealPlanId(null);
        setLoading(false);
        // Reset weekly data as well
        setWeeklyData({});
      }
    });
    return () => {
        console.log("Cleaning up auth listener."); // Log cleanup
        unsubscribe();
    }
  }, []); // Run only once on mount

  // ------------------------------------------------------------------
  // 2. Fetch User Goals and Active Plan
  // ------------------------------------------------------------------
  const fetchUserData = async (uid: string) => {
    // Keep setLoading(true) here if you want goals loading state
    // setLoading(true);
    console.log(`fetchUserData: Fetching goals for user ${uid}`);
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("fetchUserData: User doc exists, data:", data);
        if (data.nutritionGoals) {
          console.log("fetchUserData: Found nutritionGoals:", data.nutritionGoals);
          setDailyGoals(data.nutritionGoals);
          setTempGoals(data.nutritionGoals);
        } else {
          console.log("fetchUserData: No nutritionGoals found, setting defaults.");
          setDailyGoals(DEFAULT_GOALS);
          setTempGoals(DEFAULT_GOALS);
          await setDoc(userDocRef, { nutritionGoals: DEFAULT_GOALS }, { merge: true });
          console.log("fetchUserData: Saved default goals to Firestore.");
        }
        setActiveMealPlanId(data.activeMealPlanId || null);
        console.log("fetchUserData: Active plan ID:", data.activeMealPlanId || null);
      } else {
         console.warn("fetchUserData: User document not found, creating one.");
         setDailyGoals(DEFAULT_GOALS);
         setTempGoals(DEFAULT_GOALS);
         await setDoc(doc(db, "users", uid), {
             nutritionGoals: DEFAULT_GOALS,
             createdAt: Timestamp.now() // Add createdAt field if creating doc
            }, { merge: true });
         setActiveMealPlanId(null);
         console.log("fetchUserData: Created user doc with default goals.");
      }
    } catch (error) {
      console.error("fetchUserData: Error fetching user data:", error);
      toast.error("Could not load your nutrition goals.");
      setDailyGoals(DEFAULT_GOALS);
      setTempGoals(DEFAULT_GOALS);
    }
    // setLoading(false); // Move setLoading(false) to fetchMealsForDate's finally block
  };

  // ------------------------------------------------------------------
  // 3. Fetch Meals for a Specific Date
  // ------------------------------------------------------------------
  const fetchMealsForDate = async (uid: string | null, date: Date) => {
    if (!uid) {
      console.log("fetchMealsForDate: No userId provided.");
      setMeals([]); // Clear meals if no user
      setLoading(false); // Ensure loading is off if no user
      return;
    }
    setLoading(true);
    console.log(`fetchMealsForDate: Fetching for user ${uid} on date ${format(date, "yyyy-MM-dd")}`);

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const mealsRef = collection(db, "meals");
      // Use the corrected query with the required index (userId ASC, date ASC, createdAt ASC)
      const q = query(
        mealsRef,
        where("userId", "==", uid),
        where("date", ">=", Timestamp.fromDate(startOfDay)),
        where("date", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("date", "asc"), // Order by date first (needed for the index)
        orderBy("createdAt", "asc") // Then order by creation time
      );

      const querySnapshot = await getDocs(q);
      const fetchedMeals: MealLog[] = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MealLog, 'id' | 'date'>),
          date: docSnap.data().date?.toDate() || new Date(),
      }));

      // Secondary sort by time string (client-side) as Firestore might group by timestamp seconds
      fetchedMeals.sort((a, b) => a.time.localeCompare(b.time));

      console.log("fetchMealsForDate: Fetched meals data:", JSON.stringify(fetchedMeals, null, 2));

      setMeals(fetchedMeals);
      console.log("fetchMealsForDate: setMeals called.");

    } catch (error: any) { // Catch specific Firebase error
      console.error("fetchMealsForDate: Error fetching meals:", error);
      // Check if it's the index error
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.error("Firestore Index Missing: Please create the required composite index in your Firebase console.");
          toast.error("Database setup needed. Please contact support.", {
              description: "A required index is missing for fetching meals efficiently."
          });
      } else {
          toast.error(`Could not fetch meals for ${format(date, "PPP")}.`);
      }
      setMeals([]); // Clear meals on error
    } finally {
      setLoading(false);
      console.log("fetchMealsForDate: Fetch complete, loading set to false.");
    }
  };

  // ------------------------------------------------------------------
  // 4. Recalculate Daily Totals When Meals Change
  // ------------------------------------------------------------------
  useEffect(() => {
    console.log("useEffect [meals]: Recalculating totals. Current meals:", JSON.stringify(meals, null, 2));

    const totals = meals.reduce(
      (acc, meal) => {
        (meal.items || []).forEach((item) => {
          const quantity = item.quantity || 1;
          acc.calories += (item.calories || 0) * quantity;
          acc.protein += (item.protein || 0) * quantity;
          acc.carbs += (item.carbs || 0) * quantity;
          acc.fat += (item.fat || 0) * quantity;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    console.log("useEffect [meals]: Calculated totals:", totals);

    setDailyTotals(totals);
    console.log("useEffect [meals]: setDailyTotals called.");

  }, [meals]);

  // ------------------------------------------------------------------
  // 5. Refetch Meals When Selected Date Changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (userId) {
       console.log(`useEffect [selectedDate, userId]: Date or user changed. Refetching meals for ${format(selectedDate, "yyyy-MM-dd")}.`);
      fetchMealsForDate(userId, selectedDate);
    } else {
        console.log("useEffect [selectedDate, userId]: userId is null, skipping fetch.");
    }
  }, [selectedDate, userId]);

  // ------------------------------------------------------------------
  // 6. Weekly View Logic
  // ------------------------------------------------------------------
  const fetchWeeklyData = async (weekStart: Date) => {
    if (!userId) return;
    setWeeklyLoading(true);
    console.log(`fetchWeeklyData: Fetching for week starting ${format(weekStart, "yyyy-MM-dd")}`);

    const weekEnd = endOfWeek(weekStart);
    const dateMap: Record<string, NutritionGoals> = {};

    try {
        const mealsRef = collection(db, "meals");
        // Ensure this query also has a corresponding index if needed, or simplify it.
        // Index: userId ASC, date ASC
        const q = query(
            mealsRef,
            where("userId", "==", userId),
            where("date", ">=", Timestamp.fromDate(weekStart)),
            where("date", "<=", Timestamp.fromDate(weekEnd)),
            orderBy("date", "asc")
        );

        const querySnapshot = await getDocs(q);
        console.log(`fetchWeeklyData: Found ${querySnapshot.docs.length} meals for the week.`);

        querySnapshot.forEach((docSnap) => {
            const mealData = docSnap.data();
            const mealDate = mealData.date?.toDate();
            if (!mealDate) return;
            const dateString = format(mealDate, "yyyy-MM-dd");

            if (!dateMap[dateString]) {
                dateMap[dateString] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            }

            if (mealData.items && Array.isArray(mealData.items)) {
                mealData.items.forEach((item: MealItem) => {
                    const quantity = item.quantity || 1;
                    dateMap[dateString].calories += (item.calories || 0) * quantity;
                    dateMap[dateString].protein += (item.protein || 0) * quantity;
                    dateMap[dateString].carbs += (item.carbs || 0) * quantity;
                    dateMap[dateString].fat += (item.fat || 0) * quantity;
                });
            }
        });

        console.log("fetchWeeklyData: Processed weekly data:", dateMap);
        setWeeklyData(dateMap);
    } catch (error: any) {
        console.error("fetchWeeklyData: Error fetching weekly data:", error);
         if (error.code === 'failed-precondition' && error.message.includes('index')) {
             console.error("Firestore Index Missing: Please create the required composite index for weekly view (userId ASC, date ASC).");
             toast.error("Database setup needed for weekly view.", {
                 description: "A required index is missing."
             });
         } else {
            toast.error("Could not load weekly nutrition data.");
         }
    } finally {
        setWeeklyLoading(false);
        console.log("fetchWeeklyData: Fetch complete.");
    }
  };

  useEffect(() => {
    if (view === "weekly" && userId) {
      fetchWeeklyData(currentWeekStart);
    }
  }, [view, currentWeekStart, userId]);

  const handlePreviousWeek = () => setCurrentWeekStart((prev) => subDays(prev, 7));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
  const handleCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date()));

  // ------------------------------------------------------------------
  // 7. Date Navigation (Daily View)
  // ------------------------------------------------------------------
  const handlePreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  // ------------------------------------------------------------------
  // 8. Add Meal & Food Logic (Keep as is, includes toasts)
  // ------------------------------------------------------------------
    const handleAddMeal = async () => {
        if (!userId) return toast.error("Please log in.");
        if (newMeal.items.length === 0) return toast.warning("Add food items first.");

        const toastId = toast.loading("Adding meal...");
        try {
            const mealDate = new Date(selectedDate);
            const [hours, minutes] = newMeal.time.split(":").map(Number);
            mealDate.setHours(hours, minutes, 0, 0);

            const mealData = { /* ... */ }; // Keep mealData structure
            await addDoc(collection(db, "meals"), {
                userId: userId,
                name: newMeal.name,
                time: newMeal.time,
                date: Timestamp.fromDate(mealDate),
                items: newMeal.items,
                createdAt: Timestamp.now(),
            });

            setNewMeal({ name: "Breakfast", time: format(new Date().setHours(8, 0), "HH:mm"), items: [] });
            setAddMealOpen(false);
            toast.success("Meal added!", { id: toastId });
            await fetchMealsForDate(userId, selectedDate); // Refetch
        } catch (error) {
            console.error("handleAddMeal Error:", error);
            toast.error("Failed to add meal.", { id: toastId });
        }
    };

    const handleAddFoodToMeal = () => {
        const food = foodDatabase.find((f) => f.name === selectedFood);
        if (!food) return toast.warning("Select food.");

        const newItem: MealItem = { /* ... */ }; // Keep newItem structure
        newItem.name = food.name;
        newItem.calories = food.calories;
        newItem.protein = food.protein;
        newItem.carbs = food.carbs;
        newItem.fat = food.fat;
        newItem.quantity = foodQuantity;

        setNewMeal((prev) => ({ ...prev, items: [...prev.items, newItem] }));
        setSelectedFood("");
        setFoodQuantity(1);
        setSearchTerm("");
        setAddFoodOpen(false);
        toast.success(`${newItem.name} added.`);
    };

    const handleRemoveFoodFromMeal = (index: number) => {
        const removedItemName = newMeal.items[index]?.name;
        setNewMeal((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        if (removedItemName) toast.info(`${removedItemName} removed.`);
    };

    const handleDeleteMeal = async (mealId: string) => {
        if (!userId) return;
        const toastId = toast.loading("Deleting meal...");
        try {
            await deleteDoc(doc(db, "meals", mealId));
            toast.success("Meal deleted.", { id: toastId });
            setMeals(prev => prev.filter(meal => meal.id !== mealId)); // Update UI immediately
        } catch (error) {
            console.error("handleDeleteMeal Error:", error);
            toast.error("Failed to delete meal.", { id: toastId });
        }
    };

    const filteredFoods = searchTerm
        ? foodDatabase.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : foodDatabase;

  // ------------------------------------------------------------------
  // 9. Edit Goals Logic (Keep as is, includes toasts)
  // ------------------------------------------------------------------
    const handleGoalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempGoals(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleSaveGoals = async () => {
        if (!userId) return toast.error("Please log in.");
        setIsSavingGoals(true);
        const toastId = toast.loading("Saving goals...");
        try {
            const userDocRef = doc(db, "users", userId);
            await setDoc(userDocRef, { nutritionGoals: tempGoals, activeMealPlanId: null }, { merge: true }); // Clear active plan ID when manually setting goals

            setDailyGoals(tempGoals);
            setActiveMealPlanId(null); // Update local state
            setEditGoalsOpen(false);
            toast.success("Goals updated!", { id: toastId });
        } catch (error) {
            console.error("handleSaveGoals Error:", error);
            toast.error("Failed to save goals.", { id: toastId });
        } finally {
            setIsSavingGoals(false);
        }
    };

  // ------------------------------------------------------------------
  // 10. Helpers for Progress Bars (Keep as is)
  // ------------------------------------------------------------------
  const getProgress = (value: number, goal: number): number => {
    if (!goal || goal <= 0 || isNaN(goal) || isNaN(value)) return 0; // More robust check
    // Allow progress > 100 visually up to 150%, but cap calculation at 100 for display %
    const calculatedProgress = Math.round((value / goal) * 100);
    return Math.min(calculatedProgress, 100); // Value for display % capped at 100
  };

  const getProgressValueForBar = (value: number, goal: number): number => {
      if (!goal || goal <= 0 || isNaN(goal) || isNaN(value)) return 0;
      const calculatedProgress = Math.round((value / goal) * 100);
      return Math.min(calculatedProgress, 150); // Allow bar to go slightly over 100%
  };


  const getProgressColor = (value: number, goal: number) => {
    const percentage = getProgressValueForBar(value, goal); // Use the bar value for color logic
    if (percentage > 120) return "[&>div]:bg-red-500"; // Over 120% is red
    if (percentage > 105) return "[&>div]:bg-orange-500"; // 105-120% is orange
    if (percentage < 80) return "[&>div]:bg-yellow-500"; // Under 80% is yellow (optional)
    return "[&>div]:bg-primary"; // 80-105% is primary
  };

  // ------------------------------------------------------------------
  // 11. Render Logic
  // ------------------------------------------------------------------
  if (loading && !userId) { // Show loader only if loading and user ID is not yet set
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }


  const activePlanDetails = activeMealPlanId ? getMealPlanById(activeMealPlanId) : null;

  // *** ADD LOGS BEFORE RETURN ***
  console.log("Render: Rendering NutritionTracking component.");
  console.log("Render: Current meals state:", meals);
  console.log("Render: Current dailyTotals state:", dailyTotals);
  console.log("Render: Current dailyGoals state:", dailyGoals);
  console.log("Render: Current userId state:", userId);
  console.log("Render: Current loading state:", loading);

  return (
    <div className="space-y-6">
       {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Nutrition Tracking</h2>
          <p className="text-muted-foreground">Monitor your daily nutrition intake</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           {/* Edit Goals Button */}
           <Dialog open={editGoalsOpen} onOpenChange={setEditGoalsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!userId}> {/* Disable if not logged in */}
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Goals
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Edit Daily Nutrition Goals</DialogTitle>
                      <DialogDescription>Set your target calories and macronutrients.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-calories" className="text-right">Calories</Label>
                        <Input id="edit-calories" name="calories" type="number" value={tempGoals.calories} onChange={handleGoalInputChange} className="col-span-3"/>
                     </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-protein" className="text-right">Protein (g)</Label>
                        <Input id="edit-protein" name="protein" type="number" value={tempGoals.protein} onChange={handleGoalInputChange} className="col-span-3"/>
                     </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-carbs" className="text-right">Carbs (g)</Label>
                        <Input id="edit-carbs" name="carbs" type="number" value={tempGoals.carbs} onChange={handleGoalInputChange} className="col-span-3"/>
                     </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-fat" className="text-right">Fat (g)</Label>
                        <Input id="edit-fat" name="fat" type="number" value={tempGoals.fat} onChange={handleGoalInputChange} className="col-span-3"/>
                     </div>
                      {/* Optional Fiber Input */}
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-fiber" className="text-right">Fiber (g)</Label>
                        <Input id="edit-fiber" name="fiber" type="number" value={tempGoals.fiber || ''} onChange={handleGoalInputChange} className="col-span-3"/>
                     </div>
                  </div>
                  <DialogFooter>
                      <Button variant="outline" onClick={() => setEditGoalsOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveGoals} disabled={isSavingGoals}>
                         {isSavingGoals && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                         Save Changes
                      </Button>
                  </DialogFooter>
              </DialogContent>
           </Dialog>

          <Button onClick={() => setAddMealOpen(true)} disabled={!userId}> {/* Disable if not logged in */}
            <Plus className="h-4 w-4 mr-2" />
            Log Meal
          </Button>
        </div>
      </div>

       {/* Active Meal Plan Indicator */}
        {activePlanDetails && view === 'daily' && (
            <Alert variant="default" className="border-primary/30 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-semibold">Active Meal Plan: {activePlanDetails.title}</AlertTitle>
                <AlertDescription>
                    Your daily goals are set based on this plan. <Link href={`/nutrition/${activePlanDetails.id}`} className="underline hover:text-primary">View Plan Details</Link> or edit goals manually to deactivate.
                </AlertDescription>
            </Alert>
        )}

      {/* Tabs */}
      <Tabs value={view} onValueChange={setView} className="space-y-4">
        {/* TabsList and Date Nav (keep as is) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="meals">Meal Plans</TabsTrigger>
          </TabsList>
          {view === "daily" && (
            <div className="flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handlePreviousDay}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleToday} disabled={isToday(selectedDate)}>Today</Button>
              <Button variant="outline" size="sm" onClick={handleNextDay}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          )}
           {view === "weekly" && (
            <div className="flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleCurrentWeek} >This Week</Button> {/* Removed disabled logic for simplicity */}
              <Button variant="outline" size="sm" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          )}
        </div>

        {/* --- Daily View --- */}
        <TabsContent value="daily" className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">{format(selectedDate, "PPPP")}</h3>
          </div>

          {/* Daily Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Calories */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Calories</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(dailyTotals.calories)} / {dailyGoals.calories}</div>
                <Progress
                  value={(() => { const v = getProgressValueForBar(dailyTotals.calories, dailyGoals.calories); console.log(`Render PBar Cal: ${v}`); return v; })()}
                  className={`h-2 mt-2 ${getProgressColor(dailyTotals.calories, dailyGoals.calories)}`}
                />
                <div className="text-xs text-muted-foreground mt-1">{getProgress(dailyTotals.calories, dailyGoals.calories)}% of goal</div>
              </CardContent>
            </Card>
            {/* Protein */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Protein</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(dailyTotals.protein)}g / {dailyGoals.protein}g</div>
                <Progress
                  value={(() => { const v = getProgressValueForBar(dailyTotals.protein, dailyGoals.protein); console.log(`Render PBar Pro: ${v}`); return v; })()}
                  className={`h-2 mt-2 ${getProgressColor(dailyTotals.protein, dailyGoals.protein)}`}
                />
                <div className="text-xs text-muted-foreground mt-1">{getProgress(dailyTotals.protein, dailyGoals.protein)}% of goal</div>
              </CardContent>
            </Card>
            {/* Carbs */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Carbs</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(dailyTotals.carbs)}g / {dailyGoals.carbs}g</div>
                <Progress
                  value={(() => { const v = getProgressValueForBar(dailyTotals.carbs, dailyGoals.carbs); console.log(`Render PBar Carb: ${v}`); return v; })()}
                  className={`h-2 mt-2 ${getProgressColor(dailyTotals.carbs, dailyGoals.carbs)}`}
                />
                <div className="text-xs text-muted-foreground mt-1">{getProgress(dailyTotals.carbs, dailyGoals.carbs)}% of goal</div>
              </CardContent>
            </Card>
            {/* Fat */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Fat</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(dailyTotals.fat)}g / {dailyGoals.fat}g</div>
                <Progress
                  value={(() => { const v = getProgressValueForBar(dailyTotals.fat, dailyGoals.fat); console.log(`Render PBar Fat: ${v}`); return v; })()}
                  className={`h-2 mt-2 ${getProgressColor(dailyTotals.fat, dailyGoals.fat)}`}
                 />
                <div className="text-xs text-muted-foreground mt-1">{getProgress(dailyTotals.fat, dailyGoals.fat)}% of goal</div>
              </CardContent>
            </Card>
          </div>

          {/* Meals List */}
          <Card>
            <CardHeader>
                <CardTitle>Meals for {format(selectedDate, "PPP")}</CardTitle>
                {/* Show loader only when fetching specifically */}
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              {/* Conditional Rendering based on loading and meals length */}
              {!loading && meals.length === 0 && (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Meals Logged Yet</h3>
                  <p className="text-muted-foreground mb-4">Use the 'Log Meal' button to add your first meal for {format(selectedDate, "PPP")}.</p>
                  <Button onClick={() => setAddMealOpen(true)} disabled={!userId}>
                    <Plus className="h-4 w-4 mr-2" /> Log Your First Meal
                  </Button>
                </div>
              )}
              {/* Only map if meals exist */}
              {meals.length > 0 && (
                  <div className="space-y-4">
                      {meals.map((meal) => {
                          // Calculate meal totals safely
                          const mealTotals = (meal.items || []).reduce(
                              (acc, item) => ({
                                  calories: acc.calories + (item.calories || 0) * (item.quantity || 1),
                                  protein: acc.protein + (item.protein || 0) * (item.quantity || 1),
                                  carbs: acc.carbs + (item.carbs || 0) * (item.quantity || 1),
                                  fat: acc.fat + (item.fat || 0) * (item.quantity || 1),
                              }), { calories: 0, protein: 0, carbs: 0, fat: 0 }
                          );

                          return (
                              <div key={meal.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/30">
                                  {/* Meal Header */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                      <div>
                                          <h3 className="font-medium">{meal.name}</h3>
                                          <p className="text-sm text-muted-foreground">{meal.time}</p>
                                      </div>
                                      <div className="text-left sm:text-right flex-shrink-0">
                                          <div className="font-semibold text-lg">{Math.round(mealTotals.calories)} cal</div>
                                          <div className="text-xs text-muted-foreground">
                                              P:{Math.round(mealTotals.protein)} C:{Math.round(mealTotals.carbs)} F:{Math.round(mealTotals.fat)}
                                          </div>
                                      </div>
                                  </div>
                                  {/* Meal Items */}
                                  {(meal.items || []).length > 0 && (
                                      <div className="space-y-1 mt-3 border-t pt-3">
                                          {meal.items.map((item, index) => (
                                              <div key={index} className="flex justify-between text-sm items-center">
                                                  <span>{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ""}</span>
                                                  <span className="text-muted-foreground">{Math.round((item.calories || 0) * item.quantity)} cal</span>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                                  {/* Delete Button */}
                                  <div className="flex justify-end mt-3">
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteMeal(meal.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2">
                                          Delete
                                      </Button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
            </CardContent>
            {/* Add Another Meal Footer (only if meals exist) */}
            {meals.length > 0 && (
                <CardFooter>
                    <Button className="w-full" onClick={() => setAddMealOpen(true)} disabled={!userId}>
                        <Plus className="h-4 w-4 mr-2" /> Add Another Meal
                    </Button>
                </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* --- Weekly View --- */}
        <TabsContent value="weekly" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Nutrition Overview</CardTitle>
                    <CardDescription>
                        Average daily intake for the week of {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart), "MMM d, yyyy")}
                    </CardDescription>
                    {weeklyLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    {/* Weekly Average Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Calculate weekly averages */}
                        {(['calories', 'protein', 'carbs', 'fat'] as const).map(nutrient => {
                            const daysWithData = Object.values(weeklyData).filter(day => day[nutrient] > 0); // Count days with actual entries
                            const daysTracked = daysWithData.length;
                            const total = daysWithData.reduce((sum, day) => sum + (day[nutrient] || 0), 0);
                            const average = daysTracked > 0 ? Math.round(total / daysTracked) : 0;
                            const goal = dailyGoals[nutrient] || 0; // Use current daily goals for comparison
                            const unit = nutrient === 'calories' ? 'kcal' : 'g';

                            return (
                                <Card key={nutrient}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium capitalize">{nutrient}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{average}{unit}</div>
                                        <Progress
                                            value={getProgressValueForBar(average, goal)}
                                            className={`h-2 mt-2 ${getProgressColor(average, goal)}`} />
                                        <div className="text-xs text-muted-foreground mt-1">Avg Daily ({daysTracked} {daysTracked === 1 ? 'day' : 'days'}) vs Goal ({goal}{unit})</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    {/* No Data Message */}
                    {Object.keys(weeklyData).length === 0 && !weeklyLoading && (
                        <div className="text-center py-8 text-muted-foreground">
                            No nutrition data recorded for this week yet. Log meals in the 'Daily View' to see weekly averages.
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>


        {/* --- Meal Plans Tab (Link) --- */}
        <TabsContent value="meals">
            <Card>
                <CardContent className="py-8 text-center">
                    <Utensils className="h-10 w-10 mx-auto text-muted-foreground mb-3"/>
                    <p className="text-muted-foreground mb-4">Browse pre-made meal plans or use the calculator.</p>
                     <Button asChild>
                        <Link href="/nutrition">Go to Meal Plans & Calculator</Link>
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* --- Dialogs --- */}
      {/* Add Meal Dialog */}
        <Dialog open={addMealOpen} onOpenChange={setAddMealOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Meal</DialogTitle>
                    <DialogDescription>Log food items for {format(selectedDate, "PPP")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Meal Type Select */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meal-name" className="text-right">Meal</Label>
                        <Select value={newMeal.name} onValueChange={(value) => setNewMeal(prev => ({ ...prev, name: value }))}>
                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select meal" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Breakfast">Breakfast</SelectItem>
                                <SelectItem value="Morning Snack">Morning Snack</SelectItem>
                                <SelectItem value="Lunch">Lunch</SelectItem>
                                <SelectItem value="Afternoon Snack">Afternoon Snack</SelectItem>
                                <SelectItem value="Dinner">Dinner</SelectItem>
                                <SelectItem value="Evening Snack">Evening Snack</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Time Input */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meal-time" className="text-right">Time</Label>
                        <Input id="meal-time" type="time" value={newMeal.time} onChange={(e) => setNewMeal(prev => ({ ...prev, time: e.target.value }))} className="col-span-3"/>
                    </div>
                    {/* Food Items Area */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Foods</Label>
                        <div className="col-span-3 space-y-2">
                            {/* List Added Foods */}
                            {newMeal.items.length > 0 ? (
                                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-2 border rounded-md p-2">
                                    {newMeal.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm p-1 hover:bg-muted/50 rounded">
                                            <div>
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-muted-foreground"> (x{item.quantity})</span>
                                                <div className="text-xs text-muted-foreground">~{Math.round(item.calories * item.quantity)} cal</div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFoodFromMeal(index)} className="h-6 w-6 text-destructive">
                                                <span className="sr-only">Remove</span> X
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-4 border rounded-md border-dashed mb-3">
                                    <Apple className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                    <p className="text-xs text-muted-foreground">No foods added yet.</p>
                                </div>
                            )}
                            {/* Add Food Button */}
                            <Button variant="outline" size="sm" className="w-full" onClick={() => { setAddMealOpen(false); setAddFoodOpen(true); }}>
                                <Plus className="h-4 w-4 mr-2" /> Add Food Item
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setAddMealOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMeal} disabled={newMeal.items.length === 0}>Save Meal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Add Food Dialog */}
        <Dialog open={addFoodOpen} onOpenChange={(isOpen) => { setAddFoodOpen(isOpen); if (!isOpen) setAddMealOpen(true); /* Reopen meal dialog */ }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Food Item to Meal</DialogTitle>
                    <DialogDescription>Search and select from the database.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Search Input */}
                    <div className="space-y-1">
                        <Label htmlFor="food-search">Search Food</Label>
                        <Input id="food-search" placeholder="E.g., Apple, Chicken..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {/* Food List */}
                    <div className="h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                        {filteredFoods.length > 0 ? (
                            filteredFoods.map((food) => (
                                <div
                                    key={food.name}
                                    className={`p-2 rounded cursor-pointer border hover:bg-muted ${selectedFood === food.name ? "bg-muted border-primary" : "border-transparent"}`}
                                    onClick={() => setSelectedFood(food.name)}
                                >
                                    <div className="font-medium text-sm">{food.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {food.calories} cal | P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center text-sm py-4">No foods found.</p>
                        )}
                    </div>
                    {/* Quantity Selector */}
                    {selectedFood && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="food-quantity" className="text-right">Quantity</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFoodQuantity(prev => Math.max(0.1, prev - 0.5))} disabled={foodQuantity <= 0.1}>-</Button> {/* Allow decimals */}
                                <Input id="food-quantity" type="number" min="0.1" step="0.1" value={foodQuantity} onChange={(e) => setFoodQuantity(Math.max(0.1, Number.parseFloat(e.target.value) || 0.1))} className="w-16 text-center h-8"/>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFoodQuantity(prev => prev + 0.5)}>+</Button>
                                <span className="text-sm text-muted-foreground">(Servings/Units)</span>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => { setAddFoodOpen(false); setAddMealOpen(true); }}>Cancel</Button>
                    <Button onClick={handleAddFoodToMeal} disabled={!selectedFood}>Add Food to Meal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}