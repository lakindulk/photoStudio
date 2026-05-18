"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import {
  Camera, ShoppingCart, Eye, TrendingUp, CalendarDays, AlertCircle,
  Megaphone, ShoppingBag, ArrowRight, Plus, CreditCard,
} from "lucide-react"
import Link from "next/link"

interface SellerStats {
  totalAds: number
  activeAds: number
  totalBookings: number
  pendingBookings: number
  totalViews: number
  monthlyRevenue: number
  activeSubscriptions: number
  marketplaceListings: number
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SellerStats>({
    totalAds: 0,
    activeAds: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalViews: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    marketplaceListings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      try {
        const [adsSnap, bookingsSnap, subsSnap, mktSnap] = await Promise.all([
          getDocs(query(collection(db, "advertisements"), where("sellerId", "==", user.id))),
          getDocs(query(collection(db, "bookings"), where("sellerId", "==", user.id))),
          getDocs(query(collection(db, "subscriptions"), where("sellerId", "==", user.id), where("status", "==", "active"))),
          getDocs(query(collection(db, "marketplaceItems"), where("sellerId", "==", user.id))),
        ])

        const ads = adsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const now = new Date()

        const activeAds = ads.filter((a: any) => a.status === "active").length
        const pendingBookings = bookings.filter((b: any) => b.status === "waiting").length
        const activeSubs = subsSnap.docs.filter((d) => {
          const exp = d.data().expiresAt?.toDate?.()
          return !exp || exp > now
        }).length

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const monthlyRevenue = bookings
          .filter((b: any) => {
            const d = b.createdAt?.toDate?.() || new Date(b.createdAt)
            return b.status === "paid" && d >= thirtyDaysAgo
          })
          .reduce((s: number, b: any) => s + (b.totalAmount || 0), 0)

        setStats({
          totalAds: ads.length,
          activeAds,
          totalBookings: bookings.length,
          pendingBookings,
          totalViews: ads.reduce((s: number, a: any) => s + (a.views || 0), 0),
          monthlyRevenue,
          activeSubscriptions: activeSubs,
          marketplaceListings: mktSnap.size,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  const statCards = [
    {
      label: "Active Ads",
      value: stats.activeAds,
      sub: `${stats.totalAds} total`,
      icon: Megaphone,
      color: "#788C59",
      href: "/seller/ads",
    },
    {
      label: "Bookings",
      value: stats.totalBookings,
      sub: `${stats.pendingBookings} pending`,
      icon: ShoppingCart,
      color: "#254A5A",
      href: "/seller/bookings",
    },
    {
      label: "Total Views",
      value: stats.totalViews,
      sub: "All time",
      icon: Eye,
      color: "#082537",
      href: "/seller/ads",
    },
    {
      label: "Revenue",
      value: `LKR ${stats.monthlyRevenue.toLocaleString()}`,
      sub: "Last 30 days",
      icon: TrendingUp,
      color: "#788C59",
      href: "/seller/bookings",
    },
  ]

  const quickActions = [
    { label: "New Advertisement", desc: "Add a new service listing", icon: Camera, href: "/seller/ads/create", color: "#082537" },
    { label: "Event Calendar", desc: "Manage your schedule", icon: CalendarDays, href: "/seller/calendar", color: "#788C59" },
    { label: "Sell / Rent Items", desc: "List your photography gear", icon: ShoppingBag, href: "/seller/marketplace", color: "#254A5A" },
    { label: "New Subscription", desc: "Upgrade or renew your plan", icon: CreditCard, href: "/seller/subscriptions/purchase", color: "#788C59" },
  ]

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/30 p-4 md:p-8">
        {/* Header */}
        <div className="mb-7 animate-fade-in-down">
          <h1 className="text-2xl md:text-3xl font-bold text-[#082537] tracking-tight">
            Welcome back{(user as any)?.name ? `, ${(user as any).name}` : ""}
          </h1>
          <p className="text-sm text-[#082537]/50 mt-1">Here's an overview of your business</p>
        </div>

        {/* Account pending alert */}
        {user && !(user as any).isApproved && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 text-sm">Account Pending Approval</p>
              <p className="text-xs text-amber-600/80 mt-0.5">
                Your account is under review. You can create ads and manage your profile once approved.
              </p>
            </div>
          </div>
        )}

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-28 shimmer-bg animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="bg-white rounded-2xl border border-[#082537]/8 p-5 hover:shadow-lg hover:-translate-y-1 transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${card.color}15` }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: card.color }} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#082537]/20 group-hover:text-[#082537]/50 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <p className="text-2xl font-bold text-[#082537]">{card.value}</p>
                  <p className="text-xs text-[#082537]/40 mt-0.5">{card.label}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.sub}</p>
                  <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full mt-3" style={{ backgroundColor: card.color }} />
                </Link>
              )
            })}
          </div>
        )}

        {/* Subscription + Marketplace stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
          <div className="bg-[#082537] text-white rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-white/60" />
              <Link href="/seller/subscriptions" className="text-xs text-white/50 hover:text-white/80 transition-colors">
                Manage →
              </Link>
            </div>
            <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
            <p className="text-white/60 text-sm mt-0.5">Active Subscription{stats.activeSubscriptions !== 1 ? "s" : ""}</p>
            {stats.activeSubscriptions === 0 && (
              <Link
                href="/seller/subscriptions/purchase"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#788C59] hover:text-[#788C59]/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Get a plan
              </Link>
            )}
          </div>
          <div className="bg-white border border-[#082537]/8 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-5 h-5 text-[#082537]/40" />
              <Link href="/seller/marketplace" className="text-xs text-[#082537]/40 hover:text-[#082537]/70 transition-colors">
                Manage →
              </Link>
            </div>
            <p className="text-3xl font-bold text-[#082537]">{stats.marketplaceListings}</p>
            <p className="text-[#082537]/50 text-sm mt-0.5">Marketplace Listings</p>
            <Link
              href="/seller/marketplace/create"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#788C59] hover:text-[#788C59]/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New listing
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "420ms" }}>
          <h2 className="text-sm font-bold text-[#082537]/50 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 bg-white border border-[#082537]/8 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${480 + i * 60}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${action.color}15` }}>
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" style={{ color: action.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#082537] truncate group-hover:text-[#788C59] transition-colors duration-300">{action.label}</p>
                    <p className="text-xs text-[#082537]/40 truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#082537]/20 group-hover:text-[#788C59] ml-auto flex-shrink-0 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-[#788C59]/8 border border-[#788C59]/15 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
          <CalendarDays className="w-5 h-5 text-[#788C59] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#082537]">Free Event Calendar included</p>
            <p className="text-xs text-[#082537]/60 mt-0.5">
              Use the Event Calendar to track your shoots, client meetings, and deliveries.{" "}
              <Link href="/seller/calendar" className="text-[#788C59] font-medium hover:underline">Open calendar →</Link>
            </p>
          </div>
        </div>
      </div>
    </SellerLayout>
  )
}
