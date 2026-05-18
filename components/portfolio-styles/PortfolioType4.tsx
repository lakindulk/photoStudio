"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Film, ChevronRight as Arrow } from "lucide-react"
import type { PortfolioItem } from "@/types"

interface Props {
  items: PortfolioItem[]
  title?: string
}

type FilterType = "all" | "image" | "video"

export function PortfolioType4({ items, title }: Props) {
  const [filter, setFilter] = useState<FilterType>("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  const filtered = items.filter((i) => filter === "all" || i.type === filter)
  const ITEMS_PER_PAGE = 7
  const start = page * ITEMS_PER_PAGE
  const paged = filtered.slice(start, start + ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const featured = paged[0]
  const sideItems = paged.slice(1, 3)
  const bottomItems = paged.slice(3, 7)

  const imageCount = items.filter((i) => i.type === "image").length
  const videoCount = items.filter((i) => i.type === "video").length

  const openLightbox = (localIndex: number) => setLightboxIndex(start + localIndex)

  const closeLightbox = () => setLightboxIndex(null)
  const prevItem = () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  const nextItem = () => setLightboxIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i))

  const lightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#082537]">{title}</h2>
          <div className="flex items-center gap-2 text-sm text-[#082537]/60">
            <span>{filtered.length} items</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "image", "video"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-[#082537] text-white shadow"
                : "bg-[#082537]/5 text-[#082537]/70 hover:bg-[#082537]/10"
            }`}
          >
            {f === "image" && <ImageIcon className="w-3.5 h-3.5" />}
            {f === "video" && <Film className="w-3.5 h-3.5" />}
            {f === "all" ? `All (${items.length})` : f === "image" ? `Photos (${imageCount})` : `Videos (${videoCount})`}
          </button>
        ))}
      </div>

      {/* Magazine Layout */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#082537]/40">
          <ImageIcon className="w-12 h-12 mb-3" />
          <p className="text-sm">No items match this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top Section: Featured + Side Stack */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3" style={{ height: "420px" }}>
            {/* Featured large image */}
            {featured && (
              <div
                className="md:col-span-3 relative overflow-hidden rounded-2xl cursor-pointer group bg-[#082537]/5"
                onClick={() => openLightbox(0)}
              >
                {featured.type === "image" ? (
                  <img
                    src={featured.url}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video src={featured.url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                        <Play className="w-7 h-7 text-[#082537] ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-semibold text-lg leading-tight">{featured.title}</p>
                  {featured.description && (
                    <p className="text-white/70 text-sm mt-1 line-clamp-2">{featured.description}</p>
                  )}
                </div>
                <div className="absolute top-3 left-3 bg-[#788C59] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  Featured
                </div>
              </div>
            )}

            {/* Side stack */}
            <div className="md:col-span-2 flex flex-col gap-3 h-full">
              {sideItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative flex-1 overflow-hidden rounded-2xl cursor-pointer group bg-[#082537]/5"
                  onClick={() => openLightbox(idx + 1)}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-[#082537] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                  </div>
                </div>
              ))}
              {sideItems.length === 0 && featured && (
                <div className="flex-1 rounded-2xl bg-[#082537]/5 flex items-center justify-center text-[#082537]/30 text-sm">
                  No more items
                </div>
              )}
            </div>
          </div>

          {/* Bottom Strip */}
          {bottomItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bottomItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-[#082537]/5"
                  onClick={() => openLightbox(idx + 3)}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                          <Play className="w-3 h-3 text-[#082537] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="w-9 h-9 rounded-full border border-[#082537]/20 flex items-center justify-center hover:bg-[#082537]/5 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-[#082537]" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === page ? "bg-[#082537] w-6" : "bg-[#082537]/20 hover:bg-[#082537]/40"
              }`}
            />
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="w-9 h-9 rounded-full border border-[#082537]/20 flex items-center justify-center hover:bg-[#082537]/5 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-[#082537]" />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevItem() }}
            disabled={lightboxIndex === 0}
            className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div
            className="relative max-w-5xl w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxItem.type === "image" ? (
              <img
                src={lightboxItem.url}
                alt={lightboxItem.title}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={lightboxItem.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-lg"
              />
            )}
            <div className="mt-3 text-center">
              <p className="text-white font-semibold">{lightboxItem.title}</p>
              {lightboxItem.description && (
                <p className="text-white/60 text-sm mt-1">{lightboxItem.description}</p>
              )}
              <p className="text-white/40 text-xs mt-2">
                {(lightboxIndex ?? 0) + 1} / {filtered.length}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); nextItem() }}
            disabled={lightboxIndex === filtered.length - 1}
            className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
