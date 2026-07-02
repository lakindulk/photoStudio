"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { AdminLayout } from "@/components/admin/AdminLayout"
import {
  Users, Camera, ShoppingCart, CreditCard, ArrowRight,
  Clock, CheckCircle, AlertCircle, TrendingUp, Ticket,
} from "lucide-react"
import { updateExpiredSubscriptions, deactivateAdsWithExpiredSubscriptions } from "@/lib/subscriptionUtils"
import Link from "next/link"

interface DashboardStats {
  totalSellers: number
  activeSellers: number
  pendingSellers: number
  totalAds: number
  activeAds: number
  pendingAds: number
  totalBookings: number
  pendingBookings: number
  totalRevenue: number
  monthlyRevenue: number
  pendingSubscriptions: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSellers: 0, activeSellers: 0, pendingSellers: 0,
    totalAds: 0, activeAds: 0, pendingAds: 0,
    totalBookings: 0, pendingBookings: 0,
    totalRevenue: 0, monthlyRevenue: 0,
    pendingSubscriptions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!db) { setLoading(false); return }
      try {
        const { updated: subsUpdated } = await updateExpiredSubscriptions()
        if (subsUpdated > 0) console.log(`Updated ${subsUpdated} expired subscriptions`)
        const { deactivated } = await deactivateAdsWithExpiredSubscriptions()
        if (deactivated > 0) console.log(`Deactivated ${deactivated} ads`)

        const [sellersSnap, adsSnap, bookingsSnap, subsSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "seller"))),
          getDocs(collection(db, "advertisements")),
          getDocs(collection(db, "bookings")),
          getDocs(query(collection(db, "subscriptions"), where("status", "==", "pending"))),
        ])

        const sellers = sellersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const ads = adsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        setStats({
          totalSellers: sellers.length,
          activeSellers: sellers.filter((s: any) => s.isApproved).length,
          pendingSellers: sellers.filter((s: any) => !s.isApproved).length,
          totalAds: ads.length,
          activeAds: ads.filter((s: any) => s.status === "active").length,
          pendingAds: ads.filter((s: any) => s.status === "pending" || s.hasEditsPending).length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === "waiting").length,
          totalRevenue: bookings.filter((b: any) => b.status === "paid").reduce((s: number, b: any) => s + (b.totalAmount || 0), 0),
          monthlyRevenue: bookings.filter((b: any) => {
            const d = b.createdAt?.toDate?.() || new Date(b.createdAt)
            return b.status === "paid" && d >= thirtyDaysAgo
          }).reduce((s: number, b: any) => s + (b.totalAmount || 0), 0),
          pendingSubscriptions: subsSnap.size,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  const statCards = [
    {
      title: "Sellers",
      value: stats.totalSellers,
      sub: `${stats.activeSellers} active`,
      badge: stats.pendingSellers > 0 ? `${stats.pendingSellers} pending` : null,
      icon: Users, color: "#082537", href: "/admin/sellers",
    },
    {
      title: "Advertisements",
      value: stats.totalAds,
      sub: `${stats.activeAds} active`,
      badge: stats.pendingAds > 0 ? `${stats.pendingAds} to review` : null,
      icon: Camera, color: "#788C59", href: "/admin/ads",
    },
    {
      title: "Bookings",
      value: stats.totalBookings,
      sub: `${stats.pendingBookings} pending`,
      badge: stats.pendingBookings > 0 ? `${stats.pendingBookings} waiting` : null,
      icon: ShoppingCart, color: "#254A5A", href: "/admin/bookings",
    },
    {
      title: "Revenue",
      value: `LKR ${stats.totalRevenue.toLocaleString()}`,
      sub: `LKR ${stats.monthlyRevenue.toLocaleString()} this month`,
      badge: null,
      icon: CreditCard, color: "#788C59", href: "/admin/bookings",
    },
  ]

  const pendingItems = [
    { label: "Seller accounts awaiting approval", count: stats.pendingSellers, href: "/admin/sellers", color: "#082537" },
    { label: "Ads awaiting review", count: stats.pendingAds, href: "/admin/ads", color: "#788C59" },
    { label: "Subscriptions to verify", count: stats.pendingSubscriptions, href: "/admin/subscriptions", color: "#254A5A" },
    { label: "Bookings awaiting response", count: stats.pendingBookings, href: "/admin/bookings", color: "#788C59" },
  ].filter((i) => i.count > 0)

  const navCards = [
    { label: "Sellers", desc: "Manage & approve seller accounts", icon: Users, href: "/admin/sellers", color: "#082537" },
    { label: "Ad Approvals", desc: "Review submitted advertisements", icon: Camera, href: "/admin/ads", color: "#788C59" },
    { label: "Subscriptions", desc: "Verify payment receipts", icon: CreditCard, href: "/admin/subscriptions", color: "#254A5A" },
    { label: "Bookings", desc: "Monitor all platform bookings", icon: ShoppingCart, href: "/admin/bookings", color: "#082537" },
    { label: "VIP Codes", desc: "Create and manage promo codes", icon: Ticket, href: "/admin/vip-codes", color: "#788C59" },
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#eef3f0]/30 p-4 md:p-8">

        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <p className="text-xs font-bold uppercase tracking-widest text-[#082537]/35 mb-1">{greeting()}</p>
          <h1 className="text-2xl md:text-3xl font-black text-[#082537] tracking-tight">
            {(user as any)?.name ? (user as any).name : "Admin Dashboard"}
          </h1>
          <p className="text-sm text-[#082537]/40 mt-1">Platform overview — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {/* Pending action banner */}
        {!loading && pendingItems.length > 0 && (
          <div className="mb-7 bg-white border border-amber-200/60 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-bold text-[#082537]">Action Required</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {pendingItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between gap-3 bg-[#eef3f0]/60 hover:bg-[#eef3f0] rounded-xl px-3.5 py-2.5 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                    <p className="text-xs font-medium text-[#082537]/70 truncate">{item.label}</p>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0 text-white" style={{ backgroundColor: item.color }}>
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && pendingItems.length === 0 && (
          <div className="mb-7 flex items-center gap-3 bg-[#788C59]/8 border border-[#788C59]/20 rounded-2xl px-4 py-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <CheckCircle className="w-4 h-4 text-[#788C59]" />
            <p className="text-sm font-medium text-[#082537]/60">All clear — no pending actions.</p>
          </div>
        )}

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#082537]/8 h-32 shimmer-bg animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="bg-white rounded-2xl border border-[#082537]/8 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${card.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200/60">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-[#082537]">{card.value}</p>
                  <p className="text-xs text-[#082537]/40 mt-0.5 font-bold uppercase tracking-widest">{card.title}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.sub}</p>
                  <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full mt-3" style={{ backgroundColor: card.color }} />
                </Link>
              )
            })}
          </div>
        )}

        {/* Revenue highlight */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <div className="bg-[#082537] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#788C59]" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Total Revenue</p>
            </div>
            <p className="text-3xl font-black">LKR {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">All time · from completed bookings</p>
          </div>
          <div className="bg-[#788C59] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-white/60" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">This Month</p>
            </div>
            <p className="text-3xl font-black">LKR {stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-white/60 text-xs mt-1">Last 30 days · paid bookings</p>
          </div>
        </div>

        {/* Nav cards */}
        <div className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#082537]/35 mb-3">Management</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {navCards.map((card, i) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="flex items-center gap-3 bg-white border border-[#082537]/8 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${540 + i * 50}ms` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${card.color}12` }}>
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6" style={{ color: card.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#082537] group-hover:text-[#788C59] transition-colors truncate">{card.label}</p>
                    <p className="text-xs text-[#082537]/35 truncate">{card.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#082537]/20 group-hover:text-[#788C59] ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-all duration-300" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
