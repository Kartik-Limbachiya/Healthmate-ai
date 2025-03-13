import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileDashboard from "@/components/profile-dashboard"
import WorkoutHistory from "@/components/workout-history"
import NutritionTracking from "@/components/nutrition-tracking"
import ProfileSettings from "@/components/profile-settings"

export default function ProfilePage() {
  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="dashboard" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProfileDashboard />
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
  )
}

