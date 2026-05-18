# Advertisement System Implementation Summary

## Overview
This document summarizes the implementation of the advertisement system with payment flow, seller profiles, and admin approval workflow.

## Features Implemented

### 1. Seller Advertisement Management (`/seller/ads`)

#### Create New Advertisement (`/seller/ads/create`)
- **Two-step process:**
  1. **Step 1: Ad Details** - Seller fills in advertisement information
     - Title, description, category, location
     - Cover image URL
     - Service packages (optional)
  2. **Step 2: Payment** - After ad creation, seller must submit payment
     - Payment amount: LKR 5,000 for 3 months
     - WhatsApp payment option with slip upload
     - Online payment (coming soon)
- **Status:** Ad created with `status: "pending"` and `isApproved: false`
- **Payment record:** Created in `adPayments` collection with payment slip URL

#### View All Advertisements (`/seller/ads`)
- **Three tabs:**
  1. **Active** - Currently live advertisements
  2. **Pending** - Awaiting admin approval
  3. **Expired/Deactivated** - Past advertisements
- **Features:**
  - View ad details, creation date, activation date, expiry date
  - Edit active ads
  - Reactivate expired/deactivated ads
  - View rejection reasons (if rejected)

#### Edit Advertisement (`/seller/ads/[id]/edit`)
- **Editable fields:**
  - Title, description, location
  - Cover image URL
  - Service packages
- **Restrictions:** Only active ads can be edited
- **Ownership verification:** Only the ad owner can edit

#### Reactivate Advertisement (`/seller/ads/[id]/reactivate`)
- **For expired/deactivated ads**
- **Payment flow:** Same as new ad creation
  - LKR 5,000 for another 3 months
  - WhatsApp payment with slip upload
- **Creates new payment record** with `isReactivation: true`

### 2. Seller Profile Management (`/seller/profile/edit`)

#### Profile Information
- **Basic Details:**
  - Name, contact number, email, address
  - Option to hide address from guests
- **Media:**
  - Profile image URL
  - Cover image URL
- **Portfolio:**
  - Description/bio
  - Prior works (image URLs)
- **Social Media:**
  - Facebook, Instagram, YouTube, Website links

#### Profile Display
- Shown on advertisement detail pages
- Contact information visible to guests (unless hidden)
- Portfolio and social media links

### 3. Admin Approval System (`/admin/ads`)

#### Advertisement Review
- **View all pending advertisements**
- **For each ad:**
  - View full ad details (title, description, category, location, packages)
  - View payment information
  - View payment slip (opens in new tab)
  - Payment status badge

#### Approval Actions
- **Approve:**
  - Sets ad `status: "active"` and `isApproved: true`
  - Sets `activatedAt` to current date
  - Sets `expiresAt` to 3 months from activation
  - Updates payment status to `verified`
  - Records admin ID and approval timestamp
- **Reject:**
  - Sets ad `status: "rejected"` and `isApproved: false`
  - Requires rejection reason (shown to seller)
  - Updates payment status to `rejected`
  - Seller can see rejection reason in their ads list

### 4. Guest Advertisement Viewing

#### Category Pages (`/category/[category]`)
- **Filters active ads:**
  - `status === "active"`
  - `isApproved === true`
  - `expiresAt > now` (not expired)
- **Display:**
  - Ad title, description, location
  - Cover image
  - Category badge
  - Link to ad detail page

#### Advertisement Detail Page (`/ad/[id]`)
- **Ad Information:**
  - Full description
  - Location
  - Service packages (if any)
  - Gallery images
- **Seller Information:**
  - Seller profile (if exists)
  - Contact details (phone, email)
  - Social media links
  - Prior works portfolio
  - Address (if not hidden)

## Database Collections

### `advertisements`
```typescript
{
  id: string
  sellerId: string
  category: ServiceCategory
  title: string
  description: string
  coverMedia: string
  gallery: string[]
  packages: ServicePackage[]
  location: string
  status: "pending" | "approved" | "rejected" | "active" | "expired" | "deactivated"
  isApproved: boolean
  hasEditsPending: boolean
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: Date
  activatedAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### `adPayments`
```typescript
{
  id: string
  adId: string
  sellerId: string
  amount: number
  paymentSlipUrl: string
  status: "pending" | "verified" | "rejected"
  submittedAt: Date
  verifiedAt?: Date
  verifiedBy?: string
  notes?: string
  isReactivation?: boolean
}
```

### `sellerProfiles`
```typescript
{
  id: string
  userId: string
  name: string
  contactNo: string
  email: string
  address: string
  hideAddress: boolean
  profileImage: string
  coverImage: string
  description: string
  priorWorks: string[]
  socialMedia: {
    facebook: string
    instagram: string
    youtube: string
    website: string
  }
  createdAt: Date
  updatedAt: Date
}
```

## Constants

- **AD_PRICE:** LKR 5,000
- **AD_DURATION_MONTHS:** 3 months
- **PAYMENT_WHATSAPP_NUMBER:** +94715816400
- **PAYMENT_WHATSAPP_URL:** https://wa.me/94715816400

## User Flows

### Seller Creates New Ad
1. Navigate to `/seller/ads/create`
2. Fill in ad details (title, description, category, location, packages)
3. Submit form → Ad created with `status: "pending"`
4. Redirected to payment step
5. Send payment via WhatsApp
6. Upload payment slip
7. Submit → Payment record created
8. Wait for admin approval

### Admin Approves Ad
1. Navigate to `/admin/ads`
2. View pending advertisements
3. Review ad details and payment slip
4. Click "Approve" → Ad becomes active for 3 months
5. OR click "Reject" → Enter rejection reason → Ad rejected

### Seller Reactivates Expired Ad
1. Navigate to `/seller/ads`
2. Go to "Expired/Deactivated" tab
3. Click "Reactivate" on an expired ad
4. Redirected to `/seller/ads/[id]/reactivate`
5. Send payment via WhatsApp
6. Upload payment slip
7. Submit → New payment record created
8. Wait for admin approval

### Guest Views Ads
1. Navigate to category page (e.g., `/category/wedding-photography`)
2. Browse active, approved, non-expired ads
3. Click on ad → View full details at `/ad/[id]`
4. See seller profile, contact info, packages
5. Contact seller via phone/email/social media

## Files Created/Modified

### New Files
- `app/seller/ads/create/page.tsx` - Create new ad with payment
- `app/seller/ads/page.tsx` - List all seller ads
- `app/seller/ads/[id]/edit/page.tsx` - Edit active ad
- `app/seller/ads/[id]/reactivate/page.tsx` - Reactivate expired ad
- `app/seller/profile/edit/page.tsx` - Edit seller profile
- `app/admin/ads/page.tsx` - Admin approval dashboard

### Modified Files
- `app/category/[category]/page.tsx` - Updated to show ads instead of services
- `lib/constants.ts` - Added payment and pricing constants
- `types/index.ts` - Added Advertisement, AdPayment, SellerProfile types

## Next Steps (Optional Enhancements)

1. **Email Notifications:**
   - Notify seller when ad is approved/rejected
   - Notify admin when new payment is submitted

2. **Online Payment Integration:**
   - Integrate payment gateway (e.g., PayHere, Stripe)
   - Automatic approval after successful payment

3. **Analytics Dashboard:**
   - View count for each ad
   - Click-through rates
   - Popular categories

4. **Advanced Features:**
   - Featured ads (premium placement)
   - Ad performance metrics
   - Bulk ad management
   - Ad templates

5. **Image Upload:**
   - Direct image upload to Firebase Storage
   - Image optimization and resizing
   - Gallery management

## Testing Checklist

- [ ] Seller can create new ad
- [ ] Payment slip upload works
- [ ] Admin can view pending ads
- [ ] Admin can approve ads
- [ ] Admin can reject ads with reason
- [ ] Approved ads appear in category pages
- [ ] Expired ads can be reactivated
- [ ] Active ads can be edited
- [ ] Seller profile can be created/updated
- [ ] Guest can view ad details
- [ ] Guest can see seller profile on ad page
- [ ] Only active, approved, non-expired ads show to guests

