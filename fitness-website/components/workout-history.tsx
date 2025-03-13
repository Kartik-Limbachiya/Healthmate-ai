"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock workout history data
const workoutHistory = [
  {
    id: 1,
    date: "2023-05-15",
    name: "Upper Body Strength",
    duration: 45,
    calories: 320,
    type: "Strength",
    completed: true,
  },
  {
    id: 2,
    date: "2023-05-14",
    name: "HIIT Cardio",
    duration: 30,
    calories: 280,
    type: "Cardio",
    completed: true,
  },
  {
    id: 3,
    date: "2023-05-12",
    name: "Yoga Flow",
    duration: 40,
    calories: 180,
    type: "Flexibility",
    completed: true,
  },
  {
    id: 4,
    date: "2023-05-10",
    name: "Lower Body Focus",
    duration: 50,
    calories: 350,
    type: "Strength",
    completed: true,
  },
  {
    id: 5,
    date: "2023-05-08",
    name: "Core Strength",
    duration: 25,
    calories: 220,
    type: "Strength",
    completed: true,
  },
  {
    id: 6,
    date: "2023-05-07",
    name: "Endurance Run",
    duration: 60,
    calories: 450,
    type: "Cardio",
    completed: true,
  },
  {
    id: 7,
    date: "2023-05-05",
    name: "Full Body HIIT",
    duration: 35,
    calories: 310,
    type: "HIIT",
    completed: true,
  },
]

export default function WorkoutHistory() {
  const [view, setView] = useState("list")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Workout History</h2>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search workouts..." className="pl-8 w-full" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workouts</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Workouts</CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutHistory.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{workout.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString()} • {workout.duration} min • {workout.calories}{" "}
                          calories
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{workout.type}</span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Calendar</CardTitle>
              <CardDescription>View your workout schedule and history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 border rounded-md">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                <p className="text-muted-foreground mb-4">
                  A calendar view would be implemented here showing workout days and types
                </p>
                <Button>View Full Calendar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18.5 hrs</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8,640</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workout Distribution</CardTitle>
              <CardDescription>Breakdown by workout type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12 border rounded-md">
                <h3 className="text-lg font-medium mb-2">Workout Stats Chart</h3>
                <p className="text-muted-foreground mb-4">
                  A chart would be implemented here showing workout distribution by type
                </p>
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="h-24 bg-primary/80 rounded-md mb-2"></div>
                    <div className="text-sm">Strength</div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 bg-primary/60 rounded-md mb-2"></div>
                    <div className="text-sm">Cardio</div>
                  </div>
                  <div className="text-center">
                    <div className="h-12 bg-primary/40 rounded-md mb-2"></div>
                    <div className="text-sm">HIIT</div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 bg-primary/20 rounded-md mb-2"></div>
                    <div className="text-sm">Flexibility</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

