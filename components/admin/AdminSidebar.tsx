"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Camera,
  ShoppingCart,
  CreditCard,
  UserPlus,
  MessageCircle,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Package,
  ShoppingBag,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true, section: "main" },
  { name: "Sellers", href: "/admin/sellers", icon: Users, section: "main" },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, section: "main" },
  { name: "Ad Approvals", href: "/admin/ads", icon: Camera, section: "main" },
  { name: "Marketplace Items", href: "/admin/marketplace", icon: ShoppingBag, section: "main" },
  { name: "Bookings", href: "/admin/bookings", icon: ShoppingCart, section: "main" },
  { name: "Registration Links", href: "/admin/registration", icon: UserPlus, section: "tools" },
  { name: "WhatsApp Test", href: "/admin/whatsapp-test", icon: MessageCircle, section: "tools" },
  { name: "SMS Test", href: "/admin/sms-test", icon: MessageSquare, section: "tools" },
]

export function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const mainNav = navigation.filter((i) => i.section === "main")
  const toolsNav = navigation.filter((i) => i.section === "tools")

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card border-border/20 text-foreground shadow-sm rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#082537] transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 group">
              <Shield className="w-5 h-5 text-[#788C59]" />
              <span className="text-white font-black tracking-tight text-lg">malka<sup className="text-xs font-medium">™</sup></span>
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">admin</span>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold px-3 pb-1.5">Management</p>
            {mainNav.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                    active
                      ? "bg-[#788C59] text-white shadow-md"
                      : "text-white/50 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                  {item.name}
                </Link>
              )
            })}

            <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold px-3 pb-1.5 pt-4">Tools</p>
            {toolsNav.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                    active
                      ? "bg-[#788C59] text-white shadow-md"
                      : "text-white/50 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "text-white/40 group-hover:text-white/70")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-sm h-10"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
