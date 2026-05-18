"use client"

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "left" | "right" | "scale"
  style?: CSSProperties
}

export function Reveal({ children, className, delay = 0, direction = "up", style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay)
          obs.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  const baseClass =
    direction === "left"  ? "reveal-left"  :
    direction === "right" ? "reveal-right" :
    direction === "scale" ? "reveal-scale" :
    "reveal"

  return (
    <div ref={ref} className={cn(baseClass, "stagger", className)} style={{ "--delay": `${delay}ms`, ...style } as CSSProperties}>
      {children}
    </div>
  )
}
