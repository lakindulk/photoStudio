"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export default function SellerLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      router.push("/seller")
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center text-[#303633]/60 hover:text-[#788C59] transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-black text-[#082537] tracking-tight mb-2">Welcome Back.</h1>
            <p className="text-[#303633]/60 font-medium">Log in to manage your premium services and bookings.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-[#303633]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seller@example.com"
                className="bg-white border-2 border-border/20 focus:border-[#788C59] rounded-xl h-14 px-4 text-foreground transition-colors shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-[#303633]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-white border-2 border-border/20 focus:border-[#788C59] rounded-xl h-14 px-4 text-foreground transition-colors shadow-sm"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#809983] hover:bg-[#788C59] text-white rounded-xl h-14 text-sm font-bold tracking-widest uppercase transition-all shadow-lg hover:-translate-y-0.5"
              >
                {loading ? "Signing in..." : "Sign In to Dashboard"}
              </Button>
            </div>
          </form>

          <div className="mt-12 text-center text-sm font-medium text-[#303633]/60 border-t border-border/10 pt-8">
            Don't have a seller account? <Link href="/seller/register" className="text-[#788C59] font-bold hover:underline">Apply Here</Link>
          </div>
        </div>
      </div>

      {/* Right Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#eef3f0]">
        <img 
          src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200&h=1600" 
          alt="Photographer" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#082537]/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white">
           <h3 className="text-4xl font-serif mb-4">"Malka Studio elevated my photography business to a level I never thought possible."</h3>
           <p className="text-sm font-bold uppercase tracking-widest opacity-80">— Sarah Jenkins, Top Seller</p>
        </div>
      </div>
    </div>
  )
}
