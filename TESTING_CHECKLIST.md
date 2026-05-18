# Advertisement System - Testing Checklist

## Setup

- [ ] Firebase is configured and running
- [ ] All environment variables are set
- [ ] Database collections exist (advertisements, adPayments, sellerProfiles)
- [ ] Test users created (seller, admin, guest)

## Seller - Create Advertisement

### Step 1: Ad Details
- [ ] Navigate to `/seller/ads/create`
- [ ] Page loads without errors
- [ ] All form fields are visible
- [ ] Category dropdown shows all categories
- [ ] Can fill in title, description, location
- [ ] Can add cover image URL
- [ ] Can add/remove packages
- [ ] Form validation works (required fields)
- [ ] Submit button is enabled when form is valid

### Step 2: Payment
- [ ] After submitting, redirected to payment step
- [ ] Ad is created in database with status "pending"
- [ ] Payment amount shows LKR 5,000
- [ ] WhatsApp button opens correct URL
- [ ] Can select payment slip file
- [ ] File name shows after selection
- [ ] Submit button is disabled without file
- [ ] Submit button is enabled with file
- [ ] Payment slip uploads to Firebase Storage
- [ ] Payment record created in database
- [ ] Redirected to `/seller/ads` after submission
- [ ] Success toast notification appears

## Seller - View Advertisements

- [ ] Navigate to `/seller/ads`
- [ ] Page loads without errors
- [ ] Three tabs are visible (Active, Pending, Expired)
- [ ] Pending tab shows newly created ad
- [ ] Ad card shows correct information
- [ ] Status badge shows "Pending Approval"
- [ ] Creation date is displayed
- [ ] View button works
- [ ] Edit button is not shown for pending ads
- [ ] Reactivate button is not shown for pending ads

## Seller - Edit Advertisement

- [ ] Create and approve an ad (or use existing active ad)
- [ ] Navigate to `/seller/ads`
- [ ] Active tab shows the ad
- [ ] Edit button is visible
- [ ] Click Edit → redirected to `/seller/ads/[id]/edit`
- [ ] Form is pre-filled with existing data
- [ ] Can modify title, description, location
- [ ] Can update packages
- [ ] Cancel button returns to ads list
- [ ] Save button updates the ad
- [ ] Success toast appears
- [ ] Redirected to `/seller/ads`
- [ ] Changes are reflected in ads list

## Seller - Reactivate Advertisement

- [ ] Have an expired or deactivated ad
- [ ] Navigate to `/seller/ads`
- [ ] Switch to "Expired/Deactivated" tab
- [ ] Expired ad is shown
- [ ] Reactivate button is visible
- [ ] Click Reactivate → redirected to `/seller/ads/[id]/reactivate`
- [ ] Ad preview is shown
- [ ] Payment section is displayed
- [ ] WhatsApp button works
- [ ] Can upload payment slip
- [ ] Submit creates new payment record with isReactivation: true
- [ ] Redirected to `/seller/ads`
- [ ] Ad moves to Pending tab

## Seller - Profile Management

- [ ] Navigate to `/seller/profile/edit`
- [ ] Page loads without errors
- [ ] All form fields are visible
- [ ] Can fill in name, contact, email, address
- [ ] Hide address toggle works
- [ ] Can add description
- [ ] Can add profile and cover image URLs
- [ ] Can add social media links
- [ ] Can add/remove prior works
- [ ] Save button updates profile
- [ ] Success toast appears
- [ ] Profile is saved in database
- [ ] Reload page shows saved data

## Admin - Review Advertisements

- [ ] Navigate to `/admin/ads`
- [ ] Page loads without errors
- [ ] Pending count badge shows correct number
- [ ] All pending ads are listed
- [ ] Ad cards show full information
- [ ] Payment information is displayed
- [ ] Payment status badge is shown
- [ ] "View Payment Slip" link opens in new tab
- [ ] Payment slip image loads correctly

## Admin - Approve Advertisement

- [ ] Click "Approve" button on a pending ad
- [ ] Confirmation or immediate approval
- [ ] Ad status changes to "active"
- [ ] isApproved set to true
- [ ] activatedAt set to current date
- [ ] expiresAt set to 3 months from now
- [ ] Payment status changes to "verified"
- [ ] Success toast appears
- [ ] Ad removed from pending list
- [ ] Ad appears in seller's Active tab
- [ ] Ad appears in category page for guests

## Admin - Reject Advertisement

- [ ] Click "Reject" button on a pending ad
- [ ] Rejection dialog opens
- [ ] Rejection reason field is shown
- [ ] Submit button is disabled without reason
- [ ] Enter rejection reason
- [ ] Submit button is enabled
- [ ] Click submit
- [ ] Ad status changes to "rejected"
- [ ] isApproved set to false
- [ ] rejectionReason is saved
- [ ] Payment status changes to "rejected"
- [ ] Success toast appears
- [ ] Ad removed from pending list
- [ ] Seller can see rejection reason in ads list

## Guest - Browse Advertisements

- [ ] Navigate to category page (e.g., `/category/wedding-photography`)
- [ ] Page loads without errors
- [ ] Only active, approved, non-expired ads are shown
- [ ] Pending ads are not shown
- [ ] Rejected ads are not shown
- [ ] Expired ads are not shown
- [ ] Ad cards show correct information
- [ ] Search functionality works
- [ ] Sort functionality works
- [ ] Location filter works (if implemented)

## Guest - View Advertisement Details

- [ ] Click on an ad card
- [ ] Redirected to `/ad/[id]`
- [ ] Page loads without errors
- [ ] Cover image is displayed
- [ ] Ad title and description are shown
- [ ] Category badge is displayed
- [ ] Location is shown
- [ ] Packages are listed (if any)
- [ ] Gallery images are shown (if any)

## Guest - View Seller Profile

- [ ] On ad detail page, scroll to seller section
- [ ] Seller profile information is displayed
- [ ] Profile image is shown (if set)
- [ ] Contact information is visible
- [ ] Address is shown (if not hidden)
- [ ] Social media links are displayed
- [ ] Prior works gallery is shown
- [ ] All links are clickable and work

## Security & Permissions

- [ ] Guest cannot access `/seller/*` routes
- [ ] Guest cannot access `/admin/*` routes
- [ ] Seller cannot access `/admin/*` routes
- [ ] Admin cannot access `/seller/*` routes (or can if dual role)
- [ ] Seller can only edit their own ads
- [ ] Seller can only view their own ads in `/seller/ads`
- [ ] Seller can only reactivate their own ads
- [ ] Admin can view all pending ads
- [ ] Unauthenticated users redirected to login

## Database Integrity

- [ ] Ad creation creates document in advertisements collection
- [ ] Payment submission creates document in adPayments collection
- [ ] Profile creation creates document in sellerProfiles collection
- [ ] Ad approval updates both ad and payment documents
- [ ] Ad rejection updates both ad and payment documents
- [ ] Timestamps are set correctly (createdAt, updatedAt, etc.)
- [ ] Foreign keys are correct (sellerId, adId, userId)

## Error Handling

- [ ] Network errors show appropriate messages
- [ ] Database errors are caught and logged
- [ ] File upload errors show user-friendly messages
- [ ] Invalid ad IDs redirect appropriately
- [ ] Missing data shows loading or empty states
- [ ] Form validation errors are clear

## UI/UX

- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] Loading states are shown during async operations
- [ ] Success/error toasts appear and are readable
- [ ] Buttons are disabled during processing
- [ ] Forms are easy to fill out
- [ ] Navigation is intuitive
- [ ] Colors and styling are consistent
- [ ] Text is readable on all backgrounds

## Performance

- [ ] Pages load quickly
- [ ] Images load efficiently
- [ ] No unnecessary re-renders
- [ ] Database queries are optimized
- [ ] File uploads are reasonably fast

## Edge Cases

- [ ] Ad with no packages displays correctly
- [ ] Ad with no cover image displays correctly
- [ ] Seller with no profile shows default info
- [ ] Empty states show appropriate messages
- [ ] Very long descriptions are handled
- [ ] Special characters in text fields work
- [ ] Multiple simultaneous uploads work
- [ ] Expired ads don't show to guests
- [ ] Ads expiring today are handled correctly

## Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile browsers

## Final Checks

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All links work
- [ ] All buttons work
- [ ] All forms submit correctly
- [ ] All images load
- [ ] All data persists correctly
- [ ] User flows are smooth and logical

