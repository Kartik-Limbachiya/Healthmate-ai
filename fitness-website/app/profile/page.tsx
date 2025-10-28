"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileDashboard from "@/components/profile-dashboard";
import WorkoutHistory from "@/components/workout-history";
import NutritionTracking from "@/components/nutrition-tracking";
import ProfileSettings from "@/components/profile-settings";

// Import Firebase services from firebase-config.js
import { auth, db } from "@/firebase-config";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // Fallback to auth displayName if no Firestore document exists
          setUserData({ name: currentUser.displayName });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-4 text-center">Loading your profile...</div>;
  }

  return (
    <main className="container mx-auto py-6 sm:py-8 px-4 md:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">My Profile</h1>
      <Tabs defaultValue="dashboard" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="workouts" className="text-xs sm:text-sm">Workouts</TabsTrigger>
          <TabsTrigger value="nutrition" className="text-xs sm:text-sm">Nutrition</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <ProfileDashboard userData={userData} />
        </TabsContent>
        <TabsContent value="workouts">
          <WorkoutHistory />
        </TabsContent>
        <TabsContent value="nutrition">
          <NutritionTracking />
        </TabsContent>
        <TabsContent value="settings">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </main>
  );
}
