"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function SellerProfilePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user && user.role === "seller") {
      router.replace("/seller/profile/edit")
    }
  }, [user, router])

  return null
}
