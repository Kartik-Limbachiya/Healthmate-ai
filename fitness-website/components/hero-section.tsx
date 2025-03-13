"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import HeartbeatIcon from "@/components/heartbeat-icon"
import AnimatedStat from "@/components/animated-stat"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-secondary to-secondary/90 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-40 right-20 w-32 h-32 bg-accent/10 rounded-full animate-pulse"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-16 h-16 bg-destructive/10 rounded-full animate-pulse"
          style={{ animationDuration: "5s" }}
        ></div>
      </div>

      <div className="absolute inset-0 overflow-hidden opacity-20">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Health background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div
              className="inline-flex items-center bg-primary text-white px-4 py-1 rounded-full text-sm font-medium mb-6 animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <HeartbeatIcon className="mr-2" size={16} color="white" beatsPerMinute={80} />
              Your all-in-one health partner
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative">
              <span className="relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-primary after:transform after:scale-x-0 after:animate-expand">
                Achieve
              </span>{" "}
              Your Health Goals With Expert Guidance
            </h1>

            <p className="text-lg md:text-xl mb-8 max-w-lg text-gray-300">
              Personalized workout plans, nutrition advice, and progress tracking all in one place. Start your health
              journey today.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center transform transition-transform hover:scale-105">
                <AnimatedStat value={1000} suffix="+" className="text-2xl font-bold text-primary" />
                <p className="text-xs mt-1">Active Users</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center transform transition-transform hover:scale-105">
                <AnimatedStat value={87} suffix="%" className="text-2xl font-bold text-primary" />
                <p className="text-xs mt-1">Success Rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center transform transition-transform hover:scale-105">
                <AnimatedStat value={30} prefix="~" suffix=" Days" className="text-2xl font-bold text-primary" />
                <p className="text-xs mt-1">See Results</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white group relative overflow-hidden"
                asChild
              >
                <Link href="/signup">
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 group" asChild>
                <Link href="/workouts" className="flex items-center">
                  Explore Workouts
                  <svg
                    className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-lg overflow-hidden shadow-2xl transform transition-all hover:scale-105 duration-700">
              <div className="absolute inset-0 bg-primary/20 z-10 rounded-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-32 h-32 bg-accent rounded-full opacity-70 animate-pulse"></div>
              <div
                className="absolute -top-2 -left-2 w-24 h-24 bg-primary rounded-full opacity-70 animate-pulse"
                style={{ animationDuration: "4s" }}
              ></div>
              <Image src="/placeholder.svg?height=800&width=600" alt="Health trainer" fill className="object-cover" />

              {/* Animated stats overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 z-20 transform transition-transform hover:scale-105">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-300">Daily Progress</p>
                    <div className="flex items-center">
                      <HeartbeatIcon className="mr-2" color="#FF9500" />
                      <span className="text-primary font-bold">Excellent</span>
                    </div>
                  </div>
                  <div className="h-10 w-10">
                    <WaterWaveAnimation percentage={75} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Small water wave animation component for the hero
function WaterWaveAnimation({ percentage }: { percentage: number }) {
  return (
    <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-primary">
      <div
        className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-1000 ease-out"
        style={{
          height: `${percentage}%`,
          animation: "wave 2s infinite ease-in-out",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-white/30 transform -skew-x-45"></div>
      </div>
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}

