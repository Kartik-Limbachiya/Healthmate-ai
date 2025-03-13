"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  className?: string
  children?: React.ReactNode
  animate?: boolean
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = "#FF9500",
  bgColor = "#E0E0E0",
  className = "",
  children,
  animate = true,
}: ProgressRingProps) {
  const [currentProgress, setCurrentProgress] = useState(0)
  const requestRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (currentProgress / 100) * circumference

  useEffect(() => {
    if (!animate) {
      setCurrentProgress(progress)
      return
    }

    startTimeRef.current = undefined

    const animateProgress = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const duration = 1500 // Animation duration in ms

      // Calculate progress with easing
      const animProgress = Math.min(elapsed / duration, 1)
      const easedProgress = animProgress === 1 ? 1 : 1 - Math.pow(2, -10 * animProgress)

      setCurrentProgress(easedProgress * progress)

      if (animProgress < 1) {
        requestRef.current = requestAnimationFrame(animateProgress)
      }
    }

    requestRef.current = requestAnimationFrame(animateProgress)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [progress, animate])

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

