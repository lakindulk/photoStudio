import { NextRequest, NextResponse } from 'next/server'

// Free SMS API services
// Alternative services: Twilio (paid), TextBelt (free with limits), etc.

interface SMSMessage {
  phoneNumber: string
  message: string
  service?: 'textbelt' | 'twilio'
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, service = 'textbelt' }: SMSMessage = await request.json()

    // Validate required fields
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '')

    let result: any = {}

    if (service === 'textbelt') {
      // Method 1: TextBelt API (Free with daily limits)
      try {
        const textbeltResponse = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: cleanPhoneNumber,
            message: message,
            key: process.env.TEXTBELT_API_KEY || 'textbelt', // 'textbelt' for free tier
          }),
        })

        const textbeltResult = await textbeltResponse.json()
        
        if (textbeltResult.success) {
          result = {
            success: true,
            message: 'SMS sent successfully via TextBelt',
            service: 'TextBelt',
            quotaRemaining: textbeltResult.quotaRemaining,
            textId: textbeltResult.textId
          }
        } else {
          throw new Error(`TextBelt API error: ${textbeltResult.error}`)
        }
      } catch (error) {
        console.error('TextBelt API error:', error)
        result = {
          success: false,
          error: error.message,
          service: 'TextBelt'
        }
      }
    } else if (service === 'twilio') {
      // Method 2: Twilio API (Paid, more reliable)
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const fromNumber = process.env.TWILIO_PHONE_NUMBER

        if (!accountSid || !authToken || !fromNumber) {
          throw new Error('Twilio credentials not configured')
        }

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: cleanPhoneNumber,
            Body: message,
          }),
        })

        const twilioResult = await twilioResponse.json()
        
        if (twilioResponse.ok) {
          result = {
            success: true,
            message: 'SMS sent successfully via Twilio',
            service: 'Twilio',
            sid: twilioResult.sid,
            status: twilioResult.status
          }
        } else {
          throw new Error(`Twilio API error: ${twilioResult.message}`)
        }
      } catch (error) {
        console.error('Twilio API error:', error)
        result = {
          success: false,
          error: error.message,
          service: 'Twilio'
        }
      }
    }

    // Log the attempt (in production, you might want to store this in database)
    console.log(`SMS attempt for ${cleanPhoneNumber}:`, result)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}

// GET endpoint to provide setup instructions
export async function GET() {
  return NextResponse.json({
    message: 'SMS API Setup Instructions',
    services: {
      textbelt: {
        name: 'TextBelt (Free)',
        setup: [
          '1. Free tier: 1 text per day per phone number',
          '2. Paid tier: $0.15 per text with API key',
          '3. No registration required for free tier',
          '4. Add TEXTBELT_API_KEY to environment for paid tier'
        ],
        pros: ['Free option available', 'Simple setup', 'No registration for free tier'],
        cons: ['Limited free quota', 'No delivery confirmations on free tier']
      },
      twilio: {
        name: 'Twilio (Paid)',
        setup: [
          '1. Create Twilio account',
          '2. Get phone number',
          '3. Add credentials to environment variables',
          '4. TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER'
        ],
        pros: ['Reliable', 'Delivery confirmations', 'Global coverage'],
        cons: ['Paid service', 'Requires account setup']
      }
    },
    currentConfig: {
      textbeltKey: process.env.TEXTBELT_API_KEY ? 'Configured' : 'Using free tier',
      twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
    }
  })
}
