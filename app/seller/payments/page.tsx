"use client"

import { useState, useEffect } from "react"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import type { Booking } from "@/types"
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default function SellerPaymentsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "bookings"), where("sellerId", "==", user.id), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        eventDate: doc.data().eventDate?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
      })) as Booking[]
      setBookings(bookingsData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const totalEarnings = bookings
    .filter((b) => b.status === "paid" || b.status === "completed")
    .reduce((sum, b) => sum + (b.paymentAmount || b.totalAmount), 0)

  const pendingPayments = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.totalAmount, 0)

  const thisMonthEarnings = bookings
    .filter((b) => {
      const isPaid = b.status === "paid" || b.status === "completed"
      const isThisMonth =
        b.paidAt && b.paidAt.getMonth() === new Date().getMonth() && b.paidAt.getFullYear() === new Date().getFullYear()
      return isPaid && isThisMonth
    })
    .reduce((sum, b) => sum + (b.paymentAmount || b.totalAmount), 0)

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

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Payments & Earnings</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${totalEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">${thisMonthEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">${pendingPayments.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {bookings.filter((b) => b.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="bg-muted border-border/40">
          <CardHeader>
            <CardTitle className="text-foreground">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="text-foreground/80">Booking ID</TableHead>
                  <TableHead className="text-foreground/80">Customer</TableHead>
                  <TableHead className="text-foreground/80">Service</TableHead>
                  <TableHead className="text-foreground/80">Amount</TableHead>
                  <TableHead className="text-foreground/80">Status</TableHead>
                  <TableHead className="text-foreground/80">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="border-border/40">
                    <TableCell className="text-foreground font-mono">#{booking.id.slice(-6)}</TableCell>
                    <TableCell className="text-foreground">
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-foreground/70">{booking.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="text-sm">{booking.items.map((item) => item.serviceName).join(", ")}</div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="font-medium">${booking.totalAmount.toLocaleString()}</div>
                      {booking.paymentAmount && booking.paymentAmount !== booking.totalAmount && (
                        <div className="text-sm text-green-400">
                          Received: ${booking.paymentAmount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(booking.status)} text-foreground`}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {booking.paidAt ? booking.paidAt.toLocaleDateString() : booking.createdAt?.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  )
}
