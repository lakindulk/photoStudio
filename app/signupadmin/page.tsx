"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { UserPlus, Shield, Store, User } from "lucide-react"
import type { ServiceCategory, UserRole } from "@/types"

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

interface FormData {
  // Common fields
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  whatsapp: string
  role: UserRole
  
  // Seller-specific fields
  businessName: string
  description: string
  categories: ServiceCategory[]
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    whatsapp: "",
    role: "user",
    businessName: "",
    description: "",
    categories: [],
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ 
      ...prev, 
      role,
      // Reset seller-specific fields when switching away from seller
      ...(role !== "seller" && {
        businessName: "",
        description: "",
        categories: [],
      })
    }))
  }

  const handleCategoryChange = (category: ServiceCategory, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category] 
        : prev.categories.filter((c) => c !== category),
    }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return false
    }

    if (formData.role === "seller") {
      if (!formData.businessName.trim()) {
        toast({
          title: "Business Name Required",
          description: "Please enter your business name",
          variant: "destructive",
        })
        return false
      }

      if (!formData.description.trim()) {
        toast({
          title: "Business Description Required",
          description: "Please describe your business",
          variant: "destructive",
        })
        return false
      }

      if (formData.categories.length === 0) {
        toast({
          title: "Service Categories Required",
          description: "Please select at least one service category",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const userData: any = {
        role: formData.role,
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
      }

      // Add seller-specific data
      if (formData.role === "seller") {
        userData.businessName = formData.businessName
        userData.description = formData.description
        userData.categories = formData.categories
        userData.isApproved = false // Sellers need admin approval
      }

      await signUp(formData.email, formData.password, userData)

      // Success message based on role
      let successMessage = "Account created successfully!"
      let redirectPath = "/"

      switch (formData.role) {
        case "admin":
          successMessage = "Admin account created successfully!"
          redirectPath = "/admin/login"
          break
        case "seller":
          successMessage = "Seller account created successfully! Please wait for admin approval."
          redirectPath = "/seller/login"
          break
        case "user":
          successMessage = "Account created successfully! You can now browse and book services."
          redirectPath = "/login"
          break
      }

      toast({
        title: "Registration Successful",
        description: successMessage,
      })

      router.push(redirectPath)
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

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5" />
      case "seller":
        return <Store className="w-5 h-5" />
      case "user":
        return <User className="w-5 h-5" />
    }
  }

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Manage the platform, approve sellers, and oversee operations"
      case "seller":
        return "Offer photography services and manage your business"
      case "user":
        return "Browse and book photography services"
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card border-border/40">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <UserPlus className="w-8 h-8 text-foreground" />
              <div className="text-2xl font-bold text-foreground">MALKA</div>
              <div className="text-sm text-foreground/70">STUDIO</div>
            </div>
            <CardTitle className="text-foreground text-2xl">Create Your Account</CardTitle>
            <p className="text-foreground/70">Join our photography marketplace</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Choose Your Role</h3>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {(["user", "seller", "admin"] as UserRole[]).map((role) => (
                    <div key={role} className="relative">
                      <RadioGroupItem
                        value={role}
                        id={role}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={role}
                        className="flex flex-col items-center justify-center p-6 bg-muted border-2 border-border/40 rounded-lg cursor-pointer hover:bg-gray-750 peer-checked:border-blue-500 peer-checked:bg-gray-750 transition-all"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {getRoleIcon(role)}
                          <span className="text-foreground font-medium capitalize">{role}</span>
                        </div>
                        <p className="text-foreground/70 text-sm text-center">
                          {getRoleDescription(role)}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

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
                      minLength={6}
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

              {/* Seller-specific fields */}
              {formData.role === "seller" && (
                <>
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
                            onCheckedChange={(checked) =>
                              handleCategoryChange(category.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label htmlFor={category.value} className="text-foreground/80 text-sm">
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : `Create ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Account`}
                </Button>

                <div className="text-center">
                  <p className="text-foreground/70 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>

              {/* Role-specific notices */}
              {formData.role === "seller" && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Seller accounts require admin approval before you can start offering services.
                  </p>
                </div>
              )}

              {formData.role === "admin" && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    <strong>Admin Access:</strong> Admin accounts have full platform access. Only create admin accounts for trusted personnel.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
