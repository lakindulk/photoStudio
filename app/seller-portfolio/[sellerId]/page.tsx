"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PortfolioDisplay } from "@/components/PortfolioDisplay"
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Youtube } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Advertisement, SellerProfile } from "@/types"
import { CATEGORY_LABELS } from "@/lib/constants"

export default function SellerPortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!db || !params.sellerId) return

      try {
        // Fetch seller profile
        const sellerQuery = query(
          collection(db, "sellerProfiles"),
          where("userId", "==", params.sellerId as string)
        )
        const sellerSnapshot = await getDocs(sellerQuery)
        
        if (sellerSnapshot.empty) {
          router.push("/")
          return
        }

        const sellerData = {
          id: sellerSnapshot.docs[0].id,
          ...sellerSnapshot.docs[0].data(),
          createdAt: sellerSnapshot.docs[0].data().createdAt?.toDate(),
          updatedAt: sellerSnapshot.docs[0].data().updatedAt?.toDate(),
        } as SellerProfile
        setSeller(sellerData)

        // Fetch seller's active ads
        const now = new Date()
        const adsQuery = query(
          collection(db, "advertisements"),
          where("sellerId", "==", params.sellerId as string),
          where("status", "==", "active"),
          where("isApproved", "==", true),
          where("expiresAt", ">", now)
        )
        const adsSnapshot = await getDocs(adsQuery)
        const adsData = adsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          activatedAt: doc.data().activatedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
          approvedAt: doc.data().approvedAt?.toDate(),
        })) as Advertisement[]
        setAds(adsData)
      } catch (error) {
        console.error("Error fetching seller data:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchSellerData()
  }, [params.sellerId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-800 rounded-lg" />
            <div className="h-96 bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Seller Header */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {seller.profileImage && (
                <div className="relative h-40 w-40 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image
                    src={seller.profileImage}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{seller.name}</h1>
                  {seller.description && (
                    <p className="text-gray-300 text-lg">{seller.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${seller.contactNo}`} className="hover:text-white transition-colors">
                      {seller.contactNo}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${seller.email}`} className="hover:text-white transition-colors">
                      {seller.email}
                    </a>
                  </div>
                  {!seller.hideAddress && seller.address && (
                    <div className="flex items-start gap-3 text-gray-300 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <span>{seller.address}</span>
                    </div>
                  )}
                </div>

                {seller.socialMedia && (
                  <div className="flex gap-4 pt-2">
                    {seller.socialMedia.facebook && (
                      <a
                        href={seller.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                    {seller.socialMedia.instagram && (
                      <a
                        href={seller.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {seller.socialMedia.youtube && (
                      <a
                        href={seller.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Youtube className="w-6 h-6" />
                      </a>
                    )}
                    {seller.socialMedia.website && (
                      <a
                        href={seller.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Globe className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        {seller.portfolioItems && seller.portfolioItems.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800 mb-8">
            <CardContent className="p-6">
              <PortfolioDisplay
                items={seller.portfolioItems}
                portfolioType={seller.portfolioType || "type1"}
                title="Portfolio"
              />
            </CardContent>
          </Card>
        )}

        {/* Active Advertisements */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Active Advertisements</h2>
          {ads.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400">No active advertisements at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Link key={ad.id} href={`/ad/${ad.id}`}>
                  <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 group cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gray-800">
                        {ad.coverMedia && (
                          <Image
                            src={ad.coverMedia}
                            alt={ad.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-600 text-white">Active</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <Badge variant="outline" className="mb-2 text-gray-300 border-gray-600">
                          {CATEGORY_LABELS[ad.category]}
                        </Badge>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-200 transition-colors">
                          {ad.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ad.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{ad.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

