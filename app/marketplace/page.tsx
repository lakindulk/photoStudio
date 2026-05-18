"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Tag,
  ChevronDown,
  ShoppingBag,
  Package,
  ArrowRight,
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import type { MarketplaceItem } from "@/types"
import { MARKETPLACE_CATEGORIES } from "@/lib/constants"
import Link from "next/link"

const CONDITION_LABELS: Record<string, string> = {
  new: "Brand New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
]

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterType, setFilterType] = useState<"all" | "sell" | "rent">("all")
  const [filterCondition, setFilterCondition] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db!, "marketplaceItems"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        )
        const snap = await getDocs(q)
        setItems(snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? "",
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? "",
            approvedAt: data.approvedAt?.toDate?.()?.toISOString() ?? data.approvedAt,
            expiresAt: data.expiresAt?.toDate?.()?.toISOString() ?? data.expiresAt,
          } as MarketplaceItem
        }))
      } catch (error) {
        console.error("Error fetching marketplace items:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const getCategoryLabel = (cat: string) =>
    MARKETPLACE_CATEGORIES.find((c) => c.value === cat)?.label || cat

  const filtered = items
    .filter((i) => {
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.description?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterCategory && i.category !== filterCategory) return false
      if (filterType !== "all" && i.listingType !== filterType) return false
      if (filterCondition && i.condition !== filterCondition) return false
      if (minPrice && i.price < parseFloat(minPrice)) return false
      if (maxPrice && i.price > parseFloat(maxPrice)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      return b.createdAt.localeCompare(a.createdAt)
    })

  const hasFilters = filterCategory || filterType !== "all" || filterCondition || minPrice || maxPrice

  const clearFilters = () => {
    setFilterCategory("")
    setFilterType("all")
    setFilterCondition("")
    setMinPrice("")
    setMaxPrice("")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#eef3f0]/30 pt-24">
        {/* Hero */}
        <div className="bg-[#082537] text-white py-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <ShoppingBag className="w-4 h-4" />
              Photography Gear Marketplace
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Buy & Rent<br />
              <span className="text-[#788C59]">Photography Equipment</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Find cameras, lenses, lighting, and more from verified sellers
            </p>

            {/* Search bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search for cameras, lenses, lighting..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#788C59]/60 focus:border-[#788C59]"
              />
            </div>

            {/* Sell CTA */}
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/marketplace/sell"
                className="inline-flex items-center gap-2 bg-[#788C59] hover:bg-[#788C59]/90 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg"
              >
                <Tag className="w-4 h-4" />
                Sell Your Gear — 100 LKR
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  showFilters || hasFilters
                    ? "bg-[#082537] text-white border-[#082537]"
                    : "bg-white text-[#082537] border-[#082537]/15 hover:border-[#082537]/30"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasFilters && (
                  <span className="bg-[#788C59] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* Type quick filter */}
              <div className="flex gap-1.5">
                {([["all", "All"], ["sell", "For Sale"], ["rent", "For Rent"]] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setFilterType(v)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                      filterType === v
                        ? "bg-[#082537] text-white border-[#082537]"
                        : "bg-white text-[#082537]/60 border-[#082537]/10 hover:border-[#082537]/20"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-[#082537]/50">{filtered.length} items</p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#082537]/15 text-[#082537] text-sm rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#788C59]/40"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#082537]/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-[#082537]/8 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-[#082537] text-sm">Filter Results</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-[#788C59] font-medium hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-3 py-2 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 bg-white"
                  >
                    <option value="">All Categories</option>
                    {MARKETPLACE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Condition</label>
                  <select
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-3 py-2 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 bg-white"
                  >
                    <option value="">Any Condition</option>
                    {Object.entries(CONDITION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Min Price (LKR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-3 py-2 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Max Price (LKR)</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-3 py-2 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-14 h-14 text-[#082537]/15 mx-auto mb-4" />
              <p className="text-lg font-semibold text-[#082537]/40">No items found</p>
              <p className="text-sm text-[#082537]/30 mt-1">Try adjusting your search or filters</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-[#788C59] font-medium hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-[#082537]/8 overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-[#082537]/5 relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-[#082537]/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow ${
                        item.listingType === "sell" ? "bg-[#082537]" : "bg-[#788C59]"
                      }`}>
                        {item.listingType === "sell" ? "For Sale" : "For Rent"}
                      </span>
                    </div>
                    {item.condition && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#082537]/70 capitalize shadow">
                          {CONDITION_LABELS[item.condition] || item.condition}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-bold text-[#082537] line-clamp-1">{item.title}</p>
                    <p className="text-xs text-[#082537]/40 mt-0.5">{getCategoryLabel(item.category)}</p>

                    {item.location && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-[#082537]/30" />
                        <span className="text-xs text-[#082537]/40">{item.location}</span>
                      </div>
                    )}

                    <div className="flex items-end justify-between mt-3">
                      <div>
                        <p className="text-xl font-bold text-[#082537]">
                          {item.price.toLocaleString()}
                          <span className="text-sm font-medium text-[#082537]/50 ml-1">LKR</span>
                        </p>
                        {item.rentPeriod && (
                          <p className="text-xs text-[#082537]/40">{item.rentPeriod}</p>
                        )}
                      </div>
                    </div>

                    {/* Seller contact info */}
                    <div className="mt-3 pt-3 border-t border-[#082537]/5">
                      <p className="text-xs text-[#082537]/50">
                        Seller: <span className="font-medium text-[#082537]/70">{item.sellerName}</span>
                      </p>
                      {item.sellerContact && (
                        <a
                          href={`tel:${item.sellerContact}`}
                          className="text-xs text-[#788C59] font-medium hover:underline mt-0.5 block"
                        >
                          {item.sellerContact}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#082537] text-white/40 text-center py-8 text-sm">
        <p>© 2024 Malka Studio. All rights reserved.</p>
      </footer>
    </>
  )
}
