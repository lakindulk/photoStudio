"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Youtube, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Advertisement, SellerProfile } from "@/types"
import { CATEGORY_LABELS } from "@/lib/constants"

export default function AdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdAndSeller = async () => {
      if (!db || !params.id) return

      try {
        // Fetch advertisement
        const adDoc = await getDoc(doc(db, "advertisements", params.id as string))
        
        if (!adDoc.exists()) {
          router.push("/")
          return
        }

        const adData = {
          id: adDoc.id,
          ...adDoc.data(),
          createdAt: adDoc.data().createdAt?.toDate(),
          updatedAt: adDoc.data().updatedAt?.toDate(),
          activatedAt: adDoc.data().activatedAt?.toDate(),
          expiresAt: adDoc.data().expiresAt?.toDate(),
          approvedAt: adDoc.data().approvedAt?.toDate(),
        } as Advertisement

        // Check if ad is active and approved
        if (adData.status !== "active" || !adData.isApproved) {
          router.push("/")
          return
        }

        // Check if ad is expired
        if (adData.expiresAt && adData.expiresAt < new Date()) {
          router.push("/")
          return
        }

        setAd(adData)

        // Fetch seller profile
        const sellerQuery = query(
          collection(db, "sellerProfiles"),
          where("userId", "==", adData.sellerId)
        )
        const sellerSnapshot = await getDocs(sellerQuery)
        
        if (!sellerSnapshot.empty) {
          const sellerData = {
            id: sellerSnapshot.docs[0].id,
            ...sellerSnapshot.docs[0].data(),
            createdAt: sellerSnapshot.docs[0].data().createdAt?.toDate(),
            updatedAt: sellerSnapshot.docs[0].data().updatedAt?.toDate(),
          } as SellerProfile
          setSeller(sellerData)
        }
      } catch (error) {
        console.error("Error fetching ad:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchAdAndSeller()
  }, [params.id, router])

  if (loading) {
    return (
    <div className="min-h-screen bg-background pt-16">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    </div>
    )
  }

  if (!ad || !seller) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Cover Image */}
            <div className="relative h-[500px] bg-muted rounded-3xl overflow-hidden shadow-sm">
              {ad.coverMedia && (
                <Image
                  src={ad.coverMedia}
                  alt={ad.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute top-6 left-6">
                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full shadow-sm py-1.5 px-4 font-xs tracking-widest uppercase">Active</Badge>
              </div>
              <div className="absolute top-6 right-6">
                <Badge variant="outline" className="bg-background/80 text-foreground border-border/40 backdrop-blur-md rounded-full shadow-sm py-1.5 px-4 font-xs tracking-widest uppercase">
                  {CATEGORY_LABELS[ad.category]}
                </Badge>
              </div>
            </div>

            {/* Ad Details */}
            <Card className="bg-card border-none shadow-xl rounded-3xl p-8 mt-8">
              <CardHeader className="px-0 pt-0 pb-8 border-b border-border/40 mb-8">
                <CardTitle className="text-4xl md:text-5xl font-sans font-black text-foreground mb-4 leading-tight">{ad.title}</CardTitle>
                <div className="flex items-center gap-2 text-foreground/60 text-sm font-bold tracking-widest uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>{ad.location}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-12 px-0">
                <div>
                  <div className="inline-block bg-foreground text-background rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
                    DESCRIPTION
                  </div>
                  <p className="text-foreground/80 font-medium leading-relaxed whitespace-pre-wrap text-lg">{ad.description}</p>
                </div>

                {/* Gallery */}
                {ad.gallery && ad.gallery.length > 0 && (
                  <div>
                    <div className="inline-block bg-foreground text-background rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
                      GALLERY
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ad.gallery.map((image, index) => (
                        <div key={index} className="relative h-64 bg-muted rounded-2xl overflow-hidden shadow-sm">
                          <Image
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Packages */}
                {ad.packages && ad.packages.length > 0 && (
                  <div>
                    <div className="inline-block bg-foreground text-background rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
                      PACKAGES
                    </div>
                    <div className="grid gap-6">
                      {ad.packages.map((pkg) => (
                        <Card key={pkg.id} className="bg-muted/10 border border-border/20 rounded-3xl shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-8">
                            <div className="flex items-start justify-between mb-4 border-b border-border/40 pb-4">
                              <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-primary" />
                                <h4 className="font-sans font-bold text-2xl text-foreground">{pkg.name}</h4>
                              </div>
                              <span className="text-2xl font-sans font-black text-foreground">LKR {pkg.price.toLocaleString()}</span>
                            </div>
                            <p className="text-foreground/70 text-base mb-6 font-medium leading-relaxed">{pkg.description}</p>
                            {pkg.duration && (
                              <p className="text-foreground/50 text-sm mb-4 tracking-widest uppercase font-medium">Duration: {pkg.duration}</p>
                            )}
                            {pkg.features && pkg.features.length > 0 && (
                              <ul className="space-y-3">
                                {pkg.features.map((feature, idx) => (
                                  <li key={idx} className="text-foreground/80 text-base flex items-start gap-4 font-light">
                                    <span className="text-primary mt-0.5">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seller Info Sidebar */}
          <div className="space-y-8">
            <Card className="bg-card border-none shadow-xl rounded-3xl overflow-hidden sticky top-24">
              <CardHeader className="bg-muted/20 border-b border-border/20 pb-8 pt-10 flex flex-col items-center">
                <div className="inline-block bg-foreground text-background rounded-full px-4 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  SELLER INFORMATION
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-8 px-8 pb-8">
                {seller.profileImage && (
                  <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg -mt-16">
                    <Image
                      src={seller.profileImage}
                      alt={seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-3xl font-sans font-black text-foreground mb-3">{seller.name}</h3>
                  {seller.description && (
                    <p className="text-foreground/70 text-base font-medium">{seller.description}</p>
                  )}
                </div>

                <Separator className="bg-border/40" />

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-foreground/80">
                    <Phone className="w-5 h-5 text-foreground/40" />
                    <a href={`tel:${seller.contactNo}`} className="hover:text-primary transition-colors font-light">
                      {seller.contactNo}
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-foreground/80">
                    <Mail className="w-5 h-5 text-foreground/40" />
                    <a href={`mailto:${seller.email}`} className="hover:text-primary transition-colors font-light">
                      {seller.email}
                    </a>
                  </div>
                  {!seller.hideAddress && seller.address && (
                    <div className="flex items-start gap-4 text-foreground/80">
                      <MapPin className="w-5 h-5 text-foreground/40 mt-1" />
                      <span className="font-light leading-relaxed">{seller.address}</span>
                    </div>
                  )}
                </div>

                {seller.socialMedia && (
                  <>
                    <Separator className="bg-border/40" />
                    <div className="space-y-3">
                      {seller.socialMedia.facebook && (
                        <a
                          href={seller.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 text-foreground/80 hover:text-primary transition-colors font-light"
                        >
                          <Facebook className="w-5 h-5 text-foreground/40" />
                          <span>Facebook</span>
                        </a>
                      )}
                      {seller.socialMedia.instagram && (
                        <a
                          href={seller.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 text-foreground/80 hover:text-primary transition-colors font-light"
                        >
                          <Instagram className="w-5 h-5 text-foreground/40" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {seller.socialMedia.youtube && (
                        <a
                          href={seller.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 text-foreground/80 hover:text-primary transition-colors font-light"
                        >
                          <Youtube className="w-5 h-5 text-foreground/40" />
                          <span>YouTube</span>
                        </a>
                      )}
                      {seller.socialMedia.website && (
                        <a
                          href={seller.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 text-foreground/80 hover:text-primary transition-colors font-light"
                        >
                          <Globe className="w-5 h-5 text-foreground/40" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                <Separator className="bg-border/40" />

                <Link href={`/seller-portfolio/${seller.userId}`} className="block w-full">
                  <Button size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full font-semibold tracking-widest uppercase text-xs py-6">
                    View Full Portfolio
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Prior Works */}
            {seller.priorWorks && seller.priorWorks.length > 0 && (
              <Card className="bg-card border-none shadow-xl rounded-3xl mt-12 p-8 mb-12">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="text-2xl font-sans font-bold text-foreground">Prior Works</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="grid grid-cols-2 gap-4">
                    {seller.priorWorks.slice(0, 6).map((work, index) => (
                      <div key={index} className="relative h-32 bg-muted rounded-2xl overflow-hidden shadow-sm">
                        <Image
                          src={work}
                          alt={`Work ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {seller.priorWorks.length > 6 && (
                    <Link href={`/seller-portfolio/${seller.userId}`}>
                      <Button variant="link" className="w-full mt-6 text-foreground/60 hover:text-foreground tracking-widest uppercase text-xs font-medium decoration-1 underline-offset-4">
                        View All Works
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

