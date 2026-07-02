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

export default function AdminSignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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
    setLoading(true)
    try {
      await signUp(formData.email, formData.password, { role: "admin", name: formData.name })
      router.push("/admin")
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message || "Failed to create account.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#082537] flex items-center justify-center px-4">
      {/* Subtle background texture */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#788C59]/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#788C59]/5 blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#788C59]/20 border border-[#788C59]/30 mb-5">
            <Shield className="w-7 h-7 text-[#788C59]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            malka<sup className="text-xs font-medium text-[#788C59] ml-0.5">™</sup>
          </h1>
          <p className="text-white/35 text-sm mt-1 font-medium tracking-widest uppercase">Admin Setup</p>
        </div>

        {/* Warning */}
        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl px-4 py-3">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            This creates an admin account with full platform access. Only proceed for trusted personnel.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-lg font-black text-white mb-6">Create Admin Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Full Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="border-white/15 rounded-xl h-11 focus:border-[#788C59]/60 transition-all placeholder:text-white/25"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Email Address</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="border-white/15 rounded-xl h-11 focus:border-[#788C59]/60 transition-all placeholder:text-white/25"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 6 characters"
                  className="border-white/15 rounded-xl h-11 pr-11 focus:border-[#788C59]/60 transition-all placeholder:text-white/25"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Confirm Password</Label>
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repeat password"
                className="border-white/15 rounded-xl h-11 focus:border-[#788C59]/60 transition-all placeholder:text-white/25"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#788C59] hover:bg-[#788C59]/85 text-white rounded-xl font-bold text-sm tracking-wide transition-all mt-2 shadow-lg shadow-[#788C59]/20"
            >
              {loading ? "Creating Account..." : "Create Admin Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Already have an account?{" "}
          <a href="/admin/login" className="text-white/40 hover:text-white/60 transition-colors underline underline-offset-2">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
