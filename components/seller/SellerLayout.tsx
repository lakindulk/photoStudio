"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { SellerSidebar } from "./SellerSidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SellerLayoutProps {
  children: React.ReactNode
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const { user, loading, isSeller } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isSeller)) {
      router.push("/seller/login")
    }
  }, [user, loading, isSeller, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !isSeller) {
    return null
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <SellerSidebar />
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
