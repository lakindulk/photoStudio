"use client"

import { useState, useRef } from "react"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Upload, X, ChevronLeft, ShoppingBag, AlertCircle, ImagePlus } from "lucide-react"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LISTING_FEE, PAYMENT_WHATSAPP_URL } from "@/lib/constants"
import type { MarketplaceCategory, MarketplaceListingType } from "@/types"

const CONDITIONS = [
  { value: "new", label: "Brand New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good Condition" },
  { value: "fair", label: "Fair Condition" },
]

const RENT_PERIODS = ["Per Day", "Per Week", "Per Event", "Per Month"]

export default function CreateMarketplaceListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const slipInputRef = useRef<HTMLInputElement>(null)
  const imagesInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "" as MarketplaceCategory,
    listingType: "sell" as MarketplaceListingType,
    price: "",
    rentPeriod: "",
    condition: "good" as string,
    location: "",
    sellerContact: "",
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }
    const newFiles = files.slice(0, 5 - images.length)
    setImages((prev) => [...prev, ...newFiles])
    newFiles.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("Payment slip must be under 5MB"); return }
    setPaymentSlip(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPaymentSlipPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!user) return
    if (!form.title || !form.category || !form.price || !paymentSlip) {
      setError("Please fill all required fields and upload payment slip")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      // Upload images
      const imageUrls: string[] = []
      for (const img of images) {
        const imgRef = ref(storage, `marketplace/${user.id}/${Date.now()}_${img.name}`)
        await uploadBytes(imgRef, img)
        imageUrls.push(await getDownloadURL(imgRef))
      }

      // Upload payment slip
      const slipRef = ref(storage, `marketplace/slips/${user.id}/${Date.now()}_slip`)
      await uploadBytes(slipRef, paymentSlip)
      const slipUrl = await getDownloadURL(slipRef)

      const now = new Date().toISOString()
      await addDoc(collection(db, "marketplaceItems"), {
        sellerId: user.id,
        sellerName: (user as any).name || user.email,
        sellerEmail: user.email,
        sellerContact: form.sellerContact,
        title: form.title,
        description: form.description,
        category: form.category,
        listingType: form.listingType,
        price: parseFloat(form.price),
        rentPeriod: form.listingType === "rent" ? form.rentPeriod : null,
        condition: form.condition,
        location: form.location,
        images: imageUrls,
        status: "pending",
        paymentSlipUrl: slipUrl,
        listingFee: MARKETPLACE_LISTING_FEE,
        createdAt: now,
        updatedAt: now,
      })

      router.push("/seller/marketplace")
    } catch (e) {
      console.error(e)
      setError("Failed to submit listing. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/40 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white border border-[#082537]/10 flex items-center justify-center hover:bg-[#082537]/5 transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#082537]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#082537]">Create New Listing</h1>
              <p className="text-xs text-[#082537]/50">List your equipment for sale or rent</p>
            </div>
          </div>

          {/* Listing fee notice */}
          <div className="bg-[#788C59]/10 border border-[#788C59]/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <ShoppingBag className="w-5 h-5 text-[#788C59] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#082537]">Listing Fee: 100 LKR</p>
              <p className="text-xs text-[#082537]/60 mt-0.5">
                Pay via bank transfer and upload your slip below. Your listing goes live for 2 months after admin approval.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Listing type toggle */}
            <div className="bg-white rounded-2xl border border-[#082537]/8 p-5">
              <label className="text-xs font-bold text-[#082537]/50 uppercase tracking-wider">Listing Type *</label>
              <div className="flex gap-3 mt-3">
                {(["sell", "rent"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, listingType: type })}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                      form.listingType === type
                        ? type === "sell" ? "bg-[#082537] border-[#082537] text-white" : "bg-[#788C59] border-[#788C59] text-white"
                        : "border-[#082537]/10 text-[#082537]/50 hover:border-[#082537]/20"
                    }`}
                  >
                    {type === "sell" ? "For Sale" : "For Rent"}
                  </button>
                ))}
              </div>
            </div>

            {/* Item details */}
            <div className="bg-white rounded-2xl border border-[#082537]/8 p-5 space-y-4">
              <p className="font-bold text-[#082537] text-sm">Item Details</p>

              <div>
                <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Canon EOS 5D Mark IV"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as MarketplaceCategory })}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59] bg-white"
                >
                  <option value="">Select category</option>
                  {MARKETPLACE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Describe the item, its condition, included accessories, etc."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]"
                  />
                </div>
                {form.listingType === "rent" && (
                  <div>
                    <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Rent Period</label>
                    <select
                      value={form.rentPeriod}
                      onChange={(e) => setForm({ ...form, rentPeriod: e.target.value })}
                      className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59] bg-white"
                    >
                      <option value="">Select</option>
                      {RENT_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59] bg-white"
                  >
                    {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#082537]/50 uppercase tracking-wider">Contact Number</label>
                <input
                  type="text"
                  placeholder="e.g. +94 77 123 4567"
                  value={form.sellerContact}
                  onChange={(e) => setForm({ ...form, sellerContact: e.target.value })}
                  className="mt-1.5 w-full border border-[#082537]/15 rounded-xl px-4 py-2.5 text-sm text-[#082537] focus:outline-none focus:ring-2 focus:ring-[#788C59]/40 focus:border-[#788C59]"
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-[#082537]/8 p-5">
              <p className="font-bold text-[#082537] text-sm mb-3">Item Photos (up to 5)</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#082537]/5">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <button
                    onClick={() => imagesInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#082537]/15 hover:border-[#788C59]/40 flex flex-col items-center justify-center gap-1 text-[#082537]/30 hover:text-[#788C59] transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[9px] font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              <input ref={imagesInputRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-[#082537]/8 p-5">
              <p className="font-bold text-[#082537] text-sm mb-1">Payment Slip</p>
              <p className="text-xs text-[#082537]/50 mb-4">
                Transfer <strong>100 LKR</strong> to our account and upload the receipt screenshot.{" "}
                <a href={PAYMENT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-[#788C59] hover:underline font-medium">
                  Contact us on WhatsApp
                </a>{" "}
                for bank details.
              </p>
              <input ref={slipInputRef} type="file" accept="image/*" onChange={handleSlip} className="hidden" />
              {paymentSlipPreview ? (
                <div className="relative">
                  <img src={paymentSlipPreview} alt="Payment slip" className="w-full max-h-48 object-contain rounded-xl border border-[#082537]/10" />
                  <button
                    onClick={() => { setPaymentSlip(null); setPaymentSlipPreview("") }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => slipInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#082537]/15 hover:border-[#788C59]/40 rounded-xl py-8 flex flex-col items-center justify-center gap-2 text-[#082537]/40 hover:text-[#788C59] transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">Upload Payment Slip</span>
                  <span className="text-xs">JPG, PNG — max 5MB</span>
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#082537] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#082537]/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? "Submitting..." : "Submit Listing (100 LKR)"}
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  )
}
