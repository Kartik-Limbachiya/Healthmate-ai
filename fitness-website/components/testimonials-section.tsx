"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { useRef, useEffect } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import HeartbeatIcon from "@/components/heartbeat-icon"

// Mock data for testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Lost 30 lbs in 6 months",
    content:
      "HealthMate completely transformed my approach to fitness. The personalized workout plans and nutrition advice helped me achieve results I never thought possible.",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkONqfW76UJ-rYw8J2tx1Dm78Ivhpq68NvBw&s",
    rating: 5,
  },
  {
    id: 2,
    name: "Jessica Williams",
    role: "Marathon Runner",
    content:
      "As someone who's been running for years, I was surprised by how much the targeted strength workouts improved my performance. My marathon time improved by 15 minutes!",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJtGeHXUQ6PAfC55UF_-pYC8aCvzd6knG6ug&s",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Busy Professional",
    content:
      "The quick workout options and meal planning features fit perfectly into my busy schedule. I no longer have to choose between my career and staying fit.",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQToaRakUTpQNWbzuNMSft6UNbVW_VaX35LbQ&s",
    rating: 4,
  },
  {
    id: 4,
    name: "Lucy Martinez",
    role: "Fitness Enthusiast",
    content:
      "The variety of workouts keeps me motivated every day. I've built muscle, improved my endurance, and feel better than ever. This platform is a game-changer!",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqGbKzZ8X9SU5EYTjDxPBg5IUotTOf3GxoNg&s",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-testimonial")
          }
        })
      },
      { threshold: 0.1 },
    )

    const testimonialCards = document.querySelectorAll(".testimonial-card")
    testimonialCards.forEach((card) => {
      observer.observe(card)
    })

    return () => {
      testimonialCards.forEach((card) => {
        observer.unobserve(card)
      })
    }
  }, [])

  return (
    <section className="py-12 sm:py-16 px-4 md:px-6 bg-gray-50 dark:bg-secondary/50 relative overflow-hidden">
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
      </div>

      <div className="container mx-auto relative z-10" ref={containerRef}>
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          <HeartbeatIcon size={20} color="#FF9500" className="mr-2 sm:mr-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-center">What Our Members Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="testimonial-card border-none shadow-md hover:shadow-lg transition-shadow opacity-0"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardHeader className="pb-2 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{testimonial.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < testimonial.rating ? "text-primary fill-primary" : "text-gray-300"
                      } ${i < testimonial.rating ? "animate-star-pulse" : ""}`}
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-primary text-3xl sm:text-4xl opacity-20">"</div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 relative z-10">{testimonial.content}</p>
                  <div className="absolute -bottom-4 -right-2 text-primary text-3xl sm:text-4xl opacity-20">"</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .animate-testimonial {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        .animate-star-pulse {
          animation: star-pulse 1s ease-in-out;
        }
      `}</style>
    </section>
  )
}