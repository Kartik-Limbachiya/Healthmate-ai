"use client";

// We need to import the toast to show feedback to the user
import { toast } from "sonner"; // Using sonner as it's in your components/ui
import { auth, db } from "@/firebase-config"; // Make sure this path is correct
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { getMealPlanById } from "./meal-plan-data"; // Import our centralized data

/**
 * Sets a meal plan as the user's active plan and updates their
 * daily nutrition goals in Firestore to match the plan.
 * This is an "action" that can be called from any client component.
 *
 * @param planId The ID of the meal plan to set as active.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const setActiveMealPlan = async (planId: string) => {
  const user = auth.currentUser;
  if (!user) {
    toast.error("You must be logged in to use a plan.");
    return { success: false, message: "You must be logged in to use a plan." };
  }

  // 1. Get the plan details from our centralized data
  const plan = getMealPlanById(planId);
  if (!plan) {
    toast.error("Meal plan not found.");
    return { success: false, message: "Meal plan not found." };
  }

  // 2. Define the new nutrition goals based on the plan
  const newNutritionGoals = {
    calories: plan.calories,
    protein: plan.protein,
    carbs: plan.carbs,
    fat: plan.fat,
    fiber: plan.fiber,
  };

  // 3. Show a loading toast
  const toastId = toast.loading("Updating your nutrition goals...");

  try {
    // 4. Get a reference to the user's document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // 5. Update the document
    // We use setDoc with merge: true to be safe.
    // This will create the doc if it doesn't exist, or update it if it does.
    await setDoc(userDocRef, {
      activeMealPlanId: plan.id,      // Set the active plan ID
      nutritionGoals: newNutritionGoals // Overwrite daily goals with the plan's goals
    }, { merge: true }); // merge: true prevents overwriting other user data

    // 6. Show a success toast
    toast.success(`${plan.title} is now your active plan!`, {
      id: toastId,
    });
    
    console.log(`User ${user.uid} active plan set to ${plan.id}`);
    return { success: true, message: `${plan.title} is now your active plan!` };

  } catch (error) {
    console.error("Error setting active meal plan:", error);
    
    // 7. Show an error toast
    toast.error("Failed to set active plan. Please try again.", {
      id: toastId,
    });
    return { success: false, message: "Failed to set active plan. Please try again." };
  }
};