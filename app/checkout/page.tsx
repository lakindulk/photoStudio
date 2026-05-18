"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { useCart } from "@/contexts/CartContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { sendBookingNotificationToSeller, createSupportLink } from "@/lib/whatsapp"
import { sendBookingNotificationToAdmin } from "@/lib/sms"
import type { Booking } from "@/types"

export default function CheckoutPage() {
  const { items, clearCart, totalAmount } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerWhatsapp: "",
    eventDate: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create bookings for each item (grouped by seller)
      const bookingsByseller = items.reduce(
        (acc, item) => {
          if (!acc[item.sellerId]) {
            acc[item.sellerId] = []
          }
          acc[item.sellerId].push(item)
          return acc
        },
        {} as Record<string, typeof items>,
      )

      const bookingPromises = Object.entries(bookingsByseller).map(async ([sellerId, sellerItems]) => {
        if (!db) {
          throw new Error("Database not initialized")
        }

        // Get seller information for WhatsApp notification
        const sellerDoc = await getDoc(doc(db, "users", sellerId))
        const sellerData = sellerDoc.data()

        // Create booking for this seller
        const bookingData: Omit<Booking, "id"> = {
          sellerId,
          advertisementId: sellerItems[0].advertisementId, // For now, one booking per seller
          packageId: sellerItems[0].packageId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerWhatsapp: formData.customerWhatsapp,
          eventDate: new Date(formData.eventDate),
          status: "waiting",
          totalAmount: sellerItems.reduce((sum, item) => sum + item.price, 0),
          notes: formData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        console.log("Attempting to create booking with data:", bookingData)
        console.log("Database instance:", db)

        const bookingRef = await addDoc(collection(db, "bookings"), bookingData)
        console.log("Booking created successfully:", bookingRef.id)

        // Send SMS notification to admin with WhatsApp links for seller and customer
        const adminPhoneNumber = process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER
        if (adminPhoneNumber && sellerData) {
          try {
            const adminNotificationResult = await sendBookingNotificationToAdmin(
              adminPhoneNumber,
              {
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                eventDate: formData.eventDate,
                packageName: sellerItems.map((item) => item.packageName).join(", "),
                totalAmount: bookingData.totalAmount,
                bookingId: bookingRef.id,
              },
              {
                name: sellerData.name || 'Unknown',
                whatsapp: sellerData.whatsapp || '',
                businessName: sellerData.businessName || 'Unknown Business',
              }
            )

            if (adminNotificationResult.success) {
              console.log(`âœ… SMS notification sent to admin: ${adminPhoneNumber}`)
            } else {
              console.log(`âš ï¸ Failed to send SMS to admin: ${adminNotificationResult.error}`)
            }
          } catch (error) {
            console.error('Error sending SMS notification to admin:', error)
          }
        } else {
          console.warn('Admin phone number not configured or seller data missing')
        }

        return bookingRef.id
      })

      const bookingIds = await Promise.all(bookingPromises)

      // Clear cart
      clearCart()

      toast({
        title: "Booking Submitted",
        description: "Your booking has been submitted and sellers have been notified",
      })

      // Redirect to booking confirmation page
      router.push(`/booking-confirmation?bookings=${bookingIds.join(",")}`)
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking Failed",
        description: "Failed to submit your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      "event-photographers": "Event Photography",
      "wedding-photographers": "Wedding Photography",
      "wedding-videographers": "Wedding Videography",
      "event-videographers": "Event Videography",
      "wedding-dronography": "Wedding Dronography",
      "event-dronography": "Event Dronography",
      "vehicle-renting": "Vehicle Renting",
      "flower-decorators": "Flower Decorators",
      "makeup-artists": "Makeup Artists",
      "wedding-dress-tailoring": "Wedding Dress Services",
      "product-shoot-models": "Product Shoot Models",
      "product-photography": "Product Photography",
      "photo-framing": "Photo Framing",
      "photo-video-editing": "Photo & Video Editing",
      "album-making": "Album Making",
    }
    return categoryMap[category] || category
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border/40">
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">No items in cart</h2>
              <p className="text-foreground/70 mb-6">Please add items to your cart before checkout</p>
              <Button onClick={() => router.push("/services")}>Browse Services</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-foreground/70">Complete your booking information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-6">
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-foreground">Booking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="customerName" className="text-foreground/80">
                      Full Name *
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventDate" className="text-foreground/80">
                      Event Date *
                    </Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone" className="text-foreground/80">
                      Phone Number *
                    </Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerWhatsapp" className="text-foreground/80">
                      WhatsApp Number *
                    </Label>
                    <Input
                      id="customerWhatsapp"
                      name="customerWhatsapp"
                      type="tel"
                      value={formData.customerWhatsapp}
                      onChange={handleInputChange}
                      required
                      className="bg-muted border-border/40 text-foreground"
                      placeholder="+94 XX XXX XXXX"
                    />
                    <p className="text-xs text-foreground/50 mt-1">We'll send booking updates via WhatsApp</p>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-foreground/80">
                      Additional Notes
                    </Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-muted border border-border/40 rounded-md text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Submitting Booking..." : "Submit Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">Need Help?</p>
                    <p className="text-foreground/70 text-sm">Contact our support team</p>
                  </div>
                  <a href={createSupportLink("I need help with my booking")} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      WhatsApp Support
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.advertisementId}-${item.packageId}`} className="flex justify-between py-2">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{item.packageName}</p>
                      <p className="text-foreground/70 text-sm">{item.sellerName}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {getCategoryLabel(item.category)}
                      </Badge>
                    </div>
                    <div className="text-foreground font-medium">LKR {item.price.toLocaleString()}</div>
                  </div>
                ))}
                <div className="border-t border-border/40 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-lg font-semibold text-foreground">LKR {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Process */}
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-foreground">Booking Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-foreground text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Submit Booking</p>
                    <p className="text-foreground/70 text-sm">Provide your details and submit</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-foreground text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Waiting for Confirmation</p>
                    <p className="text-foreground/70 text-sm">Service providers will check availability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-foreground text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Payment & Confirmation</p>
                    <p className="text-foreground/70 text-sm">Complete payment once availability is confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
