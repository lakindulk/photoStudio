"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Calendar, User, Phone } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { sendPaymentLinkToCustomer } from "@/lib/whatsapp"
import type { Booking } from "@/types"

export default function ConfirmBookingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!db) return
        const bookingDoc = await getDoc(doc(db, "bookings", bookingId))
        if (bookingDoc.exists()) {
          const bookingData = {
            id: bookingDoc.id,
            ...bookingDoc.data(),
            eventDate: bookingDoc.data().eventDate?.toDate(),
            createdAt: bookingDoc.data().createdAt?.toDate(),
            updatedAt: bookingDoc.data().updatedAt?.toDate(),
          } as Booking

          setBooking(bookingData)
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const handleConfirm = async () => {
    if (!booking) return

    setProcessing(true)

    try {
      if (!db) return
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "pay-now",
        updatedAt: new Date(),
      })

      // Generate payment link (in a real app, this would be a proper payment gateway link)
      const paymentLink = `${window.location.origin}/payment/${booking.id}`

      // Send WhatsApp notification to customer
      const whatsappLink = sendPaymentLinkToCustomer(booking.customerWhatsapp, {
        customerName: booking.customerName,
        packageName: "Service Package", // You'd get this from the advertisement
        totalAmount: booking.totalAmount,
        paymentLink,
      })

      // Open WhatsApp link
      window.open(whatsappLink, "_blank")

      toast({
        title: "Booking Confirmed",
        description: "Customer has been notified and can now proceed with payment",
      })

      // Redirect to seller dashboard
      setTimeout(() => {
        router.push("/seller/bookings")
      }, 2000)
    } catch (error) {
      console.error("Error confirming booking:", error)
      toast({
        title: "Error",
        description: "Failed to confirm booking",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!booking) return

    setProcessing(true)

    try {
      if (!db) return
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "cancelled",
        updatedAt: new Date(),
      })

      toast({
        title: "Booking Rejected",
        description: "The booking has been cancelled",
      })

      // Redirect to seller dashboard
      setTimeout(() => {
        router.push("/seller/bookings")
      }, 2000)
    } catch (error) {
      console.error("Error rejecting booking:", error)
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground font-medium animate-pulse">Loading booking details...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card border-border/10 shadow-xl max-w-md w-full rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-black text-foreground mb-2">Booking Not Found</h2>
            <p className="text-foreground/60 font-medium">The booking could not be found or has already been processed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (booking.status !== "waiting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card border-border/10 shadow-xl max-w-md w-full rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-black text-foreground mb-2">Booking Already Processed</h2>
            <p className="text-foreground/60 font-medium">This booking has already been {booking.status}.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <Card className="bg-card border-border/10 shadow-xl max-w-2xl w-full rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center bg-muted/10 border-b border-border/5 py-8">
          <CardTitle className="text-foreground text-3xl font-black tracking-tight mb-2">Booking Confirmation</CardTitle>
          <p className="text-foreground/60 font-medium">Please review and confirm this booking request</p>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                 <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest mb-0.5">Customer</p>
                <p className="text-foreground font-black text-lg">{booking.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                 <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest mb-0.5">Event Date</p>
                <p className="text-foreground font-bold">
                  {booking.eventDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                 <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest mb-0.5">Phone</p>
                <p className="text-foreground font-bold">{booking.customerPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                 <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest mb-0.5">WhatsApp</p>
                <p className="text-foreground font-bold">{booking.customerWhatsapp}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/10 pt-6">
            <div className="flex justify-between items-center bg-muted/20 p-6 rounded-[1.5rem]">
              <span className="text-foreground/60 font-bold tracking-wide uppercase text-sm">Total Amount</span>
              <span className="text-3xl font-black text-primary">LKR {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="border-t border-border/10 pt-6">
              <p className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest mb-2">Customer Notes</p>
              <p className="text-foreground font-medium bg-muted/20 p-5 rounded-[1.5rem] leading-relaxed border border-border/5">{booking.notes}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={processing}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full py-6 font-bold text-sm tracking-widest uppercase shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {processing ? "Confirming..." : "Confirm Booking"}
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing}
              variant="outline"
              className="flex-1 border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-full py-6 font-bold text-sm tracking-widest uppercase transition-all"
            >
              <XCircle className="w-5 h-5 mr-2" />
              {processing ? "Rejecting..." : "Reject Booking"}
            </Button>
          </div>

          <div className="text-center text-foreground/40 text-xs font-medium pt-2">
            <p>By confirming, the customer will be notified via WhatsApp and can proceed with payment.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
