"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { CheckCircle, XCircle, Eye, MessageCircle, CalendarDays, Clock, Ban } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { sendPaymentLinkToCustomer } from "@/lib/whatsapp"
import type { Booking } from "@/types"

const STATUS_STYLES: Record<string, string> = {
  waiting:    "bg-amber-100 text-amber-700",
  approved:   "bg-[#788C59]/15 text-[#788C59]",
  "pay-now":  "bg-blue-100 text-blue-700",
  paid:       "bg-[#788C59]/15 text-[#788C59]",
  completed:  "bg-[#788C59]/15 text-[#788C59]",
  cancelled:  "bg-red-100 text-red-700",
}

const STATUS_LABEL: Record<string, string> = {
  waiting: "Waiting", approved: "Approved", "pay-now": "Payment Required",
  paid: "Paid", completed: "Completed", cancelled: "Cancelled",
}

export default function SellerBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !db) return
      try {
        const snap = await getDocs(query(collection(db!, "bookings"), where("sellerId", "==", user.id)))
        const data = snap.docs.map((d) => ({
          id: d.id, ...d.data(),
          eventDate: d.data().eventDate?.toDate(),
          createdAt: d.data().createdAt?.toDate(),
          updatedAt: d.data().updatedAt?.toDate(),
        })) as Booking[]
        data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setBookings(data)
      } catch {
        toast({ title: "Error", description: "Failed to fetch bookings", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [user])

  const handleApprove = async (bookingId: string) => {
    if (!db) return
    try {
      await updateDoc(doc(db!, "bookings", bookingId), { status: "pay-now", updatedAt: new Date() })
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "pay-now" } : b))
      const booking = bookings.find((b) => b.id === bookingId)
      if (booking) {
        const paymentLink = `${window.location.origin}/payment/${bookingId}`
        const link = sendPaymentLinkToCustomer(booking.customerWhatsapp, {
          customerName: booking.customerName, packageName: "Service Package",
          totalAmount: booking.totalAmount, paymentLink,
        })
        window.open(link, "_blank")
      }
      toast({ title: "Booking Approved", description: "Customer notified and can now proceed with payment" })
    } catch {
      toast({ title: "Error", description: "Failed to approve booking", variant: "destructive" })
    }
  }

  const handleReject = async (bookingId: string) => {
    if (!confirm("Are you sure you want to reject this booking?")) return
    if (!db) return
    try {
      await updateDoc(doc(db!, "bookings", bookingId), { status: "cancelled", updatedAt: new Date() })
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b))
      toast({ title: "Booking Rejected", description: "The booking has been cancelled" })
    } catch {
      toast({ title: "Error", description: "Failed to reject booking", variant: "destructive" })
    }
  }

  const waiting = bookings.filter((b) => b.status === "waiting").length
  const pending = bookings.filter((b) => b.status === "pay-now").length

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/30 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-2xl md:text-3xl font-black text-[#082537] tracking-tight">Bookings</h1>
          <p className="text-sm text-[#082537]/45 mt-1">Manage your booking requests</p>
        </div>

        {/* Summary chips */}
        {!loading && (
          <div className="flex flex-wrap gap-3 mb-6 animate-fade-in" style={{ animationDelay: "60ms" }}>
            <div className="inline-flex items-center gap-2 bg-white border border-[#082537]/8 rounded-2xl px-4 py-2.5">
              <CalendarDays className="w-4 h-4 text-[#082537]/40" />
              <span className="text-sm font-bold text-[#082537]">{bookings.length}</span>
              <span className="text-xs text-[#082537]/40 font-medium">Total</span>
            </div>
            {waiting > 0 && (
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 rounded-2xl px-4 py-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">{waiting}</span>
                <span className="text-xs text-amber-600 font-medium">Awaiting approval</span>
              </div>
            )}
            {pending > 0 && (
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-2xl px-4 py-2.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{pending}</span>
                <span className="text-xs text-blue-600 font-medium">Awaiting payment</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bg-white border border-[#082537]/8 rounded-3xl overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 shimmer-bg rounded-2xl animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-3xl bg-[#082537]/5 flex items-center justify-center mx-auto mb-5">
                <CalendarDays className="w-7 h-7 text-[#082537]/20" />
              </div>
              <p className="text-[#082537]/35 text-lg font-medium">No bookings yet</p>
              <p className="text-[#082537]/25 text-sm mt-1">Booking requests will appear here when customers book your services.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#082537]/6">
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#082537]/35">Customer</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#082537]/35">Event Date</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#082537]/35">Amount</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#082537]/35">Status</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#082537]/35">Created</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#082537]/35">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, i) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[#082537]/4 hover:bg-[#082537]/2 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#082537] text-sm">{booking.customerName}</p>
                        <p className="text-[#082537]/40 text-xs mt-0.5">{booking.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#082537]/70 font-medium">{booking.eventDate?.toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-black text-[#082537]">LKR {booking.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-500"}`}>
                          {STATUS_LABEL[booking.status] || booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#082537]/40 font-medium">{booking.createdAt?.toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button onClick={() => setSelectedBooking(booking)} className="w-8 h-8 rounded-xl bg-[#082537]/5 hover:bg-[#082537]/10 flex items-center justify-center transition-colors">
                                <Eye className="w-3.5 h-3.5 text-[#082537]/50" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="bg-white border border-[#082537]/10 rounded-3xl max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="text-[#082537] font-black">Booking Details</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4 mt-2">
                                  <div className="grid grid-cols-2 gap-4">
                                    {[
                                      { label: "Customer Name", value: selectedBooking.customerName },
                                      { label: "Event Date", value: selectedBooking.eventDate?.toLocaleDateString() },
                                      { label: "Phone", value: selectedBooking.customerPhone },
                                      { label: "WhatsApp", value: selectedBooking.customerWhatsapp },
                                    ].map(({ label, value }) => (
                                      <div key={label} className="bg-[#eef3f0]/50 rounded-2xl p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#082537]/40 mb-1">{label}</p>
                                        <p className="text-sm font-bold text-[#082537]">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="bg-[#082537] rounded-2xl p-4 flex items-center justify-between">
                                    <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Total Amount</span>
                                    <span className="text-xl font-black text-white">LKR {selectedBooking.totalAmount.toLocaleString()}</span>
                                  </div>
                                  {selectedBooking.notes && (
                                    <div className="bg-[#eef3f0]/50 rounded-2xl p-3">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#082537]/40 mb-1">Notes</p>
                                      <p className="text-sm text-[#082537]/70">{selectedBooking.notes}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[selectedBooking.status] || "bg-gray-100 text-gray-500"}`}>
                                      {STATUS_LABEL[selectedBooking.status] || selectedBooking.status}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {booking.status === "waiting" && (
                            <>
                              <button onClick={() => handleApprove(booking.id)} className="w-8 h-8 rounded-xl bg-[#788C59]/10 hover:bg-[#788C59]/20 flex items-center justify-center transition-colors">
                                <CheckCircle className="w-3.5 h-3.5 text-[#788C59]" />
                              </button>
                              <button onClick={() => handleReject(booking.id)} className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </>
                          )}

                          <a
                            href={`https://wa.me/${booking.customerWhatsapp.replace(/[^0-9]/g, "")}?text=Hello ${booking.customerName}, regarding your booking for ${booking.eventDate?.toLocaleDateString()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="w-8 h-8 rounded-xl bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors">
                              <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                            </button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  )
}
