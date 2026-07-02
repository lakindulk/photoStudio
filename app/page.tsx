import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { ServiceCategories } from "@/components/ServiceCategories"
import { FeaturedServices } from "@/components/FeaturedServices"
import { Reveal } from "@/components/Reveal"
import {
  Shield, Sparkles, Leaf,
  ArrowRight, Camera, Star, Phone, MapPin,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      

      {/* ── Categories ────────────────────────────────────── */}
      <section id="categories" className="bg-white border-t border-[#082537]/5">
        <ServiceCategories />
      </section>

      {/* ── Services quick overview ────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-[#788C59] text-xs font-bold uppercase tracking-widest mb-2">Explore</p>
              <h2 className="text-3xl font-black text-[#082537] tracking-tight">All Services</h2>
              <p className="text-[#082537]/35 mt-1 text-sm font-medium">From weddings to vehicles — every shoot covered</p>
            </div>
            <Link href="/services" className="shrink-0 group inline-flex items-center gap-1.5 text-sm font-bold text-[#788C59] border border-[#788C59]/30 hover:bg-[#788C59]/8 px-4 py-2 rounded-xl transition-all">
              View all <ArrowRight className="w-3.5 h-3.5 group-hover:animate-bounce-x" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: "Wedding Photography", href: "/category/wedding-photography",    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop&auto=format&q=70" },
              { label: "Drone Photography",   href: "/category/drone-photography",      img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&h=200&fit=crop&auto=format&q=70" },
              { label: "Event Coverage",      href: "/category/event-photography",      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop&auto=format&q=70" },
              { label: "Vehicle Photography", href: "/category/vehicle-photography",    img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=200&fit=crop&auto=format&q=70" },
              { label: "Car Renting",         href: "/category/event-car-renting",      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=200&fit=crop&auto=format&q=70" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 70} direction="scale">
                <Link href={s.href} className="group relative overflow-hidden rounded-2xl aspect-[3/4] block">
                  <img src={s.img} alt={s.label} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-0.5 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-bold leading-tight">{s.label}</p>
                    <span className="inline-block h-0.5 w-0 bg-[#788C59] group-hover:w-full transition-all duration-400 rounded-full mt-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Malka? ────────────────────────────────────── */}
      <section className="py-24 bg-[#eef3f0]/40 border-y border-[#082537]/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#788C59]/5 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#788C59]/15 text-[#788C59] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              <Star className="w-3.5 h-3.5" />
              Why Choose Us
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#082537] tracking-tight mb-4">Why Malka Studio?</h2>
            <p className="text-[#082537]/45 max-w-xl mx-auto text-base leading-relaxed">
              Pre-vetted professionals, instant booking, total peace of mind.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Leaf,     title: "Verified Talent",    desc: "Every provider is strictly vetted for quality, reliability, and professionalism before they can list.",     accent: "bg-emerald-500/10 text-emerald-600", delay: 0 },
              { icon: Sparkles, title: "Instant Booking",    desc: "Secure your date immediately through our seamless booking system — no back-and-forth needed.",              accent: "bg-[#788C59]/15 text-[#788C59]",     delay: 120, featured: true },
              { icon: Shield,   title: "100% Satisfaction",  desc: "We hold the platform to the highest standards, so every captured moment is exactly as you envisioned.",    accent: "bg-blue-500/10 text-blue-600",       delay: 240 },
            ].map((item) => (
              <Reveal key={item.title} delay={item.delay} direction="up">
                <div className={`relative rounded-3xl p-8 border transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl cursor-default ${item.featured ? "bg-[#082537] border-[#082537] shadow-xl" : "bg-white border-[#082537]/8 shadow-sm"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${item.featured ? "bg-[#788C59]/20" : item.accent}`}>
                    <item.icon className={`w-6 h-6 ${item.featured ? "text-[#788C59]" : ""}`} />
                  </div>
                  <h4 className={`font-black text-xl mb-3 ${item.featured ? "text-white" : "text-[#082537]"}`}>{item.title}</h4>
                  <p className={`text-sm leading-relaxed ${item.featured ? "text-white/45" : "text-[#082537]/50"}`}>{item.desc}</p>
                  {item.featured && (
                    <div className="absolute top-6 right-6">
                      <span className="text-[10px] font-black text-[#788C59] bg-[#788C59]/15 px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">Popular</span>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>



      

      {/* ── CTA for sellers ───────────────────────────────── */}
      <section className="bg-[#082537] py-20 relative overflow-hidden noise">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#788C59]/12 blur-3xl pointer-events-none animate-glow" />
        <div className="absolute -bottom-16 left-16 w-56 h-56 rounded-full bg-[#788C59]/6 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/3 animate-spin-slow pointer-events-none hidden lg:block" />

        <Reveal className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#788C59]/20 border border-[#788C59]/30 text-[#788C59] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Camera className="w-3.5 h-3.5" />
            For Photographers & Videographers
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-5 leading-[1.1]">
            Grow Your Business<br />
            <span className="text-gradient-olive">With Malka Studio</span>
          </h2>
          <p className="text-white/45 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            Join hundreds of professionals. Get a portfolio, calendar management, gear marketplace and more — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/seller/register"              className="btn-shimmer bg-[#788C59] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#788C59]/90 transition-all shadow-lg hover:-translate-y-0.5 text-sm">Join as a Seller</Link>
            <Link href="/plans" className="bg-white/8 border border-white/15 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-white/14 transition-all text-sm hover:-translate-y-0.5">View Plans</Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-[#061c29] pt-14 pb-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-[#788C59]" />
                <span className="font-black text-white text-xl tracking-tighter">malka<sup className="text-xs text-[#788C59] font-medium ml-0.5">™</sup></span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed max-w-[200px]">Sri Lanka's premier photography & videography marketplace.</p>
              <div className="flex items-center gap-2 mt-5">
                <Phone className="w-3.5 h-3.5 text-[#788C59]" />
                <span className="text-white/35 text-xs font-medium">+94 71 581 6400</span>
              </div>
            </div>
            <div>
              <p className="text-white/45 font-bold text-xs uppercase tracking-wider mb-4">Services</p>
              <div className="space-y-2.5">
                {[{ label: "Wedding Photography", href: "/category/wedding-photography" },{ label: "Drone Services", href: "/category/drone-photography" },{ label: "Event Coverage", href: "/category/event-photography" },{ label: "Vehicle Photography", href: "/category/vehicle-photography" }].map((s) => (
                  <Link key={s.label} href={s.href} className="block text-white/30 text-sm hover:text-white/65 transition-colors hover:translate-x-1 transform">{s.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/45 font-bold text-xs uppercase tracking-wider mb-4">Platform</p>
              <div className="space-y-2.5">
                {[{ label: "All Services", href: "/services" },{ label: "About Us", href: "/about" },{ label: "Seller Portal", href: "/seller/login" },{ label: "Privacy Policy", href: "/privacy" }].map((s) => (
                  <Link key={s.label} href={s.href} className="block text-white/30 text-sm hover:text-white/65 transition-colors hover:translate-x-1 transform">{s.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/45 font-bold text-xs uppercase tracking-wider mb-4">Contact</p>
              <div className="space-y-2.5">
                <p className="text-white/30 text-sm">WhatsApp: +94 71 581 6400</p>
                <p className="text-white/30 text-sm">info@malkastudio.lk</p>
                <div className="flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5 text-[#788C59] shrink-0" /><span className="text-white/25 text-xs font-medium">Sri Lanka</span></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/18 text-xs">© 2025 Malka Studio. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="/privacy" className="text-white/18 text-xs hover:text-white/45 transition-colors">Privacy Policy</Link>
              <Link href="/about"   className="text-white/18 text-xs hover:text-white/45 transition-colors">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
