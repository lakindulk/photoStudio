"use client"

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay)
          obs.disconnect()
        }
      },
      // positive bottom margin pre-fires elements before they reach the viewport
      { threshold: 0.01, rootMargin: "0px 0px 120px 0px" }
    )
    obs.observe(el)

    // safety net: ensure all content is visible after 1.5 s regardless
    const fallback = setTimeout(() => el.classList.add("visible"), Math.max(delay, 1500))

    return () => {
      obs.disconnect()
      clearTimeout(fallback)
    }
  }, [delay])

  const baseClass =
    direction === "left"  ? "reveal-left"  :
    direction === "right" ? "reveal-right" :
    direction === "scale" ? "reveal-scale" :
    "reveal"

  return (
    // skip animation class on SSR so content is visible in the initial HTML
    <div
      ref={ref}
      className={cn(ready ? baseClass : "", "stagger", className)}
      style={{ "--delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </div>
  )
}
