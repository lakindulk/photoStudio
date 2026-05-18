"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, User as UserIcon, Menu, X, ShoppingBag, Camera } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function Header({ forceWhite = false }: { forceWhite?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isWhite = scrolled || forceWhite

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/about", label: "About Us" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isWhite
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-[#082537]/8"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group w-1/4">
            <Camera className="w-5 h-5 text-[#788C59] group-hover:scale-110 transition-transform" />
            <span className={cn(
              "text-2xl font-black tracking-tighter transition-colors",
              scrolled ? "text-[#082537]" : "text-[#082537]"
            )}>
              malka<sup className="text-xs font-medium ml-0.5 text-[#788C59]">™</sup>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center gap-10 w-2/4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[14px] font-semibold relative group py-1.5 transition-colors",
                  isWhite ? "text-[#082537]/80 hover:text-[#082537]" : "text-[#082537] hover:text-[#788C59]"
                )}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 bg-[#788C59] w-0 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center justify-end gap-5 w-1/4">
            <button className="text-[#082537]/70 hover:text-[#788C59] transition-colors">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#082537] bg-[#788C59]/10 hover:bg-[#788C59]/20 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#788C59]" />
              Marketplace
            </Link>
            {user && (
              <Link
                href={user.role === "admin" ? "/admin" : "/seller"}
                className="w-9 h-9 rounded-xl bg-[#082537] flex items-center justify-center hover:bg-[#082537]/80 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-white" />
              </Link>
            )}
            {!user && (
              <Link
                href="/seller/login"
                className="text-sm font-bold text-white bg-[#082537] px-4 py-2 rounded-xl hover:bg-[#082537]/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center gap-3 w-1/4 justify-end">
            {user && (
              <Link href={user.role === "admin" ? "/admin" : "/seller"} className="text-[#082537]">
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#082537]">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-[#082537]/8 shadow-xl py-5 px-5 flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-semibold text-[#082537] py-2.5 px-4 rounded-xl hover:bg-[#eef3f0] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#082537]/8 flex items-center gap-3 px-4">
              <button className="text-[#082537]"><Search className="w-5 h-5" /></button>
              {!user && (
                <Link
                  href="/seller/login"
                  className="ml-auto text-sm font-bold text-white bg-[#082537] px-4 py-2 rounded-xl"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
