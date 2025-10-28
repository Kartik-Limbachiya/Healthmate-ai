"use client"

import Link from "next/link"
import { ArrowRight, Dumbbell, Utensils, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import FeaturedWorkouts from "@/components/featured-workouts"
import HeroSection from "@/components/hero-section"
import TestimonialsSection from "@/components/testimonials-section"
import AnimatedBackground from "@/components/animated-background"
import ProgressRing from "@/components/progress-ring"
import HeartbeatIcon from "@/components/heartbeat-icon"
import AnimatedStat from "@/components/animated-stat"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col relative">
      <AnimatedBackground />
      <HeroSection />

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 md:px-6 bg-gray-50 dark:bg-secondary relative overflow-hidden">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">What We Offer</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4">
            HealthMate provides everything you need to achieve your health and fitness goals in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary transition-colors transform hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 right-4 bg-primary text-white rounded-full p-1 shadow-lg">
                <ProgressRing progress={85} size={50} color="#FF9500" bgColor="#FFD9A8">
                  <span className="text-xs font-bold">85%</span>
                </ProgressRing>
              </div>
              <CardHeader>
                <Dumbbell className="h-10 w-10 mb-2 text-primary animate-bounce" style={{ animationDuration: "3s" }} />
                <CardTitle>Personalized Workouts</CardTitle>
                <CardDescription>Custom workout plans tailored to your fitness goals</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Access hundreds of workout routines designed by professional trainers. Filter by difficulty, muscle
                  group, or duration.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full group">
                  <Link href="/workouts" className="flex items-center justify-center">
                    Explore Workouts{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary transition-colors transform hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 right-4 bg-primary text-white rounded-full p-1 shadow-lg">
                <ProgressRing progress={92} size={50} color="#FF9500" bgColor="#FFD9A8">
                  <span className="text-xs font-bold">92%</span>
                </ProgressRing>
              </div>
              <CardHeader>
                <Utensils className="h-10 w-10 mb-2 text-primary animate-bounce" style={{ animationDuration: "4s" }} />
                <CardTitle>Nutrition Planning</CardTitle>
                <CardDescription>Meal plans and nutritional guidance</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Get customized meal plans based on your dietary preferences and fitness goals. Track your nutrition
                  and stay on target.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full group">
                  <Link href="/nutrition" className="flex items-center justify-center">
                    View Meal Plans{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary transition-colors transform hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 right-4 bg-primary text-white rounded-full p-1 shadow-lg">
                <ProgressRing progress={78} size={50} color="#FF9500" bgColor="#FFD9A8">
                  <span className="text-xs font-bold">78%</span>
                </ProgressRing>
              </div>
              <CardHeader>
                <User className="h-10 w-10 mb-2 text-primary animate-bounce" style={{ animationDuration: "5s" }} />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>Monitor your health journey</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Track your workouts, measurements, and achievements. Visualize your progress with detailed charts and
                  statistics.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full group">
                  <Link href="/profile" className="flex items-center justify-center">
                    View Dashboard{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Health Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-secondary/80 rounded-lg p-4 sm:p-6 shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
              <HeartbeatIcon size={32} color="#FF9500" beatsPerMinute={75} className="mb-2 sm:mb-3" />
              <AnimatedStat value={10000} suffix="+" className="text-xl sm:text-3xl font-bold" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Steps Tracked Daily</p>
            </div>

            <div className="bg-white dark:bg-secondary/80 rounded-lg p-4 sm:p-6 shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
              <div className="mb-2 sm:mb-3 text-primary text-3xl sm:text-4xl">💪</div>
              <AnimatedStat value={500} suffix="+" className="text-xl sm:text-3xl font-bold" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Workout Plans</p>
            </div>

            <div className="bg-white dark:bg-secondary/80 rounded-lg p-4 sm:p-6 shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
              <div className="mb-2 sm:mb-3 text-primary text-3xl sm:text-4xl">🥗</div>
              <AnimatedStat value={1000} suffix="+" className="text-xl sm:text-3xl font-bold" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Healthy Recipes</p>
            </div>

            <div className="bg-white dark:bg-secondary/80 rounded-lg p-4 sm:p-6 shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
              <div className="mb-2 sm:mb-3 text-primary text-3xl sm:text-4xl">🏆</div>
              <AnimatedStat value={98} suffix="%" className="text-xl sm:text-3xl font-bold" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Workouts */}
      <section className="py-12 sm:py-16 px-4 md:px-6 relative">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Featured Workouts</h2>
          <p className="text-muted-foreground mb-8 sm:mb-12 max-w-2xl text-sm sm:text-base">
            Discover our most popular workout routines designed by health experts to help you achieve your fitness
            goals.
          </p>
          <FeaturedWorkouts />
          <div className="text-center mt-6 sm:mt-8">
            <Button asChild className="group relative overflow-hidden w-full sm:w-auto">
              <Link href="/workouts" className="flex items-center justify-center">
                <span className="relative z-10">View All Workouts</span>
                <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 bg-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 md:px-6 bg-secondary text-white relative overflow-hidden">
        {/* Animated elements */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-20 overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="#FF9500"
              opacity=".25"
              className="animate-wave"
            ></path>
            <style jsx>{`
              .animate-wave {
                animation: wave 15s linear infinite;
              }
              @keyframes wave {
                0% { transform: translateX(0); }
                50% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
            `}</style>
          </svg>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <HeartbeatIcon size={40} color="#4CD964" beatsPerMinute={70} className="mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 px-4">Ready to Transform Your Health Journey?</h2>
          <p className="max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base px-4">
            Join thousands of members who have achieved their health and fitness goals with our personalized approach.
          </p>
          <Button size="lg" className="bg-accent text-secondary hover:bg-accent/90 group relative overflow-hidden w-full sm:w-auto">
            <Link href="/signup" className="flex items-center justify-center">
              <span className="relative z-10">Get Started Today</span>
              <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </Link>
          </Button>

          {/* Animated stats */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 transform hover:scale-105 transition-transform">
              <AnimatedStat value={5000} suffix="+" className="text-xl sm:text-2xl font-bold text-accent" />
              <p className="text-xs sm:text-sm mt-1">Active Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 transform hover:scale-105 transition-transform">
              <AnimatedStat value={200} suffix="+" className="text-xl sm:text-2xl font-bold text-accent" />
              <p className="text-xs sm:text-sm mt-1">Expert Trainers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 transform hover:scale-105 transition-transform">
              <AnimatedStat value={15000} suffix="+" className="text-xl sm:text-2xl font-bold text-accent" />
              <p className="text-xs sm:text-sm mt-1">Workouts Completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 transform hover:scale-105 transition-transform">
              <AnimatedStat value={95} suffix="%" className="text-xl sm:text-2xl font-bold text-accent" />
              <p className="text-xs sm:text-sm mt-1">Success Rate</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

