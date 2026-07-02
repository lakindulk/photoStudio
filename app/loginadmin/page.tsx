"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { LogIn, Store } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      switch (user.role) {
        case "admin":
          router.push("/admin")
          break
        case "seller":
          router.push("/seller")
          break
        case "user":
          router.push("/")
          break
        default:
          router.push("/")
      }
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      // Redirect will be handled by the useEffect above
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border/40">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <LogIn className="w-8 h-8 text-foreground" />
            <div className="text-2xl font-bold text-foreground">MALKA</div>
            <div className="text-sm text-foreground/70">STUDIO</div>
          </div>
          <CardTitle className="text-foreground text-2xl">Welcome Back</CardTitle>
          <p className="text-foreground/70">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground/80">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted border-border/40 text-foreground"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-foreground/80">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted border-border/40 text-foreground"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-foreground/70 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                  Create one here
                </Link>
              </p>
            </div>

            <div className="border-t border-border/40 pt-4 text-center">
              <Link href="/seller/login">
                <Button variant="outline" size="sm" className="bg-transparent border-gray-600 text-foreground/80 hover:bg-muted">
                  <Store className="w-4 h-4 mr-1" />
                  Seller Login
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">
                Back to Homepage
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
