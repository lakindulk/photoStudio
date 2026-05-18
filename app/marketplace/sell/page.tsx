"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import {
  SUBSCRIPTION_PACKAGES_3M,
  SUBSCRIPTION_PACKAGES_6M,
  SUBSCRIPTION_PACKAGES_SPECIAL,
} from "@/lib/constants"
import {
  Check, ShoppingBag, UserPlus, Upload, BadgeCheck, Zap,
  LayoutGrid, Star, Globe, ArrowRight, MessageCircle, Tag,
} from "lucide-react"
import Link from "next/link"

const WA = "https://wa.me/940715816400"

type Tab = "all" | "basic" | "standard" | "premium"

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "all",      label: "All Plans",  icon: LayoutGrid },
  { key: "basic",    label: "Basic",      icon: Zap },
  { key: "standard", label: "Standard",   icon: Star },
  { key: "premium",  label: "Premium",    icon: Globe },
]

const stripCalendar = (features: string[]) =>
  features.filter((f) => !f.toLowerCase().includes("event calendar"))

const SECTIONS = {
  all: [
    { label: "Business & Portfolio", desc: "Get listed with ads-only or a readymade portfolio", packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(0, 2) },
    { label: "3-Month Plans",        desc: "Standard service plans — billed every 3 months",   packages: SUBSCRIPTION_PACKAGES_3M },
    { label: "6-Month Plans",        desc: "Save ~20% — same plans billed every 6 months",     packages: SUBSCRIPTION_PACKAGES_6M },
    { label: "Premium Plans",        desc: "Custom website or fully managed by our team",       packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(2) },
  ],
  basic: [
    { label: "Business & Portfolio", desc: "Get listed with ads-only or a readymade portfolio", packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(0, 2) },
  ],
  standard: [
    { label: "3-Month Plans", desc: "Standard service plans — billed every 3 months", packages: SUBSCRIPTION_PACKAGES_3M },
    { label: "6-Month Plans", desc: "Save ~20% — same plans billed every 6 months",   packages: SUBSCRIPTION_PACKAGES_6M },
  ],
  premium: [
    { label: "Premium Plans", desc: "Custom website or fully managed by our team", packages: SUBSCRIPTION_PACKAGES_SPECIAL.slice(2) },
  ],
}

const isContact = (pkg: any) =>
  pkg.type === "custom-portfolio-website" || pkg.type === "fully-managed"

const STEPS = [
  { icon: UserPlus,   title: "Register as a Seller",       desc: "Contact us on WhatsApp to create your seller account and unlock marketplace listing access." },
  { icon: Tag,        title: "Create Your Listing",         desc: "Fill in your item details, add photos, set your price, and choose sale or rent." },
  { icon: Upload,     title: "Pay 100 LKR & Upload Slip",   desc: "Transfer 100 LKR via bank transfer and upload your receipt. Your listing stays live for 2 months." },
  { icon: BadgeCheck, title: "Admin Approves & Goes Live",  desc: "Our team reviews your listing within 24 hours. Once approved, it's published to the marketplace." },
]

export default function SellOnMarketplacePage() {
  const [tab, setTab] = useState<Tab>("all")

  return (
    <div className="min-h-screen bg-[#f4f7f5]">
      <Header forceWhite />

      {/* Hero */}
      <section className="bg-[#082537] pt-32 pb-20 px-6 relative overflow-hidden noise">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#788C59]/10 blur-3xl pointer-events-none animate-glow" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#788C59]/5 blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#788C59]/20 border border-[#788C59]/30 text-[#788C59] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <ShoppingBag className="w-3.5 h-3.5" />
            Sell on Marketplace
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4">
            Sell Your Gear<br />
            <span className="text-[#788C59]">For Just 100 LKR</span>
          </h1>
          <p className="text-white/45 text-base max-w-xl mx-auto leading-relaxed mb-8">
            List your cameras, lenses, lighting, and more. Listings stay live for 2 months.
            Register as a seller to get started.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="btn-shimmer inline-flex items-center gap-2 bg-[#788C59] hover:bg-[#788C59]/90 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg hover:-translate-y-0.5"
          >
            Register as a Seller <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-white border-b border-[#082537]/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#788C59] text-xs font-bold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl font-black text-[#082537] tracking-tight">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 h-px bg-[#082537]/8 z-0" style={{ width: "calc(100% - 3rem)", left: "3rem" }} />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#082537] flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-[#788C59]" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#788C59]/15 flex items-center justify-center mb-3">
                    <span className="text-[10px] font-black text-[#788C59]">{i + 1}</span>
                  </div>
                  <h3 className="font-black text-[#082537] text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-[#082537]/50 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listing fee highlight */}
      <section className="py-10 px-6 bg-[#eef3f0]/50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#082537] rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[#788C59]/20 flex items-center justify-center flex-shrink-0">
              <Tag className="w-7 h-7 text-[#788C59]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-1">Just 100 LKR per listing</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                Pay via bank transfer, upload your slip, and our admin reviews within 24 hours.
                Your item stays live for 2 full months once approved.
              </p>
            </div>
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-[#788C59] hover:bg-[#788C59]/90 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Subscription plans */}
      <section className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#788C59] text-xs font-bold uppercase tracking-widest mb-2">Also Available</p>
            <h2 className="text-3xl font-black text-[#082537] tracking-tight">Seller Subscription Plans</h2>
            <p className="text-[#082537]/45 text-sm mt-2 max-w-lg mx-auto">
              Unlock a full seller profile, portfolio page, and service ads alongside your marketplace listings.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-1 justify-center flex-wrap">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  tab === key
                    ? "bg-[#082537] text-white shadow-sm"
                    : "text-[#082537]/55 bg-white border border-[#082537]/10 hover:text-[#082537] hover:border-[#082537]/25"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {SECTIONS[tab].map((section, si) => (
              <div key={section.label} className="animate-fade-in-up" style={{ animationDelay: `${si * 60}ms` }}>
                <div className="mb-5">
                  <h3 className="text-lg font-black text-[#082537]">{section.label}</h3>
                  <p className="text-sm text-[#082537]/45 mt-0.5">{section.desc}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {section.packages.map((pkg: any, pi: number) => {
                    const contact = isContact(pkg)
                    const features = stripCalendar(pkg.features)
                    return (
                      <div
                        key={pkg.type}
                        className={`relative rounded-2xl border-2 p-6 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                          pkg.popular || pkg.premium
                            ? "border-[#082537] shadow-md"
                            : "border-[#082537]/10 shadow-sm"
                        }`}
                        style={{ animationDelay: `${si * 60 + pi * 50}ms` }}
                      >
                        <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end">
                          {pkg.popular && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#788C59] text-white">Popular</span>}
                          {pkg.premium && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#082537] text-white">Premium</span>}
                          {pkg.badge && !pkg.popular && !pkg.premium && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#788C59]/15 text-[#788C59] border border-[#788C59]/30">{pkg.badge}</span>
                          )}
                        </div>

                        <h4 className="font-black text-[#082537] text-lg pr-20 mb-1">{pkg.name}</h4>
                        <p className="text-xs text-[#082537]/45 mb-4 leading-relaxed">{pkg.description}</p>

                        <div className="mb-5">
                          {contact ? (
                            <p className="text-2xl font-black text-[#082537]">{pkg.priceLabel}</p>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-[#082537]">{pkg.price.toLocaleString()}</span>
                              <span className="text-sm font-medium text-[#082537]/45">LKR / {pkg.duration}</span>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2 mb-6">
                          {features.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#082537]/70">
                              <Check className="w-4 h-4 text-[#788C59] flex-shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <a
                          href={WA}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-colors group ${
                            contact
                              ? "bg-[#25D366] hover:bg-[#1db954] text-white"
                              : "bg-[#082537] hover:bg-[#082537]/90 text-white"
                          }`}
                        >
                          {contact ? <MessageCircle className="w-4 h-4" /> : null}
                          {contact ? "Contact on WhatsApp" : "Get Started"}
                          {!contact && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#082537] py-16 px-6 text-center noise">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-3">Ready to Start Selling?</h2>
          <p className="text-white/45 text-sm mb-8 leading-relaxed">
            Register free, list your gear for 100 LKR, and reach buyers across Sri Lanka.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="btn-shimmer bg-[#788C59] text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#788C59]/90 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              Register as a Seller
            </a>
            <Link href="/marketplace" className="bg-white/8 border border-white/15 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/14 transition-all hover:-translate-y-0.5">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
