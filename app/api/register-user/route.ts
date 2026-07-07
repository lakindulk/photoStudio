import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const { idToken, userData } = await request.json()

    if (!idToken || !userData) {
      return NextResponse.json({ error: 'Missing idToken or userData' }, { status: 400 })
    }

    // Verify the Firebase ID token (proves the client is authenticated)
    const auth = getAdminAuth()
    const decoded = await auth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Remove undefined values — Firestore rejects them
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(userData)) {
      if (v !== undefined) clean[k] = v
    }

    // Write via Admin SDK — bypasses Firestore security rules entirely
    const db = getAdminFirestore()
    await db.collection('users').doc(uid).set({
      ...clean,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true, uid })
  } catch (error: any) {
    console.error('[register-user]', error?.message ?? error)
    return NextResponse.json(
      { error: error?.message ?? 'Failed to create user document' },
      { status: 500 }
    )
  }
}
