"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { SellerLayout } from "@/components/seller/SellerLayout"
import { useAuth } from "@/contexts/AuthContext"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {
  SUBSCRIPTION_PACKAGES_3M,
  SUBSCRIPTION_PACKAGES_6M,
  SUBSCRIPTION_PACKAGES_SPECIAL,
  PAYMENT_WHATSAPP_URL,
  MAX_ADS_PER_SUBSCRIPTION,
} from "@/lib/constants"
import {
  Check, Upload, X, ChevronLeft, MessageCircle, AlertCircle, ExternalLink, CalendarDays,
  LayoutGrid, Zap, Star, Globe,
} from "lucide-react"

type PlanTab = "all" | "basic" | "standard" | "premium"

const TABS: { key: PlanTab; label: string; icon: any; desc: string }[] = [
  { key: "all",      label: "All",      icon: LayoutGrid, desc: "Every available plan" },
  { key: "basic",    label: "Basic",    icon: Zap,        desc: "Ads-only or readymade portfolio" },
  { key: "standard", label: "Standard", icon: Star,       desc: "Full service — 3 or 6 months" },
  { key: "premium",  label: "Premium",  icon: Globe,      desc: "Custom website or fully managed" },
]

const ALL_SECTIONS = [
  { label: "Business & Portfolio",  desc: "Ads-only, readymade portfolio, or a fully custom website",  packages: SUBSCRIPTION_PACKAGES_SPECIAL, tab: "basic" as PlanTab },
  { label: "3-Month Plans",         desc: "Standard service plans — billed every 3 months",             packages: SUBSCRIPTION_PACKAGES_3M,      tab: "standard" as PlanTab },
  { label: "6-Month Plans",         desc: "Save ~20% — same plans billed every 6 months",               packages: SUBSCRIPTION_PACKAGES_6M,      tab: "standard" as PlanTab },
  { label: "Premium Plans",         desc: "Custom website or fully managed by our team",                packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(2), tab: "premium" as PlanTab },
]

export default function PurchaseSubscriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const slipRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<PlanTab>("all")
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError("File too large — max 5MB"); return }
    setSlipFile(f)
    const r = new FileReader()
    r.onload = (ev) => setSlipPreview(ev.target?.result as string)
    r.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!user || !selectedPackage || !slipFile) {
      setError("Please select a package and upload payment slip")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const slipStorageRef = ref(storage, `payments/${user.id}/${Date.now()}_slip`)
      await uploadBytes(slipStorageRef, slipFile)
      const slipUrl = await getDownloadURL(slipStorageRef)

      await addDoc(collection(db, "subscriptions"), {
        sellerId: user.id,
        packageType: selectedPackage.type,
        amount: selectedPackage.price,
        durationMonths: selectedPackage.durationMonths,
        paymentSlipUrl: slipUrl,
        status: "pending",
        allowedCategories: selectedPackage.allowedCategories || [],
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      setSuccess(true)
    } catch (e) {
      console.error(e)
      setError("Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isContact = (pkg: any) =>
    pkg.type === "custom-portfolio-website" || pkg.type === "fully-managed"

  if (success) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-[#eef3f0]/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-[#788C59]/20 flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 text-[#788C59]" />
            </div>
            <h2 className="text-2xl font-black text-[#082537] mb-2">Submitted!</h2>
            <p className="text-[#082537]/60 mb-6">
              Your subscription request has been submitted. Admin will review within 24 hours.
            </p>
            <button
              onClick={() => router.push("/seller/subscriptions")}
              className="w-full bg-[#082537] text-white py-3 rounded-2xl font-bold hover:bg-[#082537]/90 transition-colors"
            >
              View My Subscriptions
            </button>
          </div>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-[#eef3f0]/40 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in-down">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-[#082537]/10 flex items-center justify-center hover:bg-[#082537]/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#082537]" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#082537]">Choose a Plan</h1>
            <p className="text-sm text-[#082537]/50 mt-0.5">All plans include a free Event Calendar &amp; up to {MAX_ADS_PER_SUBSCRIPTION} ads</p>
          </div>
        </div>

        {/* Calendar banner */}
        <div className="mb-6 bg-[#788C59]/10 border border-[#788C59]/20 rounded-2xl p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <CalendarDays className="w-5 h-5 text-[#788C59] flex-shrink-0" />
          <p className="text-sm text-[#082537]">
            <strong>Every plan includes a free Event Calendar</strong> — schedule shoots, meetings &amp; deliveries with ease.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSelectedPackage(null) }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === key
                  ? "bg-[#082537] text-white shadow-md"
                  : "bg-white text-[#082537]/60 border border-[#082537]/10 hover:border-[#082537]/25 hover:text-[#082537]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Filtered sections */}
        {(activeTab === "all"
          ? [
              { label: "Business & Portfolio", desc: "Ads-only or readymade portfolio", packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(0, 2), tab: "basic" as PlanTab },
              { label: "3-Month Plans",        desc: "Standard service plans — billed every 3 months", packages: SUBSCRIPTION_PACKAGES_3M, tab: "standard" as PlanTab },
              { label: "6-Month Plans",        desc: "Save ~20% — same plans billed every 6 months",   packages: SUBSCRIPTION_PACKAGES_6M, tab: "standard" as PlanTab },
              { label: "Premium Plans",        desc: "Custom website or fully managed by our team",     packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(2), tab: "premium" as PlanTab },
            ]
          : activeTab === "basic"
          ? [{ label: "Business & Portfolio", desc: "Ads-only or readymade portfolio", packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(0, 2), tab: "basic" as PlanTab }]
          : activeTab === "standard"
          ? [
              { label: "3-Month Plans", desc: "Standard service plans — billed every 3 months", packages: SUBSCRIPTION_PACKAGES_3M, tab: "standard" as PlanTab },
              { label: "6-Month Plans", desc: "Save ~20% — same plans billed every 6 months",   packages: SUBSCRIPTION_PACKAGES_6M, tab: "standard" as PlanTab },
            ]
          : [{ label: "Premium Plans", desc: "Custom website or fully managed by our team", packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(2), tab: "premium" as PlanTab }]
        ).map((section, si) => (
          <div key={section.label} className="mb-10 animate-fade-in-up" style={{ animationDelay: `${si * 80}ms` }}>
            {/* Section header */}
            <div className="mb-4">
              <h2 className="text-lg font-black text-[#082537]">{section.label}</h2>
              <p className="text-sm text-[#082537]/45 mt-0.5">{section.desc}</p>
            </div>

            {/* Package cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.packages.map((pkg: any, pi: number) => {
                const isSelected = selectedPackage?.type === pkg.type
                const contact = isContact(pkg)

                return (
                  <div
                    key={pkg.type}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 animate-fade-in ${
                      isSelected
                        ? "border-[#082537] bg-[#082537]/3 shadow-lg scale-[1.01]"
                        : "border-[#082537]/10 bg-white hover:border-[#082537]/25 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                    style={{ animationDelay: `${si * 80 + pi * 50}ms` }}
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end">
                      {pkg.popular && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#788C59] text-white">Popular</span>}
                      {pkg.premium && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#082537] text-white">Premium</span>}
                      {pkg.badge && !pkg.popular && !pkg.premium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#788C59]/15 text-[#788C59] border border-[#788C59]/30">{pkg.badge}</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-4 left-4 w-5 h-5 rounded-full bg-[#082537] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div className={isSelected ? "pl-7" : ""}>
                      <h3 className="font-black text-[#082537] text-base pr-16 mb-0.5">{pkg.name}</h3>
                      <p className="text-xs text-[#082537]/50 mb-3">{pkg.description}</p>

                      <div className="mb-4">
                        {contact ? (
                          <p className="text-xl font-black text-[#082537]">{pkg.priceLabel}</p>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#082537]">{pkg.price.toLocaleString()}</span>
                            <span className="text-sm font-medium text-[#082537]/50">LKR / {pkg.duration}</span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-1.5">
                        {pkg.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#082537]/70">
                            <Check className="w-3.5 h-3.5 text-[#788C59] flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {contact && (
                        <p className="mt-3 text-xs text-[#788C59] font-medium flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          Contact us to discuss pricing
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Payment form — appears when a plan is selected */}
        {selectedPackage && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#082537]/10 shadow-sm p-6 space-y-5 animate-fade-in-up mt-4 mb-8">
            <div>
              <h2 className="font-black text-[#082537] text-lg">
                {isContact(selectedPackage) ? "Contact Us to Proceed" : "Complete Your Payment"}
              </h2>
              <p className="text-sm text-[#082537]/60 mt-0.5">
                Plan: <strong>{selectedPackage.name}</strong>
                {selectedPackage.price > 0 && (
                  <> — <strong>{selectedPackage.price.toLocaleString()} LKR / {selectedPackage.duration}</strong></>
                )}
              </p>
            </div>

            {isContact(selectedPackage) ? (
              <div className="space-y-4">
                <p className="text-sm text-[#082537]/70">
                  This plan is custom-priced. Reach out on WhatsApp and our team will get back to you with a tailored quote.
                </p>
                <a
                  href={PAYMENT_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3.5 rounded-2xl font-bold hover:bg-[#1db954] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                  <ExternalLink className="w-4 h-4 opacity-60" />
                </a>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {[
                    { n: 1, t: "Make bank transfer", d: `Send ${selectedPackage.price.toLocaleString()} LKR. Contact us on WhatsApp for bank account details.` },
                    { n: 2, t: "Screenshot the receipt", d: "Take a clear photo or screenshot of your transfer confirmation." },
                    { n: 3, t: "Upload below & submit", d: "Upload the receipt and click Submit. We review within 24 hours." },
                    { n: 4, t: "Go live!", d: `Your subscription activates for ${selectedPackage.durationMonths} months with up to ${MAX_ADS_PER_SUBSCRIPTION} active ads.` },
                  ].map((s) => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#082537] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {s.n}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#082537]">{s.t}</p>
                        <p className="text-xs text-[#082537]/50 mt-0.5">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href={PAYMENT_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-[#25D366]/50 text-[#25D366] py-2.5 rounded-xl font-medium text-sm hover:bg-[#25D366]/5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Get bank details on WhatsApp
                </a>

                <div>
                  <p className="text-xs font-bold text-[#082537]/50 uppercase tracking-wider mb-2">Upload Payment Slip *</p>
                  <input ref={slipRef} type="file" accept="image/*" onChange={handleSlip} className="hidden" />
                  {slipPreview ? (
                    <div className="relative">
                      <img src={slipPreview} alt="slip" className="w-full max-h-44 object-contain rounded-xl border border-[#082537]/10" />
                      <button
                        onClick={() => { setSlipFile(null); setSlipPreview("") }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => slipRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#082537]/15 hover:border-[#788C59]/40 rounded-xl py-8 flex flex-col items-center justify-center gap-2 text-[#082537]/40 hover:text-[#788C59] transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">Upload receipt (JPG/PNG — max 5MB)</span>
                    </button>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !slipFile}
                  className="w-full bg-[#082537] text-white py-3.5 rounded-2xl font-bold hover:bg-[#082537]/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Submitting..." : `Submit — ${selectedPackage.price.toLocaleString()} LKR`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </SellerLayout>
  )
}
