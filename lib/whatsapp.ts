export const ADMIN_WHATSAPP = "+94715816400"

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`
}

export async function sendWhatsAppMessage(phoneNumber: string, message: string, apiKey?: string): Promise<boolean> {
  try {
    // Try to send automatically via API
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        message,
        apiKey: apiKey || process.env.NEXT_PUBLIC_CALLMEBOT_API_KEY
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log('WhatsApp message sent automatically:', result)
      return true
    } else {
      console.warn('Automatic WhatsApp sending failed, falling back to manual:', result)

      // Fallback: Open WhatsApp Web (only in browser)
      if (typeof window !== "undefined") {
        const whatsappUrl = createWhatsAppLink(phoneNumber, message)
        window.open(whatsappUrl, "_blank")
      }
      return false
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)

    // Fallback: Open WhatsApp Web (only in browser)
    if (typeof window !== "undefined") {
      const whatsappUrl = createWhatsAppLink(phoneNumber, message)
      window.open(whatsappUrl, "_blank")
    }
    return false
  }
}

export async function sendBookingNotificationToSeller(
  sellerWhatsapp: string,
  booking: {
    customerName: string
    eventDate: string
    packageName: string
    totalAmount: number
    bookingId: string
  },
  apiKey?: string
): Promise<{ success: boolean; whatsappUrl?: string }> {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'

  const message = `🔔 New Booking Request!

Customer: ${booking.customerName}
Event Date: ${booking.eventDate}
Package: ${booking.packageName}
Amount: LKR ${booking.totalAmount.toLocaleString()}

Booking ID: ${booking.bookingId}

Please confirm availability by logging into your seller dashboard: ${baseUrl}/seller/bookings

To approve this booking, click here: ${baseUrl}/seller/confirm-booking/${booking.bookingId}`

  try {
    const success = await sendWhatsAppMessage(sellerWhatsapp, message, apiKey)
    return {
      success,
      whatsappUrl: success ? undefined : createWhatsAppLink(sellerWhatsapp, message)
    }
  } catch (error) {
    console.error('Error sending booking notification:', error)
    return {
      success: false,
      whatsappUrl: createWhatsAppLink(sellerWhatsapp, message)
    }
  }
}

export function sendPaymentLinkToCustomer(
  customerWhatsapp: string,
  booking: {
    customerName: string
    packageName: string
    totalAmount: number
    paymentLink: string
  },
): string {
  const message = `✅ Your booking has been confirmed!

Hi ${booking.customerName},

Your booking for ${booking.packageName} has been approved by the service provider.
Total Amount: LKR ${booking.totalAmount.toLocaleString()}

Please complete payment using this link:
${booking.paymentLink}

For any questions, contact our support: ${createWhatsAppLink(ADMIN_WHATSAPP, "I need help with my booking")}`

  return createWhatsAppLink(customerWhatsapp, message)
}

export function createSupportLink(message = "I need help"): string {
  return createWhatsAppLink(ADMIN_WHATSAPP, message)
}
