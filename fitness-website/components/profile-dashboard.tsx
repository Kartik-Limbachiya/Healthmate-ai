import type React from "react"
import { Activity, Calendar, TrendingUp, Award, Clock, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ProfileDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle>Welcome back, Alex!</CardTitle>
            <CardDescription>Here's your health summary for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">4 of 5</div>
                <div className="text-sm text-muted-foreground">Weekly workouts completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">80%</div>
                <div className="text-sm text-muted-foreground">Nutrition goal progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2.5 kg</div>
                <div className="text-sm text-muted-foreground">Weight loss this month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <div className="text-xs text-muted-foreground">+8% from last week</div>
            <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "65%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">186</div>
            <div className="text-xs text-muted-foreground">+12% from last week</div>
            <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
          <CardDescription>Your progress towards this week's targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  <span>Complete 5 workouts</span>
                </div>
                <span className="text-sm font-medium">4/5</span>
              </div>
              <Progress value={80} className="bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  <span>Burn 2,500 calories</span>
                </div>
                <span className="text-sm font-medium">1,248/2,500</span>
              </div>
              <Progress value={50} className="bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span>Log meals for 7 days</span>
                </div>
                <span className="text-sm font-medium">5/7</span>
              </div>
              <Progress value={71} className="bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  <span>Reach protein target daily</span>
                </div>
                <span className="text-sm font-medium">4/7</span>
              </div>
              <Progress value={57} className="bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest workouts and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Upper Body Strength</div>
                  <div className="text-sm text-muted-foreground">Completed workout • 45 min • 320 calories</div>
                </div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">HIIT Cardio</div>
                  <div className="text-sm text-muted-foreground">Completed workout • 30 min • 280 calories</div>
                </div>
                <div className="text-sm text-muted-foreground">Yesterday</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">New Achievement</div>
                  <div className="text-sm text-muted-foreground">Completed 10 workouts this month</div>
                </div>
                <div className="text-sm text-muted-foreground">2 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Your scheduled workouts and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Lower Body Focus</div>
                  <div className="text-sm text-muted-foreground">Scheduled workout • 40 min</div>
                </div>
                <div className="text-sm text-muted-foreground">Tomorrow, 6:00 AM</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Weekly Progress Check</div>
                  <div className="text-sm text-muted-foreground">Weight and measurements update</div>
                </div>
                <div className="text-sm text-muted-foreground">Sunday, 9:00 AM</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Nutrition Plan Update</div>
                  <div className="text-sm text-muted-foreground">Review and adjust your meal plan</div>
                </div>
                <div className="text-sm text-muted-foreground">Monday, 12:00 PM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper component for the dashboard
function Dumbbell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 5v14" />
      <path d="M18 5v14" />
      <path d="M9 5h6" />
      <path d="M9 19h6" />
      <path d="M3 7h3" />
      <path d="M3 17h3" />
      <path d="M18 7h3" />
      <path d="M18 17h3" />
    </svg>
  )
}

