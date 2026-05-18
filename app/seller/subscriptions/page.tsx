"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { ALL_SUBSCRIPTION_PACKAGES, CATEGORY_LABELS } from "@/lib/constants"
import { Plus, CheckCircle, Clock, XCircle, Calendar, Package } from "lucide-react"
import type { Subscription } from "@/types"

type TabKey = "all" | "active" | "pending" | "expired" | "rejected"

const STATUS_PILL: Record<string, { style: string; label: string; icon: React.ElementType }> = {
  active:   { style: "bg-[#788C59]/15 text-[#788C59]",  label: "Active",           icon: CheckCircle },
  pending:  { style: "bg-amber-100 text-amber-700",      label: "Pending Approval", icon: Clock },
  rejected: { style: "bg-red-100 text-red-700",          label: "Rejected",         icon: XCircle },
  expired:  { style: "bg-gray-100 text-gray-500",        label: "Expired",          icon: XCircle },
}

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("all")

  useEffect(() => {
    if (!user || !db) return
    const fetchSubscriptions = async () => {
      try {
        const snap = await getDocs(query(collection(db, "subscriptions"), where("sellerId", "==", user.id), orderBy("createdAt", "desc")))
        setSubscriptions(snap.docs.map((d) => ({
          id: d.id, ...d.data(),
          submittedAt: d.data().submittedAt?.toDate(),
          approvedAt: d.data().approvedAt?.toDate(),
          rejectedAt: d.data().rejectedAt?.toDate(),
          activatedAt: d.data().activatedAt?.toDate(),
          expiresAt: d.data().expiresAt?.toDate(),
          createdAt: d.data().createdAt?.toDate(),
          updatedAt: d.data().updatedAt?.toDate(),
        })) as Subscription[])
      } catch (error) {
        console.error("Error fetching subscriptions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [user])

  const now = new Date()
  const grouped: Record<TabKey, Subscription[]> = {
    all:      subscriptions,
    active:   subscriptions.filter((s) => s.status === "active" && s.expiresAt && s.expiresAt > now),
    pending:  subscriptions.filter((s) => s.status === "pending"),
    expired:  subscriptions.filter((s) => s.status === "expired" || (s.expiresAt && s.expiresAt <= now && s.status !== "pending" && s.status !== "rejected")),
    rejected: subscriptions.filter((s) => s.status === "rejected"),
  }

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "all",      label: "All",      icon: Package },
    { key: "active",   label: "Active",   icon: CheckCircle },
    { key: "pending",  label: "Pending",  icon: Clock },
    { key: "expired",  label: "Expired",  icon: Calendar },
    { key: "rejected", label: "Rejected", icon: XCircle },
  ]

  const SubCard = ({ sub, i }: { sub: Subscription; i: number }) => {
    const pkg = ALL_SUBSCRIPTION_PACKAGES.find((p) => p.type === sub.packageType)
    const daysLeft = sub.expiresAt ? Math.ceil((sub.expiresAt.getTime() - now.getTime()) / 86400000) : 0
    const statusKey = (sub.status === "active" && sub.expiresAt && sub.expiresAt > now) ? "active" : sub.status === "pending" ? "pending" : sub.status === "rejected" ? "rejected" : "expired"
    const { style, label, icon: Icon } = STATUS_PILL[statusKey] || STATUS_PILL.expired

    return (
      <div
        className="bg-white border border-[#082537]/8 rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-[#082537]">{pkg?.name || sub.packageType}</h3>
              <p className="text-sm font-bold text-[#788C59] mt-0.5">LKR {sub.amount.toLocaleString()}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${style}`}>
              <Icon className="w-3 h-3" />
              {label}
            </span>
          </div>

          {/* Allowed categories */}
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#082537]/35 mb-2">Allowed Services</p>
            <div className="flex flex-wrap gap-1.5">
              {sub.allowedCategories.map((cat) => (
                <span key={cat} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#082537]/6 text-[#082537]/60">
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2 border-t border-[#082537]/6 pt-4">
            {sub.submittedAt && (
              <div className="flex items-center gap-2 text-xs text-[#082537]/45 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Submitted {sub.submittedAt.toLocaleDateString()}
              </div>
            )}
            {sub.approvedAt && (
              <div className="flex items-center gap-2 text-xs text-[#788C59] font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Approved {sub.approvedAt.toLocaleDateString()}
              </div>
            )}
            {sub.expiresAt && sub.status === "active" && (
              <div className="flex items-center gap-2 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#082537]/45" />
                <span className="text-[#082537]/45">Expires {sub.expiresAt.toLocaleDateString()}</span>
                {daysLeft > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${daysLeft <= 7 ? "bg-amber-100 text-amber-700" : "bg-[#788C59]/12 text-[#788C59]"}`}>
                    {daysLeft}d left
                  </span>
                )}
              </div>
            )}
            {sub.rejectionReason && (
              <div className="bg-red-50 border border-red-200/60 rounded-xl p-3 mt-2">
                <p className="text-xs text-red-700"><strong>Reason:</strong> {sub.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/30 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-down">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#082537] tracking-tight">Subscriptions</h1>
            <p className="text-sm text-[#082537]/45 mt-1">Manage your subscription packages</p>
          </div>
          <button
            onClick={() => router.push("/seller/subscriptions/purchase")}
            className="inline-flex items-center gap-2 bg-[#082537] text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-[#082537]/85 transition-all hover:-translate-y-0.5 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-[#082537]/8 h-48 shimmer-bg animate-fade-in" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in" style={{ animationDelay: "60ms" }}>
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeTab === key
                      ? "bg-[#082537] text-white shadow-sm"
                      : "bg-white border border-[#082537]/10 text-[#082537]/50 hover:border-[#082537]/20 hover:text-[#082537]/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === key ? "bg-white/20 text-white" : "bg-[#082537]/8 text-[#082537]/50"}`}>
                    {grouped[key].length}
                  </span>
                </button>
              ))}
            </div>

            {/* Cards */}
            {grouped[activeTab].length === 0 ? (
              <div className="text-center py-24 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-[#082537]/5 flex items-center justify-center mx-auto mb-5">
                  <Package className="w-7 h-7 text-[#082537]/20" />
                </div>
                <p className="text-[#082537]/35 text-lg font-medium">{activeTab === "all" ? "No subscriptions yet." : `No ${activeTab} subscriptions.`}</p>
                {(activeTab === "active" || activeTab === "all") && (
                  <button
                    onClick={() => router.push("/seller/subscriptions/purchase")}
                    className="inline-flex items-center gap-2 mt-5 bg-[#082537] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#082537]/85 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" /> Purchase Subscription
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {grouped[activeTab].map((sub, i) => <SubCard key={sub.id} sub={sub} i={i} />)}
              </div>
            )}
          </>
        )}
      </div>
    </SellerLayout>
  )
}
