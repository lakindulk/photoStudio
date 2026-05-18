"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, doc, updateDoc, getDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { ALL_SUBSCRIPTION_PACKAGES, SUBSCRIPTION_DURATION_MONTHS, CATEGORY_LABELS } from "@/lib/constants"
import { CheckCircle, XCircle, Clock, User, Calendar, Package, Eye, RefreshCw } from "lucide-react"
import type { Subscription, SellerProfile } from "@/types"
import Image from "next/image"
import { updateExpiredSubscriptions, deactivateAdsWithExpiredSubscriptions } from "@/lib/subscriptionUtils"

export default function AdminSubscriptionsPage() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [sellerProfiles, setSellerProfiles] = useState<Record<string, SellerProfile>>({})
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [checkingExpiry, setCheckingExpiry] = useState(false)

  useEffect(() => {
    if (!user || !db) return

    const fetchData = async () => {
      try {
        // Fetch all subscriptions
        const subsQuery = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"))
        const subsSnapshot = await getDocs(subsQuery)
        const subs = subsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate(),
          approvedAt: doc.data().approvedAt?.toDate(),
          rejectedAt: doc.data().rejectedAt?.toDate(),
          activatedAt: doc.data().activatedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Subscription[]

        setSubscriptions(subs)

        // Fetch seller profiles
        const sellerIds = [...new Set(subs.map((sub) => sub.sellerId))]
        const profiles: Record<string, SellerProfile> = {}
        
        for (const sellerId of sellerIds) {
          const sellerDoc = await getDoc(doc(db, "sellerProfiles", sellerId))
          if (sellerDoc.exists()) {
            profiles[sellerId] = {
              id: sellerDoc.id,
              ...sellerDoc.data(),
              createdAt: sellerDoc.data().createdAt?.toDate(),
              updatedAt: sellerDoc.data().updatedAt?.toDate(),
            } as SellerProfile
          }
        }
        
        setSellerProfiles(profiles)
      } catch (error) {
        console.error("Error fetching subscriptions:", error)
        toast({
          title: "Error",
          description: "Failed to load subscriptions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, db])

  const handleApprove = async (subscription: Subscription) => {
    if (!db || !user) return

    setProcessing(true)
    try {
      // Use per-package durationMonths if stored, otherwise fall back to global constant
      const months = (subscription as any).durationMonths ?? SUBSCRIPTION_DURATION_MONTHS
      const activatedAt = new Date()
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + months)

      await updateDoc(doc(db, "subscriptions", subscription.id), {
        status: "active",
        approvedBy: user.id,
        approvedAt: activatedAt,
        activatedAt,
        expiresAt,
        updatedAt: new Date(),
      })

      toast({
        title: "Subscription Approved",
        description: `Subscription activated until ${expiresAt.toLocaleDateString()}`,
      })

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error approving subscription:", error)
      toast({
        title: "Error",
        description: "Failed to approve subscription",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!db || !user || !selectedSubscription) return

    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      await updateDoc(doc(db, "subscriptions", selectedSubscription.id), {
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason,
        updatedAt: new Date(),
      })

      toast({
        title: "Subscription Rejected",
        description: "Seller has been notified",
      })

      setShowRejectDialog(false)
      setRejectionReason("")
      setSelectedSubscription(null)

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error rejecting subscription:", error)
      toast({
        title: "Error",
        description: "Failed to reject subscription",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCheckExpiredSubscriptions = async () => {
    setCheckingExpiry(true)
    try {
      const { updated } = await updateExpiredSubscriptions()
      const { deactivated } = await deactivateAdsWithExpiredSubscriptions()

      toast({
        title: "Expiry Check Complete",
        description: `Updated ${updated} expired subscriptions and deactivated ${deactivated} ads`,
      })

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error checking expired subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to check expired subscriptions",
        variant: "destructive",
      })
    } finally {
      setCheckingExpiry(false)
    }
  }

  const getStatusBadge = (subscription: Subscription) => {
    if (subscription.status === "active" && subscription.expiresAt && subscription.expiresAt > new Date()) {
      return (
        <Badge className="bg-green-500 text-foreground">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    }
    if (subscription.status === "pending") {
      return (
        <Badge className="bg-yellow-500 text-black">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    }
    if (subscription.status === "rejected") {
      return (
        <Badge className="bg-red-500 text-foreground">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-500 text-foreground">
        <XCircle className="w-3 h-3 mr-1" />
        Expired
      </Badge>
    )
  }

  const getPackageDetails = (packageType: string) => {
    return ALL_SUBSCRIPTION_PACKAGES.find((pkg) => pkg.type === packageType)
  }

  const groupedBySeller = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.sellerId]) {
      acc[sub.sellerId] = []
    }
    acc[sub.sellerId].push(sub)
    return acc
  }, {} as Record<string, Subscription[]>)

  const pendingSubscriptions = subscriptions.filter((sub) => sub.status === "pending")
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active" && sub.expiresAt && sub.expiresAt > new Date()
  )

  const renderSubscriptionCard = (subscription: Subscription) => {
    const packageDetails = getPackageDetails(subscription.packageType)
    const seller = sellerProfiles[subscription.sellerId]
    const daysRemaining = subscription.expiresAt
      ? Math.ceil((subscription.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return (
      <Card key={subscription.id} className="bg-card/50 border-border/40">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-foreground/70" />
                <span className="text-foreground font-semibold">{seller?.name || "Unknown Seller"}</span>
              </div>
              <CardTitle className="text-foreground text-lg">
                {packageDetails?.name || subscription.packageType}
              </CardTitle>
              <p className="text-sm text-foreground/70 mt-1">LKR {subscription.amount.toLocaleString()}</p>
            </div>
            {getStatusBadge(subscription)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seller Info */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="text-foreground/70">Email: {seller?.email || "N/A"}</div>
            <div className="text-foreground/70">Contact: {seller?.contactNo || "N/A"}</div>
          </div>

          {/* Allowed Categories */}
          <div>
            <h4 className="text-sm font-semibold text-foreground/70 mb-2">Allowed Services:</h4>
            <div className="flex flex-wrap gap-2">
              {subscription.allowedCategories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {CATEGORY_LABELS[category]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Payment Slip */}
          <div>
            <h4 className="text-sm font-semibold text-foreground/70 mb-2">Payment Slip:</h4>
            <a
              href={subscription.paymentSlipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Payment Slip
              </Button>
            </a>
          </div>

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground/70">
              <Calendar className="w-4 h-4" />
              <span>Submitted: {subscription.submittedAt?.toLocaleDateString()}</span>
            </div>
            {subscription.approvedAt && (
              <div className="flex items-center gap-2 text-foreground/70">
                <CheckCircle className="w-4 h-4" />
                <span>Approved: {subscription.approvedAt.toLocaleDateString()}</span>
              </div>
            )}
            {subscription.expiresAt && subscription.status === "active" && (
              <div className="flex items-center gap-2 text-foreground/70">
                <Calendar className="w-4 h-4" />
                <span>
                  Expires: {subscription.expiresAt.toLocaleDateString()}
                  {daysRemaining > 0 && daysRemaining <= 30 && (
                    <span className="ml-2 text-yellow-500">({daysRemaining} days left)</span>
                  )}
                </span>
              </div>
            )}
            {subscription.rejectionReason && (
              <div className="text-red-400 text-sm">
                <strong>Rejection Reason:</strong> {subscription.rejectionReason}
              </div>
            )}
          </div>

          {/* Actions */}
          {subscription.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApprove(subscription)}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => {
                  setSelectedSubscription(subscription)
                  setShowRejectDialog(true)
                }}
                disabled={processing}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-foreground">Loading subscriptions...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Management</h1>
            <p className="text-foreground/70">Manage seller subscriptions and approvals</p>
          </div>
          <Button
            onClick={handleCheckExpiredSubscriptions}
            disabled={checkingExpiry}
            variant="outline"
            className="border-border/40 text-foreground/80"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checkingExpiry ? "animate-spin" : ""}`} />
            {checkingExpiry ? "Checking..." : "Check Expired"}
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-card/50 border border-border/40">
            <TabsTrigger value="pending">
              Pending Approval ({pendingSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="by-seller">
              By Seller ({Object.keys(groupedBySeller).length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({subscriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingSubscriptions.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                  <p className="text-foreground/70">No pending subscriptions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingSubscriptions.map(renderSubscriptionCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeSubscriptions.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                  <p className="text-foreground/70">No active subscriptions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {activeSubscriptions.map(renderSubscriptionCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-seller" className="space-y-6 mt-6">
            {Object.entries(groupedBySeller).map(([sellerId, subs]) => {
              const seller = sellerProfiles[sellerId]
              return (
                <Card key={sellerId} className="bg-card/50 border-border/40">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {seller?.name || "Unknown Seller"}
                    </CardTitle>
                    <p className="text-sm text-foreground/70">
                      {seller?.email} â€¢ {seller?.contactNo}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {subs.map(renderSubscriptionCard)}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {subscriptions.map(renderSubscriptionCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader>
              <DialogTitle className="text-foreground">Reject Subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason" className="text-foreground/80">
                  Rejection Reason *
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-muted border-border/40 text-foreground mt-2"
                  placeholder="Explain why this subscription is being rejected..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason("")
                  setSelectedSubscription(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={processing}>
                {processing ? "Rejecting..." : "Reject Subscription"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

