"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { PortfolioItemUpload } from "@/components/PortfolioItemUpload"
import { PortfolioTypeSelector } from "@/components/PortfolioTypeSelector"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
  Link2, Copy, CheckCheck, ExternalLink, ImageIcon, Video, Save, Camera,
} from "lucide-react"
import Link from "next/link"
import type { PortfolioItem, PortfolioType, SellerProfile } from "@/types"

export default function SellerPortfolioPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [portfolioType, setPortfolioType] = useState<PortfolioType>("type1")
  const [linkCopied, setLinkCopied] = useState(false)

  const portfolioUrl =
    typeof window !== "undefined" && user
      ? `${window.location.origin}/portfolio/${user.id}`
      : ""

  // ── Load existing portfolio ────────────────────────────────────────────────
  useEffect(() => {
    if (!db || !user) return
    getDocs(query(collection(db, "sellerProfiles"), where("userId", "==", user.id)))
      .then((snap) => {
        if (!snap.empty) {
          const data = snap.docs[0].data() as SellerProfile
          setProfileId(snap.docs[0].id)
          setPortfolioItems(data.portfolioItems ?? [])
          setPortfolioType(data.portfolioType ?? "type1")
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!db || !user) return
    setSaving(true)
    try {
      const payload = {
        portfolioItems,
        portfolioType,
        updatedAt: new Date(),
      }
      if (profileId) {
        await updateDoc(doc(db, "sellerProfiles", profileId), payload)
      } else {
        await addDoc(collection(db, "sellerProfiles"), {
          userId: user.id,
          name: (user as any).name ?? "",
          contactNo: (user as any).phone ?? "",
          email: user.email,
          address: "",
          hideAddress: false,
          createdAt: new Date(),
          ...payload,
        })
      }
      toast({ title: "Portfolio saved!", description: "Your public portfolio has been updated." })
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message ?? "Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  // ── Copy link ──────────────────────────────────────────────────────────────
  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl).then(() => {
      setLinkCopied(true)
      toast({ title: "Link copied!", description: "Share this link so anyone can view your portfolio." })
      setTimeout(() => setLinkCopied(false), 2500)
    })
  }

  const photoCount = portfolioItems.filter((i) => i.type === "image").length
  const videoCount = portfolioItems.filter((i) => i.type === "video").length

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SellerLayout>
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-24 bg-white rounded-2xl border border-[#082537]/8" />
          <div className="h-48 bg-white rounded-2xl border border-[#082537]/8" />
          <div className="h-96 bg-white rounded-2xl border border-[#082537]/8" />
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Page title ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-[#082537]">My Portfolio</h1>
          <p className="text-sm text-[#082537]/50 mt-0.5">
            Add your photos and videos — then share the link with anyone.
          </p>
        </div>

        {/* ── Portfolio link card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#082537]/8 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-[#788C59]" />
            <h2 className="text-sm font-bold text-[#082537]">Your Public Portfolio Link</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#eef3f0] rounded-xl px-3 py-2.5 min-w-0">
              <span className="text-xs font-mono text-[#082537]/60 truncate">{portfolioUrl}</span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={copyLink}
                size="sm"
                className="h-9 px-4 bg-[#082537] hover:bg-[#082537]/85 text-white rounded-xl font-bold text-xs gap-1.5"
              >
                {linkCopied ? (
                  <><CheckCheck className="w-3.5 h-3.5" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                )}
              </Button>
              <Link href={`/portfolio/${user?.id}`} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 border-[#082537]/15 text-[#082537]/60 hover:text-[#082537] rounded-xl text-xs gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-[#082537]/35 mt-2">
            Anyone with this link can view your portfolio — no login required.
          </p>

          {/* Stats row */}
          {portfolioItems.length > 0 && (
            <div className="flex gap-4 mt-3 pt-3 border-t border-[#082537]/6">
              <div className="flex items-center gap-1.5 text-xs text-[#082537]/50">
                <ImageIcon className="w-3.5 h-3.5 text-[#788C59]" />
                <span>{photoCount} photo{photoCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#082537]/50">
                <Video className="w-3.5 h-3.5 text-[#788C59]" />
                <span>{videoCount} video{videoCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Layout style ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#082537]/8 p-5">
          <h2 className="text-sm font-bold text-[#082537] mb-4">Portfolio Layout Style</h2>
          <PortfolioTypeSelector
            selectedType={portfolioType}
            onTypeChange={setPortfolioType}
          />
        </div>

        {/* ── Portfolio items ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#082537]/8 p-5">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-[#082537]">Portfolio Works</h2>
            <p className="text-xs text-[#082537]/40 mt-0.5">
              Upload photos and videos, or paste external URLs (YouTube, Vimeo, Cloudinary, etc.).
            </p>
          </div>

          <PortfolioItemUpload
            label=""
            items={portfolioItems}
            onChange={setPortfolioItems}
            maxSizeMB={50}
            storagePath="seller-portfolios"
            maxItems={60}
          />
        </div>

        {/* ── Save button ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 pb-8">
          <p className="text-xs text-[#082537]/40">
            Save your changes, then share the link above with clients and social media.
          </p>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-11 px-8 bg-[#788C59] hover:bg-[#788C59]/85 text-white rounded-xl font-bold text-sm gap-2 shadow-lg shadow-[#788C59]/20"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Portfolio"}
          </Button>
        </div>
      </div>
    </SellerLayout>
  )
}
