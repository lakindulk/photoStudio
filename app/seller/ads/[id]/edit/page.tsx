"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import type { Advertisement, ServicePackage } from "@/types"
import { PackageManager } from "@/components/seller/PackageManager"
import { MediaUpload } from "@/components/MediaUpload"
import { SeparateMediaUpload } from "@/components/SeparateMediaUpload"

export default function EditAdPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const adId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    coverMedia: "",
    gallery: [] as string[], // Legacy field
    galleryImages: [] as string[],
    galleryVideos: [] as string[],
    packages: [] as ServicePackage[],
  })

  useEffect(() => {
    const fetchAd = async () => {
      if (!db || !user) return

      try {
        const adDoc = await getDoc(doc(db, "advertisements", adId))
        if (adDoc.exists()) {
          const adData = adDoc.data() as Advertisement

          // Verify ownership
          if (adData.sellerId !== user.id) {
            router.push("/seller/ads")
            return
          }

          // Allow editing of active and deactivated ads only
          if (adData.status !== "active" && adData.status !== "deactivated") {
            router.push("/seller/ads")
            return
          }

          setFormData({
            title: adData.title,
            description: adData.description,
            location: adData.location,
            coverMedia: adData.coverMedia || "",
            gallery: adData.gallery || [],
            galleryImages: adData.galleryImages || [],
            galleryVideos: adData.galleryVideos || [],
            packages: adData.packages || [],
          })
        } else {
          router.push("/seller/ads")
        }
      } catch (error) {
        console.error("Error fetching ad:", error)
        router.push("/seller/ads")
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [adId, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePackagesChange = (packages: ServicePackage[]) => {
    setFormData((prev) => ({ ...prev, packages }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      await updateDoc(doc(db, "advertisements", adId), {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        coverMedia: formData.coverMedia,
        gallery: formData.gallery, // Legacy field
        galleryImages: formData.galleryImages,
        galleryVideos: formData.galleryVideos,
        packages: formData.packages,
        updatedAt: new Date(),
        hasEditsPending: false,
      })

      toast({
        title: "Advertisement Updated",
        description: "Your changes have been saved successfully",
      })

      router.push("/seller/ads")
    } catch (error) {
      console.error("Error updating ad:", error)
      toast({
        title: "Error",
        description: "Failed to update advertisement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user || user.role !== "seller") {
    return null
  }

  if (loading) {
    return (
      <SellerLayout>
        <Card className="bg-gray-900/50 border-gray-800 animate-pulse">
          <CardContent className="p-12">
            <div className="h-64 bg-gray-800 rounded" />
          </CardContent>
        </Card>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Edit Advertisement</CardTitle>
            <CardDescription className="text-gray-400">
              Update your advertisement details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  Advertisement Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., Professional Wedding Photography Services"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white min-h-32"
                  placeholder="Describe your services in detail..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-300">
                  Location *
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
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
              <p className="text-xs text-gray-400 -mt-2">
                💡 <strong>Tip:</strong> Upload images and videos separately. Files up to 10MB can be uploaded directly.
                For larger files, use the URL option.
              </p>

              <div>
                <Label className="text-gray-300 mb-3 block">Packages (Optional)</Label>
                <PackageManager packages={formData.packages} onChange={handlePackagesChange} />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/seller/ads")}
                  className="flex-1 border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-gray-200" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  )
}

