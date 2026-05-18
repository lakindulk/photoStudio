"use client"

import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { getDb } from "@/lib/firebase"
import { Star, MapPin, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Advertisement } from "@/types"
import { Reveal } from "@/components/Reveal"

export function FeaturedServices() {
  const [services, setServices] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const db = getDb()
        if (!db) return
        const now = new Date()
        const q = query(
          collection(db, "advertisements"),
          where("status", "==", "active"),
          where("isApproved", "==", true),
          where("expiresAt", ">", now),
          orderBy("expiresAt", "desc"),
          limit(6),
        )
        const snap = await getDocs(q)
        setServices(snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          activatedAt: doc.data().activatedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
          approvedAt: doc.data().approvedAt?.toDate(),
        })) as Advertisement[])
      } catch (error) {
        console.error("Error fetching featured services:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedServices()
  }, [])

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 bg-[#fafafa]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #082537 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#082537]/8 text-[#082537]/50 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase mb-5 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#788C59]" />
              Premium Selection
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-[#082537] tracking-tight leading-[1.05]">
              Featured<br />
              <span className="text-gradient-olive">Services</span>
            </h2>
          </div>
          <Link href="/services">
            <button className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold tracking-widest uppercase border border-[#082537]/12 hover:border-[#788C59]/40 hover:bg-[#788C59]/6 text-[#082537]/60 hover:text-[#788C59] transition-all">
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:animate-bounce-x" />
            </button>
          </Link>
        </Reveal>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <div className="aspect-[4/3] shimmer-bg" />
                <div className="p-7 space-y-3">
                  <div className="h-4 shimmer-bg rounded-lg w-1/3" />
                  <div className="h-3 shimmer-bg rounded-lg w-3/4" />
                  <div className="h-3 shimmer-bg rounded-lg w-1/2" />
                  <div className="h-10 shimmer-bg rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <Reveal className="text-center py-20">
            <p className="text-[#082537]/30 text-lg font-medium italic">
              Be the first to list your service — no featured ads yet.
            </p>
            <Link href="/seller/ads/create" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#788C59] hover:underline">
              Create an ad <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 80} direction="up">
                <Link href={`/ad/${service.id}`}>
                  <div className="glow-hover bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col h-full hover:-translate-y-1.5">
                    {/* Image */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-[#082537]/5 m-2.5 rounded-2xl">
                      <Image
                        src={service.coverMedia || "/placeholder.svg"}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                      {/* Star badge */}
                      <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Star className="w-3 h-3 text-[#788C59] fill-[#788C59]" />
                        <span className="text-[10px] font-black text-[#082537]">4.9</span>
                      </div>

                      {/* Location chip — slides up on hover */}
                      <div className="absolute bottom-3 left-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <MapPin className="w-3 h-3 text-[#082537]/50" />
                          <span className="text-[10px] font-bold text-[#082537] truncate max-w-[110px]">{service.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-black text-[#082537] mb-1.5 group-hover:text-[#788C59] transition-colors line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-[#082537]/45 text-sm font-medium mb-5 line-clamp-2 leading-relaxed flex-grow">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-[#082537]/6 mt-auto">
                        <div>
                          <p className="text-[10px] text-[#082537]/30 font-bold uppercase tracking-widest mb-0.5">From</p>
                          <p className="text-base font-black text-[#082537]">
                            LKR {service.packages?.length ? Math.min(...service.packages.map((p) => p.price)).toLocaleString() : "—"}
                          </p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-[#082537]/5 flex items-center justify-center group-hover:bg-[#788C59] transition-colors duration-300">
                          <ArrowRight className="w-4 h-4 text-[#082537]/40 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
