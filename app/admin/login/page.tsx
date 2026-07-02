"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      router.push("/admin")
    } catch {
      toast({ title: "Sign In Failed", description: "Invalid email or password.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#082537] flex">
      {/* Left — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 relative">
        {/* Background blobs */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#788C59]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#788C59]/5 blur-2xl pointer-events-none" />

        <div className="relative max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#788C59]/20 border border-[#788C59]/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#788C59]" />
            </div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">
                malka<sup className="text-xs font-medium text-[#788C59] ml-0.5">™</sup>
              </span>
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Admin Portal</p>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Welcome<br />back.
            </h1>
            <p className="text-white/35 text-sm mt-2">Sign in to manage the platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="border-white/15 rounded-xl h-12 focus:border-[#788C59]/60 transition-all [&:-webkit-autofill]:![background-color:#0d3347] [&:-webkit-autofill]:[color:white]"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="border-white/15 rounded-xl h-12 pr-12 focus:border-[#788C59]/60 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#788C59] hover:bg-[#788C59]/85 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#788C59]/20 mt-2"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200&h=1600"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#082537] via-[#082537]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <div className="space-y-6">
            {[
              { label: "Active Sellers", sublabel: "on the platform" },
              { label: "Ad Approvals", sublabel: "review queue" },
              { label: "Subscriptions", sublabel: "managed monthly" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#788C59]" />
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-white/35 text-xs">{item.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/20 text-xs font-medium tracking-widest uppercase">Malka Studio — Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
