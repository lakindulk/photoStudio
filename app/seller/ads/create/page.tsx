"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, Lock } from "lucide-react"
import type { ServiceCategory, Subscription } from "@/types"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import { PackageManager } from "@/components/seller/PackageManager"
import { MediaUpload } from "@/components/MediaUpload"
import { SeparateMediaUpload } from "@/components/SeparateMediaUpload"
import type { ServicePackage } from "@/types"
import Link from "next/link"

export default function CreateAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([])
  const [allowedCategories, setAllowedCategories] = useState<ServiceCategory[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ServiceCategory,
    location: "",
    coverMedia: "",
    gallery: [] as string[], // Legacy field
    galleryImages: [] as string[],
    galleryVideos: [] as string[],
    packages: [] as ServicePackage[],
  })

  // Check for active subscriptions on mount
  useEffect(() => {
    const checkSubscriptions = async () => {
      if (!user || !db) return

      try {
        const q = query(
          collection(db, "subscriptions"),
          where("sellerId", "==", user.id),
          where("status", "==", "active")
        )
        const snapshot = await getDocs(q)
        const subs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate(),
          approvedAt: doc.data().approvedAt?.toDate(),
          rejectedAt: doc.data().rejectedAt?.toDate(),
          activatedAt: doc.data().activatedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Subscription[]

        // Filter out expired subscriptions
        const activeSubs = subs.filter((sub) => sub.expiresAt && sub.expiresAt > new Date())
        setActiveSubscriptions(activeSubs)

        // Collect all allowed categories from active subscriptions
        const categories = new Set<ServiceCategory>()
        activeSubs.forEach((sub) => {
          sub.allowedCategories.forEach((cat) => categories.add(cat))
        })
        setAllowedCategories(Array.from(categories))
      } catch (error) {
        console.error("Error checking subscriptions:", error)
      } finally {
        setCheckingSubscription(false)
      }
    }

    checkSubscriptions()
  }, [user, db])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (category: ServiceCategory) => {
    setFormData((prev) => ({ ...prev, category }))
  }

  const handlePackagesChange = (packages: ServicePackage[]) => {
    setFormData((prev) => ({ ...prev, packages }))
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a service category",
        variant: "destructive",
      })
      return
    }

    // Check if seller has active subscription for this category
    if (!allowedCategories.includes(formData.category)) {
      toast({
        title: "Subscription Required",
        description: `You need an active subscription to create ads in this category`,
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const adData = {
        sellerId: user.id,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        coverMedia: formData.coverMedia,
        gallery: formData.gallery, // Legacy field
        galleryImages: formData.galleryImages,
        galleryVideos: formData.galleryVideos,
        packages: formData.packages,
        location: formData.location,
        status: "pending",
        isApproved: false,
        hasEditsPending: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "advertisements"), adData)

      toast({
        title: "Advertisement Created",
        description: "Your advertisement has been submitted for admin approval",
      })

      router.push("/seller/ads")
    } catch (error) {
      console.error("Error creating ad:", error)
      toast({
        title: "Error",
        description: "Failed to create advertisement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "seller") {
    return null
  }

  if (checkingSubscription) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground">Checking subscriptions...</div>
        </div>
      </SellerLayout>
    )
  }

  // If no active subscriptions, show message
  if (activeSubscriptions.length === 0) {
    return (
      <SellerLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50 border-border/40">
            <CardContent className="py-12 text-center">
              <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Subscription Required</h2>
              <p className="text-foreground/70 mb-6">
                You need an active subscription to create advertisements. Purchase a subscription package to get
                started.
              </p>
              <Link href="/seller/subscriptions/purchase">
                <Button className="bg-white text-black hover:bg-gray-200">
                  Purchase Subscription
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Subscription Info Banner */}
        <Card className="bg-blue-900/20 border-blue-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-foreground font-semibold mb-1">Active Subscriptions</h3>
                <p className="text-sm text-foreground/80">
                  You have {activeSubscriptions.length} active subscription(s). You can create ads in the following
                  categories:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allowedCategories.map((cat) => (
                    <span key={cat} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {SERVICE_CATEGORIES.find((c) => c.value === cat)?.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Create New Advertisement</CardTitle>
            <CardDescription className="text-foreground/70">
              Fill in the details for your advertisement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAd} className="space-y-6">
              <div>
                <Label htmlFor="category" className="text-foreground/80">
                  Service Category *
                </Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-muted border-border/40 text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40">
                    {SERVICE_CATEGORIES.map((cat) => {
                      const isAllowed = allowedCategories.includes(cat.value)
                      return (
                        <SelectItem
                          key={cat.value}
                          value={cat.value}
                          className="text-foreground"
                          disabled={!isAllowed}
                        >
                          {cat.label} {!isAllowed && "(Subscription Required)"}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

                <div>
                  <Label htmlFor="title" className="text-foreground/80">
                    Advertisement Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground"
                    placeholder="e.g., Professional Wedding Photography Services"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground/80">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground min-h-32"
                    placeholder="Describe your services in detail..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-foreground/80">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground"
                    placeholder="e.g., Colombo, Sri Lanka"
                    required
                  />
                </div>

                <MediaUpload
                  label="Cover Image/Video"
                  value={formData.coverMedia}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverMedia: url }))}
                  accept="both"
                  maxSizeMB={10}
                  storagePath="advertisements/covers"
                  showPreview={true}
                  required={false}
                />

                <SeparateMediaUpload
                  label="Gallery"
                  images={formData.galleryImages}
                  videos={formData.galleryVideos}
                  onImagesChange={(urls) => setFormData((prev) => ({ ...prev, galleryImages: urls }))}
                  onVideosChange={(urls) => setFormData((prev) => ({ ...prev, galleryVideos: urls }))}
                  maxSizeMB={10}
                  storagePath="advertisements/gallery"
                  maxImages={15}
                  maxVideos={10}
                />
                <p className="text-xs text-foreground/70 -mt-2">
                  ðŸ’¡ <strong>Tip:</strong> Upload images and videos separately. Files up to 10MB can be uploaded directly.
                  For larger files, use the URL option.
                </p>

                <div>
                  <Label className="text-foreground/80 mb-3 block">Packages (Optional)</Label>
                  <PackageManager packages={formData.packages} onChange={handlePackagesChange} />
                </div>

              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
                {loading ? "Creating..." : "Create Advertisement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  )
}

