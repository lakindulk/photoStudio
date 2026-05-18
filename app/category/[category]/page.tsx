"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Advertisement } from "@/types"
import { CATEGORY_LABELS } from "@/lib/constants"

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const [ads, setAds] = useState<Advertisement[]>([])
  const [filteredAds, setFilteredAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchAds = async () => {
      try {
        if (!db) {
          console.error("Database not available")
          return
        }

        const now = new Date()
        const adsQuery = query(
          collection(db, "advertisements"),
          where("category", "==", category),
          where("status", "==", "active"),
          where("isApproved", "==", true),
          where("expiresAt", ">", now)
        )

        const snapshot = await getDocs(adsQuery)
        const adsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          activatedAt: doc.data().activatedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
          approvedAt: doc.data().approvedAt?.toDate(),
        })) as Advertisement[]

        setAds(adsData)
        setFilteredAds(adsData)
      } catch (error) {
        console.error("Error fetching ads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [category])

  useEffect(() => {
    let filtered = ads

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => (b.activatedAt?.getTime() || 0) - (a.activatedAt?.getTime() || 0))
        break
      case "oldest":
        filtered.sort((a, b) => (a.activatedAt?.getTime() || 0) - (b.activatedAt?.getTime() || 0))
        break
    }

    setFilteredAds(filtered)
  }, [ads, searchQuery, sortBy])

  const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative bg-[#082537] pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #788C59 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#788C59]/10 blur-3xl animate-glow pointer-events-none" />
        <div className="absolute top-12 right-12 w-28 h-28 rounded-full border border-dashed border-white/8 animate-spin-slow hidden lg:block" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="animate-fade-in-down" style={{ animationDelay: "0ms" }}>
            <div className="inline-flex items-center gap-2 bg-[#788C59]/20 border border-[#788C59]/30 text-[#788C59] rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#788C59] animate-pulse" />
              Category
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight max-w-3xl leading-[1.05] animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            {categoryLabel}
          </h1>
          <p className="text-white/45 text-base max-w-xl font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            Discover professional {categoryLabel.toLowerCase()} services from verified providers across Sri Lanka
          </p>
        </div>
      </section>

      {/* ── Filters ───────────────────────────────────────── */}
      <section className="py-5 bg-white border-b border-[#082537]/6 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#082537]/30 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search advertisements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-[#eef3f0]/50 border border-[#082537]/8 rounded-2xl text-[#082537] placeholder-[#082537]/30 focus:ring-2 focus:ring-[#788C59]/30 focus:border-[#788C59]/40 h-11 shadow-none transition-all"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44 bg-[#eef3f0]/50 border border-[#082537]/8 text-[#082537]/60 rounded-2xl shadow-none font-bold text-[10px] tracking-widest uppercase h-11 px-4">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#082537]/10 shadow-lg rounded-2xl">
                <SelectItem value="newest" className="text-[#082537] text-[10px] font-bold uppercase tracking-widest">Newest First</SelectItem>
                <SelectItem value="oldest" className="text-[#082537] text-[10px] font-bold uppercase tracking-widest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ── Ads Grid ──────────────────────────────────────── */}
      <section className="pb-24 pt-10 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="h-[280px] shimmer-bg" />
                  <div className="p-7 bg-white space-y-3">
                    <div className="h-4 shimmer-bg rounded-lg w-1/3" />
                    <div className="h-3 shimmer-bg rounded-lg w-3/4" />
                    <div className="h-10 shimmer-bg rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-16 h-16 rounded-3xl bg-[#082537]/5 flex items-center justify-center mx-auto mb-5">
                <Search className="w-7 h-7 text-[#082537]/20" />
              </div>
              <p className="text-[#082537]/35 text-lg font-medium">No active advertisements found.</p>
              <p className="text-[#082537]/25 text-sm mt-1">Try a different search term or check back later.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#082537]/30 tracking-widest uppercase font-medium mb-8">
                Showing {filteredAds.length} result{filteredAds.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAds.map((ad, i) => (
                  <Link
                    key={ad.id}
                    href={`/ad/${ad.id}`}
                    className="block animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="glow-hover bg-white border border-[#082537]/6 hover:-translate-y-2 transition-all duration-500 group cursor-pointer overflow-hidden rounded-3xl flex flex-col h-full shadow-sm hover:shadow-2xl">
                      <div className="relative h-[280px] overflow-hidden bg-[#082537]/5">
                        {ad.coverMedia && (
                          <Image
                            src={ad.coverMedia}
                            alt={ad.title}
                            fill
                            className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                        <div className="absolute top-4 right-4">
                          <span className="bg-[#788C59] text-white font-bold px-3 py-1 rounded-full shadow-md text-[10px] uppercase tracking-widest">Active</span>
                        </div>
                        <div className="absolute bottom-4 left-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                            <MapPin className="w-3 h-3 text-[#082537]/50" />
                            <span className="text-[10px] font-bold text-[#082537] truncate max-w-[120px]">{ad.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-black text-[#082537] mb-2 group-hover:text-[#788C59] transition-colors line-clamp-1">
                          {ad.title}
                        </h3>
                        <p className="text-[#082537]/45 text-sm mb-5 line-clamp-2 leading-relaxed flex-grow font-medium">{ad.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-[#082537]/6 mt-auto">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#082537]/30 tracking-widest uppercase">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{ad.location}</span>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-[#082537]/5 group-hover:bg-[#788C59] flex items-center justify-center transition-all duration-300">
                            <ArrowRight className="w-3.5 h-3.5 text-[#082537]/30 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
