"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Phone,
  Mail,
  Tag,
  AlertCircle,
} from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore"
import type { MarketplaceItem } from "@/types"
import { MARKETPLACE_CATEGORIES } from "@/lib/constants"
import { useAuth } from "@/contexts/AuthContext"

const TABS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "approved", label: "Active", icon: CheckCircle2 },
  { key: "all", label: "All", icon: Package },
]

const CONDITION_LABELS: Record<string, string> = {
  new: "Brand New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
}

function MarketplaceCard({
  item,
  onApprove,
  onReject,
}: {
  item: MarketplaceItem
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const getCategoryLabel = (cat: string) =>
    MARKETPLACE_CATEGORIES.find((c) => c.value === cat)?.label || cat

  return (
    <div className="bg-white rounded-2xl border border-[#082537]/8 overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image */}
          {item.images?.[0] && (
            <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-[#082537]/5 flex-shrink-0">
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
                    item.listingType === "sell" ? "bg-[#082537]" : "bg-[#788C59]"
                  }`}>
                    {item.listingType === "sell" ? "For Sale" : "For Rent"}
                  </span>
                  {item.condition && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#082537]/5 text-[#082537]/60">
                      {CONDITION_LABELS[item.condition] || item.condition}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-[#082537] text-base">{item.title}</h3>
                <p className="text-xs text-[#082537]/50 mt-0.5">{getCategoryLabel(item.category)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#082537]">{item.price.toLocaleString()} LKR</p>
                {item.rentPeriod && <p className="text-xs text-[#082537]/40">{item.rentPeriod}</p>}
              </div>
            </div>

            {/* Seller info */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#082537]/60">
                <User className="w-3.5 h-3.5" />
                {item.sellerName}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#082537]/60">
                <Mail className="w-3.5 h-3.5" />
                {item.sellerEmail}
              </div>
              {item.sellerContact && (
                <div className="flex items-center gap-1.5 text-xs text-[#082537]/60">
                  <Phone className="w-3.5 h-3.5" />
                  {item.sellerContact}
                </div>
              )}
            </div>

            {item.location && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#082537]/50">
                <MapPin className="w-3.5 h-3.5" />
                {item.location}
              </div>
            )}

            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#082537]/40">
              <Tag className="w-3.5 h-3.5" />
              Listing fee: {item.listingFee} LKR
              {" · "}
              Submitted: {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs text-[#082537]/40 hover:text-[#082537] font-medium transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide details" : "View details"}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#082537]/8 space-y-3">
            {item.description && (
              <div>
                <p className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-[#082537]/70">{item.description}</p>
              </div>
            )}

            {item.images && item.images.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider mb-2">Photos</p>
                <div className="flex gap-2 overflow-x-auto">
                  {item.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-[#082537]/10 flex-shrink-0 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {item.paymentSlipUrl && (
              <div>
                <p className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider mb-2">Payment Slip (100 LKR)</p>
                <a href={item.paymentSlipUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#788C59] font-medium hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  View slip
                </a>
              </div>
            )}

            {item.status === "rejected" && item.rejectionReason && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600"><strong>Rejection reason:</strong> {item.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {item.status === "pending" && (
          <div className="mt-4 flex gap-3 pt-4 border-t border-[#082537]/8">
            <button
              onClick={() => onApprove(item.id)}
              className="flex items-center gap-2 bg-[#082537] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#082537]/90 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Listing
            </button>
            <button
              onClick={() => setShowRejectDialog(true)}
              className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-[#082537] mb-3">Reject Listing</h3>
            <p className="text-sm text-[#082537]/60 mb-4">Provide a reason for rejection (shown to the seller):</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Payment slip not clear, please re-upload..."
              className="w-full border border-[#082537]/15 rounded-xl px-4 py-3 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { onReject(item.id, rejectReason); setShowRejectDialog(false) }}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setShowRejectDialog(false)}
                className="flex-1 border border-[#082537]/15 text-[#082537] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#082537]/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminMarketplacePage() {
  const { user } = useAuth()
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    const q = query(collection(db, "marketplaceItems"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MarketplaceItem)))
      setLoading(false)
    })
    return unsub
  }, [])

  const approve = async (id: string) => {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 2)
    await updateDoc(doc(db, "marketplaceItems", id), {
      status: "approved",
      approvedBy: user?.uid,
      approvedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const reject = async (id: string, reason: string) => {
    await updateDoc(doc(db, "marketplaceItems", id), {
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    })
  }

  const filtered = items.filter((i) => {
    if (activeTab === "all") return true
    return i.status === activeTab
  })

  const pendingCount = items.filter((i) => i.status === "pending").length
  const activeCount = items.filter((i) => i.status === "approved").length

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#082537]">Marketplace Items</h1>
          <p className="text-sm text-[#082537]/60 mt-1">Review and approve seller equipment listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-[#082537]/50 mt-1">Pending Review</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-[#082537]/50 mt-1">Active Listings</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
            <p className="text-2xl font-bold text-[#082537]">{items.length}</p>
            <p className="text-xs text-[#082537]/50 mt-1">Total All Time</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === key ? "bg-[#082537] text-white" : "bg-white text-[#082537]/60 border border-[#082537]/10 hover:border-[#082537]/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? "bg-white/20" : "bg-[#082537]/5 text-[#082537]/40"}`}>
                {key === "pending" ? pendingCount : key === "approved" ? activeCount : items.length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-32 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-12 text-center">
            <Package className="w-12 h-12 text-[#082537]/15 mx-auto mb-3" />
            <p className="text-[#082537]/40">No items in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <MarketplaceCard key={item.id} item={item} onApprove={approve} onReject={reject} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
