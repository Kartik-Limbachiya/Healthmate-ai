import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WorkoutsList from "@/components/workouts-list"

export default function WorkoutsPage() {
  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Workouts Library</h1>
          <p className="text-muted-foreground">Find the perfect workout for your fitness goals</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
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

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-5 md:w-auto w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
          <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
          <TabsTrigger value="hiit">HIIT</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Difficulty Level</CardTitle>
                <CardDescription>Filter workouts by difficulty</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  Beginner
                </Button>
                <Button variant="outline" size="sm">
                  Intermediate
                </Button>
                <Button variant="outline" size="sm">
                  Advanced
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Duration</CardTitle>
                <CardDescription>Filter by workout length</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  &lt; 15 min
                </Button>
                <Button variant="outline" size="sm">
                  15-30 min
                </Button>
                <Button variant="outline" size="sm">
                  30+ min
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Equipment</CardTitle>
                <CardDescription>Filter by available equipment</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  No Equipment
                </Button>
                <Button variant="outline" size="sm">
                  Minimal
                </Button>
                <Button variant="outline" size="sm">
                  Full Gym
                </Button>
              </CardContent>
            </Card>
          </div>

          <WorkoutsList />
        </TabsContent>
        <TabsContent value="strength">
          <WorkoutsList category="strength" />
        </TabsContent>
        <TabsContent value="cardio">
          <WorkoutsList category="cardio" />
        </TabsContent>
        <TabsContent value="flexibility">
          <WorkoutsList category="flexibility" />
        </TabsContent>
        <TabsContent value="hiit">
          <WorkoutsList category="hiit" />
        </TabsContent>
      </Tabs>
    </main>
  )
}

