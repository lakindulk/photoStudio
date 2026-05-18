# Advertisement System - User Guide

## For Sellers

### Creating a New Advertisement

1. **Navigate to Create Ad Page**
   - Go to `/seller/ads/create`
   - Or click "Create New Ad" button on `/seller/ads`

2. **Fill in Advertisement Details**
   - **Service Category** (required): Select from dropdown
   - **Title** (required): e.g., "Professional Wedding Photography Services"
   - **Description** (required): Detailed description of your services
   - **Location** (required): e.g., "Colombo, Sri Lanka"
   - **Cover Image URL** (optional): Upload image to hosting service and paste URL
   - **Packages** (optional): Add service packages with names, descriptions, and prices

3. **Submit Payment**
   - After creating the ad, you'll be redirected to the payment page
   - **Payment Amount:** LKR 5,000 for 3 months
   - **Payment Method:**
     - Click "Send Payment Slip via WhatsApp" to contact admin
     - Make payment and receive payment slip
     - Upload the payment slip image
     - Click "Submit Payment Slip"

4. **Wait for Approval**
   - Your ad will be in "Pending" status
   - Admin will review your ad and payment
   - You'll see the status in your ads list at `/seller/ads`

### Managing Your Advertisements

#### View All Ads
- Go to `/seller/ads`
- **Active Tab:** Currently live advertisements
- **Pending Tab:** Awaiting admin approval
- **Expired/Deactivated Tab:** Past advertisements

#### Edit Active Ad
1. Go to `/seller/ads`
2. Find your active ad
3. Click "Edit" button
4. Update details (title, description, location, packages)
5. Click "Save Changes"

#### Reactivate Expired Ad
1. Go to `/seller/ads`
2. Switch to "Expired/Deactivated" tab
3. Click "Reactivate" on the ad you want to reactivate
4. Submit payment (LKR 5,000 for another 3 months)
5. Upload payment slip
6. Wait for admin approval

### Managing Your Profile

1. **Navigate to Profile Edit Page**
   - Go to `/seller/profile/edit`

2. **Fill in Profile Information**
   - **Basic Details:** Name, contact number, email, address
   - **Hide Address:** Toggle to hide address from guests
   - **Description:** Tell guests about yourself and your services
   - **Profile Image:** URL to your profile picture
   - **Cover Image:** URL to your cover/banner image
   - **Social Media:** Facebook, Instagram, YouTube, Website links
   - **Prior Works:** Add URLs to images of your previous work

3. **Save Profile**
   - Click "Save Profile"
   - Your profile will be visible on your advertisement pages

## For Admins

### Reviewing Pending Advertisements

1. **Navigate to Admin Ads Page**
   - Go to `/admin/ads`
   - You'll see all pending advertisements

2. **Review Advertisement**
   - View ad details (title, description, category, location, packages)
   - Check payment information
   - Click "View Payment Slip" to see the uploaded payment proof

3. **Approve Advertisement**
   - Click "Approve" button
   - Ad will become active for 3 months
   - Seller will be able to see it in their "Active" tab
   - Guests will be able to see it in category pages

4. **Reject Advertisement**
   - Click "Reject" button
   - Enter a rejection reason (required)
   - Click "Reject Advertisement"
   - Seller will see the rejection reason in their ads list

## For Guests

### Browsing Advertisements

1. **View Category Page**
   - Navigate to a category (e.g., `/category/wedding-photography`)
   - See all active, approved, non-expired advertisements

2. **Search and Filter**
   - Use search bar to find specific ads
   - Sort by newest, oldest, or price

3. **View Advertisement Details**
   - Click on an advertisement card
   - View full details at `/ad/[id]`
   - See:
     - Full description
     - Service packages
     - Gallery images
     - Seller profile
     - Contact information
     - Social media links
     - Prior works portfolio

4. **Contact Seller**
   - Use phone number, email, or social media links
   - Contact information is shown on the ad detail page

## Payment Information

- **Amount:** LKR 5,000
- **Duration:** 3 months from activation date
- **Payment Method:** WhatsApp payment with slip upload
- **WhatsApp Number:** +94715816400
- **Online Payment:** Coming soon

## Advertisement Lifecycle

1. **Created** → Ad created with "Pending" status
2. **Payment Submitted** → Payment slip uploaded
3. **Admin Review** → Admin reviews ad and payment
4. **Approved** → Ad becomes active for 3 months
5. **Active** → Ad is visible to guests
6. **Expired** → After 3 months, ad expires
7. **Reactivated** → Seller can reactivate with new payment

## Status Badges

- **Active** (Green): Ad is currently live
- **Pending Approval** (Yellow): Awaiting admin review
- **Rejected** (Red): Ad was rejected by admin
- **Expired** (Gray): Ad duration has ended
- **Deactivated** (Gray): Ad was manually deactivated

## Tips for Sellers

1. **Use High-Quality Images**
   - Upload images to a reliable hosting service
   - Use clear, professional photos
   - Recommended size: 1200x800px or larger

2. **Write Detailed Descriptions**
   - Explain your services clearly
   - Mention your experience and expertise
   - Include what makes you unique

3. **Set Competitive Packages**
   - Offer multiple package options
   - Price competitively
   - Include clear descriptions of what's included

4. **Complete Your Profile**
   - Fill in all profile information
   - Add social media links
   - Upload portfolio images
   - This builds trust with potential clients

5. **Keep Ads Updated**
   - Edit your ads to keep information current
   - Update packages and pricing as needed
   - Reactivate expired ads promptly

## Troubleshooting

### Ad Not Showing in Category Page
- Check if ad is approved (status should be "Active")
- Verify ad hasn't expired
- Ensure payment was verified by admin

### Cannot Edit Ad
- Only active ads can be edited
- Pending or expired ads cannot be edited
- You can only edit your own ads

### Payment Slip Upload Failed
- Check file size (should be under 5MB)
- Ensure file is an image (JPG, PNG, etc.)
- Try a different browser if issue persists

### Profile Not Showing on Ad Page
- Ensure you've created a seller profile at `/seller/profile/edit`
- Save the profile after making changes
- Refresh the ad page

## Support

For technical support or payment issues, contact:
- **WhatsApp:** +94715816400
- **Email:** [Your support email]

## Future Features

- Online payment integration
- Email notifications
- Analytics dashboard
- Featured ads
- Bulk ad management
- Direct image upload

