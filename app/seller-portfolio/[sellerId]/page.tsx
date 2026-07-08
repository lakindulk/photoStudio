"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PortfolioDisplay } from "@/components/PortfolioDisplay"
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Youtube, Star, Quote, Image as ImageIcon, Video } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Advertisement, SellerProfile, Rating } from "@/types"
import { CATEGORY_LABELS } from "@/lib/constants"

// ── Helpers ──────────────────────────────────────────────────────────────────

function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} transition-colors ${
            s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"
          }`}
        />
      ))}
    </div>
  )
}

function averageRating(ratings: Rating[]): number {
  const withRating = ratings.filter((r) => r.rating && r.rating > 0)
  if (!withRating.length) return 0
  return withRating.reduce((sum, r) => sum + (r.rating ?? 0), 0) / withRating.length
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SellerPortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [ads, setAds] = useState<Advertisement[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      if (!db || !params.sellerId) return
      try {
        // Seller profile
        const sellerSnap = await getDocs(
          query(collection(db, "sellerProfiles"), where("userId", "==", params.sellerId as string))
        )
        if (sellerSnap.empty) { router.push("/"); return }
        const sellerData = {
          id: sellerSnap.docs[0].id,
          ...sellerSnap.docs[0].data(),
          createdAt: sellerSnap.docs[0].data().createdAt?.toDate(),
          updatedAt: sellerSnap.docs[0].data().updatedAt?.toDate(),
        } as SellerProfile
        setSeller(sellerData)

        // Active ads
        const now = new Date()
        const adsSnap = await getDocs(
          query(
            collection(db, "advertisements"),
            where("sellerId", "==", params.sellerId as string),
            where("status", "==", "active"),
            where("isApproved", "==", true),
            where("expiresAt", ">", now)
          )
        )
        setAds(
          adsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate(),
            updatedAt: d.data().updatedAt?.toDate(),
            activatedAt: d.data().activatedAt?.toDate(),
            expiresAt: d.data().expiresAt?.toDate(),
            approvedAt: d.data().approvedAt?.toDate(),
          })) as Advertisement[]
        )

        // Ratings
        const ratingsSnap = await getDocs(
          query(
            collection(db, "ratings"),
            where("sellerId", "==", params.sellerId as string),
            orderBy("createdAt", "desc")
          )
        )
        setRatings(
          ratingsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate() ?? new Date(),
          })) as Rating[]
        )
      } catch (error) {
        console.error("Error fetching seller data:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [params.sellerId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-800 rounded-lg" />
            <div className="h-96 bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!seller) return null

  const avg = averageRating(ratings)
  const ratedCount = ratings.filter((r) => r.rating && r.rating > 0).length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Seller Header ─────────────────────────────────────────────── */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {seller.profileImage && (
                <div className="relative h-40 w-40 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image src={seller.profileImage} alt={seller.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{seller.name}</h1>
                    {/* Inline average rating badge */}
                    {avg > 0 && (
                      <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-3 py-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">{avg.toFixed(1)}</span>
                        <span className="text-yellow-400/60 text-xs">({ratedCount})</span>
                      </div>
                    )}
                  </div>
                  {seller.description && (
                    <p className="text-gray-300 text-lg">{seller.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${seller.contactNo}`} className="hover:text-white transition-colors">{seller.contactNo}</a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${seller.email}`} className="hover:text-white transition-colors">{seller.email}</a>
                  </div>
                  {!seller.hideAddress && seller.address && (
                    <div className="flex items-start gap-3 text-gray-300 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <span>{seller.address}</span>
                    </div>
                  )}
                </div>

                {seller.socialMedia && (
                  <div className="flex gap-4 pt-2">
                    {seller.socialMedia.facebook && (
                      <a href={seller.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {seller.socialMedia.instagram && (
                      <a href={seller.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {seller.socialMedia.youtube && (
                      <a href={seller.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Youtube className="w-6 h-6" />
                      </a>
                    )}
                    {seller.socialMedia.website && (
                      <a href={seller.socialMedia.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Globe className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Portfolio ─────────────────────────────────────────────────── */}
        {seller.portfolioItems && seller.portfolioItems.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800 mb-8">
            <CardContent className="p-6">
              <PortfolioDisplay
                items={seller.portfolioItems}
                portfolioType={seller.portfolioType || "type1"}
                title="Portfolio"
              />
            </CardContent>
          </Card>
        )}

        {/* ── Ratings & Reviews ─────────────────────────────────────────── */}
        {ratings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-white">Reviews</h2>
              {avg > 0 && (
                <div className="flex items-center gap-2">
                  <StarDisplay value={avg} size="md" />
                  <span className="text-white font-bold text-lg">{avg.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({ratings.length} review{ratings.length !== 1 ? "s" : ""})</span>
                </div>
              )}
              {avg === 0 && (
                <span className="text-gray-500 text-sm">({ratings.length} review{ratings.length !== 1 ? "s" : ""})</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratings.map((review) => (
                <Card key={review.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-5 space-y-3">

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {review.rating && review.rating > 0 && (
                          <StarDisplay value={review.rating} />
                        )}
                        <p className="font-semibold text-white text-sm">
                          {review.guestName || "Anonymous"}
                        </p>
                      </div>
                      <time className="text-xs text-gray-600 flex-shrink-0 pt-0.5">
                        {review.createdAt instanceof Date
                          ? review.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : ""}
                      </time>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <p className="font-semibold text-gray-100">{review.title}</p>
                    )}

                    {/* Description */}
                    {review.description && (
                      <div className="flex gap-2">
                        <Quote className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-400 text-sm leading-relaxed">{review.description}</p>
                      </div>
                    )}

                    {/* Media */}
                    {review.mediaUrl && (
                      <div className="rounded-xl overflow-hidden border border-gray-800">
                        {review.mediaType === "video" ? (
                          <div className="relative">
                            <video
                              src={review.mediaUrl}
                              controls
                              className="w-full max-h-56 bg-black"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                <Video className="w-3 h-3" /> Video
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-48">
                            <Image
                              src={review.mediaUrl}
                              alt={review.title || "Review photo"}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                <ImageIcon className="w-3 h-3" /> Photo
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Active Advertisements ─────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Active Advertisements</h2>
          {ads.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400">No active advertisements at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Link key={ad.id} href={`/ad/${ad.id}`}>
                  <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 group cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gray-800">
                        {ad.coverMedia && (
                          <Image
                            src={ad.coverMedia}
                            alt={ad.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-600 text-white">Active</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <Badge variant="outline" className="mb-2 text-gray-300 border-gray-600">
                          {CATEGORY_LABELS[ad.category]}
                        </Badge>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-200 transition-colors">
                          {ad.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ad.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{ad.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
