"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { Plus, Edit, Eye, RefreshCw, AlertCircle, Megaphone, Clock, XCircle, Archive } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import type { Advertisement, Subscription } from "@/types"
import { CATEGORY_LABELS } from "@/lib/constants"
import { format } from "date-fns"

type TabKey = "active" | "pending" | "deactivated" | "expired"

export default function SellerAdsPage() {
  const { user } = useAuth()
  const [ads, setAds] = useState<Advertisement[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [reactivating, setReactivating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("active")

  useEffect(() => {
    const fetchData = async () => {
      if (!db || !user) return
      try {
        const [adsSnap, subsSnap] = await Promise.all([
          getDocs(query(collection(db, "advertisements"), where("sellerId", "==", user.id), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "subscriptions"), where("sellerId", "==", user.id), where("status", "==", "active"))),
        ])

        const adsData = adsSnap.docs.map((d) => ({
          id: d.id, ...d.data(),
          createdAt: d.data().createdAt?.toDate(),
          updatedAt: d.data().updatedAt?.toDate(),
          activatedAt: d.data().activatedAt?.toDate(),
          expiresAt: d.data().expiresAt?.toDate(),
          approvedAt: d.data().approvedAt?.toDate(),
        })) as Advertisement[]

        const subsData = subsSnap.docs.map((d) => ({
          id: d.id, ...d.data(),
          expiresAt: d.data().expiresAt?.toDate(),
        })) as Subscription[]

        setAds(adsData)
        setSubscriptions(subsData.filter((s) => s.expiresAt && s.expiresAt > new Date()))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const activeAds = ads.filter((ad) => ad.status === "active" && ad.isApproved)
  const pendingAds = ads.filter((ad) => ad.status === "pending" || (ad.status !== "active" && !ad.isApproved && ad.status !== "deactivated" && ad.status !== "expired"))
  const deactivatedAds = ads.filter((ad) => ad.status === "deactivated")
  const expiredAds = ads.filter((ad) => ad.status === "expired")

  const handleReactivate = async (ad: Advertisement) => {
    if (!db || !user) return
    const hasValidSub = subscriptions.some((sub) => sub.allowedCategories.includes(ad.category))
    if (!hasValidSub) {
      toast({ title: "Subscription Required", description: `You need an active subscription for ${CATEGORY_LABELS[ad.category]} to reactivate this ad`, variant: "destructive" })
      return
    }
    setReactivating(ad.id)
    try {
      await updateDoc(doc(db, "advertisements", ad.id), { status: "pending", updatedAt: new Date() })
      toast({ title: "Ad Reactivated", description: "Your ad has been submitted for admin approval" })
      window.location.reload()
    } catch {
      toast({ title: "Error", description: "Failed to reactivate ad", variant: "destructive" })
    } finally {
      setReactivating(null)
    }
  }

  const statusBadge = (ad: Advertisement) => {
    if (ad.status === "active" && ad.isApproved) return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#788C59]/15 text-[#788C59]">Active</span>
    if (ad.status === "pending") return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700">Pending</span>
    if (ad.status === "rejected") return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700">Rejected</span>
    if (ad.status === "expired") return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500">Expired</span>
    if (ad.status === "deactivated") return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500">Deactivated</span>
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500">{ad.status}</span>
  }

  const AdCard = ({ ad, i }: { ad: Advertisement; i: number }) => (
    <div
      className="bg-white border border-[#082537]/8 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:h-auto md:w-52 bg-[#082537]/5 flex-shrink-0 md:m-3 md:rounded-xl overflow-hidden">
          {ad.coverMedia ? (
            <Image src={ad.coverMedia} alt={ad.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Megaphone className="w-10 h-10 text-[#082537]/15" />
            </div>
          )}
        </div>
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#082537] mb-1.5">{ad.title}</h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#082537]/6 text-[#082537]/60">
                {CATEGORY_LABELS[ad.category]}
              </span>
            </div>
            {statusBadge(ad)}
          </div>
          <p className="text-[#082537]/50 text-sm line-clamp-2 leading-relaxed">{ad.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#082537]/30 font-medium">
            <span>Created {format(ad.createdAt, "MMM dd, yyyy")}</span>
            {ad.activatedAt && <span>· Activated {format(ad.activatedAt, "MMM dd, yyyy")}</span>}
            {ad.expiresAt && <span>· Expires {format(ad.expiresAt, "MMM dd, yyyy")}</span>}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={`/ad/${ad.id}`}>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#082537]/10 text-[#082537]/60 text-xs font-bold hover:border-[#082537]/20 hover:bg-[#082537]/4 transition-all">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
            </Link>
            {(ad.status === "active" || ad.status === "deactivated") && (
              <Link href={`/seller/ads/${ad.id}/edit`}>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#082537]/10 text-[#082537]/60 text-xs font-bold hover:border-[#082537]/20 hover:bg-[#082537]/4 transition-all">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              </Link>
            )}
            {ad.status === "deactivated" && (
              <button
                onClick={() => handleReactivate(ad)}
                disabled={reactivating === ad.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#788C59]/30 text-[#788C59] text-xs font-bold hover:bg-[#788C59]/8 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reactivating === ad.id ? "animate-spin" : ""}`} />
                {reactivating === ad.id ? "Reactivating..." : "Reactivate"}
              </button>
            )}
          </div>
          {ad.status === "deactivated" && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                This ad was deactivated because your subscription expired.{" "}
                {subscriptions.some((sub) => sub.allowedCategories.includes(ad.category)) ? "You can reactivate it now." : "Purchase a subscription to reactivate."}
              </p>
            </div>
          )}
          {ad.rejectionReason && (
            <div className="bg-red-50 border border-red-200/60 rounded-xl p-3">
              <p className="text-xs text-red-700"><strong>Rejection Reason:</strong> {ad.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const tabs: { key: TabKey; label: string; count: number; icon: React.ElementType }[] = [
    { key: "active", label: "Active", count: activeAds.length, icon: Megaphone },
    { key: "pending", label: "Pending", count: pendingAds.length, icon: Clock },
    { key: "deactivated", label: "Deactivated", count: deactivatedAds.length, icon: XCircle },
    { key: "expired", label: "Expired", count: expiredAds.length, icon: Archive },
  ]

  const tabAds: Record<TabKey, Advertisement[]> = { active: activeAds, pending: pendingAds, deactivated: deactivatedAds, expired: expiredAds }

  if (!user || user.role !== "seller") return null

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/30 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-down">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#082537] tracking-tight">My Advertisements</h1>
            <p className="text-sm text-[#082537]/45 mt-1">{ads.length} total listing{ads.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/seller/ads/create">
            <button className="inline-flex items-center gap-2 bg-[#082537] text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-[#082537]/85 transition-all hover:-translate-y-0.5 shadow-sm text-sm">
              <Plus className="w-4 h-4" />
              New Ad
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-40 shimmer-bg animate-fade-in" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-32 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-[#082537]/5 flex items-center justify-center mx-auto mb-5">
              <Megaphone className="w-7 h-7 text-[#082537]/20" />
            </div>
            <p className="text-[#082537]/40 text-lg font-medium mb-4">No advertisements yet.</p>
            <Link href="/seller/ads/create">
              <button className="inline-flex items-center gap-2 bg-[#082537] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#082537]/85 transition-all text-sm">
                <Plus className="w-4 h-4" /> Create Your First Ad
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-in" style={{ animationDelay: "60ms" }}>
              {tabs.map(({ key, label, count, icon: Icon }) => (
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
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Ad list */}
            <div className="space-y-4">
              {activeTab === "deactivated" && deactivatedAds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">These ads were deactivated because your subscription expired. You can reactivate them with an active subscription.</p>
                </div>
              )}
              {tabAds[activeTab].length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                  <p className="text-[#082537]/30 font-medium">No {activeTab} advertisements.</p>
                </div>
              ) : (
                tabAds[activeTab].map((ad, i) => <AdCard key={ad.id} ad={ad} i={i} />)
              )}
            </div>
          </>
        )}
      </div>
    </SellerLayout>
  )
}
