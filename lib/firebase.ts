import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAcfGOmel9XWyACqQMQlvz70r7V9swuJAI",
  authDomain: "malkastudio-22e38.firebaseapp.com",
  projectId: "malkastudio-22e38",
  storageBucket: "malkastudio-22e38.appspot.com",
  messagingSenderId: "452950636739",
  appId: "1:452950636739:web:8c26aa0d67356077368a76",
  measurementId: "G-RRR8DH1K4X",
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
