"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import {
  Phone, Mail, Globe, Facebook, Instagram, Youtube,
  Star, Play, X, ChevronLeft, ChevronRight,
  Camera, ImageIcon, Video, Quote,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { SellerProfile, Rating, PortfolioItem } from "@/types"

// ── Types ─────────────────────────────────────────────────────────────────────
type Filter = "all" | "image" | "video"

// ── Small helpers ─────────────────────────────────────────────────────────────
function Stars({ value, size = 4 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size }}
          className={s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}
        />
      ))}
    </span>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: PortfolioItem[]
  startIndex: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const item = items[idx]
  const total = items.length

  const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [onClose, prev, next])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/50 text-sm font-medium">{idx + 1} / {total}</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Media area */}
      <div
        className="flex-1 flex items-center justify-center relative px-16 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev */}
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center">
          {item.type === "video" ? (
            <video
              key={item.id}
              src={item.url}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-xl object-contain"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            />
          ) : (
            <div className="relative" style={{ maxWidth: "90vw", maxHeight: "calc(100vh - 200px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={item.id}
                src={item.url}
                alt={item.title}
                className="max-w-full max-h-full rounded-xl object-contain block"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              />
            </div>
          )}
        </div>

        {/* Next */}
        {total > 1 && (
          <button
            onClick={next}
            className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Caption */}
      {(item.title || item.description) && (
        <div
          className="flex-shrink-0 px-6 py-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {item.title && <p className="text-white font-semibold">{item.title}</p>}
          {item.description && (
            <p className="text-white/50 text-sm mt-1 max-w-xl mx-auto line-clamp-2">{item.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PublicPortfolioPage() {
  const params = useParams()
  const sellerId = params.sellerId as string

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!db || !sellerId) { setLoading(false); return }
    Promise.all([
      getDocs(query(collection(db, "sellerProfiles"), where("userId", "==", sellerId))),
      getDocs(
        query(collection(db, "ratings"), where("sellerId", "==", sellerId), orderBy("createdAt", "desc"))
      ),
    ])
      .then(([sellerSnap, ratingsSnap]) => {
        if (!sellerSnap.empty) {
          setSeller({ id: sellerSnap.docs[0].id, ...sellerSnap.docs[0].data() } as SellerProfile)
        }
        setRatings(
          ratingsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() ?? new Date(),
          })) as Rating[]
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [sellerId])

  const allItems = seller?.portfolioItems ?? []
  const filtered =
    filter === "all" ? allItems : allItems.filter((i) => i.type === filter)
  const photoCount = allItems.filter((i) => i.type === "image").length
  const videoCount = allItems.filter((i) => i.type === "video").length

  const ratedReviews = ratings.filter((r) => r.rating && r.rating > 0)
  const avg =
    ratedReviews.length > 0
      ? ratedReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / ratedReviews.length
      : 0

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="flex gap-6 items-center">
            <div className="w-28 h-28 rounded-full bg-gray-800 flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-7 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
              <div className="h-4 bg-gray-800 rounded w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-video bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <Camera className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Portfolio not found.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filtered}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="min-h-screen bg-background">
        <Header />

        {/* ── Seller header ────────────────────────────────────────────────── */}
        <div className="border-b border-gray-800">
          {/* Cover image strip */}
          {seller.coverImage && (
            <div className="relative w-full h-48 md:h-64 overflow-hidden">
              <Image src={seller.coverImage} alt="Cover" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className={`relative flex-shrink-0 ${seller.coverImage ? "-mt-16" : ""}`}>
                {seller.profileImage ? (
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-4 ring-background">
                    <Image src={seller.profileImage} alt={seller.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-800 flex items-center justify-center ring-4 ring-background">
                    <Camera className="w-10 h-10 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-white">{seller.name}</h1>
                  {avg > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1">
                      <Stars value={avg} size={14} />
                      <span className="text-yellow-400 font-bold text-sm">{avg.toFixed(1)}</span>
                      <span className="text-yellow-400/50 text-xs">({ratedReviews.length})</span>
                    </div>
                  )}
                </div>

                {seller.description && (
                  <p className="text-gray-400 text-base mb-4 max-w-2xl">{seller.description}</p>
                )}

                {/* Contacts */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  {seller.contactNo && (
                    <a href={`tel:${seller.contactNo}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Phone className="w-4 h-4" /> {seller.contactNo}
                    </a>
                  )}
                  {seller.email && (
                    <a href={`mailto:${seller.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Mail className="w-4 h-4" /> {seller.email}
                    </a>
                  )}
                </div>

                {/* Social links */}
                {seller.socialMedia && (
                  <div className="flex gap-3">
                    {seller.socialMedia.facebook && (
                      <a href={seller.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {seller.socialMedia.instagram && (
                      <a href={seller.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {seller.socialMedia.youtube && (
                      <a href={seller.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                    {seller.socialMedia.website && (
                      <a href={seller.socialMedia.website} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Stats pill */}
              <div className="flex gap-3 flex-shrink-0 self-start sm:self-center">
                <div className="flex flex-col items-center bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-3 min-w-[72px]">
                  <ImageIcon className="w-4 h-4 text-gray-500 mb-1" />
                  <p className="text-xl font-bold text-white">{photoCount}</p>
                  <p className="text-xs text-gray-500">Photos</p>
                </div>
                <div className="flex flex-col items-center bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-3 min-w-[72px]">
                  <Video className="w-4 h-4 text-gray-500 mb-1" />
                  <p className="text-xl font-bold text-white">{videoCount}</p>
                  <p className="text-xs text-gray-500">Videos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Gallery ──────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {allItems.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
              <Camera className="w-14 h-14 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No portfolio items yet</p>
              <p className="text-gray-700 text-sm mt-1">Check back later for new work.</p>
            </div>
          ) : (
            <>
              {/* Filter pills */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {(
                  [
                    { key: "all", label: `All`, count: allItems.length },
                    { key: "image", label: "Photos", count: photoCount },
                    { key: "video", label: "Videos", count: videoCount },
                  ] as { key: Filter; label: string; count: number }[]
                )
                  .filter((f) => f.key === "all" || f.count > 0)
                  .map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filter === f.key
                          ? "bg-white text-black"
                          : "bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
                      }`}
                    >
                      {f.key === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                      {f.key === "video" && <Video className="w-3.5 h-3.5" />}
                      {f.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-black/15 text-black" : "bg-gray-800 text-gray-500"}`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-600">No items match this filter.</div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
                  {filtered.map((item, i) => (
                    <div
                      key={item.id}
                      className="mb-3 break-inside-avoid group cursor-pointer relative overflow-hidden rounded-xl border border-gray-800 hover:border-gray-600 transition-all"
                      onClick={() => setLightboxIndex(i)}
                    >
                      {item.type === "image" ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-auto block"
                            loading="lazy"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <div>
                              <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                              {item.description && (
                                <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>
                          {/* Image badge */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Photo
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative bg-black aspect-video">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-7 h-7 text-white fill-white ml-1" />
                              </div>
                            </div>
                            {/* Video badge */}
                            <div className="absolute top-2 left-2">
                              <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Video className="w-3 h-3" /> Video
                              </span>
                            </div>
                          </div>
                          {/* Caption below video */}
                          <div className="p-3 bg-gray-900/80">
                            <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                            {item.description && (
                              <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Reviews section ───────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="border-t border-gray-800 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Reviews</h2>
                {avg > 0 && (
                  <div className="flex items-center gap-2">
                    <Stars value={avg} size={18} />
                    <span className="text-white font-bold">{avg.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({ratings.length})</span>
                  </div>
                )}
                {ratings.length === 0 && (
                  <span className="text-gray-600 text-sm">No reviews yet</span>
                )}
              </div>
              <Link href={`/rate/${sellerId}`}>
                <Button className="bg-[#788C59] hover:bg-[#788C59]/85 text-white rounded-xl font-bold text-sm gap-2">
                  <Star className="w-4 h-4" />
                  Leave a Review
                </Button>
              </Link>
            </div>

            {ratings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ratings.slice(0, 9).map((r) => (
                  <div key={r.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {r.rating && r.rating > 0 && <Stars value={r.rating} size={15} />}
                        <p className="font-semibold text-white text-sm mt-1">{r.guestName || "Anonymous"}</p>
                      </div>
                      <time className="text-xs text-gray-600 flex-shrink-0">
                        {r.createdAt instanceof Date
                          ? r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : ""}
                      </time>
                    </div>
                    {r.title && <p className="font-semibold text-gray-200 text-sm">{r.title}</p>}
                    {r.description && (
                      <div className="flex gap-2">
                        <Quote className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">{r.description}</p>
                      </div>
                    )}
                    {r.mediaUrl && (
                      <div className="rounded-lg overflow-hidden border border-gray-800">
                        {r.mediaType === "video" ? (
                          <video src={r.mediaUrl} controls className="w-full max-h-40 bg-black" />
                        ) : (
                          <div className="relative w-full h-36">
                            <Image src={r.mediaUrl} alt="Review photo" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
