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
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              ...userData,
              createdAt: userData.createdAt?.toDate(),
              updatedAt: userData.updatedAt?.toDate(),
            } as User)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
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
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const auth = getFirebaseAuth()
    const db = getFirebaseFirestore()
    if (!auth || !db) throw new Error("Firebase not initialized")

    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

    const userDoc = {
      email: firebaseUser.email,
      role: userData.role || "seller",
      name: userData.name || "",
      phone: userData.phone || "",
      whatsapp: userData.whatsapp || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    }

    await setDoc(doc(db, "users", firebaseUser.uid), userDoc)
  }

  const logout = async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error("Auth not initialized")
    await signOut(auth)
  }

  const isAdmin = user?.role === "admin"
  const isSeller = user?.role === "seller"

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin,
    isSeller,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
