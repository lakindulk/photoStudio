"use client"

import Link from "next/link"
import { CATEGORY_DATA } from "@/lib/constants"
import { Reveal } from "@/components/Reveal"

export function ServiceCategories() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#788C59]/5 blur-3xl pointer-events-none animate-glow" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#082537]/4 blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header */}
        <Reveal className="mb-16 text-center">
          <p className="text-[#788C59] text-xs font-bold uppercase tracking-widest mb-3">What We Offer</p>
          <h2 className="text-5xl lg:text-6xl font-black text-[#082537] mb-4 tracking-tighter">
            Our Categories
          </h2>
          <p className="text-[#303633]/50 font-medium max-w-md mx-auto">
            Browse our premium event services — from intimate portraits to sweeping aerial coverage
          </p>
        </Reveal>

        {/* Grid */}
        <div className="flex flex-wrap justify-center gap-10 lg:gap-14">
          {CATEGORY_DATA.map((item, i) => {
            const Icon = item.icon
            return (
              <Reveal key={item.category} delay={i * 55} direction="up">
                <Link href={`/category/${item.category}`} className="group flex flex-col items-center w-28 text-center">
                  {/* Ring + icon */}
                  <div className="relative mb-4">
                    {/* Spinning dashed ring on hover */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#788C59]/0 group-hover:border-[#788C59]/50 group-hover:animate-spin-slow transition-all duration-500" />
                    {/* Static outer ring */}
                    <div className="w-24 h-24 rounded-full border-2 border-[#082537]/8 bg-white flex items-center justify-center transition-all duration-400 group-hover:border-[#788C59]/40 group-hover:shadow-[0_0_0_6px_rgba(120,140,89,0.08)] group-hover:-translate-y-2">
                      {/* Bg fill on hover */}
                      <div className="absolute inset-0 rounded-full bg-[#788C59]/0 group-hover:bg-[#788C59]/8 transition-all duration-300" />
                      <Icon className="w-9 h-9 text-[#788C59] stroke-[1.5] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 relative z-10" />
                    </div>
                  </div>

                  {/* Number */}
                  <span className="text-[10px] font-black text-[#082537]/20 group-hover:text-[#788C59]/60 tracking-widest mb-1 transition-colors duration-300">
                    {item.number}
                  </span>

                  {/* Label */}
                  <span className="text-xs font-bold text-[#082537]/70 group-hover:text-[#788C59] transition-colors duration-300 leading-tight">
                    {item.title}
                  </span>

                  {/* Animated underline */}
                  <span className="block mt-1.5 h-0.5 w-0 bg-[#788C59] group-hover:w-full transition-all duration-400 rounded-full" />
                </Link>
              </Reveal>
            )
          })}
        </div>

        {/* View all link */}
        <Reveal delay={600} className="text-center mt-14">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#788C59] border border-[#788C59]/30 hover:bg-[#788C59]/8 px-6 py-2.5 rounded-2xl transition-all hover:-translate-y-0.5"
          >
            View all services
            <span className="animate-bounce-x">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
