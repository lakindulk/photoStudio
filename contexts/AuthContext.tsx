"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<string>
  logout: () => Promise<void>
  isAdmin: boolean
  isSeller: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const db = getFirebaseFirestore()

    if (!auth || !db) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        setLoading(true)
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setUser({
              id: fbUser.uid,
              email: fbUser.email!,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            } as User)
          }
        } catch (err) {
          console.error("onAuthStateChanged fetch error:", err)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error("Auth not initialized")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<string> => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error("Firebase not initialized")

    setLoading(true)
    try {
      // Step 1 — create the Firebase Auth user
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Step 2 — get a fresh ID token to authenticate the server-side call
      const idToken = await fbUser.getIdToken()

      // Step 3 — build document data, stripping undefined values (Firestore rejects them)
      const raw = {
        email: fbUser.email,
        role: userData.role || "seller",
        name: userData.name || "",
        phone: userData.phone || "",
        whatsapp: userData.whatsapp || "",
        ...userData,
      }
      const userDocData: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(raw)) {
        if (v !== undefined) userDocData[k] = v
      }

      // Step 4 — write the Firestore document via the Admin SDK API route,
      //          which bypasses security rules and avoids the auth-propagation
      //          race condition that blocks direct client-side writes for new users
      const res = await fetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, userData: userDocData }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || "Failed to create user profile")
      }

      // Step 5 — put the user in context immediately so layouts don't redirect
      setUser({
        id: fbUser.uid,
        email: fbUser.email!,
        ...(userDocData as Partial<User>),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User)

      return fbUser.uid
    } catch (error: any) {
      setLoading(false)
      const msg = error?.message || String(error)
      console.error("signUp error:", msg)
      throw new Error(msg)
    }
  }

  const logout = async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error("Auth not initialized")
    await signOut(auth)
  }

  const isAdmin = user?.role === "admin"
  const isSeller = user?.role === "seller"

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signUp, logout, isAdmin, isSeller }}>
      {children}
    </AuthContext.Provider>
  )
}
