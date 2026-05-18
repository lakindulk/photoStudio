"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { MediaUpload } from "@/components/MediaUpload"
import { PortfolioItemUpload } from "@/components/PortfolioItemUpload"
import { PortfolioTypeSelector } from "@/components/PortfolioTypeSelector"
import type { SellerProfile, PortfolioItem, PortfolioType } from "@/types"

export default function EditSellerProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    email: "",
    address: "",
    hideAddress: false,
    profileImage: "",
    coverImage: "",
    description: "",
    portfolioItems: [] as PortfolioItem[],
    portfolioType: "type1" as PortfolioType,
    socialMedia: {
      facebook: "",
      instagram: "",
      youtube: "",
      website: "",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!db || !user) return

      try {
        const profileQuery = query(
          collection(db, "sellerProfiles"),
          where("userId", "==", user.id)
        )
        const snapshot = await getDocs(profileQuery)

        if (!snapshot.empty) {
          const profileData = snapshot.docs[0].data() as SellerProfile
          setProfileId(snapshot.docs[0].id)
          setFormData({
            name: profileData.name || "",
            contactNo: profileData.contactNo || "",
            email: profileData.email || "",
            address: profileData.address || "",
            hideAddress: profileData.hideAddress || false,
            profileImage: profileData.profileImage || "",
            coverImage: profileData.coverImage || "",
            description: profileData.description || "",
            portfolioItems: profileData.portfolioItems || [],
            portfolioType: profileData.portfolioType || "type1",
            socialMedia: profileData.socialMedia || {
              facebook: "",
              instagram: "",
              youtube: "",
              website: "",
            },
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    if (!formData.name || !formData.contactNo || !formData.email || !formData.address) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const profileData = {
        userId: user.id,
        name: formData.name,
        contactNo: formData.contactNo,
        email: formData.email,
        address: formData.address,
        hideAddress: formData.hideAddress,
        profileImage: formData.profileImage,
        coverImage: formData.coverImage,
        description: formData.description,
        portfolioItems: formData.portfolioItems,
        portfolioType: formData.portfolioType,
        socialMedia: formData.socialMedia,
        updatedAt: new Date(),
      }

      if (profileId) {
        // Update existing profile
        await updateDoc(doc(db, "sellerProfiles", profileId), profileData)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        })
      } else {
        // Create new profile
        await addDoc(collection(db, "sellerProfiles"), {
          ...profileData,
          createdAt: new Date(),
        })
        toast({
          title: "Profile Created",
          description: "Your profile has been created successfully",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
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
        <Card className="bg-card/50 border-border/40 animate-pulse">
          <CardContent className="p-12">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Edit Profile</CardTitle>
            <CardDescription className="text-foreground/70">
              Update your seller profile information. This will be visible to guests viewing your advertisements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-foreground/80">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactNo" className="text-foreground/80">
                    Contact Number *
                  </Label>
                  <Input
                    id="contactNo"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground/80">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-foreground/80">
                    Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-muted border-border/40 text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hideAddress"
                  checked={formData.hideAddress}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, hideAddress: checked }))}
                />
                <Label htmlFor="hideAddress" className="text-foreground/80">
                  Hide address from guests
                </Label>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground/80">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-muted border-border/40 text-foreground min-h-24"
                  placeholder="Tell guests about yourself and your services..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <MediaUpload
                  label="Profile Image"
                  value={formData.profileImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, profileImage: url }))}
                  accept="image"
                  maxSizeMB={5}
                  storagePath="seller-profiles/profile-images"
                  showPreview={true}
                />

                <MediaUpload
                  label="Cover Image"
                  value={formData.coverImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                  accept="image"
                  maxSizeMB={5}
                  storagePath="seller-profiles/cover-images"
                  showPreview={true}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground/80">Social Media Links</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Facebook URL"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                    className="bg-muted border-border/40 text-foreground"
                  />
                  <Input
                    placeholder="Instagram URL"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                    className="bg-muted border-border/40 text-foreground"
                  />
                  <Input
                    placeholder="YouTube URL"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                    className="bg-muted border-border/40 text-foreground"
                  />
                  <Input
                    placeholder="Website URL"
                    value={formData.socialMedia.website}
                    onChange={(e) => handleSocialMediaChange("website", e.target.value)}
                    className="bg-muted border-border/40 text-foreground"
                  />
                </div>
              </div>

              <PortfolioTypeSelector
                selectedType={formData.portfolioType}
                onTypeChange={(type) => setFormData((prev) => ({ ...prev, portfolioType: type }))}
              />

              <PortfolioItemUpload
                label="Portfolio"
                items={formData.portfolioItems}
                onChange={(items) => setFormData((prev) => ({ ...prev, portfolioItems: items }))}
                maxSizeMB={10}
                storagePath="seller-portfolios"
                maxItems={30}
              />
              <p className="text-xs text-foreground/70 mt-2">
                ðŸ’¡ <strong>Tip:</strong> Add titles and descriptions to showcase your work. Files up to 10MB can be uploaded directly.
                For larger files, use the URL option with external hosting (Cloudinary, YouTube, Vimeo, etc.).
              </p>

              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  )
}

