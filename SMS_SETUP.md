# SMS Notification System Setup

This guide explains how to set up SMS notifications for admins when bookings are created. The admin receives SMS messages with WhatsApp links to send messages to both sellers and customers.

## 🚀 Quick Setup (Free Option - TextBelt)

### Step 1: Configure Admin Phone Number

Add your admin phone number to `.env.local`:
```
NEXT_PUBLIC_ADMIN_PHONE_NUMBER=+94715816400
```

### Step 2: Choose SMS Service

#### Option A: TextBelt (Free Tier)
- **Free**: 1 SMS per day per phone number
- **No setup required** for free tier
- **Paid tier**: $0.15 per SMS with API key

For paid tier, get API key from [textbelt.com](https://textbelt.com) and add:
```
TEXTBELT_API_KEY=your_api_key_here
```

#### Option B: Twilio (Paid)
1. Create account at [twilio.com](https://twilio.com)
2. Get phone number and credentials
3. Add to `.env.local`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit SMS test page**: `/admin/sms-test`

3. **Test SMS sending**: Enter your phone number and send a test message

4. **Test booking notification**: Use the booking notification test feature

## 📱 How It Works

### Booking Flow
1. **Customer creates booking** on checkout page
2. **System automatically sends SMS to admin** with:
   - Booking details
   - WhatsApp link for seller notification
   - WhatsApp link for customer confirmation
3. **Admin clicks links** to send WhatsApp messages manually
4. **No automation required** from admin side - just click and send

### SMS Message Format

Admin receives SMS like this:

```
🔔 NEW BOOKING ALERT - Malka Studio

Booking ID: ABC123
Customer: John Doe
Seller: Jane's Photography Studio
Amount: LKR 150,000

ACTION REQUIRED:
1. Send confirmation to SELLER:
https://wa.me/94712345678?text=...

2. Send confirmation to CUSTOMER:
https://wa.me/94715816400?text=...

Admin Dashboard: https://yoursite.com/admin/bookings
```

### WhatsApp Messages

#### Seller Message (via WhatsApp link):
```
🔔 New Booking Confirmation!

Customer: John Doe
Event Date: 2024-02-15
Package: Wedding Photography Premium
Amount: LKR 150,000

Booking ID: ABC123

Please confirm availability by logging into your seller dashboard: [link]

To approve this booking, click here: [direct link]
```

#### Customer Message (via WhatsApp link):
```
✅ Booking Confirmation - Malka Studio

Dear John Doe,

Your booking has been received!

📅 Event Date: 2024-02-15
📦 Package: Wedding Photography Premium
💰 Amount: LKR 150,000
🆔 Booking ID: ABC123

Seller: Jane's Photography Studio
Contact: Jane Smith

Your booking is being reviewed by the seller. You will receive confirmation shortly.

Track your booking: [link]

Thank you for choosing Malka Studio!
```

## 🔧 Configuration Options

### Environment Variables

```bash
# Required: Admin phone number
NEXT_PUBLIC_ADMIN_PHONE_NUMBER=+94715816400

# Optional: TextBelt API key (for paid tier)
TEXTBELT_API_KEY=your_textbelt_key

# Optional: Twilio credentials (alternative service)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Required: App URL for links
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Service Comparison

| Feature | TextBelt Free | TextBelt Paid | Twilio |
|---------|---------------|---------------|---------|
| Cost | Free | $0.15/SMS | ~$0.0075/SMS |
| Daily Limit | 1 SMS/day/phone | Unlimited | Unlimited |
| Reliability | Basic | Good | Excellent |
| Delivery Reports | No | Yes | Yes |
| Setup Complexity | None | Minimal | Moderate |
| Global Coverage | Limited | Good | Excellent |

## 🛠️ Testing

### Test Pages Available

1. **SMS Test Page**: `/admin/sms-test`
   - Send test SMS messages
   - Test different services
   - View setup information

2. **WhatsApp Test Page**: `/admin/whatsapp-test`
   - Test WhatsApp message formatting
   - Verify link generation

### Testing Checklist

- [ ] Admin phone number configured
- [ ] SMS service credentials added (if using paid tier)
- [ ] Test SMS sending works
- [ ] Test booking notification SMS
- [ ] WhatsApp links open correctly
- [ ] Messages format properly
- [ ] Links redirect to correct pages

## 🔍 Troubleshooting

### SMS Not Sending

1. **Check phone number format**: Must include country code (+94715816400)
2. **Verify environment variables**: Check `.env.local` file
3. **Check service limits**: TextBelt free tier is 1 SMS/day
4. **Test with different service**: Try Twilio if TextBelt fails
5. **Check console logs**: Look for error messages

### WhatsApp Links Not Working

1. **Check phone number format**: Remove spaces and special characters
2. **Verify message encoding**: Special characters might break URLs
3. **Test link manually**: Copy and paste in browser
4. **Check app URL**: Ensure `NEXT_PUBLIC_APP_URL` is correct

### Common Issues

**"Quota exceeded"**: Using TextBelt free tier limit
- Solution: Wait 24 hours or upgrade to paid tier

**"Invalid phone number"**: Wrong format
- Solution: Use international format with country code

**"Service unavailable"**: API service down
- Solution: Try alternative service or wait

**"Links not working"**: App URL misconfigured
- Solution: Check `NEXT_PUBLIC_APP_URL` in environment

## 📊 Monitoring

### Logs to Check

1. **Browser Console**: Client-side errors and success messages
2. **Server Logs**: API call results and errors
3. **Network Tab**: SMS API request/response details

### Success Indicators

- ✅ SMS sent successfully to admin
- ✅ WhatsApp links open correctly
- ✅ Messages display properly formatted
- ✅ Booking details are accurate
- ✅ Links redirect to correct pages

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Environment variables configured on hosting platform
- [ ] Admin phone number verified
- [ ] SMS service credentials tested
- [ ] App URL updated for production domain
- [ ] Rate limits understood and planned for
- [ ] Backup SMS service configured (optional)

### Recommended Setup for Production

1. **Primary**: Twilio SMS (reliable, scalable)
2. **Backup**: TextBelt (fallback option)
3. **Monitoring**: Set up alerts for SMS failures
4. **Logging**: Track SMS success/failure rates

## 💡 Tips for Success

1. **Test thoroughly** before going live
2. **Use international phone number format** (+country_code_number)
3. **Monitor SMS usage** to avoid unexpected costs
4. **Have backup admin contacts** in case primary fails
5. **Keep messages concise** to avoid SMS length limits
6. **Test WhatsApp links** on different devices

## 📞 Support

If you need help:
1. Check troubleshooting section above
2. Test using `/admin/sms-test` page
3. Review console logs for errors
4. Verify environment variable configuration
5. Test with a different SMS service
