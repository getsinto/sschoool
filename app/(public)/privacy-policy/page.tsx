'use client'

import StaticLayout from '@/components/layout/StaticLayout'
import { Shield, Lock, Eye, UserCheck, Database, Mail } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <StaticLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                At St Haroon Online School, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online education platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="leading-relaxed">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Name, email address, and contact information</li>
                    <li>Student information (age, grade level, educational background)</li>
                    <li>Parent/guardian information for minor students</li>
                    <li>Payment and billing information</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
                  <p className="leading-relaxed">
                    We automatically collect certain information about your device and how you interact with our platform, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Log data (IP address, browser type, pages visited)</li>
                    <li>Course progress and performance data</li>
                    <li>Device information and identifiers</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">We use the information we collect to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide, maintain, and improve our educational services</li>
                  <li>Process registrations and manage student accounts</li>
                  <li>Facilitate online classes and educational content delivery</li>
                  <li>Process payments and prevent fraud</li>
                  <li>Send important updates, notifications, and educational materials</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><span className="font-semibold">With Teachers:</span> To facilitate your educational experience</li>
                  <li><span className="font-semibold">Service Providers:</span> Third-party vendors who assist in operating our platform</li>
                  <li><span className="font-semibold">Legal Requirements:</span> When required by law or to protect our rights</li>
                  <li><span className="font-semibold">With Consent:</span> When you explicitly authorize us to share your information</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, 
                regular security assessments, and access controls. However, no method of transmission over the internet is 100% secure, 
                and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Rights and Choices</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent where processing is based on consent</li>
                  <li>Export your data in a portable format</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are designed for students of all ages, including children under 13. We comply with applicable children's 
                privacy laws, including COPPA (Children's Online Privacy Protection Act). We require parental consent before collecting 
                personal information from children under 13. Parents have the right to review, delete, and refuse further collection 
                of their child's information.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Email:</span> privacy@stharoon.com</p>
                <p><span className="font-semibold">Phone:</span> +1 (555) 123-4567</p>
                <p><span className="font-semibold">Address:</span> St Haroon Online School, Global Online Platform</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </StaticLayout>
  )
}
