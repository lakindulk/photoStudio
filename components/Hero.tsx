"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, ArrowRight, CheckCircle } from "lucide-react"

const MARQUEE_ITEMS = [
  "Wedding Photography", "Drone Services", "Event Coverage", "Vehicle Photography",
  "Wedding Videography", "Product Photography", "Car Renting", "Drone Photography",
  "Event Videography", "Vehicle Videography",
]

const PILLS = ["Wedding", "Drone", "Events", "Vehicles", "Portraits"]

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-stretch bg-white overflow-hidden pt-20">

      {/* ── Sage panel ─────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-full lg:w-[46%] h-full bg-[#788C59] z-0 hidden lg:block" />

      {/* ── Animated orb on left panel ─────────────────────── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#788C59]/8 blur-3xl animate-glow pointer-events-none hidden lg:block" />

      {/* ── Subtle dot grid ────────────────────────────────── */}
      <div
        className="absolute inset-y-0 left-0 z-0 hidden lg:block"
        style={{
          width: "54%",
          backgroundImage: "radial-gradient(circle, #082537 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: 0.032,
        }}
      />

      {/* ── Spinning decorative ring ────────────────────────── */}
      <div className="absolute top-32 right-[48%] w-24 h-24 rounded-full border border-dashed border-[#788C59]/20 animate-spin-slow hidden lg:block z-0" />
      <div className="absolute bottom-40 left-12 w-16 h-16 rounded-full border border-dashed border-[#082537]/10 animate-spin-slow-reverse hidden lg:block z-0" />

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex items-center">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-0">

          {/* Left ─────────────────────────────── */}
          <div className="w-full lg:w-[54%] py-28 lg:py-0 pr-0 lg:pr-20 space-y-7">

            {/* Eyebrow */}
            <div className="animate-fade-in-down" style={{ animationDelay: "0ms" }}>
              <div className="inline-flex items-center gap-2.5 bg-[#082537]/6 border border-[#082537]/10 text-[#082537]/55 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#788C59] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#788C59]" />
                </span>
                Sri Lanka's Premier Creative Platform
              </div>
            </div>

            {/* Headline */}
            <div className="overflow-hidden">
              <h1
                className="text-[clamp(52px,8vw,108px)] font-black tracking-tighter text-[#082537] leading-[0.92] animate-fade-in-up"
                style={{ animationDelay: "80ms" }}
              >
                Malka<br />
                <span className="text-gradient-olive">Studio</span>
              </h1>
              <p
                className="text-[#082537]/35 font-black text-xl lg:text-2xl tracking-tight mt-2 animate-fade-in-up"
                style={{ animationDelay: "180ms" }}
              >
                Network
              </p>
            </div>

            {/* Body */}
            <p
              className="text-[#303633]/55 text-base lg:text-lg leading-relaxed font-medium max-w-lg animate-fade-in-up"
              style={{ animationDelay: "260ms" }}
            >
              Connect with top-tier photographers, videographers, and event specialists.
              Browse portfolios, compare packages, and book instantly.
            </p>

            {/* Trust checks */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 animate-fade-in-up" style={{ animationDelay: "320ms" }}>
              {["Verified Professionals", "Instant Booking", "100% Secure"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-[#082537]/45 font-semibold">
                  <CheckCircle className="w-4 h-4 text-[#788C59]" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1 animate-fade-in-up" style={{ animationDelay: "380ms" }}>
              <Link href="/marketplace">
                <button className="btn-shimmer flex items-center gap-2.5 bg-[#082537] hover:bg-[#082537]/90 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </button>
              </Link>
              <Link href="/services">
                <button className="group flex items-center gap-2 bg-transparent border-2 border-[#082537]/15 hover:border-[#788C59] text-[#082537] px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5">
                  Browse Services
                  <ArrowRight className="w-4 h-4 group-hover:animate-bounce-x" />
                </button>
              </Link>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "480ms" }}>
              {PILLS.map((p, i) => (
                <span
                  key={p}
                  className="px-3.5 py-1 rounded-full bg-[#082537]/5 hover:bg-[#788C59]/15 text-[#082537]/45 hover:text-[#788C59] text-xs font-semibold border border-[#082537]/8 hover:border-[#788C59]/30 transition-all cursor-default animate-fade-in"
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Right image ──────────────────────── */}
          <div className="w-full lg:w-[46%] relative flex justify-center items-end mt-12 lg:mt-0 min-h-[500px] lg:min-h-[760px]">

            {/* Background glow on sage panel */}
            <div className="absolute inset-0 hidden lg:block">
              <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-glow" />
            </div>

            {/* Image */}
            <div className="relative z-10 w-full max-w-[520px] animate-fade-in-right" style={{ animationDelay: "200ms" }}>
              <div className="animate-float-slow">
                <Image
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=85&w=800&h=1000"
                  alt="Professional photographer"
                  width={800}
                  height={1000}
                  priority
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="w-full h-auto object-cover rounded-tl-[3rem] drop-shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* Floating card – top left */}
              <div
                className="absolute -left-10 top-20 z-20 glass-dark rounded-2xl px-4 py-3 hidden lg:flex items-center gap-3 animate-fade-in-left animate-float"
                style={{ animationDelay: "600ms" }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#788C59]/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#788C59]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">Verified Professionals</p>
                  <p className="text-[10px] text-white/45 font-medium">850+ Active Sellers</p>
                </div>
              </div>

              {/* Floating card – bottom right */}
              <div
                className="absolute -right-6 bottom-28 z-20 bg-white rounded-2xl shadow-2xl px-4 py-3 border border-[#082537]/8 hidden lg:flex items-center gap-3 animate-fade-in-right animate-float-delayed"
                style={{ animationDelay: "700ms" }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#082537]/8 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-[#788C59]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#082537]">Instant Booking</p>
                  <p className="text-[10px] text-[#082537]/40 font-medium">No waiting, no hassle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Marquee strip ─────────────────────────────────── */}
      <div className="relative z-20 w-full bg-[#082537] py-3.5 overflow-hidden border-t border-white/5">
        <div className="marquee-track animate-marquee select-none whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mr-10 text-xs font-bold text-white/40 uppercase tracking-widest">
              <span className="w-1 h-1 rounded-full bg-[#788C59] inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
