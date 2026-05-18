"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, doc, updateDoc, getDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { toast } from "@/hooks/use-toast"
import {
  Check, X, Eye, User, Trash2, ChevronDown, ChevronUp, MapPin, Clock,
  AlertCircle, CheckCircle2, XCircle, Package, Camera, RefreshCw,
} from "lucide-react"
import Image from "next/image"
import type { Advertisement, SellerProfile, Subscription } from "@/types"
import { CATEGORY_LABELS, SUBSCRIPTION_DURATION_MONTHS } from "@/lib/constants"
import { format } from "date-fns"

type TabKey = "pending" | "active" | "deactivated" | "all"

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700 border-amber-200" },
    active:      { label: "Active",      cls: "bg-green-100 text-green-700 border-green-200" },
    approved:    { label: "Active",      cls: "bg-green-100 text-green-700 border-green-200" },
    rejected:    { label: "Rejected",    cls: "bg-red-100 text-red-600 border-red-200" },
    deactivated: { label: "Deactivated", cls: "bg-gray-100 text-gray-500 border-gray-200" },
    expired:     { label: "Expired",     cls: "bg-gray-100 text-gray-400 border-gray-200" },
    removed:     { label: "Removed",     cls: "bg-red-50 text-red-400 border-red-100" },
  }
  const c = cfg[status] || cfg.pending
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${c.cls}`}>
      {c.label}
    </span>
  )
}

function AdCard({
  ad,
  seller,
  sellerSubs,
  onApprove,
  onReject,
  onRemove,
  processing,
}: {
  ad: Advertisement
  seller?: SellerProfile
  sellerSubs: Subscription[]
  onApprove: (ad: Advertisement) => void
  onReject: (ad: Advertisement) => void
  onRemove: (ad: Advertisement) => void
  processing: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const hasValidSub = sellerSubs.some((s) => s.allowedCategories.includes(ad.category))

  return (
    <div className="bg-white rounded-2xl border border-[#082537]/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Cover */}
          <div className="relative w-full lg:w-56 h-44 lg:h-auto rounded-xl overflow-hidden bg-[#082537]/5 flex-shrink-0">
            {ad.coverMedia ? (
              <Image src={ad.coverMedia} alt={ad.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-[#082537]/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-[#082537] leading-tight">{ad.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#082537]/8 text-[#082537]/70">
                    {CATEGORY_LABELS[ad.category]}
                  </span>
                  <StatusBadge status={ad.status} />
                  {hasValidSub ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                      ✓ Valid Subscription
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200">
                      ✗ No Subscription
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#082537]/40 flex-shrink-0">
                {ad.createdAt && format(ad.createdAt instanceof Date ? ad.createdAt : new Date(ad.createdAt as any), "dd MMM yyyy")}
              </p>
            </div>

            <p className="text-sm text-[#082537]/60 line-clamp-2">{ad.description}</p>

            {ad.location && (
              <div className="flex items-center gap-1.5 text-xs text-[#082537]/50">
                <MapPin className="w-3.5 h-3.5" />
                {ad.location}
              </div>
            )}

            {/* Seller info row */}
            <div className="bg-[#eef3f0]/60 rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-[#082537]/40 font-medium">Seller</p>
                <p className="text-[#082537] font-semibold mt-0.5 truncate">{seller?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-[#082537]/40 font-medium">Email</p>
                <p className="text-[#082537] mt-0.5 truncate">{seller?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-[#082537]/40 font-medium">Contact</p>
                <p className="text-[#082537] mt-0.5">{seller?.contactNo || "N/A"}</p>
              </div>
              <div>
                <p className="text-[#082537]/40 font-medium">Active Subs</p>
                <p className="text-[#082537] font-semibold mt-0.5">{sellerSubs.length}</p>
              </div>
            </div>

            {ad.rejectionReason && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600"><strong>Rejection reason:</strong> {ad.rejectionReason}</p>
              </div>
            )}

            {/* Expand */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-[#082537]/40 hover:text-[#082537] font-medium transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? "Hide subscriptions" : "Show subscriptions"}
            </button>

            {expanded && sellerSubs.length > 0 && (
              <div className="space-y-2 pt-1">
                {sellerSubs.map((sub) => (
                  <div key={sub.id} className="text-xs bg-[#082537]/3 rounded-xl p-3 border border-[#082537]/5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#082537]">{sub.packageType}</span>
                      <span className="text-[#082537]/50">
                        Expires: {sub.expiresAt ? format(sub.expiresAt instanceof Date ? sub.expiresAt : new Date(sub.expiresAt as any), "dd MMM yyyy") : "N/A"}
                      </span>
                    </div>
                    <p className="text-[#082537]/50 mt-0.5">
                      {sub.allowedCategories.map((c) => CATEGORY_LABELS[c] || c).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              {ad.status === "pending" && (
                <>
                  <button
                    onClick={() => onApprove(ad)}
                    disabled={processing || !hasValidSub}
                    className="flex items-center gap-1.5 bg-[#082537] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#082537]/90 transition-colors disabled:opacity-40"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(ad)}
                    disabled={processing}
                    className="flex items-center gap-1.5 border border-amber-300 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors disabled:opacity-40"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => onRemove(ad)}
                disabled={processing}
                className="flex items-center gap-1.5 border border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-40 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Ad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminAdsPage() {
  const { user } = useAuth()
  const [allAds, setAllAds] = useState<Advertisement[]>([])
  const [sellerProfiles, setSellerProfiles] = useState<Record<string, SellerProfile>>({})
  const [sellerSubscriptions, setSellerSubscriptions] = useState<Record<string, Subscription[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("pending")
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchData = async () => {
    if (!db || !user) return
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, "advertisements"))
      const ads = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate?.() ?? d.data().updatedAt,
          activatedAt: d.data().activatedAt?.toDate?.() ?? d.data().activatedAt,
          expiresAt: d.data().expiresAt?.toDate?.() ?? d.data().expiresAt,
          approvedAt: d.data().approvedAt?.toDate?.() ?? d.data().approvedAt,
        } as Advertisement))
        .filter((a) => a.status !== "removed")

      setAllAds(ads)

      const ids = [...new Set(ads.map((a) => a.sellerId))]
      const profiles: Record<string, SellerProfile> = {}
      const subs: Record<string, Subscription[]> = {}

      for (const id of ids) {
        const pd = await getDoc(doc(db, "sellerProfiles", id))
        if (pd.exists()) profiles[id] = { id: pd.id, ...pd.data() } as SellerProfile

        const sq = query(collection(db, "subscriptions"), where("sellerId", "==", id), where("status", "==", "active"))
        const ss = await getDocs(sq)
        subs[id] = ss.docs.map((d) => ({
          id: d.id, ...d.data(),
          submittedAt: d.data().submittedAt?.toDate?.() ?? d.data().submittedAt,
          approvedAt: d.data().approvedAt?.toDate?.() ?? d.data().approvedAt,
          expiresAt: d.data().expiresAt?.toDate?.() ?? d.data().expiresAt,
          createdAt: d.data().createdAt?.toDate?.() ?? d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate?.() ?? d.data().updatedAt,
        } as Subscription)).filter((s) => s.expiresAt && new Date(s.expiresAt) > new Date())
      }

      setSellerProfiles(profiles)
      setSellerSubscriptions(subs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [user])

  const handleApprove = async (ad: Advertisement) => {
    if (!user) return
    const subs = sellerSubscriptions[ad.sellerId] || []
    if (!subs.some((s) => s.allowedCategories.includes(ad.category))) {
      toast({ title: "No valid subscription for this category", variant: "destructive" })
      return
    }
    setProcessing(true)
    try {
      const now = new Date()
      const expires = new Date()
      expires.setMonth(expires.getMonth() + SUBSCRIPTION_DURATION_MONTHS)
      await updateDoc(doc(db, "advertisements", ad.id), {
        status: "active",
        isApproved: true,
        approvedBy: user.id,
        approvedAt: now,
        activatedAt: now,
        expiresAt: expires,
        updatedAt: now,
      })
      toast({ title: "Advertisement approved!" })
      setAllAds((prev) => prev.map((a) => a.id === ad.id ? { ...a, status: "active", isApproved: true } : a))
    } catch (e) {
      toast({ title: "Failed to approve", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const openReject = (ad: Advertisement) => {
    setSelectedAd(ad)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  const handleReject = async () => {
    if (!selectedAd || !rejectionReason.trim()) return
    setProcessing(true)
    try {
      await updateDoc(doc(db, "advertisements", selectedAd.id), {
        status: "rejected",
        isApproved: false,
        rejectionReason,
        updatedAt: new Date(),
      })
      toast({ title: "Advertisement rejected" })
      setAllAds((prev) => prev.map((a) => a.id === selectedAd.id ? { ...a, status: "rejected", rejectionReason } : a))
      setShowRejectDialog(false)
    } catch (e) {
      toast({ title: "Failed to reject", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handleRemove = async (ad: Advertisement) => {
    if (!confirm(`Remove "${ad.title}"? This will hide it from all views.`)) return
    setProcessing(true)
    try {
      await updateDoc(doc(db, "advertisements", ad.id), {
        status: "removed",
        removedBy: user?.id,
        removedAt: new Date(),
        updatedAt: new Date(),
      })
      toast({ title: "Advertisement removed" })
      setAllAds((prev) => prev.filter((a) => a.id !== ad.id))
    } catch (e) {
      toast({ title: "Failed to remove", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const tabs: { key: TabKey; label: string; statuses: string[] }[] = [
    { key: "pending",     label: "Pending",     statuses: ["pending"] },
    { key: "active",      label: "Active",      statuses: ["active", "approved"] },
    { key: "deactivated", label: "Deactivated", statuses: ["deactivated", "expired", "rejected"] },
    { key: "all",         label: "All",         statuses: [] },
  ]

  const filtered = allAds.filter((a) => {
    const tab = tabs.find((t) => t.key === activeTab)!
    return tab.statuses.length === 0 || tab.statuses.includes(a.status)
  })

  const countFor = (key: TabKey) => {
    const tab = tabs.find((t) => t.key === key)!
    return tab.statuses.length === 0 ? allAds.length : allAds.filter((a) => tab.statuses.includes(a.status)).length
  }

  if (!user || user.role !== "admin") return null

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 min-h-screen bg-[#eef3f0]/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#082537]">Advertisement Management</h1>
            <p className="text-sm text-[#082537]/60 mt-0.5">Review, approve, reject, or remove seller advertisements</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#082537]/10 text-sm font-medium text-[#082537]/70 hover:bg-[#082537]/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {tabs.map((t) => (
            <div key={t.key} className="bg-white rounded-2xl border border-[#082537]/8 p-4 text-center">
              <p className={`text-2xl font-bold ${
                t.key === "pending" ? "text-amber-600" :
                t.key === "active" ? "text-green-600" :
                t.key === "deactivated" ? "text-gray-500" :
                "text-[#082537]"
              }`}>{countFor(t.key)}</p>
              <p className="text-xs text-[#082537]/50 mt-1 capitalize">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.key
                  ? "bg-[#082537] text-white shadow"
                  : "bg-white text-[#082537]/60 border border-[#082537]/10 hover:border-[#082537]/20"
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === t.key ? "bg-white/20" : "bg-[#082537]/5 text-[#082537]/40"}`}>
                {countFor(t.key)}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-16 text-center">
            <Camera className="w-12 h-12 text-[#082537]/15 mx-auto mb-3" />
            <p className="text-[#082537]/40 font-medium">No advertisements in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                seller={sellerProfiles[ad.sellerId]}
                sellerSubs={sellerSubscriptions[ad.sellerId] || []}
                onApprove={handleApprove}
                onReject={openReject}
                onRemove={handleRemove}
                processing={processing}
              />
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="font-bold text-[#082537] mb-1">Reject Advertisement</h3>
              <p className="text-sm text-[#082537]/60 mb-4">"{selectedAd?.title}" — provide a reason for the seller:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Image quality too low, misleading description..."
                className="w-full border border-[#082537]/15 rounded-xl px-4 py-3 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
                >
                  {processing ? "Rejecting..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="flex-1 border border-[#082537]/15 text-[#082537] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#082537]/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
