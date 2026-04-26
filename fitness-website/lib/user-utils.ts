import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref as rtdbRef, set as rtdbSet } from "firebase/database";
import { db, rtdb } from "@/firebase-config";

/**
 * Ensures a user profile exists in both Firestore and Realtime Database.
 * Called after login or signup (email or Google).
 * Extracted from login/signup pages to eliminate duplication.
 */
export async function ensureUserProfile(user: User, fallbackName?: string) {
  const name =
    user.displayName || fallbackName || user.email?.split("@")[0] || "Athlete";

  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      name,
      email: user.email,
      createdAt: new Date(),
      workoutsCompleted: 0,
      caloriesBurned: 0,
      streak: 0,
      weeklyGoal: 5,
      calorieGoal: 2500,
      weightLoss: 0,
    });
  }

  await rtdbSet(rtdbRef(rtdb, `users/${user.uid}`), {
    name,
    email: user.email,
  });
}
