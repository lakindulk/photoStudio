import { Header } from "@/components/Header"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#eef3f0]/30">
      <Header />

      {/* Hero */}
      <div className="bg-[#082537] pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium text-white/70 mb-4">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/50 text-base">Last updated: May 2025</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-[#082537]/8 p-8 md:p-12 space-y-10">

          <Section title="1. Introduction">
            <p>
              Welcome to Malka Studio (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We operate the website and platform at{" "}
              <strong>malkastudio.lk</strong> (the &quot;Platform&quot;), a photography and videography marketplace for Sri Lanka.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use our Platform.
              Please read this policy carefully. If you disagree with its terms, please discontinue use of the Platform.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="mb-3">We may collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#082537]/70">
              <li>
                <strong className="text-[#082537]">Account Information:</strong> Name, email address, phone number, and password when you register as a seller or admin.
              </li>
              <li>
                <strong className="text-[#082537]">Profile Information:</strong> Business name, bio, portfolio images, service categories, and location you add to your seller profile.
              </li>
              <li>
                <strong className="text-[#082537]">Payment Information:</strong> Payment slip images uploaded to verify subscription or marketplace listing fee payments. We do not store card numbers or bank account details.
              </li>
              <li>
                <strong className="text-[#082537]">Booking Data:</strong> Booking requests, event details, dates, and messages exchanged between customers and sellers.
              </li>
              <li>
                <strong className="text-[#082537]">Marketplace Listings:</strong> Item descriptions, images, pricing, and contact details submitted for gear listings.
              </li>
              <li>
                <strong className="text-[#082537]">Usage Data:</strong> IP address, browser type, pages visited, and time spent on the Platform, collected automatically through cookies and similar technologies.
              </li>
              <li>
                <strong className="text-[#082537]">Communications:</strong> Messages sent through our contact forms or WhatsApp integration.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#082537]/70">
              <li>Create and manage your account and seller profile</li>
              <li>Process and verify subscription payments</li>
              <li>Facilitate bookings between customers and sellers</li>
              <li>Display your advertisements and portfolio to potential customers</li>
              <li>Review and approve marketplace listings</li>
              <li>Send transactional notifications (booking confirmations, subscription approvals)</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Improve and personalise the Platform experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Sharing of Information">
            <p className="mb-3">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#082537]/70">
              <li>
                <strong className="text-[#082537]">With Customers:</strong> Your seller name, portfolio, service categories, and contact number are publicly displayed to help customers find and book you.
              </li>
              <li>
                <strong className="text-[#082537]">With Service Providers:</strong> We use Firebase (Google) for authentication, database, and storage services. These providers process data on our behalf under strict confidentiality obligations.
              </li>
              <li>
                <strong className="text-[#082537]">Legal Requirements:</strong> If required by law, court order, or governmental authority, we may disclose your information.
              </li>
              <li>
                <strong className="text-[#082537]">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies and Tracking Technologies">
            <p>
              We use cookies and similar tracking technologies to maintain your session (login state), remember your preferences, and gather analytics about Platform usage.
              Essential cookies are required for the Platform to function. You can control non-essential cookies through your browser settings, though disabling them may affect your experience.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. If you request account deletion, we will remove or anonymise your data within 30 days, except where we are required to retain it for legal or legitimate business purposes (e.g., payment records for tax compliance).
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We implement industry-standard security measures including encrypted data transmission (HTTPS), Firebase Security Rules to restrict database access, and secure file storage. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Our Platform is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#082537]/70">
              <li><strong className="text-[#082537]">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-[#082537]">Correction:</strong> Update or correct inaccurate information via your profile settings</li>
              <li><strong className="text-[#082537]">Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong className="text-[#082537]">Objection:</strong> Object to certain types of data processing</li>
              <li><strong className="text-[#082537]">Portability:</strong> Request your data in a portable format where technically feasible</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at <strong>info@malkastudio.lk</strong> or via WhatsApp at <strong>+94 71 581 6400</strong>.
            </p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>
              Our Platform may contain links to third-party websites (e.g., WhatsApp, payment portals). We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies independently.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date at the top of this page and, where appropriate, by sending a notification through the Platform. Your continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 bg-[#eef3f0] rounded-2xl p-5 space-y-1.5 text-sm text-[#082537]/70">
              <p><strong className="text-[#082537]">Malka Studio</strong></p>
              <p>Sri Lanka</p>
              <p>Email: <a href="mailto:info@malkastudio.lk" className="text-[#788C59] hover:underline">info@malkastudio.lk</a></p>
              <p>WhatsApp: <a href="https://wa.me/94715816400" className="text-[#788C59] hover:underline">+94 71 581 6400</a></p>
            </div>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#061c29] py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">© 2025 Malka Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="text-white/30 text-sm hover:text-white/60 transition-colors">Home</Link>
            <Link href="/marketplace" className="text-white/30 text-sm hover:text-white/60 transition-colors">Marketplace</Link>
            <Link href="/privacy" className="text-white/50 text-sm font-medium">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#082537] mb-3 pb-2 border-b border-[#082537]/8">{title}</h2>
      <div className="text-[#082537]/70 leading-relaxed text-sm space-y-2">{children}</div>
    </div>
  )
}
