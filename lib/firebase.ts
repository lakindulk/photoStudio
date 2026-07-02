import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDlTeos5LS8N70zyhsBJ3xfhGyQE3doC6Q",
  authDomain: "cambay-e8189.firebaseapp.com",
  projectId: "cambay-e8189",
  storageBucket: "cambay-e8189.firebasestorage.app",
  messagingSenderId: "467937035831",
  appId: "1:467937035831:web:ce8ffd84ee9afe28eb61b2",
  measurementId: "G-47SQY227DZ",
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let firebaseDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null

const initializeFirebase = () => {
  if (typeof window === "undefined") return null

  try {
    if (!firebaseApp) {
      firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    }
    return firebaseApp
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return null
  }
}

const getFirebaseAuth = () => {
  if (typeof window === "undefined") return null

  try {
    const app = initializeFirebase()
    if (!app) return null

    if (!firebaseAuth) {
      firebaseAuth = getAuth(app)
    }
    return firebaseAuth
  } catch (error) {
    console.error("Firebase Auth initialization error:", error)
    return null
  }
}

const getFirebaseFirestore = () => {
  if (typeof window === "undefined") return null

  try {
    const app = initializeFirebase()
    if (!app) return null

    if (!firebaseDb) {
      firebaseDb = getFirestore(app)
    }
    return firebaseDb
  } catch (error) {
    console.error("Firebase Firestore initialization error:", error)
    return null
  }
}

const getFirebaseStorage = () => {
  if (typeof window === "undefined") return null

  try {
    const app = initializeFirebase()
    if (!app) return null

    if (!firebaseStorage) {
      firebaseStorage = getStorage(app)
    }
    return firebaseStorage
  } catch (error) {
    console.error("Firebase Storage initialization error:", error)
    return null
  }
}

// Initialize Firebase app
const app = typeof window !== "undefined" ? initializeFirebase() : null

// Create instances directly for client-side usage
export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
export const storage = app ? getStorage(app) : null

// Keep the function exports for backward compatibility
export const getDb = getFirebaseFirestore
export { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage }

export default initializeFirebase
