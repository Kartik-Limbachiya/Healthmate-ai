import Link from "next/link"
import Image from "next/image"
import { Clock, Flame, BarChart, Bookmark } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data for workouts
const allWorkouts = [
  {
    id: 1,
    title: "Full Body HIIT",
    category: "hiit",
    difficulty: "Intermediate",
    duration: "30 min",
    calories: "350",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    title: "Core Strength Builder",
    category: "strength",
    difficulty: "Beginner",
    duration: "25 min",
    calories: "220",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    title: "Upper Body Power",
    category: "strength",
    difficulty: "Advanced",
    duration: "45 min",
    calories: "400",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    title: "Yoga Flow",
    category: "flexibility",
    difficulty: "All Levels",
    duration: "40 min",
    calories: "180",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 5,
    title: "Cardio Blast",
    category: "cardio",
    difficulty: "Intermediate",
    duration: "20 min",
    calories: "280",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 6,
    title: "Lower Body Focus",
    category: "strength",
    difficulty: "Intermediate",
    duration: "35 min",
    calories: "320",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 7,
    title: "HIIT Tabata",
    category: "hiit",
    difficulty: "Advanced",
    duration: "25 min",
    calories: "380",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 8,
    title: "Pilates Core",
    category: "flexibility",
    difficulty: "Beginner",
    duration: "30 min",
    calories: "200",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 9,
    title: "Endurance Run",
    category: "cardio",
    difficulty: "Advanced",
    duration: "50 min",
    calories: "500",
    image: "/placeholder.svg?height=400&width=600",
  },
]

interface WorkoutsListProps {
  category?: string
}

export default function WorkoutsList({ category }: WorkoutsListProps) {
  // Filter workouts by category if provided
  const workouts = category ? allWorkouts.filter((workout) => workout.category === category) : allWorkouts

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <Card key={workout.id} className="overflow-hidden h-full">
            <div className="relative h-48 w-full overflow-hidden group">
              <Image
                src={workout.image || "/placeholder.svg"}
                alt={workout.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className="bg-primary">{workout.category}</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 bg-background/80 hover:bg-background/90"
              >
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Save workout</span>
              </Button>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                <Link href={`/workouts/${workout.id}`} className="hover:underline">
                  {workout.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {workout.duration}
                </div>
                <div className="flex items-center">
                  <Flame className="mr-1 h-4 w-4" />
                  {workout.calories} cal
                </div>
                <div className="flex items-center">
                  <BarChart className="mr-1 h-4 w-4" />
                  {workout.difficulty}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workouts/${workout.id}`}>View Details</Link>
              </Button>
              <Button size="sm">Start Workout</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

