"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video } from "lucide-react"
import type { PortfolioItem } from "@/types"

interface PortfolioType3Props {
  items: PortfolioItem[]
  title?: string
}

export function PortfolioType3({ items, title = "Portfolio" }: PortfolioType3Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filter, setFilter] = useState<"all" | "image" | "video">("all")
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true
    return item.type === filter
  })

  const images = items.filter((item) => item.type === "image")
  const videos = items.filter((item) => item.type === "video")

  const currentItem = filteredItems[currentIndex]

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || filteredItems.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, filteredItems.length])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length)
    setIsAutoPlaying(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No portfolio items yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All ({items.length})
          </Badge>
          {images.length > 0 && (
            <Badge
              variant={filter === "image" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("image")}
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Images ({images.length})
            </Badge>
          )}
          {videos.length > 0 && (
            <Badge
              variant={filter === "video" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("video")}
            >
              <Video className="w-3 h-3 mr-1" />
              Videos ({videos.length})
            </Badge>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden">
        {/* Main Slide */}
        <div className="relative aspect-video bg-black">
          {currentItem.type === "image" ? (
            <Image
              src={currentItem.url}
              alt={currentItem.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={currentItem.url}
                controls
                className="w-full h-full object-contain"
                onPlay={() => setIsAutoPlaying(false)}
              />
              {!isAutoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                  <Play className="w-20 h-20 text-white opacity-80" />
                </div>
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          {filteredItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
            <h3 className="text-white text-2xl font-bold mb-2">{currentItem.title}</h3>
            {currentItem.description && (
              <p className="text-gray-200 text-sm">{currentItem.description}</p>
            )}
          </div>
        </div>

        {/* Dot Indicators */}
        {filteredItems.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {filteredItems.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {filteredItems.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? "ring-2 ring-white scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
              onClick={() => goToSlide(index)}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="text-center text-gray-400 text-sm">
        {currentIndex + 1} / {filteredItems.length}
      </div>
    </div>
  )
}

