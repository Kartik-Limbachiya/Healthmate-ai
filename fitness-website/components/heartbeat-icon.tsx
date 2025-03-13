"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"

interface HeartbeatIconProps {
  className?: string
  size?: number
  color?: string
  beatsPerMinute?: number
}

export default function HeartbeatIcon({
  className = "",
  size = 24,
  color = "currentColor",
  beatsPerMinute = 70,
}: HeartbeatIconProps) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    // Calculate beat interval in ms from beats per minute
    const beatInterval = 60000 / beatsPerMinute

    const interval = setInterval(() => {
      // Pulse animation
      setScale(1.2)
      setTimeout(() => setScale(1), 150)
    }, beatInterval)

    return () => clearInterval(interval)
  }, [beatsPerMinute])

  return (
    <div
      className={`inline-flex transition-transform duration-150 ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <Heart size={size} color={color} fill={color} />
    </div>
  )
}

