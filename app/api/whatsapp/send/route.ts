import { NextRequest, NextResponse } from 'next/server'

// Free WhatsApp API service - CallMeBot
// Alternative services: Twilio (paid), WhatsApp Business API (paid), etc.

interface WhatsAppMessage {
  phoneNumber: string
  message: string
  apiKey?: string
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, apiKey }: WhatsAppMessage = await request.json()

    // Validate required fields
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '')

    // Method 1: CallMeBot API (Free)
    // Note: Requires one-time setup per phone number
    if (apiKey) {
      const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhoneNumber}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
      
      try {
        const response = await fetch(callMeBotUrl)
        const result = await response.text()
        
        if (response.ok) {
          return NextResponse.json({ 
            success: true, 
            message: 'WhatsApp message sent successfully',
            service: 'CallMeBot'
          })
        } else {
          throw new Error(`CallMeBot API error: ${result}`)
        }
      } catch (error) {
        console.error('CallMeBot API error:', error)
        // Fall back to other methods
      }
    }

    // Method 2: WhatsApp Web URL (Fallback)
    // This will open WhatsApp Web with pre-filled message
    const whatsappWebUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`
    
    // Log the attempt (in production, you might want to store this in database)
    console.log(`WhatsApp message prepared for ${cleanPhoneNumber}:`, message)
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp message prepared',
      whatsappUrl: whatsappWebUrl,
      service: 'WhatsApp Web',
      note: 'For automatic sending, configure CallMeBot API key'
    })

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}

// GET endpoint to provide setup instructions
export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp API Setup Instructions',
    services: {
      callmebot: {
        name: 'CallMeBot (Free)',
        setup: [
          '1. Add +34 644 59 71 67 to your phone contacts (name it CallMeBot)',
          '2. Send "I allow callmebot to send me messages" to this contact',
          '3. Wait for confirmation message with your API key',
          '4. Add the API key to your environment variables'
        ],
        pros: ['Free', 'Automatic sending', 'No registration required'],
        cons: ['One-time setup per phone', 'Rate limited', 'Reliability varies']
      },
      twilio: {
        name: 'Twilio (Paid)',
        setup: [
          '1. Create Twilio account',
          '2. Get WhatsApp Business API access',
          '3. Configure webhook endpoints',
          '4. Add credentials to environment'
        ],
        pros: ['Reliable', 'Professional', 'Rich features'],
        cons: ['Paid service', 'Complex setup', 'Business verification required']
      }
    }
  })
}
