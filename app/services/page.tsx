import { Header } from "@/components/Header"
import { CATEGORY_DATA } from "@/lib/constants"
import { Reveal } from "@/components/Reveal"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Sparkles } from "lucide-react"
import type { ServiceCategory } from "@/types"

const IMG: Record<ServiceCategory, string> = {
  "wedding-photography":  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=700&fit=crop&auto=format&q=80",
  "drone-photography":    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=700&fit=crop&auto=format&q=80",
  "wedding-videography":  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=700&fit=crop&auto=format&q=80",
  "event-photography":    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=700&fit=crop&auto=format&q=80",
  "product-photography":  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=700&fit=crop&auto=format&q=80",
  "drone-videography":    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=700&fit=crop&auto=format&q=80",
  "event-videography":    "https://images.unsplash.com/photo-1578403963-75f19ef0b27e?w=800&h=700&fit=crop&auto=format&q=80",
  "event-car-renting":    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=700&fit=crop&auto=format&q=80",
  "vehicle-photography":  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=700&fit=crop&auto=format&q=80",
  "vehicle-videography":  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=700&fit=crop&auto=format&q=80",
}

const GRID: Array<{ category: ServiceCategory; span: 1 | 2 }> = [
  { category: "wedding-photography", span: 2 }, { category: "drone-photography",   span: 1 },
  { category: "wedding-videography", span: 1 }, { category: "event-photography",   span: 2 },
  { category: "product-photography", span: 2 }, { category: "drone-videography",   span: 1 },
  { category: "event-videography",   span: 1 }, { category: "event-car-renting",   span: 2 },
  { category: "vehicle-photography", span: 2 }, { category: "vehicle-videography", span: 1 },
]

const byCategory = Object.fromEntries(CATEGORY_DATA.map((d) => [d.category, d]))
const STATS = [{ value: "10", label: "Service Types" }, { value: "850+", label: "Professionals" }, { value: "6k+", label: "Bookings" }, { value: "95%", label: "Satisfaction" }]
const TAGS = ["Photography", "Videography", "Drone", "Events", "Vehicles", "Car Rental"]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#eef3f0]/20">
      <Header forceWhite />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative bg-[#082537] pt-32 pb-20 px-6 overflow-hidden noise">
        {/* Animated orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#788C59]/10 blur-3xl pointer-events-none animate-glow" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#788C59]/5 blur-2xl pointer-events-none" />
        {/* Spinning rings */}
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full border border-dashed border-white/5 animate-spin-slow hidden xl:block" />
        <div className="absolute bottom-16 left-16 w-24 h-24 rounded-full border border-dashed border-[#788C59]/15 animate-spin-slow-reverse hidden xl:block" />
        {/* Ghost number */}
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[200px] font-black text-white/[0.025] select-none leading-none hidden xl:block animate-fade-in">10</span>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="animate-fade-in-down" style={{ animationDelay: "0ms" }}>
            <div className="inline-flex items-center gap-2 bg-[#788C59]/20 border border-[#788C59]/30 text-[#788C59] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              What We Offer
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6 max-w-3xl animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Every Shot.<br />
            <span className="text-gradient-olive">Every Story.</span>
          </h1>
          <p className="text-white/45 text-lg max-w-xl leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            From intimate wedding moments to cinematic aerial footage — explore all 10 service categories and find the perfect professional for your vision.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-14 animate-fade-in" style={{ animationDelay: "260ms" }}>
            {TAGS.map((tag, i) => (
              <span key={tag} className="px-4 py-1.5 rounded-full border border-white/10 text-white/40 text-sm font-medium hover:border-[#788C59]/60 hover:text-[#788C59] transition-all cursor-default animate-fade-in" style={{ animationDelay: `${280 + i * 50}ms` }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={s.label} className="border-l-2 border-[#788C59]/40 pl-4 animate-fade-in-up" style={{ animationDelay: `${350 + i * 80}ms` }}>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-white/35 text-sm font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Grid ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {GRID.map(({ category, span }, i) => {
            const data = byCategory[category]
            if (!data) return null
            const Icon = data.icon
            return (
              <div
                key={category}
                className={[
                  "animate-fade-in-up",
                  span === 2 ? "md:col-span-2" : "md:col-span-1",
                ].join(" ")}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href={`/category/${category}`}
                  className="group relative overflow-hidden rounded-3xl cursor-pointer block h-[280px] md:h-[320px] glow-hover"
                >
                  <Image
                    src={IMG[category]}
                    alt={data.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                  {/* Number */}
                  <div className="absolute top-5 left-5 z-10">
                    <span className="text-xs font-black text-white/30 tracking-widest group-hover:text-white/60 transition-colors duration-300">
                      {data.number}
                    </span>
                  </div>

                  {/* Icon badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#788C59] group-hover:border-[#788C59] group-hover:scale-110">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/0 group-hover:text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1.5 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
                          Explore
                        </p>
                        <h3 className="text-white font-black text-xl md:text-2xl leading-tight group-hover:translate-y-0 transition-transform duration-300">
                          {data.title}
                        </h3>
                        <p className="text-white/0 group-hover:text-white/55 text-sm mt-1.5 max-w-xs line-clamp-1 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                          {data.description}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0 w-10 h-10 rounded-2xl border border-white/15 group-hover:border-[#788C59] group-hover:bg-[#788C59] flex items-center justify-center transition-all duration-300 translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    {/* Animated underline */}
                    <div className="h-0.5 w-0 bg-[#788C59] group-hover:w-full transition-all duration-500 rounded-full mt-3" />
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <Reveal className="bg-[#082537] mx-4 md:mx-8 max-w-7xl md:mx-auto rounded-3xl mb-12 px-8 py-14 text-center relative overflow-hidden noise">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #788C59 0%, transparent 50%), radial-gradient(circle at 80% 50%, #788C59 0%, transparent 50%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5 animate-spin-slow pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[#788C59] text-xs font-bold uppercase tracking-widest mb-3">Ready to get started?</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Find the Perfect Professional</h2>
          <p className="text-white/45 text-base max-w-lg mx-auto mb-8">Browse verified photographers, videographers and more — all vetted, all ready to bring your vision to life.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/#categories" className="btn-shimmer bg-[#788C59] text-white font-bold px-7 py-3 rounded-2xl hover:bg-[#788C59]/90 transition-all shadow-lg hover:-translate-y-0.5 text-sm">Browse All Listings</Link>
            <Link href="/seller/register" className="bg-white/10 border border-white/20 text-white font-bold px-7 py-3 rounded-2xl hover:bg-white/15 transition-all text-sm hover:-translate-y-0.5">Join as a Seller</Link>
          </div>
        </div>
      </Reveal>

      <footer className="bg-[#061c29] py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">© 2025 Malka Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/"           className="text-white/25 text-xs hover:text-white/55 transition-colors">Home</Link>
            <Link href="/marketplace" className="text-white/25 text-xs hover:text-white/55 transition-colors">Marketplace</Link>
            <Link href="/privacy"     className="text-white/25 text-xs hover:text-white/55 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
