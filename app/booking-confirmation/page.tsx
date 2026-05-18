"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, MessageCircle, Home } from "lucide-react"
import Link from "next/link"
import { createSupportLink } from "@/lib/whatsapp"
import type { Booking } from "@/types"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      const bookingIds = searchParams.get("bookings")?.split(",") || []

      if (bookingIds.length === 0) {
        setLoading(false)
        return
      }

      try {
        const bookingPromises = bookingIds.map(async (id) => {
          const bookingDoc = await getDoc(doc(db, "bookings", id))
          if (bookingDoc.exists()) {
            return {
              id: bookingDoc.id,
              ...bookingDoc.data(),
              eventDate: bookingDoc.data().eventDate?.toDate(),
              createdAt: bookingDoc.data().createdAt?.toDate(),
              updatedAt: bookingDoc.data().updatedAt?.toDate(),
            } as Booking
          }
          return null
        })

        const bookingResults = await Promise.all(bookingPromises)
        const validBookings = bookingResults.filter((booking) => booking !== null) as Booking[]
        setBookings(validBookings)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [searchParams])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-600"
      case "approved":
        return "bg-green-600"
      case "pay-now":
        return "bg-blue-600"
      case "paid":
        return "bg-green-600"
      case "completed":
        return "bg-green-600"
      case "cancelled":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "waiting":
        return "Waiting for Confirmation"
      case "approved":
        return "Approved"
      case "pay-now":
        return "Payment Required"
      case "paid":
        return "Paid"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-foreground">Loading booking details...</div>
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border/40">
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">No bookings found</h2>
              <p className="text-foreground/70 mb-6">The booking information could not be retrieved</p>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Submitted Successfully!</h1>
          <p className="text-foreground/70">Your booking requests have been sent to the service providers</p>
        </div>

        <div className="space-y-6">
          {/* Booking Details */}
          {bookings.map((booking) => (
            <Card key={booking.id} className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center justify-between">
                  Booking #{booking.id.slice(-8)}
                  <Badge className={getStatusColor(booking.status)}>{getStatusLabel(booking.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-foreground/70 text-sm">Customer Name</p>
                    <p className="text-foreground font-medium">{booking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-foreground/70 text-sm">Event Date</p>
                    <p className="text-foreground font-medium">
                      {booking.eventDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/70 text-sm">Phone Number</p>
                    <p className="text-foreground font-medium">{booking.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-foreground/70 text-sm">WhatsApp</p>
                    <p className="text-foreground font-medium">{booking.customerWhatsapp}</p>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">Total Amount</span>
                    <span className="text-xl font-semibold text-foreground">LKR {booking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-foreground/70 text-sm mb-1">Additional Notes</p>
                    <p className="text-foreground">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Next Steps */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <p className="text-foreground font-medium">Service providers have been notified</p>
                    <p className="text-foreground/70 text-sm">
                      They will check their availability for your event date and respond via WhatsApp
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-foreground font-medium">You'll receive WhatsApp updates</p>
                    <p className="text-foreground/70 text-sm">
                      We'll send you notifications about your booking status changes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-foreground font-medium">Payment after confirmation</p>
                    <p className="text-foreground/70 text-sm">
                      You'll only need to pay once the service provider confirms availability
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-foreground font-medium">Need Help?</p>
                    <p className="text-foreground/70 text-sm">Contact our support team</p>
                  </div>
                </div>
                <a href={createSupportLink("I need help with my booking")} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full bg-transparent">
                    WhatsApp Support
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-foreground font-medium">Continue Browsing</p>
                    <p className="text-foreground/70 text-sm">Explore more services</p>
                  </div>
                </div>
                <Link href="/">
                  <Button className="w-full">Return to Homepage</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
