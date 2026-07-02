"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { storage, getFirebaseFirestore } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc, collection, query, where, getDocs, increment } from "firebase/firestore"
import { SUBSCRIPTION_PACKAGES_3M } from "@/lib/constants"
import type { VipCode } from "@/types"
import { Camera, Upload, Check, Tag, X, Gift, Percent, ArrowLeft } from "lucide-react"
import Link from "next/link"

function RegisterForm() {
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get("plan") ?? ""

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    description: "",
    phone: "",
    whatsapp: "",
    selectedPlan: planFromUrl,
  })

  useEffect(() => {
    if (planFromUrl) {
      setFormData((prev) => ({ ...prev, selectedPlan: planFromUrl }))
    }
  }, [planFromUrl])

  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // VIP code state
  const [vipInput, setVipInput] = useState("")
  const [vipApplying, setVipApplying] = useState(false)
  const [appliedVip, setAppliedVip] = useState<VipCode | null>(null)
  const [vipError, setVipError] = useState("")

  const { signUp } = useAuth()
  const router = useRouter()

  const getEffectivePrice = (basePrice: number) => {
    if (!appliedVip || appliedVip.discountType !== "percent") return basePrice
    const pct = appliedVip.discountPercent ?? 0
    return Math.round(basePrice * (1 - pct / 100))
  }

  const isFreeVip = appliedVip?.discountType === "free"
  const selectedPlanData = SUBSCRIPTION_PACKAGES_3M.find((p) => p.type === formData.selectedPlan)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPaymentSlip(file)
    setPaymentSlipPreview(URL.createObjectURL(file))
  }

  const handleApplyVip = async () => {
    const code = vipInput.trim().toUpperCase()
    if (!code) return
    setVipError("")
    setVipApplying(true)
    try {
      const db = getFirebaseFirestore()
      if (!db) throw new Error("Database unavailable")
      const q = query(collection(db, "vipCodes"), where("code", "==", code), where("isActive", "==", true))
      const snap = await getDocs(q)
      if (snap.empty) {
        setVipError("Invalid or inactive VIP code.")
        setVipApplying(false)
        return
      }
      const vipDoc = snap.docs[0]
      const vip = { id: vipDoc.id, ...vipDoc.data() } as VipCode
      if (vip.useCount >= vip.maxUses) {
        setVipError("This VIP code has reached its usage limit.")
        setVipApplying(false)
        return
      }
      setAppliedVip(vip)
      toast({ title: "VIP Code Applied!", description: describeVip(vip) })
    } catch {
      setVipError("Failed to validate code. Please try again.")
    }
    setVipApplying(false)
  }

  const handleRemoveVip = () => {
    setAppliedVip(null)
    setVipInput("")
    setVipError("")
  }

  const describeVip = (vip: VipCode) => {
    if (vip.discountType === "free") {
      const dur = vip.freeDurationMonths ? `${vip.freeDurationMonths} month${vip.freeDurationMonths > 1 ? "s" : ""}` : "custom period"
      const svc = vip.freeServices === "all" ? "all services" : "selected services"
      return `Free access to ${svc} for ${dur}`
    }
    return `${vip.discountPercent}% off all plan prices`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" })
      return
    }
    if (formData.password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }

    // If no free VIP code, plan + payment are required
    if (!isFreeVip) {
      if (!formData.selectedPlan || !selectedPlanData) {
        toast({ title: "Select a Plan", description: "Please choose a subscription plan.", variant: "destructive" })
        return
      }
      if (!paymentSlip) {
        toast({ title: "Payment Receipt Required", description: "Please upload your payment receipt.", variant: "destructive" })
        return
      }
    }

    setLoading(true)
    try {
      let vipExpiresAt: Date | undefined
      if (isFreeVip && appliedVip?.freeDurationMonths) {
        vipExpiresAt = new Date()
        vipExpiresAt.setMonth(vipExpiresAt.getMonth() + appliedVip.freeDurationMonths)
      }

      const allowedCategories = isFreeVip
        ? (appliedVip!.freeServices === "all"
            ? SUBSCRIPTION_PACKAGES_3M.find((p) => p.type === "all-services")?.allowedCategories ?? []
            : appliedVip!.freeServices as string[])
        : (selectedPlanData?.allowedCategories ?? [])

      const uid = await signUp(formData.email, formData.password, {
        role: "seller",
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        businessName: formData.businessName,
        description: formData.description,
        categories: allowedCategories,
        selectedPlanType: isFreeVip ? "all-services" : selectedPlanData?.type,
        selectedPlanPrice: isFreeVip ? 0 : selectedPlanData?.price,
        isApproved: isFreeVip,
        ...(appliedVip ? { vipCodeUsed: appliedVip.code, vipCodeId: appliedVip.id } : {}),
        ...(vipExpiresAt ? { vipExpiresAt: vipExpiresAt.toISOString() } : {}),
      } as any)

      const db = getFirebaseFirestore()

      // Upload receipt if not free VIP
      if (!isFreeVip && storage && paymentSlip) {
        const slipRef = ref(storage, `sellerPayments/${uid}/receipt`)
        await uploadBytes(slipRef, paymentSlip)
        const paymentSlipUrl = await getDownloadURL(slipRef)
        if (db) {
          await updateDoc(doc(db, "users", uid), { paymentSlipUrl })
        }
      }

      // Increment VIP code usage
      if (appliedVip && db) {
        await updateDoc(doc(db, "vipCodes", appliedVip.id), { useCount: increment(1) })
      }

      toast({
        title: isFreeVip ? "Welcome to Malka Studio!" : "Registration Submitted",
        description: isFreeVip
          ? "Your account is activated. Welcome!"
          : "Your account is pending admin approval.",
      })
      router.push("/seller")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef3f0]/30">
      {/* Header */}
      <div className="bg-white border-b border-[#082537]/8 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 mr-1">
          <Camera className="w-5 h-5 text-[#788C59]" />
          <span className="font-black text-[#082537] text-xl tracking-tighter">
            malka<sup className="text-xs font-medium text-[#788C59] ml-0.5">™</sup>
          </span>
        </Link>
        <span className="text-[#082537]/20 text-sm">/ Seller Registration</span>
        <div className="flex-1" />
        <Link
          href="/plans"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#082537]/45 hover:text-[#082537]/75 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Plans
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#082537] tracking-tight">Join as a Seller</h1>
          <p className="text-[#082537]/50 mt-1 text-sm">
            Fill in your details, choose a subscription plan, and upload your payment receipt. Your account will be reviewed by an admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#082537]/50 uppercase tracking-widest">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Full Name *</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} required
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Email *</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Password *</Label>
                <Input name="password" type="password" value={formData.password} onChange={handleInputChange} required
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="Min 6 characters" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Confirm Password *</Label>
                <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="Repeat password" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Phone</Label>
                <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange}
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="+94 7X XXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">WhatsApp</Label>
                <Input name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange}
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="+94 7X XXX XXXX" />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#082537]/50 uppercase tracking-widest">Business Information</h2>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Business Name *</Label>
              <Input name="businessName" value={formData.businessName} onChange={handleInputChange} required
                className="rounded-xl border-[#082537]/15 h-11 text-[#082537]" placeholder="Your studio or business name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-[#082537]/60">Description *</Label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3}
                className="rounded-xl border-[#082537]/15 text-[#082537] resize-none"
                placeholder="Briefly describe your services and experience..." />
            </div>
          </div>

          {/* VIP Code */}
          <div className="bg-white rounded-2xl border border-[#082537]/8 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#082537]/50 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> VIP Code
              </h2>
              <p className="text-xs text-[#082537]/40 mt-1">Have a VIP code? Apply it to get free access or a discount on your plan.</p>
            </div>

            {appliedVip ? (
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                isFreeVip ? "bg-[#788C59]/10 border border-[#788C59]/30" : "bg-blue-50 border border-blue-200"
              }`}>
                <div className="flex items-center gap-3">
                  {isFreeVip
                    ? <Gift className="w-4 h-4 text-[#788C59]" />
                    : <Percent className="w-4 h-4 text-blue-600" />}
                  <div>
                    <p className={`text-sm font-bold ${isFreeVip ? "text-[#788C59]" : "text-blue-700"}`}>
                      {appliedVip.code}
                    </p>
                    <p className="text-xs text-[#082537]/50">{describeVip(appliedVip)}</p>
                  </div>
                </div>
                <button type="button" onClick={handleRemoveVip} className="text-[#082537]/30 hover:text-[#082537]/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={vipInput}
                  onChange={(e) => { setVipInput(e.target.value.toUpperCase()); setVipError("") }}
                  placeholder="Enter VIP code"
                  className="rounded-xl border-[#082537]/15 h-11 text-[#082537] flex-1 font-mono tracking-widest uppercase"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyVip() } }}
                />
                <Button
                  type="button"
                  onClick={handleApplyVip}
                  disabled={!vipInput.trim() || vipApplying}
                  className="h-11 px-5 bg-[#082537] hover:bg-[#082537]/85 text-white rounded-xl font-bold text-sm"
                >
                  {vipApplying ? "Checking..." : "Apply"}
                </Button>
              </div>
            )}
            {vipError && <p className="text-xs text-red-500 font-medium">{vipError}</p>}
          </div>

          {/* Free VIP — show access summary instead of plan + receipt */}
          {isFreeVip ? (
            <div className="bg-[#788C59]/8 rounded-2xl border-2 border-[#788C59]/30 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#788C59] flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-[#082537] text-lg">Free Access Activated</p>
                <p className="text-sm text-[#082537]/55 mt-1">
                  Your VIP code grants{" "}
                  {appliedVip!.freeServices === "all" ? "access to all services" : "access to selected services"}{" "}
                  {appliedVip!.freeDurationMonths
                    ? `for ${appliedVip!.freeDurationMonths} month${appliedVip!.freeDurationMonths > 1 ? "s" : ""}`
                    : ""}.
                  No payment required — your account will be activated immediately upon registration.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Subscription Plans */}
              <div className="bg-white rounded-2xl border border-[#082537]/8 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#082537]/50 uppercase tracking-widest">Choose a Plan</h2>
                    <p className="text-xs text-[#082537]/40 mt-1">Select the subscription plan you've paid for. Valid for 3 months after admin approval.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, selectedPlan: "" }))}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#082537]/30 hover:text-[#082537]/50 transition-colors mt-0.5"
                  >
                    Skip for now
                  </button>
                </div>

                {formData.selectedPlan === "" && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-medium">
                    You need to select a plan before you can post ads. You can choose a plan after logging in from your dashboard.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PACKAGES_3M.map((plan) => {
                    const isSelected = formData.selectedPlan === plan.type
                    const effectivePrice = getEffectivePrice(plan.price)
                    const hasDiscount = appliedVip?.discountType === "percent" && effectivePrice !== plan.price
                    return (
                      <button
                        key={plan.type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, selectedPlan: plan.type }))}
                        className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-[#788C59] bg-[#788C59]/5 shadow-md"
                            : "border-[#082537]/10 hover:border-[#082537]/25"
                        } ${(plan as any).popular ? "ring-1 ring-[#788C59]/30" : ""}`}
                      >
                        {(plan as any).popular && (
                          <span className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-widest bg-[#788C59] text-white px-2.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        {(plan as any).premium && (
                          <span className="absolute -top-2.5 left-4 text-[10px] font-black uppercase tracking-widest bg-[#082537] text-white px-2.5 py-0.5 rounded-full">
                            Premium
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#788C59] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <p className="font-black text-[#082537] text-base mb-0.5">{plan.name}</p>
                        <p className="text-xs text-[#082537]/40 mb-3">{plan.description}</p>
                        {hasDiscount ? (
                          <div className="mb-1">
                            <span className="text-sm text-[#082537]/30 line-through">LKR {plan.price.toLocaleString()}</span>
                            <p className="text-2xl font-black text-[#788C59]">LKR {effectivePrice.toLocaleString()}</p>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#788C59] bg-[#788C59]/10 px-1.5 py-0.5 rounded-full">
                              {appliedVip!.discountPercent}% off
                            </span>
                          </div>
                        ) : (
                          <p className="text-2xl font-black text-[#082537]">
                            LKR {plan.price.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-[#082537]/40 mb-4">{plan.duration}</p>
                        <ul className="space-y-1.5">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs text-[#082537]/70">
                              <Check className="w-3 h-3 text-[#788C59] flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
                {selectedPlanData && (
                  <p className="text-xs font-semibold text-[#788C59]">
                    Selected: {selectedPlanData.name} — LKR {getEffectivePrice(selectedPlanData.price).toLocaleString()} / {selectedPlanData.duration}
                  </p>
                )}
              </div>

              {/* Payment Receipt */}
              {formData.selectedPlan && (
                <div className="bg-white rounded-2xl border border-[#082537]/8 p-6 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#082537]/50 uppercase tracking-widest">Payment Receipt *</h2>
                    <p className="text-xs text-[#082537]/40 mt-1">
                      Transfer the plan amount to our bank account and upload the receipt here. Admin will verify before activating your account.
                    </p>
                  </div>
                  <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                    paymentSlipPreview ? "border-[#788C59]/40 bg-[#788C59]/5" : "border-[#082537]/15 hover:border-[#082537]/30"
                  }`}>
                    <input type="file" accept="image/*,.pdf" onChange={handlePaymentSlipChange} className="hidden" />
                    {paymentSlipPreview ? (
                      <div className="text-center">
                        <img src={paymentSlipPreview} alt="Receipt preview" className="max-h-40 rounded-xl mx-auto mb-2 object-contain" />
                        <p className="text-xs font-semibold text-[#788C59]">Receipt uploaded — click to change</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#082537]/5 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-[#082537]/30" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-[#082537]">Click to upload receipt</p>
                          <p className="text-xs text-[#082537]/40 mt-0.5">JPG, PNG or PDF</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              )}
            </>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#082537] hover:bg-[#082537]/90 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg hover:-translate-y-0.5"
          >
            {loading ? "Creating Account..." : "Submit Registration"}
          </Button>

          <p className="text-center text-xs text-[#082537]/40">
            Already have an account?{" "}
            <Link href="/seller/login" className="text-[#788C59] font-semibold hover:underline">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function SellerRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
