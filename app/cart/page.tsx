"use client"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { useCart } from "@/contexts/CartContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { items, removeItem, clearCart, totalAmount } = useCart()
  const router = useRouter()

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

  const handleProceedToCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-foreground/70">Review your selected services</p>
        </div>

        {items.length === 0 ? (
          <Card className="bg-card border-border/40">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-foreground/70 mb-6">Browse our services and add them to your cart</p>
              <Link href="/">
                <Button>Browse Services</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center justify-between">
                  Cart Items ({items.length})
                  <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-400">
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.advertisementId}-${item.packageId}`}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium mb-1">{item.packageName}</h3>
                      <p className="text-foreground/70 text-sm mb-2">{item.sellerName}</p>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(item.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">LKR {item.price.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.advertisementId, item.packageId)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="text-foreground">LKR {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border/40">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-semibold text-foreground">LKR {totalAmount.toLocaleString()}</span>
                </div>
                <Button onClick={handleProceedToCheckout} className="w-full flex items-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-4">
                <h3 className="text-foreground font-medium mb-2">Important Notes:</h3>
                <ul className="text-foreground/70 text-sm space-y-1">
                  <li>â€¢ Your booking will be pending until confirmed by the service provider</li>
                  <li>â€¢ You'll receive WhatsApp notifications about your booking status</li>
                  <li>â€¢ Payment is only required after the service provider confirms availability</li>
                  <li>â€¢ You can contact our support team anytime for assistance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
