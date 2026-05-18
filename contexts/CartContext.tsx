"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem } from "@/types"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (advertisementId: string, packageId: string) => void
  clearCart: () => void
  totalAmount: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("photography-cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("photography-cart", JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Check if item already exists
      const existingIndex = prev.findIndex(
        (i) => i.advertisementId === item.advertisementId && i.packageId === item.packageId,
      )

      if (existingIndex >= 0) {
        // Item already exists, don't add duplicate
        return prev
      }

      return [...prev, item]
    })
  }

  const removeItem = (advertisementId: string, packageId: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.advertisementId === advertisementId && item.packageId === packageId)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)
  const itemCount = items.length

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    totalAmount,
    itemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
