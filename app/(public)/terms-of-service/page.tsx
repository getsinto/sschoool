import SharedLayout from '@/components/layout/SharedLayout'
import { FileText, Users, CreditCard, AlertCircle, Scale, BookOpen } from 'lucide-react'

export default function TermsOfServicePage() {
  const currentYear = new Date().getFullYear()

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
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
                Welcome to St Haroon Online School. These Terms of Service ("Terms") govern your access to and use of our online 
                education platform, services, and website. By accessing or using our services, you agree to be bound by these Terms. 
                If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">
                  By creating an account, accessing our platform, or using any of our services, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms and our Privacy Policy. If you are using our services on behalf 
                  of a minor, you represent that you have the authority to bind that minor to these Terms.
                </p>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">User Accounts and Registration</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">To access certain features of our platform, you must register for an account. You agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Not share your account credentials with others</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
                </p>
              </div>
            </section>

            {/* Educational Services */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Educational Services</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <h3 className="font-semibold text-gray-900">Course Access and Enrollment</h3>
                <p className="leading-relaxed">
                  When you enroll in a course, you receive a limited, non-exclusive, non-transferable license to access and use 
                  the course materials for personal, non-commercial educational purposes only.
                </p>
                <h3 className="font-semibold text-gray-900 mt-4">Course Content</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>All course content is provided for educational purposes only</li>
                  <li>Course materials may not be reproduced, distributed, or shared without permission</li>
                  <li>We reserve the right to modify, update, or discontinue courses at any time</li>
                  <li>Course completion does not guarantee specific outcomes or certifications unless explicitly stated</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Payment and Billing</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <h3 className="font-semibold text-gray-900">Fees and Charges</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>All fees are stated in the applicable currency and are subject to change with notice</li>
                  <li>Payment is required before accessing paid courses or services</li>
                  <li>You authorize us to charge your payment method for all fees incurred</li>
                  <li>All sales are final unless otherwise stated in our refund policy</li>
                </ul>
                <h3 className="font-semibold text-gray-900 mt-4">Refund Policy</h3>
                <p className="leading-relaxed">
                  Refund requests must be submitted within 7 days of purchase. Refunds are granted at our discretion and may be 
                  subject to conditions. Courses that have been substantially accessed or completed are not eligible for refunds.
                </p>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">User Conduct and Prohibited Activities</h2>
              </div>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">You agree not to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the intellectual property rights of others</li>
                  <li>Upload or transmit viruses, malware, or harmful code</li>
                  <li>Harass, abuse, or harm other users or instructors</li>
                  <li>Impersonate any person or entity</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use our services for any commercial purpose without authorization</li>
                  <li>Share course materials or account access with unauthorized parties</li>
                  <li>Engage in any activity that disrupts or interferes with our services</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">
                  All content, materials, and intellectual property on our platform, including but not limited to text, graphics, 
                  logos, videos, audio, software, and course materials, are owned by or licensed to St Haroon Online School and 
                  are protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  You may not copy, modify, distribute, sell, or lease any part of our services or content without our express 
                  written permission.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers and Limitations of Liability</h2>
              <div className="text-gray-700 space-y-3">
                <p className="leading-relaxed">
                  Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. 
                  We do not guarantee that our services will be uninterrupted, secure, or error-free.
                </p>
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, St Haroon Online School shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages arising out of or related to your use of our services.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account and access to our services at any time, with or without 
                notice, for any reason, including violation of these Terms. Upon termination, your right to use our services will 
                immediately cease, and we may delete your account and data.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our 
                website and updating the "Last updated" date. Your continued use of our services after such changes constitutes 
                your acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising out of or 
                relating to these Terms or our services shall be resolved through binding arbitration, except where prohibited by law.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-purple-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Email:</span> legal@stharoon.com</p>
                <p><span className="font-semibold">Phone:</span> +1 (555) 123-4567</p>
                <p><span className="font-semibold">Address:</span> St Haroon Online School, Global Online Platform</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="border-t pt-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                By using St Haroon Online School's services, you acknowledge that you have read, understood, and agree to be bound 
                by these Terms of Service and our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </SharedLayout>
  )
}
