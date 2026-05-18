"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { sendSMS, sendBookingNotificationToAdmin } from "@/lib/sms"
import { MessageSquare, Send, Settings, TestTube } from "lucide-react"

export default function SMSTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("ðŸ”” Test SMS from Malka Studio!\n\nThis is a test of our SMS notification system.")
  const [service, setService] = useState<'textbelt' | 'twilio'>('textbelt')
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  // Test booking data
  const [testBookingData, setTestBookingData] = useState({
    customerName: "John Doe",
    customerPhone: "+94715816400",
    eventDate: "2024-02-15",
    packageName: "Wedding Photography Premium",
    totalAmount: 150000,
    bookingId: "TEST123",
    sellerName: "Jane Smith",
    sellerWhatsapp: "+94712345678",
    sellerBusinessName: "Jane's Photography Studio"
  })

  const handleSendTest = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to test",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await sendSMS(phoneNumber, message, service)
      
      setLastResult({ ...result, phoneNumber, message, timestamp: new Date(), service })
      
      if (result.success) {
        toast({
          title: "SMS Sent Successfully",
          description: `Message sent via ${service}`,
        })
      } else {
        toast({
          title: "SMS Sending Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending test SMS:", error)
      toast({
        title: "Error",
        description: "Failed to send test SMS",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestBookingNotification = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Admin Phone Required",
        description: "Please enter admin phone number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await sendBookingNotificationToAdmin(
        phoneNumber,
        {
          customerName: testBookingData.customerName,
          customerPhone: testBookingData.customerPhone,
          eventDate: testBookingData.eventDate,
          packageName: testBookingData.packageName,
          totalAmount: testBookingData.totalAmount,
          bookingId: testBookingData.bookingId,
        },
        {
          name: testBookingData.sellerName,
          whatsapp: testBookingData.sellerWhatsapp,
          businessName: testBookingData.sellerBusinessName,
        }
      )
      
      setLastResult({ ...result, phoneNumber, timestamp: new Date(), type: 'booking_notification' })
      
      if (result.success) {
        toast({
          title: "Booking Notification Sent",
          description: "Admin SMS with WhatsApp links sent successfully",
        })
      } else {
        toast({
          title: "Notification Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending booking notification:", error)
      toast({
        title: "Error",
        description: "Failed to send booking notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckSetup = async () => {
    try {
      const response = await fetch('/api/sms/send')
      const setupInfo = await response.json()
      
      toast({
        title: "Setup Information",
        description: "Check console for detailed setup instructions",
      })
      
      console.log("SMS Setup Information:", setupInfo)
    } catch (error) {
      console.error("Error checking setup:", error)
      toast({
        title: "Error",
        description: "Failed to get setup information",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SMS Testing</h1>
          <p className="text-foreground/70">Test SMS notifications to admin with WhatsApp links</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic SMS Test */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Send Test SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-foreground/80">
                  Phone Number (with country code)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+94715816400"
                  className="bg-muted border-border/40 text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="service" className="text-foreground/80">
                  SMS Service
                </Label>
                <Select value={service} onValueChange={(value: 'textbelt' | 'twilio') => setService(value)}>
                  <SelectTrigger className="bg-muted border-border/40 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textbelt">TextBelt (Free)</SelectItem>
                    <SelectItem value="twilio">Twilio (Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-foreground/80">
                  Test Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="bg-muted border-border/40 text-foreground"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendTest} disabled={loading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Test SMS"}
                </Button>
                
                <Button onClick={handleCheckSetup} variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Booking Notification Test */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Test Booking Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-foreground/80 text-sm">
                <p className="mb-2">This will send an SMS to admin with WhatsApp links for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Seller notification link</li>
                  <li>Customer confirmation link</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="text-foreground/70">Customer:</Label>
                  <p className="text-foreground">{testBookingData.customerName}</p>
                </div>
                <div>
                  <Label className="text-foreground/70">Amount:</Label>
                  <p className="text-foreground">LKR {testBookingData.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-foreground/70">Seller:</Label>
                  <p className="text-foreground">{testBookingData.sellerBusinessName}</p>
                </div>
                <div>
                  <Label className="text-foreground/70">Event Date:</Label>
                  <p className="text-foreground">{testBookingData.eventDate}</p>
                </div>
              </div>

              <Button onClick={handleTestBookingNotification} disabled={loading} className="w-full">
                <TestTube className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Send Booking Notification"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-foreground">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-foreground/80">
              <div>
                <h4 className="font-semibold text-foreground mb-2">TextBelt (Free Option):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Free tier: 1 SMS per day per phone number</li>
                  <li>No registration required</li>
                  <li>For paid tier: Get API key from textbelt.com</li>
                  <li>Add to <code className="bg-muted px-1 rounded">.env.local</code>: <code>TEXTBELT_API_KEY=your_key</code></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Twilio (Paid Option):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Create account at twilio.com</li>
                  <li>Get phone number and credentials</li>
                  <li>Add to <code className="bg-muted px-1 rounded">.env.local</code>:</li>
                </ul>
                <code className="block bg-muted p-2 rounded mt-2 text-xs">
                  TWILIO_ACCOUNT_SID=your_sid<br/>
                  TWILIO_AUTH_TOKEN=your_token<br/>
                  TWILIO_PHONE_NUMBER=+1234567890
                </code>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Admin Phone Configuration:</h4>
                <p className="text-sm">Add admin phone number to <code className="bg-muted px-1 rounded">.env.local</code>:</p>
                <code className="block bg-muted p-2 rounded mt-2 text-xs">
                  NEXT_PUBLIC_ADMIN_PHONE_NUMBER=+94715816400
                </code>
              </div>

              {lastResult && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Last Test Result:</h4>
                  <div className="bg-muted p-2 rounded text-xs">
                    <p>Status: {lastResult.success ? "âœ… Success" : "âŒ Failed"}</p>
                    <p>Service: {lastResult.service || lastResult.details?.service}</p>
                    <p>Phone: {lastResult.phoneNumber}</p>
                    <p>Time: {lastResult.timestamp?.toLocaleString()}</p>
                    {lastResult.error && <p>Error: {lastResult.error}</p>}
                    {lastResult.details?.quotaRemaining && <p>Quota Remaining: {lastResult.details.quotaRemaining}</p>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
