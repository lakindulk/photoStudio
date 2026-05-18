"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import type { ServiceCategory } from "@/types"

const serviceCategories: Array<{ value: ServiceCategory; label: string }> = [
  { value: "event-photographers", label: "Event Photography" },
  { value: "wedding-photographers", label: "Wedding Photography" },
  { value: "wedding-videographers", label: "Wedding Videography" },
  { value: "event-videographers", label: "Event Videography" },
  { value: "wedding-dronography", label: "Wedding Dronography" },
  { value: "event-dronography", label: "Event Dronography" },
  { value: "vehicle-renting", label: "Vehicle Renting" },
  { value: "flower-decorators", label: "Flower Decorators" },
  { value: "makeup-artists", label: "Makeup Artists" },
  { value: "wedding-dress-tailoring", label: "Wedding Dress Services" },
  { value: "product-shoot-models", label: "Product Shoot Models" },
  { value: "product-photography", label: "Product Photography" },
  { value: "photo-framing", label: "Photo Framing" },
  { value: "photo-video-editing", label: "Photo & Video Editing" },
  { value: "album-making", label: "Album Making" },
]

export default function SellerRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    description: "",
    phone: "",
    whatsapp: "",
    categories: [] as ServiceCategory[],
  })
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      toast({
        title: "Invalid Registration Link",
        description: "This registration link is invalid or expired",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // In a real app, you would validate the token against your database
    // For now, we'll just check if it exists
    setValidToken(true)
  }, [searchParams, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (category: ServiceCategory, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked ? [...prev.categories, category] : prev.categories.filter((c) => c !== category),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (formData.categories.length === 0) {
      toast({
        title: "Categories Required",
        description: "Please select at least one service category",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        role: "seller",
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        businessName: formData.businessName,
        description: formData.description,
        categories: formData.categories,
        isApproved: false, // Requires admin approval
      })

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please wait for admin approval.",
      })

      router.push("/seller/login")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Validating registration link...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border/40">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="text-2xl font-bold text-foreground">MALKA</div>
              <div className="text-sm text-foreground/70">SELLER</div>
            </div>
            <CardTitle className="text-foreground">Seller Registration</CardTitle>
            <p className="text-foreground/70">Join our photography marketplace</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground/80">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
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
                      required
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-foreground/80">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-foreground/80">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-foreground/80">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="text-foreground/80">
                      WhatsApp Number
                    </Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
                <div>
                  <Label htmlFor="businessName" className="text-foreground/80">
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="bg-muted border-border/40 text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-foreground/80">
                    Business Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="bg-muted border-border/40 text-foreground"
                    placeholder="Describe your business and services..."
                  />
                </div>
              </div>

              {/* Service Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Service Categories *</h3>
                <p className="text-sm text-foreground/70">Select the services you provide</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serviceCategories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.value}
                        checked={formData.categories.includes(category.value)}
                        onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                        className="border-gray-600"
                      />
                      <Label htmlFor={category.value} className="text-foreground/80 text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Register as Seller"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
