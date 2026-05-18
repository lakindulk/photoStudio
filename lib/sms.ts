// SMS utility functions for sending text messages

export async function sendSMS(
  phoneNumber: string, 
  message: string, 
  service: 'textbelt' | 'twilio' = 'textbelt'
): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phoneNumber, 
        message,
        service 
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('SMS sent successfully:', result)
      return { success: true, details: result }
    } else {
      console.warn('SMS sending failed:', result)
      return { success: false, error: result.error, details: result }
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return { success: false, error: error.message }
  }
}

export async function sendBookingNotificationToAdmin(
  adminPhoneNumber: string,
  booking: {
    customerName: string
    customerPhone: string
    eventDate: string
    packageName: string
    totalAmount: number
    bookingId: string
  },
  seller: {
    name: string
    whatsapp: string
    businessName: string
  }
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
  
  // Create WhatsApp links for seller and customer
  const sellerWhatsAppMessage = `🔔 New Booking Confirmation!

Customer: ${booking.customerName}
Event Date: ${booking.eventDate}
Package: ${booking.packageName}
Amount: LKR ${booking.totalAmount.toLocaleString()}

Booking ID: ${booking.bookingId}

Please confirm availability by logging into your seller dashboard: ${baseUrl}/seller/bookings

To approve this booking, click here: ${baseUrl}/seller/confirm-booking/${booking.bookingId}`

  const customerWhatsAppMessage = `✅ Booking Confirmation - Malka Studio

Dear ${booking.customerName},

Your booking has been received!

📅 Event Date: ${booking.eventDate}
📦 Package: ${booking.packageName}
💰 Amount: LKR ${booking.totalAmount.toLocaleString()}
🆔 Booking ID: ${booking.bookingId}

Seller: ${seller.businessName}
Contact: ${seller.name}

Your booking is being reviewed by the seller. You will receive confirmation shortly.

Track your booking: ${baseUrl}/my-bookings?phone=${encodeURIComponent(booking.customerPhone)}

Thank you for choosing Malka Studio!`

  // Create WhatsApp links
  const sellerWhatsAppLink = `https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(sellerWhatsAppMessage)}`
  const customerWhatsAppLink = `https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customerWhatsAppMessage)}`

  // SMS message to admin with both WhatsApp links
  const adminSMSMessage = `🔔 NEW BOOKING ALERT - Malka Studio

Booking ID: ${booking.bookingId}
Customer: ${booking.customerName}
Seller: ${seller.businessName}
Amount: LKR ${booking.totalAmount.toLocaleString()}

ACTION REQUIRED:
1. Send confirmation to SELLER:
${sellerWhatsAppLink}

2. Send confirmation to CUSTOMER:
${customerWhatsAppLink}

Admin Dashboard: ${baseUrl}/admin/bookings`

  try {
    const result = await sendSMS(adminPhoneNumber, adminSMSMessage)
    return result
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error: error.message }
  }
}

export async function sendAdminAlert(
  adminPhoneNumber: string,
  alertType: 'new_booking' | 'new_seller' | 'payment_received' | 'system_error',
  details: any
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
  
  let message = ''
  
  switch (alertType) {
    case 'new_booking':
      message = `🔔 NEW BOOKING - Malka Studio
Customer: ${details.customerName}
Amount: LKR ${details.totalAmount?.toLocaleString()}
Booking ID: ${details.bookingId}
View: ${baseUrl}/admin/bookings`
      break
      
    case 'new_seller':
      message = `👤 NEW SELLER REGISTRATION - Malka Studio
Business: ${details.businessName}
Name: ${details.name}
Email: ${details.email}
Approval needed: ${baseUrl}/admin/sellers`
      break
      
    case 'payment_received':
      message = `💰 PAYMENT RECEIVED - Malka Studio
Amount: LKR ${details.amount?.toLocaleString()}
Booking: ${details.bookingId}
Customer: ${details.customerName}
View: ${baseUrl}/admin/payments`
      break
      
    case 'system_error':
      message = `⚠️ SYSTEM ERROR - Malka Studio
Error: ${details.error}
Time: ${new Date().toLocaleString()}
Check logs: ${baseUrl}/admin`
      break
      
    default:
      message = `🔔 ALERT - Malka Studio
${JSON.stringify(details)}
Dashboard: ${baseUrl}/admin`
  }

  try {
    const result = await sendSMS(adminPhoneNumber, message)
    return result
  } catch (error) {
    console.error('Error sending admin alert:', error)
    return { success: false, error: error.message }
  }
}

// Utility function to validate phone numbers
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic validation for international phone numbers
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '')
  return phoneRegex.test(cleanNumber)
}

// Utility function to format phone numbers
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters except +
  let cleaned = phoneNumber.replace(/[^0-9+]/g, '')
  
  // Add + if not present and doesn't start with 0
  if (!cleaned.startsWith('+') && !cleaned.startsWith('0')) {
    cleaned = '+' + cleaned
  }
  
  return cleaned
}
