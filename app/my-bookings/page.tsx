"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Booking } from "@/types"
import { Calendar, MapPin, MessageCircle, DollarSign } from "lucide-react"
import Link from "next/link"

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [customerPhone, setCustomerPhone] = useState("")

  useEffect(() => {
    // Get phone from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const phone = urlParams.get("phone") || localStorage.getItem("customerPhone") || ""
    setCustomerPhone(phone)

    if (phone && db) {
      const q = query(collection(db, "bookings"), where("customerPhone", "==", phone), orderBy("createdAt", "desc"))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          eventDate: doc.data().eventDate?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Booking[]
        setBookings(bookingsData)
        setLoading(false)
      })

      return unsubscribe
    } else {
      setLoading(false)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "paid":
        return "bg-green-500"
      case "completed":
        return "bg-purple-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Your booking is being reviewed by the photographer. You'll receive a WhatsApp message soon!"
      case "confirmed":
        return "Your booking is confirmed! Please proceed with payment to secure your session."
      case "paid":
        return "Payment received! Your session is fully booked. The photographer will contact you with final details."
      case "completed":
        return "Your photography session is complete! Thank you for choosing our services."
      case "cancelled":
        return "This booking has been cancelled. Contact us if you have any questions."
      default:
        return ""
    }
  }

  const openWhatsApp = (phone: string, message: string) => {
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!customerPhone) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-muted border-border/40 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-foreground">Track Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 mb-4">Enter your phone number to view your booking status.</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-foreground"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const phone = (e.target as HTMLInputElement).value
                      localStorage.setItem("customerPhone", phone)
                      window.location.search = `?phone=${phone}`
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[type="tel"]') as HTMLInputElement
                    const phone = input.value
                    localStorage.setItem("customerPhone", phone)
                    window.location.search = `?phone=${phone}`
                  }}
                >
                  Track
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Link href="/">
            <Button variant="outline" className="border-gray-600 text-foreground hover:bg-muted bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card className="bg-muted border-border/40">
            <CardContent className="text-center py-12">
              <p className="text-foreground/80 text-lg">No bookings found for this phone number.</p>
              <Link href="/" className="inline-block mt-4">
                <Button>Browse Services</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-muted border-border/40">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-foreground">Booking #{booking.id.slice(-6)}</CardTitle>
                      <p className="text-foreground/70 mt-1">Booked on {booking.createdAt?.toLocaleDateString()}</p>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} text-foreground`}>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Message */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-foreground/80">{getStatusMessage(booking.status)}</p>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Calendar className="h-4 w-4" />
                        <span>Event Date: {booking.eventDate?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/80">
                        <MapPin className="h-4 w-4" />
                        <span>Location: {booking.eventLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/80">
                        <DollarSign className="h-4 w-4" />
                        <span>Total: ${booking.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Services:</h4>
                      {booking.items.map((item, index) => (
                        <div key={index} className="text-foreground/80 text-sm">
                          â€¢ {item.serviceName} - {item.packageName} (${item.price})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Special Requests:</h4>
                      <p className="text-foreground/80 bg-gray-700 p-3 rounded">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() =>
                        openWhatsApp(
                          "1234567890", // Admin WhatsApp
                          `Hi! I have a question about my booking #${booking.id.slice(-6)}`,
                        )
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>

                    {booking.status === "confirmed" && (
                      <Button
                        onClick={() =>
                          openWhatsApp(
                            "1234567890", // Admin WhatsApp
                            `Hi! I'm ready to make payment for booking #${booking.id.slice(-6)}. Total amount: $${booking.totalAmount}`,
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Make Payment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
