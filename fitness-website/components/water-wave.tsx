"use client"

import { useEffect, useRef } from "react"

interface WaterWaveProps {
  percentage: number
  color?: string
  height?: number
  width?: number
  className?: string
}

export default function WaterWave({
  percentage,
  color = "#4CD964",
  height = 100,
  width = 100,
  className = "",
}: WaterWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    let offset = 0

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height)

      // Calculate wave height based on percentage
      const waveHeight = height * (1 - percentage / 100)

      // Draw the wave
      ctx.beginPath()

      // Fill with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, `${color}80`) // Semi-transparent at top
      gradient.addColorStop(1, color)
      ctx.fillStyle = gradient

      // Start at bottom left
      ctx.moveTo(0, height)

      // Draw wave
      for (let x = 0; x <= width; x += 10) {
        const y = waveHeight + Math.sin(x * 0.05 + offset) * 5
        ctx.lineTo(x, y)
      }

      // Complete the rectangle
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fill()

      // Animate the wave
      offset += 0.05
      animationRef.current = requestAnimationFrame(drawWave)
    }

    drawWave()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [percentage, color, height, width])

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
    </div>
  )
}

