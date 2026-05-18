"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import {
  SUBSCRIPTION_PACKAGES_3M,
  SUBSCRIPTION_PACKAGES_6M,
  SUBSCRIPTION_PACKAGES_SPECIAL,
  MAX_ADS_PER_SUBSCRIPTION,
} from "@/lib/constants"
import { Check, LayoutGrid, Zap, Star, Globe, CalendarDays, MessageCircle, ArrowRight, Camera } from "lucide-react"
import Link from "next/link"

type Tab = "all" | "basic" | "standard" | "premium"

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "all",      label: "All Plans",  icon: LayoutGrid },
  { key: "basic",    label: "Basic",      icon: Zap },
  { key: "standard", label: "Standard",   icon: Star },
  { key: "premium",  label: "Premium",    icon: Globe },
]

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

export default function PlansPage() {
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
            <Camera className="w-3.5 h-3.5" />
            Seller Plans
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4">
            Grow Your Business<br />
            <span className="text-[#788C59]">With Malka Studio</span>
          </h1>
          <p className="text-white/45 text-base max-w-xl mx-auto leading-relaxed mb-8">
            Choose a plan that fits your goals. Every subscription includes a free Event Calendar and up to {MAX_ADS_PER_SUBSCRIPTION} active ads.
          </p>

          {/* Calendar banner */}
          <div className="inline-flex items-center gap-2.5 bg-[#788C59]/15 border border-[#788C59]/25 text-[#788C59] px-5 py-2.5 rounded-full text-sm font-semibold">
            <CalendarDays className="w-4 h-4" />
            Free Event Calendar included with every plan
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#082537]/8 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex gap-1 py-3 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                tab === key
                  ? "bg-[#082537] text-white shadow-sm"
                  : "text-[#082537]/55 hover:text-[#082537] hover:bg-[#082537]/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan sections */}
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-14">
        {SECTIONS[tab].map((section, si) => (
          <div key={section.label} className="animate-fade-in-up" style={{ animationDelay: `${si * 60}ms` }}>
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#082537]">{section.label}</h2>
              <p className="text-sm text-[#082537]/45 mt-1">{section.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.packages.map((pkg: any, pi: number) => {
                const contact = isContact(pkg)
                return (
                  <div
                    key={pkg.type}
                    className={`relative rounded-2xl border-2 p-6 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl animate-fade-in ${
                      pkg.popular || pkg.premium
                        ? "border-[#082537] shadow-md"
                        : "border-[#082537]/10 shadow-sm"
                    }`}
                    style={{ animationDelay: `${si * 60 + pi * 50}ms` }}
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end">
                      {pkg.popular && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#788C59] text-white">Popular</span>}
                      {pkg.premium && <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#082537] text-white">Premium</span>}
                      {pkg.badge && !pkg.popular && !pkg.premium && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#788C59]/15 text-[#788C59] border border-[#788C59]/30">{pkg.badge}</span>
                      )}
                    </div>

                    <h3 className="font-black text-[#082537] text-lg pr-20 mb-1">{pkg.name}</h3>
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
                      {pkg.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#082537]/70">
                          <Check className="w-4 h-4 text-[#788C59] flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {contact ? (
                      <a
                        href="https://wa.me/94715816400"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#1db954] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact on WhatsApp
                      </a>
                    ) : (
                      <Link
                        href="/seller/register"
                        className="flex items-center justify-center gap-2 w-full bg-[#082537] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#082537]/90 transition-colors group"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="bg-[#082537] py-16 px-6 text-center noise">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-3">Ready to Get Started?</h2>
          <p className="text-white/45 text-sm mb-8 leading-relaxed">
            Join hundreds of professionals already growing their business on Malka Studio.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/seller/register" className="btn-shimmer bg-[#788C59] text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#788C59]/90 transition-all hover:-translate-y-0.5 shadow-lg">
              Join as a Seller
            </Link>
            <Link href="/seller/login" className="bg-white/8 border border-white/15 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/14 transition-all hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
