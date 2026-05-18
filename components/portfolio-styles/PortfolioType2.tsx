"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video } from "lucide-react"
import type { PortfolioItem } from "@/types"

interface PortfolioType2Props {
  items: PortfolioItem[]
  title?: string
}

export function PortfolioType2({ items, title = "Portfolio" }: PortfolioType2Props) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [filter, setFilter] = useState<"all" | "image" | "video">("all")

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true
    return item.type === filter
  })

  const images = items.filter((item) => item.type === "image")
  const videos = items.filter((item) => item.type === "video")

  const openLightbox = (item: PortfolioItem, index: number) => {
    setSelectedItem(item)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedItem(null)
  }

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % filteredItems.length
    setCurrentIndex(nextIndex)
    setSelectedItem(filteredItems[nextIndex])
  }

  const goToPrevious = () => {
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length
    setCurrentIndex(prevIndex)
    setSelectedItem(filteredItems[prevIndex])
  }

  // Distribute items into columns for masonry layout
  const distributeItems = (items: PortfolioItem[], columns: number) => {
    const cols: PortfolioItem[][] = Array.from({ length: columns }, () => [])
    items.forEach((item, index) => {
      cols[index % columns].push(item)
    })
    return cols
  }

  const columns = distributeItems(filteredItems, 3)

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

      {/* Masonry Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4">
            {column.map((item) => {
              const itemIndex = filteredItems.findIndex((i) => i.id === item.id)
              // Vary heights for masonry effect
              const heights = ["aspect-square", "aspect-[3/4]", "aspect-[4/3]"]
              const heightClass = heights[itemIndex % heights.length]

              return (
                <div
                  key={item.id}
                  className={`group relative ${heightClass} bg-gray-900 rounded-lg overflow-hidden cursor-pointer`}
                  onClick={() => openLightbox(item, itemIndex)}
                >
                  {item.type === "image" ? (
                    <Image
                      src={item.url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-5xl bg-black border-gray-800 p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeLightbox}
              >
                <X className="w-5 h-5" />
              </Button>

              {filteredItems.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={goToNext}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              <div className="relative aspect-video bg-black">
                {selectedItem.type === "image" ? (
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video src={selectedItem.url} controls className="w-full h-full" />
                )}
              </div>

              <div className="p-6 bg-gray-900">
                <h3 className="text-white text-2xl font-bold mb-2">{selectedItem.title}</h3>
                {selectedItem.description && (
                  <p className="text-gray-300">{selectedItem.description}</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

