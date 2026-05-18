"use client"

import { useState, useEffect } from "react"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import {
  Plus,
  ShoppingBag,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import type { MarketplaceItem } from "@/types"
import { MARKETPLACE_CATEGORIES } from "@/lib/constants"

const STATUS_CONFIG = {
  pending: { label: "Pending Approval", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  approved: { label: "Active", icon: CheckCircle2, color: "text-green-700 bg-green-50 border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  sold: { label: "Sold", icon: Package, color: "text-blue-600 bg-blue-50 border-blue-200" },
  rented: { label: "Rented", icon: Package, color: "text-purple-600 bg-purple-50 border-purple-200" },
  expired: { label: "Expired", icon: AlertCircle, color: "text-gray-500 bg-gray-50 border-gray-200" },
}

export default function SellerMarketplacePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "all">("all")

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "marketplaceItems"), where("sellerId", "==", user.id))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MarketplaceItem))
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      setItems(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const filtered = items.filter((i) => {
    if (activeTab === "active") return i.status === "approved"
    if (activeTab === "pending") return i.status === "pending"
    return true
  })

  const activeCount = items.filter((i) => i.status === "approved").length
  const pendingCount = items.filter((i) => i.status === "pending").length

  const getCategoryLabel = (cat: string) =>
    MARKETPLACE_CATEGORIES.find((c) => c.value === cat)?.label || cat

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this listing?")) return
    await deleteDoc(doc(db, "marketplaceItems", id))
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/40 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#082537]">Sell / Rent Items</h1>
            <p className="text-sm text-[#082537]/60 mt-0.5">List your photography gear for sale or rent — 100 LKR per listing, active for 2 months</p>
          </div>
          <Link
            href="/seller/marketplace/create"
            className="flex items-center gap-2 bg-[#082537] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#082537]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>

        {/* Info banner */}
        <div className="mb-6 bg-[#082537]/5 border border-[#082537]/10 rounded-2xl p-4 flex items-start gap-3">
          <ShoppingBag className="w-5 h-5 text-[#788C59] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#082537]">How it works</p>
            <p className="text-xs text-[#082537]/60 mt-0.5">
              Post your photography equipment for sale or rent. Each listing costs <strong>100 LKR</strong> (paid via bank slip upload). After admin approval, your listing goes live for <strong>2 months</strong>. Buyers contact you directly.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
            <p className="text-2xl font-bold text-[#082537]">{items.length}</p>
            <p className="text-xs text-[#082537]/50 mt-1">Total Listings</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-[#082537]/50 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-[#082537]/50 mt-1">Pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {([["all", "All", items.length], ["active", "Active", activeCount], ["pending", "Pending", pendingCount]] as const).map(([tab, label, count]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab ? "bg-[#082537] text-white" : "bg-white text-[#082537]/60 border border-[#082537]/10 hover:border-[#082537]/20"
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? "bg-white/20 text-white" : "bg-[#082537]/8 text-[#082537]/50"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-[#082537]/15 mx-auto mb-3" />
            <p className="text-[#082537]/50 font-medium">No listings yet</p>
            <p className="text-sm text-[#082537]/30 mt-1">Create your first listing to get started</p>
            <Link
              href="/seller/marketplace/create"
              className="inline-flex items-center gap-2 mt-4 bg-[#082537] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#082537]/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-[#082537]/8 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="aspect-[4/3] bg-[#082537]/5 relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-[#082537]/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.listingType === "sell" ? "bg-[#082537] text-white" : "bg-[#788C59] text-white"
                      }`}>
                        {item.listingType === "sell" ? "For Sale" : "For Rent"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-bold text-[#082537] truncate">{item.title}</p>
                    <p className="text-xs text-[#082537]/40 mt-0.5">{getCategoryLabel(item.category)}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-lg font-bold text-[#082537]">
                          {item.price.toLocaleString()} <span className="text-sm font-medium text-[#082537]/50">LKR</span>
                        </p>
                        {item.rentPeriod && (
                          <p className="text-xs text-[#082537]/40">{item.rentPeriod}</p>
                        )}
                      </div>
                      {item.condition && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#082537]/5 text-[#082537]/60 capitalize">
                          {item.condition}
                        </span>
                      )}
                    </div>

                    {item.status === "rejected" && item.rejectionReason && (
                      <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600"><strong>Rejected:</strong> {item.rejectionReason}</p>
                      </div>
                    )}

                    {item.expiresAt && item.status === "approved" && (
                      <p className="text-xs text-[#082537]/40 mt-2">
                        Expires: {new Date(item.expiresAt).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#082537]/8">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SellerLayout>
  )
}
