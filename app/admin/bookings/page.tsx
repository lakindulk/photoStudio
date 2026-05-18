"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import type { Booking } from "@/types"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { Eye, DollarSign, CheckCircle, Clock } from "lucide-react"

export default function AdminBookingsPage() {
  const { isAdmin } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!isAdmin) return

    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsData = snapshot.docs.map((d) => {
          const raw = d.data() as any

          // Normalize dates
          const createdAt = raw.createdAt?.toDate?.() ?? raw.createdAt ?? null
          const eventDate = raw.eventDate?.toDate?.() ?? raw.eventDate ?? null
          const updatedAt = raw.updatedAt?.toDate?.() ?? raw.updatedAt ?? null
          const paidAt = raw.paidAt?.toDate?.() ?? raw.paidAt ?? null

          // Normalize items to always be an array
          // (support alternate field names just in case)
          const itemsCandidate = raw.items ?? raw.cartItems ?? []
          const items = Array.isArray(itemsCandidate) ? itemsCandidate : []

          return {
            id: d.id,
            ...raw,
            items,
            createdAt,
            eventDate,
            updatedAt,
            paidAt,
            // sensible fallbacks to avoid undefined in UI/filtering
            customerName: raw.customerName ?? "",
            customerEmail: raw.customerEmail ?? "",
            status: raw.status ?? "pending",
            totalAmount: Number(raw.totalAmount ?? 0),
            paymentAmount: raw.paymentAmount != null ? Number(raw.paymentAmount) : undefined,
            whatsapp: raw.whatsapp ?? "",
          } as Booking
        })

        setBookings(bookingsData)
        setLoading(false)
      },
      (err) => {
        console.error("Firestore snapshot error:", err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [isAdmin])

  const updateBookingStatus = async (bookingId: string, status: string, paymentAmount?: number) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      }

      // Save paymentAmount even if 0
      if (typeof paymentAmount === "number") {
        updateData.paymentAmount = paymentAmount
      }

      if (status === "paid") {
        updateData.paidAt = new Date()
      }

      await updateDoc(doc(db, "bookings", bookingId), updateData)

      // WhatsApp notification
      const booking = bookings.find((b) => b.id === bookingId)
      if (booking) {
        let message = ""
        switch (status) {
          case "paid":
            message = `âœ… Payment confirmed for booking #${bookingId.slice(-6)}. Your photography session is fully booked! We'll contact you soon with final details.`
            break
          case "cancelled":
            message = `âŒ Booking #${bookingId.slice(-6)} has been cancelled. If you have any questions, please contact us.`
            break
          case "completed":
            message = `ðŸŽ‰ Your photography session is complete! Thank you for choosing our services. We hope you love your photos!`
            break
        }
        if (message && booking.whatsapp) {
          await sendWhatsAppMessage(booking.whatsapp, message)
        }
      }
    } catch (error) {
      console.error("Error updating booking:", error)
    }
  }

  const filteredBookings = useMemo(() => {
    const s = search.trim().toLowerCase()
    return bookings.filter((booking) => {
      const matchesFilter = filter === "all" || booking.status === filter
      const matchesSearch =
        s === "" ||
        booking.customerName?.toLowerCase?.().includes(s) ||
        booking.customerEmail?.toLowerCase?.().includes(s) ||
        booking.id?.toLowerCase?.().includes(s)
      return matchesFilter && matchesSearch
    })
  }, [bookings, filter, search])

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

  // Totals with guards
  const totalRevenue = bookings
    .filter((b) => b.status === "paid" || b.status === "completed")
    .reduce((sum, b) => sum + Number(b.paymentAmount ?? b.totalAmount ?? 0), 0)

  const pendingPayments = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.totalAmount ?? 0), 0)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Booking &amp; Payment Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Total Bookings</CardTitle>
              <Eye className="h-4 w-4 text-foreground/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{bookings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">${pendingPayments.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {bookings.filter((b) => b.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm bg-muted border-border/40 text-foreground"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-muted border-border/40 text-foreground">
              <SelectValue placeholder="All Bookings" />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border/40">
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-muted border-border/40">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="text-foreground/80">Booking ID</TableHead>
                  <TableHead className="text-foreground/80">Customer</TableHead>
                  <TableHead className="text-foreground/80">Service</TableHead>
                  <TableHead className="text-foreground/80">Event Date</TableHead>
                  <TableHead className="text-foreground/80">Amount</TableHead>
                  <TableHead className="text-foreground/80">Status</TableHead>
                  <TableHead className="text-foreground/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="border-border/40">
                    <TableCell className="text-foreground font-mono">#{booking.id?.slice(-6)}</TableCell>
                    <TableCell className="text-foreground">
                      <div>
                        <div className="font-medium">{booking.customerName || "â€”"}</div>
                        <div className="text-sm text-foreground/70">{booking.customerEmail || "â€”"}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="text-sm">
                        {(booking.items ?? []).map((item: any) => item?.serviceName ?? "Service").join(", ") || "â€”"}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "â€”"}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div>
                        <div className="font-medium">
                          ${Number(booking.totalAmount ?? 0).toLocaleString()}
                        </div>
                        {booking.paymentAmount != null &&
                          booking.paymentAmount !== booking.totalAmount && (
                            <div className="text-sm text-green-400">
                              Paid: ${Number(booking.paymentAmount).toLocaleString()}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} text-foreground`}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, "paid", booking.totalAmount ?? 0)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Paid
                          </Button>
                        )}
                        {booking.status === "paid" && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, "completed")}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Complete
                          </Button>
                        )}
                        {booking.status !== "cancelled" && booking.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
