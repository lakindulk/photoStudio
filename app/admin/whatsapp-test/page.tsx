"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { MessageCircle, Send, Settings } from "lucide-react"

export default function WhatsAppTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("ðŸ”” Test message from Malka Studio!\n\nThis is a test of our automatic WhatsApp messaging system.")
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

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
      const success = await sendWhatsAppMessage(phoneNumber, message, apiKey || undefined)
      
      setLastResult({ success, phoneNumber, message, timestamp: new Date() })
      
      if (success) {
        toast({
          title: "Message Sent Successfully",
          description: "WhatsApp message was sent automatically",
        })
      } else {
        toast({
          title: "Automatic Sending Failed",
          description: "Message prepared but requires manual sending via WhatsApp Web",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending test message:", error)
      toast({
        title: "Error",
        description: "Failed to send test message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckSetup = async () => {
    try {
      const response = await fetch('/api/whatsapp/send')
      const setupInfo = await response.json()
      
      toast({
        title: "Setup Information",
        description: "Check console for detailed setup instructions",
      })
      
      console.log("WhatsApp Setup Information:", setupInfo)
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
          <h1 className="text-3xl font-bold text-foreground mb-2">WhatsApp Testing</h1>
          <p className="text-foreground/70">Test automatic WhatsApp message sending</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Message Form */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Send Test Message
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

              <div>
                <Label htmlFor="apiKey" className="text-foreground/80">
                  CallMeBot API Key (Optional)
                </Label>
                <Input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Leave empty to use environment variable"
                  className="bg-muted border-border/40 text-foreground"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendTest} disabled={loading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Test Message"}
                </Button>
                
                <Button onClick={handleCheckSetup} variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-foreground/80">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">CallMeBot Setup (Free):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Add <code className="bg-muted px-1 rounded">+34 644 59 71 67</code> to your contacts</li>
                    <li>Send: "I allow callmebot to send me messages"</li>
                    <li>Copy the API key from the reply</li>
                    <li>Add to <code className="bg-muted px-1 rounded">.env.local</code>:</li>
                  </ol>
                  <code className="block bg-muted p-2 rounded mt-2 text-xs">
                    NEXT_PUBLIC_CALLMEBOT_API_KEY=your_api_key
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Environment Variables:</h4>
                  <div className="text-sm space-y-1">
                    <p>Current API Key: {process.env.NEXT_PUBLIC_CALLMEBOT_API_KEY ? "âœ… Set" : "âŒ Not set"}</p>
                    <p>App URL: {process.env.NEXT_PUBLIC_APP_URL || "Not set"}</p>
                  </div>
                </div>

                {lastResult && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Last Test Result:</h4>
                    <div className="bg-muted p-2 rounded text-xs">
                      <p>Status: {lastResult.success ? "âœ… Success" : "âŒ Failed"}</p>
                      <p>Phone: {lastResult.phoneNumber}</p>
                      <p>Time: {lastResult.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-foreground">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-foreground/80">
              <p>1. <strong>Automatic Sending:</strong> When configured properly, messages are sent automatically via CallMeBot API</p>
              <p>2. <strong>Fallback Mode:</strong> If automatic sending fails, WhatsApp Web opens with pre-filled message</p>
              <p>3. <strong>Booking Flow:</strong> When customers create bookings, sellers receive instant WhatsApp notifications</p>
              <p>4. <strong>No Manual Action:</strong> Guests don't see any WhatsApp interface - everything happens in the background</p>
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> For production use, consider upgrading to Twilio WhatsApp API for better reliability
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
