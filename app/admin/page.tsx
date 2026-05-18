"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Users, Camera, ShoppingCart, CreditCard, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import { updateExpiredSubscriptions, deactivateAdsWithExpiredSubscriptions } from "@/lib/subscriptionUtils"
import Link from "next/link"

interface DashboardStats {
  totalSellers: number; activeSellers: number; totalServices: number; activeServices: number
  totalBookings: number; pendingBookings: number; totalRevenue: number; monthlyRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSellers: 0, activeSellers: 0, totalServices: 0, activeServices: 0,
    totalBookings: 0, pendingBookings: 0, totalRevenue: 0, monthlyRevenue: 0,
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

        const [sellersSnap, servicesSnap, bookingsSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "seller"))),
          getDocs(collection(db, "advertisements")),
          getDocs(collection(db, "bookings")),
        ])

        const sellers = sellersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const services = servicesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        setStats({
          totalSellers: sellers.length,
          activeSellers: sellers.filter((s: any) => s.isApproved).length,
          totalServices: services.length,
          activeServices: services.filter((s: any) => s.isActive).length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === "waiting").length,
          totalRevenue: bookings.filter((b: any) => b.status === "paid").reduce((s: number, b: any) => s + (b.totalAmount || 0), 0),
          monthlyRevenue: bookings.filter((b: any) => {
            const d = b.createdAt?.toDate?.() || new Date(b.createdAt)
            return b.status === "paid" && d >= thirtyDaysAgo
          }).reduce((s: number, b: any) => s + (b.totalAmount || 0), 0),
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: "Total Sellers", value: stats.totalSellers, subtitle: `${stats.activeSellers} active`, icon: Users, color: "#082537", href: "/admin/sellers" },
    { title: "Total Services", value: stats.totalServices, subtitle: `${stats.activeServices} active`, icon: Camera, color: "#788C59", href: "/admin/ads" },
    { title: "Total Bookings", value: stats.totalBookings, subtitle: `${stats.pendingBookings} pending`, icon: ShoppingCart, color: "#254A5A", href: "/admin/bookings" },
    { title: "Total Revenue", value: `LKR ${stats.totalRevenue.toLocaleString()}`, subtitle: `LKR ${stats.monthlyRevenue.toLocaleString()} this month`, icon: CreditCard, color: "#788C59", href: "/admin/bookings" },
  ]

  const quickActions = [
    { label: "Review Pending Ads", desc: "Approve or reject submitted ads", href: "/admin/ads" },
    { label: "Manage Sellers", desc: "Approve or manage seller accounts", href: "/admin/sellers" },
    { label: "Review Bookings", desc: "Check bookings awaiting approval", href: "/admin/bookings" },
    { label: "Subscriptions", desc: "Review and manage subscriptions", href: "/admin/subscriptions" },
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#eef3f0]/30 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-2xl md:text-3xl font-black text-[#082537] tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-[#082537]/45 mt-1">Platform overview and management</p>
        </div>

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
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${card.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#082537]/20 group-hover:text-[#082537]/50 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <p className="text-2xl font-black text-[#082537]">{card.value}</p>
                  <p className="text-xs text-[#082537]/40 mt-0.5 font-bold uppercase tracking-widest">{card.title}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: card.color }}>{card.subtitle}</p>
                  <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full mt-3" style={{ backgroundColor: card.color }} />
                </Link>
              )
            })}
          </div>
        )}

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border border-[#082537]/8 rounded-3xl overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: "320ms" }}>
            <div className="px-6 py-5 border-b border-[#082537]/6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#788C59]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#788C59]" />
              </div>
              <h2 className="font-black text-[#082537] text-base">Recent Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { color: "#788C59", label: "New seller registration", time: "2 hours ago" },
                { color: "#254A5A", label: "New booking received", time: "4 hours ago" },
                { color: "#788C59", label: "Payment completed", time: "6 hours ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group animate-fade-in" style={{ animationDelay: `${400 + i * 60}ms` }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 group-hover:scale-150 transition-transform duration-300" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#082537]">{item.label}</p>
                    <p className="text-xs text-[#082537]/35 font-medium mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#082537]/8 rounded-3xl overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: "380ms" }}>
            <div className="px-6 py-5 border-b border-[#082537]/6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#082537]/8 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#082537]/60" />
              </div>
              <h2 className="font-black text-[#082537] text-base">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {quickActions.map((action, i) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#082537]/4 transition-all group border border-transparent hover:border-[#082537]/8 animate-fade-in"
                  style={{ animationDelay: `${460 + i * 50}ms` }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#082537] group-hover:text-[#788C59] transition-colors duration-200">{action.label}</p>
                    <p className="text-xs text-[#082537]/40 mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#082537]/20 group-hover:text-[#788C59] group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
