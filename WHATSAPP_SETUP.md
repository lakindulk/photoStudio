# WhatsApp Automatic Messaging Setup

This guide explains how to set up automatic WhatsApp message sending for your photography marketplace.

## 🚀 Quick Setup (Free Option - CallMeBot)

### Step 1: Get CallMeBot API Key

1. **Add Contact**: Add `+34 644 59 71 67` to your phone contacts
   - Name it "CallMeBot" or any name you prefer

2. **Send Activation Message**: Send this exact message to the contact:
   ```
   I allow callmebot to send me messages
   ```

3. **Get API Key**: You'll receive a reply with your unique API key
   - Example: "Your API key is: 123456"

4. **Add to Environment**: Add the API key to your `.env.local` file:
   ```
   NEXT_PUBLIC_CALLMEBOT_API_KEY=123456
   ```

### Step 2: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test booking creation**: Create a test booking and check if WhatsApp messages are sent automatically

3. **Check console logs**: Look for success/failure messages in browser console

## 🔧 How It Works

### Automatic Flow
1. Customer creates a booking
2. System automatically sends WhatsApp message to seller
3. No manual intervention required
4. Seller receives instant notification

### Fallback Mechanism
- If automatic sending fails, system falls back to opening WhatsApp Web
- Ensures messages are always delivered one way or another

## 📱 Message Format

Sellers receive messages like this:

```
🔔 New Booking Request!

Customer: John Doe
Event Date: 2024-01-15
Package: Wedding Photography Premium
Amount: LKR 150,000

Booking ID: abc123

Please confirm availability by logging into your seller dashboard: https://yoursite.com/seller/bookings

To approve this booking, click here: https://yoursite.com/seller/confirm-booking/abc123
```

## 🔄 Alternative Services

### Option 1: CallMeBot (Free)
- ✅ Free to use
- ✅ Easy setup
- ✅ No registration required
- ❌ Rate limited
- ❌ Reliability varies
- ❌ One-time setup per phone number

### Option 2: Twilio WhatsApp API (Paid)
- ✅ Highly reliable
- ✅ Professional features
- ✅ Rich message formatting
- ✅ Delivery confirmations
- ❌ Paid service
- ❌ Complex setup
- ❌ Business verification required

### Option 3: WhatsApp Business API (Official)
- ✅ Official WhatsApp service
- ✅ Most reliable
- ✅ Advanced features
- ❌ Expensive
- ❌ Complex approval process
- ❌ Requires business verification

## 🛠️ Troubleshooting

### Messages Not Sending Automatically
1. **Check API Key**: Ensure `NEXT_PUBLIC_CALLMEBOT_API_KEY` is set correctly
2. **Check Phone Format**: Phone numbers should include country code (e.g., +94715816400)
3. **Check Console**: Look for error messages in browser console
4. **Test API**: Visit `/api/whatsapp/send` to see setup instructions

### CallMeBot Setup Issues
1. **Wrong Contact**: Make sure you added the correct number: `+34 644 59 71 67`
2. **Exact Message**: Send exactly: "I allow callmebot to send me messages"
3. **Wait Time**: Sometimes it takes a few minutes to receive the API key
4. **Try Again**: If no response, try sending the message again

### Rate Limiting
- CallMeBot has rate limits (exact limits not published)
- If you hit limits, messages will fall back to WhatsApp Web
- For high volume, consider upgrading to Twilio

## 🔐 Security Notes

- API keys are stored in environment variables
- Messages are sent server-side for security
- Phone numbers are validated and sanitized
- No sensitive data is logged

## 📊 Monitoring

Check these logs to monitor WhatsApp sending:
- Browser console: Success/failure messages
- Server logs: API call results
- Network tab: API request/response details

## 🚀 Production Deployment

1. **Set Environment Variables**: Add API key to your hosting platform
2. **Update App URL**: Set `NEXT_PUBLIC_APP_URL` to your production domain
3. **Test Thoroughly**: Test with real phone numbers before going live
4. **Monitor Usage**: Keep track of message volume and success rates

## 📞 Support

If you need help with setup:
1. Check the troubleshooting section above
2. Test the API endpoint: `/api/whatsapp/send`
3. Review console logs for error details
4. Consider upgrading to a paid service for better reliability
