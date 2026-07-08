"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Star, Upload, X, CheckCircle, Camera, Image as ImageIcon, Video } from "lucide-react"
import Image from "next/image"
import type { SellerProfile } from "@/types"

export default function RatingPage() {
  const params = useParams()
  const sellerId = params.sellerId as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [loadingSeller, setLoadingSeller] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state — all optional
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [guestName, setGuestName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)

  useEffect(() => {
    if (!db || !sellerId) { setLoadingSeller(false); return }
    getDocs(query(collection(db, "sellerProfiles"), where("userId", "==", sellerId)))
      .then((snap) => {
        if (!snap.empty) {
          setSeller({ id: snap.docs[0].id, ...snap.docs[0].data() } as SellerProfile)
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSeller(false))
  }, [sellerId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")
    if (!isVideo && !isImage) {
      toast({ title: "Invalid file", description: "Please upload an image or video.", variant: "destructive" })
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 50 MB.", variant: "destructive" })
      return
    }
    setMediaFile(file)
    setMediaType(isVideo ? "video" : "image")
    setMediaPreview(URL.createObjectURL(file))
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating && !title.trim() && !description.trim() && !mediaFile) {
      toast({
        title: "Nothing to submit",
        description: "Please add at least a star rating, title, description, or media.",
        variant: "destructive",
      })
      return
    }
    if (!db) return
    setSubmitting(true)
    try {
      let mediaUrl: string | undefined
      if (mediaFile && storage) {
        const ext = mediaFile.name.split(".").pop() ?? "bin"
        const path = `ratings/media/${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const snap = await uploadBytes(ref(storage, path), mediaFile)
        mediaUrl = await getDownloadURL(snap.ref)
      }

      const data: Record<string, unknown> = { sellerId, createdAt: serverTimestamp() }
      if (rating) data.rating = rating
      if (guestName.trim()) data.guestName = guestName.trim()
      if (title.trim()) data.title = title.trim()
      if (description.trim()) data.description = description.trim()
      if (mediaUrl) { data.mediaUrl = mediaUrl; data.mediaType = mediaType }

      await addDoc(collection(db, "ratings"), data)
      setSubmitted(true)
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message ?? "Please try again.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingSeller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-16 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-800 rounded w-1/2" />
              <div className="h-3 bg-gray-800 rounded w-1/3" />
            </div>
          </div>
          <div className="h-48 bg-gray-800 rounded-xl" />
          <div className="h-12 bg-gray-800 rounded-xl" />
          <div className="h-28 bg-gray-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <p className="text-gray-400 text-lg">Seller not found.</p>
        </div>
      </div>
    )
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex w-24 h-24 rounded-full bg-green-500/15 items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Thank you!</h1>
          <p className="text-gray-400 text-lg">
            Your review for{" "}
            <span className="text-white font-semibold">{seller.name}</span> has been submitted.
          </p>
        </div>
      </div>
    )
  }

  const starLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

  // ── Rating form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Seller header */}
        <div className="flex items-center gap-4 mb-8">
          {seller.profileImage ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700">
              <Image src={seller.profileImage} alt={seller.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Camera className="w-7 h-7 text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">Leave a Review</h1>
            <p className="text-gray-400 text-sm">
              for <span className="text-white font-medium">{seller.name}</span> — all fields are optional
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Star Rating ──────────────────────────────────────────────── */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Star Rating <span className="normal-case tracking-normal font-normal">(optional)</span>
            </p>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s === rating ? 0 : s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-colors duration-100 ${
                      s <= (hoveredStar || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoveredStar || rating) > 0 && (
              <p className="text-sm text-yellow-400 font-medium">
                {starLabels[hoveredStar || rating]}
              </p>
            )}
          </div>

          {/* ── Guest Name ───────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300 font-medium">
              Your Name <span className="text-gray-600 font-normal">(optional)</span>
            </Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Sarah M."
              maxLength={60}
              className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-700 rounded-xl focus:border-gray-600"
            />
          </div>

          {/* ── Title ────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300 font-medium">
              Review Title <span className="text-gray-600 font-normal">(optional)</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stunning wedding photos!"
              maxLength={100}
              className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-700 rounded-xl focus:border-gray-600"
            />
          </div>

          {/* ── Description ──────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300 font-medium">
              Description <span className="text-gray-600 font-normal">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your experience with this photographer..."
              rows={4}
              maxLength={1000}
              className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-700 rounded-xl focus:border-gray-600 resize-none"
            />
            {description.length > 900 && (
              <p className="text-xs text-gray-500 text-right">{description.length}/1000</p>
            )}
          </div>

          {/* ── Media Upload ─────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-300 font-medium">
              Photo or Video <span className="text-gray-600 font-normal">(optional)</span>
            </Label>

            {mediaPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-800">
                {mediaType === "video" ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-72 bg-black"
                  />
                ) : (
                  <div className="relative w-full h-64">
                    <Image src={mediaPreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {mediaType === "video" ? (
                      <><Video className="w-3 h-3" /> Video</>
                    ) : (
                      <><ImageIcon className="w-3 h-3" /> Photo</>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-800 rounded-xl cursor-pointer hover:border-gray-600 hover:bg-gray-900/30 transition-all">
                <Upload className="w-6 h-6 text-gray-600 mb-2" />
                <span className="text-sm text-gray-500">Click to upload a photo or video</span>
                <span className="text-xs text-gray-700 mt-1">Max 50 MB · JPG, PNG, MP4, MOV…</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-[#788C59] hover:bg-[#788C59]/85 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg shadow-[#788C59]/20 transition-all"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      </div>
    </div>
  )
}
