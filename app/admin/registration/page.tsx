"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, LinkIcon, Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminRegistrationPage() {
  const [registrationLink, setRegistrationLink] = useState("")
  const [customMessage, setCustomMessage] = useState(
    "You're invited to join our photography marketplace as a seller. Click the link below to register:",
  )
  const [recipientEmail, setRecipientEmail] = useState("")

  const generateRegistrationLink = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const link = `${window.location.origin}/seller/register?token=${token}`
    setRegistrationLink(link)

    toast({
      title: "Registration Link Generated",
      description: "The registration link has been created successfully",
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationLink)
    toast({
      title: "Copied!",
      description: "Registration link copied to clipboard",
    })
  }

  const sendEmail = () => {
    if (!recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send an actual email
    const subject = "Invitation to Join Photography Marketplace"
    const body = `${customMessage}\n\n${registrationLink}\n\nBest regards,\nMalka Studio Team`

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)

    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with the invitation",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Registration Links</h1>
          <p className="text-foreground/70">Generate and send registration links to new sellers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate Link */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Generate Registration Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateRegistrationLink} className="w-full">
                Generate New Link
              </Button>

              {registrationLink && (
                <div className="space-y-2">
                  <Label className="text-foreground/80">Generated Link</Label>
                  <div className="flex gap-2">
                    <Input value={registrationLink} readOnly className="bg-muted border-border/40 text-foreground" />
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Email */}
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Invitation Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground/80">
                  Recipient Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="seller@example.com"
                  className="bg-muted border-border/40 text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-foreground/80">
                  Custom Message
                </Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="bg-muted border-border/40 text-foreground"
                />
              </div>

              <Button onClick={sendEmail} className="w-full" disabled={!registrationLink}>
                Send Invitation Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle className="text-foreground">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-foreground/80">
              <p>1. Click "Generate New Link" to create a unique registration link for a new seller</p>
              <p>2. Copy the link and share it directly, or use the email feature to send an invitation</p>
              <p>3. The seller will use this link to register their account and provide their business details</p>
              <p>4. Once registered, you can review and approve their account from the Sellers page</p>
              <p className="text-yellow-400 text-sm">
                Note: Each registration link is unique and should only be shared with one seller
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
