//components\profile-dashboard.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Activity,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Flame,
  Dumbbell,
  Medal,
  Star,
  Trophy,
  ShieldCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart as ReBarChart,
  Bar,
} from "recharts"
import { format } from "date-fns"
import { auth, db, rtdb } from "@/firebase-config"
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore"
import { ref, onValue } from "firebase/database"

interface WorkoutEntry {
  id: string
  type: string
  totalReps: number
  correctReps: number
  incorrectReps: number
  calories: number
  date: Date
}

interface BadgeInfo {
  title: string
  description: string
  color: string
  icon: JSX.Element
}

export default function ProfileDashboard() {
  const [userData, setUserData] = useState<any>({
    displayName: "",
    workoutsCompleted: 0,
    caloriesBurned: 0,
    streak: 0,
    weeklyGoal: 5,
    calorieGoal: 2500,
    weightLoss: 0,
  })

  const [workoutStats, setWorkoutStats] = useState<any>({
    correctPostures: 0,
    incorrectPostures: 0,
    totalSessions: 0,
    lastWorkout: null,
    totalCaloriesBurned: 0,
  })

  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutEntry[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [typeDistribution, setTypeDistribution] = useState<any[]>([])
  const [badges, setBadges] = useState<BadgeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      router.push("/login")
      return
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          setUserData({
            displayName: user.displayName || userDoc.data()?.name || "Athlete",
            ...userDoc.data(),
          })
        } else {
          const newUserData = {
            displayName: user.displayName || "Athlete",
            email: user.email,
            workoutsCompleted: 0,
            caloriesBurned: 0,
            streak: 0,
            weeklyGoal: 5,
            calorieGoal: 2500,
            weightLoss: 0,
            createdAt: new Date(),
          }
          await setDoc(userDocRef, newUserData)
          setUserData(newUserData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    const fetchWorkouts = async () => {
      try {
        const workoutsRef = collection(db, "workouts")
        const q = query(
          workoutsRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(30)
        )
        const snapshot = await getDocs(q)
        const workouts: WorkoutEntry[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          const ts = data.date
          const workoutDate = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : new Date()
          workouts.push({
            id: docSnap.id,
            type: data.type || "General",
            totalReps: data.totalReps || 0,
            correctReps: data.correctReps || 0,
            incorrectReps: data.incorrectReps || 0,
            calories: data.calories || 0,
            date: workoutDate,
          })
        })
        setRecentWorkouts(workouts)
      } catch (error) {
        console.error("Error loading workouts:", error)
      }
    }

    const statsRef = ref(rtdb, `workoutStats/${user.uid}`)
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setWorkoutStats(data)
      }
      setLoading(false)
    })

    fetchUserData()
    fetchWorkouts()

    return () => {
      unsubscribe()
    }
  }, [router])

  useEffect(() => {
    const totalPostures = workoutStats.correctPostures + workoutStats.incorrectPostures

    const typeMap = new Map<string, number>()
    recentWorkouts.forEach((workout) => {
      const key = workout.type || "General"
      typeMap.set(key, (typeMap.get(key) || 0) + workout.totalReps)
    })

    const typeData = Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    const dayMap = new Map<string, { date: Date; sessions: number; calories: number; correct: number }>()
    recentWorkouts.forEach((workout) => {
      const key = format(workout.date, "yyyy-MM-dd")
      const existing = dayMap.get(key) || {
        date: workout.date,
        sessions: 0,
        calories: 0,
        correct: 0,
      }
      existing.sessions += 1
      existing.calories += workout.calories || 0
      existing.correct += workout.correctReps || 0
      dayMap.set(key, existing)
    })

    const trend = Array.from(dayMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-10)
      .map((entry) => ({
        date: format(entry.date, "MMM d"),
        sessions: entry.sessions,
        calories: entry.calories,
        correct: entry.correct,
      }))

    const badgesEarned: BadgeInfo[] = []
    const successRate = totalPostures ? workoutStats.correctPostures / totalPostures : 0
    const totalReps = recentWorkouts.reduce((sum, w) => sum + w.totalReps, 0)

    if (workoutStats.totalSessions >= 10) {
      badgesEarned.push({
        title: "Consistency Champ",
        description: "10+ tracked sessions. Momentum unlocked!",
        color: "bg-amber-100 text-amber-800",
        icon: <Medal className="h-5 w-5" />,
      })
    }

    if (successRate >= 0.8 && totalPostures >= 50) {
      badgesEarned.push({
        title: "Form Master",
        description: "80%+ correct posture across sessions.",
        color: "bg-emerald-100 text-emerald-800",
        icon: <ShieldCheck className="h-5 w-5" />,
      })
    }

    if (workoutStats.totalCaloriesBurned >= 1500 || userData.caloriesBurned >= 1500) {
      badgesEarned.push({
        title: "Calorie Crusher",
        description: "Burned over 1,500 calories with AI sessions.",
        color: "bg-rose-100 text-rose-800",
        icon: <Flame className="h-5 w-5" />,
      })
    }

    if (totalReps >= 200) {
      badgesEarned.push({
        title: "Volume Hero",
        description: "Logged 200+ quality reps. Keep pushing!",
        color: "bg-blue-100 text-blue-800",
        icon: <Dumbbell className="h-5 w-5" />,
      })
    }

    if (!badgesEarned.length) {
      badgesEarned.push({
        title: "Getting Started",
        description: "Kick things off with your first AI-powered session.",
        color: "bg-slate-200 text-slate-800",
        icon: <Star className="h-5 w-5" />,
      })
    }

    setTrendData(trend)
    setTypeDistribution(typeData)
    setBadges(badgesEarned)
  }, [workoutStats, recentWorkouts, userData.caloriesBurned])

  const postureData = useMemo(() => {
    const correct = workoutStats.correctPostures || 0
    const incorrect = workoutStats.incorrectPostures || 0
    const fallback = correct === 0 && incorrect === 0
    return fallback
      ? [
          { name: "Correct", value: 1 },
          { name: "Incorrect", value: 0 },
        ]
      : [
          { name: "Correct", value: correct },
          { name: "Incorrect", value: incorrect },
        ]
  }, [workoutStats.correctPostures, workoutStats.incorrectPostures])

  const postureConfig = {
    Correct: { label: "Correct", color: "hsl(142, 76%, 36%)" },
    Incorrect: { label: "Incorrect", color: "hsl(0, 84%, 60%)" },
  }

  const trendConfig = {
    sessions: { label: "Sessions", color: "hsl(213, 94%, 57%)" },
    calories: { label: "Calories", color: "hsl(25, 95%, 53%)" },
    correct: { label: "Correct Reps", color: "hsl(142, 76%, 36%)" },
  }

  const typeConfig = {
    volume: { label: "Total Reps", color: "hsl(268, 83%, 60%)" },
  }

  const postureTotal = workoutStats.correctPostures + workoutStats.incorrectPostures
  const postureRate = postureTotal
    ? Math.round((workoutStats.correctPostures / postureTotal) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 border-2 border-primary/20">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">
              Welcome back, {userData.displayName || "Athlete"}!
            </CardTitle>
            <CardDescription className="text-sm">
              Personalized snapshot of your training week
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold">
                  {userData.workoutsCompleted} / {userData.weeklyGoal || 1}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Workouts completed this week
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">{userData.streak} days</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Current streak</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">
                  {userData.weightLoss > 0 ? `${userData.weightLoss} kg` : "Stay consistent"}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Weight change this month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{userData.caloriesBurned}</div>
            <div className="text-xs text-muted-foreground">This week</div>
            <div className="mt-3 sm:mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{
                  width: `${Math.min(
                    ((userData.caloriesBurned || 0) / (userData.calorieGoal || 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Posture Quality</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {postureTotal ? `${postureRate}%` : "Start tracking"}
            </div>
            <div className="text-xs text-muted-foreground">Correct posture rate</div>
            <div className="mt-3 sm:mt-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${postureTotal ? postureRate : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Posture Breakdown</CardTitle>
            <CardDescription>Correct vs incorrect posture counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={postureConfig} className="mx-auto h-64">
              <RePieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={postureData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={postureTotal ? 4 : 0}
                >
                  {postureData.map((item) => (
                    <Cell key={item.name} fill={`var(--color-${item.name})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </RePieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Sessions, calories, and correct reps (last 10 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length ? (
              <ChartContainer config={trendConfig} className="h-72">
                <ReLineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={12} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="sessions" stroke="var(--color-sessions)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="calories" stroke="var(--color-calories)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="correct" stroke="var(--color-correct)" strokeWidth={2} dot={false} />
                </ReLineChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-16">
                Complete a session to unlock trend insights.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Workout Volume by Type</CardTitle>
            <CardDescription>Total reps logged per training focus</CardDescription>
          </CardHeader>
          <CardContent>
            {typeDistribution.length ? (
              <ChartContainer config={typeConfig} className="h-72">
                <ReBarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-volume)" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-16">
                Log sessions to see your focus areas.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Badges & Milestones</CardTitle>
            <CardDescription>Show off your HealthMate achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${badge.color}`}
                >
                  <div className="mt-0.5">{badge.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{badge.title}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
          <CardDescription>Track how you’re progressing this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  <span>Complete {userData.weeklyGoal} workouts</span>
                </div>
                <span className="text-sm font-medium">
                  {userData.workoutsCompleted}/{userData.weeklyGoal}
                </span>
              </div>
              <Progress value={Math.min((userData.workoutsCompleted / (userData.weeklyGoal || 1)) * 100, 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  <span>Burn {userData.calorieGoal} calories</span>
                </div>
                <span className="text-sm font-medium">
                  {userData.caloriesBurned}/{userData.calorieGoal}
                </span>
              </div>
              <Progress value={Math.min((userData.caloriesBurned / (userData.calorieGoal || 1)) * 100, 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  <span>Maintain correct posture</span>
                </div>
                <span className="text-sm font-medium">
                  {postureTotal ? `${workoutStats.correctPostures}/${postureTotal}` : "No data"}
                </span>
              </div>
              <Progress value={postureTotal ? postureRate : 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-sm">Your latest AI-assisted sessions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {recentWorkouts.length ? (
              <div className="space-y-4">
                {recentWorkouts.slice(0, 3).map((workout) => (
                  <div key={workout.id} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{workout.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(workout.date, "PPpp")} • {workout.totalReps} reps • {workout.calories} cal
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">No workout sessions recorded yet</div>
                <Button onClick={() => router.push("/workouts")}>Start Your First Workout</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recommendations</CardTitle>
            <CardDescription className="text-sm">Tailored suggestions to keep you improving</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-4">
              {workoutStats.totalSessions > 0 ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Workout Focus</div>
                      <div className="text-sm text-muted-foreground">
                        {workoutStats.correctPostures > workoutStats.incorrectPostures
                          ? "Great form! Increase intensity or add new exercises."
                          : "Focus on controlled reps and slower tempo for better form."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Progress Check</div>
                      <div className="text-sm text-muted-foreground">
                        {userData.streak >= 3
                          ? "Momentum looks great—schedule your next workout within 24 hours."
                          : "Aim for two sessions this week to kickstart a streak."}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Get Started</div>
                    <div className="text-sm text-muted-foreground">
                      Complete your first workout to receive personalized recommendations.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Weekly Report</div>
                  <div className="text-sm text-muted-foreground">
                    Your detailed weekly progress report arrives every Sunday.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

