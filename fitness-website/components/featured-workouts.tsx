//components\featured-workouts.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, Flame, BarChart } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for featured workouts
const featuredWorkouts = [
  {
    id: 1,
    title: "Full Body HIIT",
    category: "Cardio",
    difficulty: "Intermediate",
    duration: "30 min",
    calories: "350",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    title: "Core Strength Builder",
    category: "Strength",
    difficulty: "Beginner",
    duration: "25 min",
    calories: "220",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    title: "Upper Body Power",
    category: "Strength",
    difficulty: "Advanced",
    duration: "45 min",
    calories: "400",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    title: "Yoga Flow",
    category: "Flexibility",
    difficulty: "All Levels",
    duration: "40 min",
    calories: "180",
    image: "/placeholder.svg?height=400&width=600",
  },
]

export default function FeaturedWorkouts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredWorkouts.map((workout, index) => (
        <Link href={`/workouts/${workout.id}`} key={workout.id} className="group">
          <Card
            className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={workout.image || "/placeholder.svg"}
                alt={workout.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute top-3 right-3 bg-primary">{workout.category}</Badge>

              {/* Animated overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  Tap to view workout details
                </p>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{workout.title}</CardTitle>
              <Badge variant="outline" className="bg-secondary/5">
                {workout.difficulty}
              </Badge>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-primary" />
                  {workout.duration}
                </div>
                <div className="flex items-center">
                  <Flame className="mr-1 h-4 w-4 text-primary" />
                  {workout.calories} cal
                </div>
                <div className="flex items-center">
                  <BarChart className="mr-1 h-4 w-4 text-primary" />
                  {workout.difficulty}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <span className="text-sm text-primary font-medium group-hover:underline flex items-center">
                View Workout
                <svg
                  className="ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

