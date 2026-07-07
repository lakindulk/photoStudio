import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | null = null

function getAdminApp(): App {
  if (adminApp) return adminApp

  const existing = getApps()
  if (existing.length > 0) {
    adminApp = existing[0]
    return adminApp
  }

  const json = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON
  if (!json) {
    throw new Error(
      'FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is not set. ' +
      'Download a service account key from Firebase Console → Project Settings → Service Accounts ' +
      'and paste the JSON content into .env.local as FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON.'
    )
  }

  adminApp = initializeApp({ credential: cert(JSON.parse(json)) })
  return adminApp
}

export const getAdminFirestore = () => getFirestore(getAdminApp())
export const getAdminAuth = () => getAuth(getAdminApp())
