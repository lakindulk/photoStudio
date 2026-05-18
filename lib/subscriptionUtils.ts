import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "./firebase"

/**
 * Check and update expired subscriptions
 * This function should be called periodically (e.g., on admin dashboard load)
 * to ensure subscription statuses are up to date
 */
export async function updateExpiredSubscriptions(): Promise<{
  updated: number
  errors: number
}> {
  if (!db) {
    console.error("Database not initialized")
    return { updated: 0, errors: 0 }
  }

  try {
    const now = new Date()
    
    // Query for active subscriptions
    const q = query(
      collection(db, "subscriptions"),
      where("status", "==", "active")
    )
    
    const snapshot = await getDocs(q)
    let updated = 0
    let errors = 0

    // Check each subscription for expiry
    for (const docSnapshot of snapshot.docs) {
      const subscription = docSnapshot.data()
      const expiresAt = subscription.expiresAt?.toDate()

      // If subscription has expired, update its status
      if (expiresAt && expiresAt <= now) {
        try {
          await updateDoc(doc(db, "subscriptions", docSnapshot.id), {
            status: "expired",
            updatedAt: new Date(),
          })
          updated++
          console.log(`Updated subscription ${docSnapshot.id} to expired`)
        } catch (error) {
          console.error(`Error updating subscription ${docSnapshot.id}:`, error)
          errors++
        }
      }
    }

    console.log(`Subscription expiry check complete: ${updated} updated, ${errors} errors`)
    return { updated, errors }
  } catch (error) {
    console.error("Error checking expired subscriptions:", error)
    return { updated: 0, errors: 1 }
  }
}

/**
 * Check and deactivate advertisements for sellers with expired subscriptions
 * This should be called after updateExpiredSubscriptions
 */
export async function deactivateAdsWithExpiredSubscriptions(): Promise<{
  deactivated: number
  errors: number
}> {
  if (!db) {
    console.error("Database not initialized")
    return { deactivated: 0, errors: 0 }
  }

  try {
    const now = new Date()
    
    // Get all active ads
    const adsQuery = query(
      collection(db, "advertisements"),
      where("status", "==", "active")
    )
    
    const adsSnapshot = await getDocs(adsQuery)
    let deactivated = 0
    let errors = 0

    // Check each ad's seller subscriptions
    for (const adDoc of adsSnapshot.docs) {
      const ad = adDoc.data()
      
      // Get seller's active subscriptions for this category
      const subsQuery = query(
        collection(db, "subscriptions"),
        where("sellerId", "==", ad.sellerId),
        where("status", "==", "active")
      )
      
      const subsSnapshot = await getDocs(subsQuery)
      const activeSubs = subsSnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          expiresAt: doc.data().expiresAt?.toDate(),
        }))
        .filter((sub: any) => 
          sub.expiresAt && 
          sub.expiresAt > now &&
          sub.allowedCategories?.includes(ad.category)
        )

      // If no valid subscription, deactivate the ad
      if (activeSubs.length === 0) {
        try {
          await updateDoc(doc(db, "advertisements", adDoc.id), {
            status: "deactivated",
            updatedAt: new Date(),
          })
          deactivated++
          console.log(`Deactivated ad ${adDoc.id} - no valid subscription`)
        } catch (error) {
          console.error(`Error deactivating ad ${adDoc.id}:`, error)
          errors++
        }
      }
    }

    console.log(`Ad deactivation check complete: ${deactivated} deactivated, ${errors} errors`)
    return { deactivated, errors }
  } catch (error) {
    console.error("Error deactivating ads:", error)
    return { deactivated: 0, errors: 1 }
  }
}

