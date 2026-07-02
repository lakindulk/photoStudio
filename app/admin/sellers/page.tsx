"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Trash2, CheckCircle, XCircle, Eye, ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Seller {
  id: string
  name: string
  email: string
  businessName: string
  phone?: string
  whatsapp?: string
  categories: string[]
  isApproved: boolean
  paymentSlipUrl?: string
  createdAt: any
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        if (!db) {
          console.error("Database not initialized")
          setLoading(false)
          return
        }

        const q = query(collection(db, "users"), where("role", "==", "seller"))
        const querySnapshot = await getDocs(q)
        const sellersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Seller[]

        setSellers(sellersData)
        setFilteredSellers(sellersData)
      } catch (error) {
        console.error("Error fetching sellers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch sellers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSellers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = sellers.filter(
        (seller) =>
          seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredSellers(filtered)
    } else {
      setFilteredSellers(sellers)
    }
  }, [searchQuery, sellers])

  const handleApprovalToggle = async (sellerId: string, currentStatus: boolean) => {
    try {
      if (!db) {
        throw new Error("Database not initialized")
      }

      await updateDoc(doc(db, "users", sellerId), {
        isApproved: !currentStatus,
        updatedAt: new Date(),
      })

      setSellers((prev) =>
        prev.map((seller) => (seller.id === sellerId ? { ...seller, isApproved: !currentStatus } : seller)),
      )

      toast({
        title: "Success",
        description: `Seller ${!currentStatus ? "approved" : "suspended"} successfully`,
      })
    } catch (error) {
      console.error("Error updating seller approval:", error)
      toast({
        title: "Error",
        description: "Failed to update seller status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSeller = async (sellerId: string) => {
    if (!confirm("Are you sure you want to delete this seller? This action cannot be undone.")) {
      return
    }

    try {
      if (!db) {
        throw new Error("Database not initialized")
      }

      await deleteDoc(doc(db, "users", sellerId))
      setSellers((prev) => prev.filter((seller) => seller.id !== sellerId))

      toast({
        title: "Success",
        description: "Seller deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting seller:", error)
      toast({
        title: "Error",
        description: "Failed to delete seller",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sellers Management</h1>
            <p className="text-foreground/70">Manage seller accounts and approvals</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/70 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-border/40 text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sellers Table */}
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-foreground">Sellers ({filteredSellers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-foreground/70">Loading sellers...</div>
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-foreground/70">No sellers found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead className="text-foreground/80">Name</TableHead>
                      <TableHead className="text-foreground/80">Business</TableHead>
                      <TableHead className="text-foreground/80">Email</TableHead>
                      <TableHead className="text-foreground/80">Status</TableHead>
                      <TableHead className="text-foreground/80">Categories</TableHead>
                      <TableHead className="text-foreground/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSellers.map((seller) => (
                      <TableRow key={seller.id} className="border-border/40">
                        <TableCell className="text-foreground font-medium">{seller.name}</TableCell>
                        <TableCell className="text-foreground/80">{seller.businessName}</TableCell>
                        <TableCell className="text-foreground/80">{seller.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={seller.isApproved ? "default" : "secondary"}
                            className={seller.isApproved ? "bg-green-600" : "bg-yellow-600"}
                          >
                            {seller.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground/80">
                          <div className="flex flex-wrap gap-1">
                            {seller.categories?.slice(0, 2).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {seller.categories?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{seller.categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedSeller(seller)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border/40">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Seller Details</DialogTitle>
                                </DialogHeader>
                                {selectedSeller && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm text-foreground/70">Name</label>
                                      <p className="text-foreground">{selectedSeller.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm text-foreground/70">Business Name</label>
                                      <p className="text-foreground">{selectedSeller.businessName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm text-foreground/70">Email</label>
                                      <p className="text-foreground">{selectedSeller.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm text-foreground/70">Phone</label>
                                      <p className="text-foreground">{selectedSeller.phone || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm text-foreground/70">WhatsApp</label>
                                      <p className="text-foreground">{selectedSeller.whatsapp || "Not provided"}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm text-foreground/70">Categories</label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedSeller.categories?.map((category) => (
                                          <Badge key={category} variant="outline">
                                            {category}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm text-foreground/70">Payment Receipt</label>
                                      {selectedSeller.paymentSlipUrl ? (
                                        <div className="mt-2">
                                          <img
                                            src={selectedSeller.paymentSlipUrl}
                                            alt="Payment receipt"
                                            className="max-h-64 rounded-lg border border-border/40 object-contain"
                                          />
                                          <a
                                            href={selectedSeller.paymentSlipUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                                          >
                                            Open full size
                                          </a>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 mt-1 text-foreground/40">
                                          <ImageIcon className="w-4 h-4" />
                                          <span className="text-sm">No receipt uploaded</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprovalToggle(seller.id, seller.isApproved)}
                              className={seller.isApproved ? "text-yellow-500" : "text-green-500"}
                            >
                              {seller.isApproved ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSeller(seller.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
