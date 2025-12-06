'use client'

import Link from 'next/link'
import { Cookie, Settings, Eye, Shield, Info, CheckCircle } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Cookie className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl opacity-90">
              Understanding how we use cookies and tracking technologies
            </p>
            <p className="text-sm opacity-75 mt-2">
              Last updated: November 12, 2024
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Table of Contents */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-orange-600" />
              Table of Contents
            </h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#what-are-cookies" className="text-orange-600 hover:underline">1. What Are Cookies?</a></li>
              <li><a href="#how-we-use" className="text-orange-600 hover:underline">2. How We Use Cookies</a></li>
              <li><a href="#types-of-cookies" className="text-orange-600 hover:underline">3. Types of Cookies We Use</a></li>
              <li><a href="#third-party-cookies" className="text-orange-600 hover:underline">4. Third-Party Cookies</a></li>
              <li><a href="#cookie-management" className="text-orange-600 hover:underline">5. Managing Your Cookie Preferences</a></li>
              <li><a href="#other-technologies" className="text-orange-600 hover:underline">6. Other Tracking Technologies</a></li>
              <li><a href="#updates" className="text-orange-600 hover:underline">7. Updates to This Policy</a></li>
              <li><a href="#contact" className="text-orange-600 hover:underline">8. Contact Us</a></li>
            </ul>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <p className="text-orange-800">
                This Cookie Policy explains how EduPlatform uses cookies and similar technologies to recognize you 
                when you visit our platform. It explains what these technologies are, why we use them, and your 
                rights to control our use of them.
              </p>
            </div>
          </section>

          {/* Section 1 */}
          <section id="what-are-cookies" className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Cookie className="w-6 h-6 mr-2 text-orange-600" />
              1. What Are Cookies?
            </h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when 
              you visit a website. They are widely used to make websites work more efficiently and provide 
              information to website owners.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800">First-Party Cookies</h3>
                <p className="text-sm text-gray-700">
                  Set directly by EduPlatform. These cookies enable core functionality and help us understand 
                  how you use our platform.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-800">Third-Party Cookies</h3>
                <p className="text-sm text-gray-700">
                  Set by external services we use, such as analytics providers, payment processors, and 
                  video hosting platforms.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="how-we-use" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies for several important reasons:
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Essential Platform Functionality</h3>
                  <p className="text-sm text-gray-700">
                    Enable core features like user authentication, course access, and secure transactions
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Performance and Analytics</h3>
                  <p className="text-sm text-gray-700">
                    Understand how users interact with our platform to improve user experience and features
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Personalization</h3>
                  <p className="text-sm text-gray-700">
                    Remember your preferences, settings, and provide personalized content recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Security</h3>
                  <p className="text-sm text-gray-700">
                    Protect against fraud, detect suspicious activity, and ensure platform security
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="types-of-cookies" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left">Cookie Type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Duration</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="font-semibold text-red-600">Strictly Necessary</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Essential for platform functionality, authentication, and security
                    </td>
                    <td className="border border-gray-300 px-4 py-2">Session / 1 year</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="text-red-600 font-semibold">Yes</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="font-semibold text-blue-600">Performance</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Collect anonymous usage data to improve platform performance
                    </td>
                    <td className="border border-gray-300 px-4 py-2">2 years</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="text-gray-600">No</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="font-semibold text-green-600">Functional</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Remember your preferences, settings, and choices
                    </td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="text-gray-600">No</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="font-semibold text-purple-600">Targeting</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Deliver relevant content and measure campaign effectiveness
                    </td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="text-gray-600">No</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> Strictly necessary cookies cannot be disabled as they are essential 
                for the platform to function properly. Disabling other cookies may affect your experience.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="third-party-cookies" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use services from trusted third-party providers that may set cookies on your device:
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-blue-600" />
                  Analytics Services
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Google Analytics:</strong> Helps us understand how users interact with our platform
                </p>
                <p className="text-xs text-gray-600">
                  Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Privacy Policy</a>
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Payment Processors
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Stripe, PayPal, Razorpay:</strong> Secure payment processing and fraud prevention
                </p>
                <p className="text-xs text-gray-600">
                  These services use cookies to ensure secure transactions and prevent fraud
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-purple-600" />
                  Video Hosting
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>YouTube, Vimeo:</strong> Embedded video content and playback functionality
                </p>
                <p className="text-xs text-gray-600">
                  Videos may set cookies to track viewing preferences and analytics
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Cookie className="w-4 h-4 mr-2 text-orange-600" />
                  Live Class Platforms
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Zoom, Google Meet:</strong> Video conferencing and live class functionality
                </p>
                <p className="text-xs text-gray-600">
                  These platforms use cookies for session management and feature functionality
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="cookie-management" className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-blue-600" />
              5. Managing Your Cookie Preferences
            </h2>
            <p className="text-gray-700 mb-4">
              You have several options to manage or disable cookies:
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Platform Cookie Settings</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  Manage your cookie preferences directly on our platform:
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cookie Preferences
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Browser Settings</h3>
              <p className="text-sm text-gray-700 mb-3">
                Most browsers allow you to control cookies through their settings:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Google Chrome</h4>
                  <p className="text-xs text-gray-600">Settings → Privacy and security → Cookies</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Mozilla Firefox</h4>
                  <p className="text-xs text-gray-600">Options → Privacy & Security → Cookies</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Safari</h4>
                  <p className="text-xs text-gray-600">Preferences → Privacy → Cookies</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Microsoft Edge</h4>
                  <p className="text-xs text-gray-600">Settings → Privacy → Cookies</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Note</h3>
              <p className="text-sm text-yellow-700">
                Blocking or deleting cookies may impact your ability to use certain features of our platform. 
                Some functionality may not work properly without cookies enabled.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="other-technologies" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Other Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              In addition to cookies, we may use other tracking technologies:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Web Beacons (Pixels)</h3>
                <p className="text-sm text-gray-700">
                  Small transparent images embedded in web pages or emails to track user behavior and 
                  measure campaign effectiveness.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Local Storage</h3>
                <p className="text-sm text-gray-700">
                  Browser storage that allows us to store data locally on your device for improved 
                  performance and offline functionality.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Session Storage</h3>
                <p className="text-sm text-gray-700">
                  Temporary storage that maintains your session state while you navigate through our platform.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Device Fingerprinting</h3>
                <p className="text-sm text-gray-700">
                  Collection of device and browser information to detect fraud and enhance security.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="updates" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or 
              for legal, operational, or regulatory reasons.
            </p>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">How We Notify You</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Updated "Last updated" date at the top of this policy</li>
                <li>• Email notification for significant changes</li>
                <li>• Banner notification on the platform</li>
                <li>• Prompt to review updated policy on next login</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:privacy@eduplatform.com" className="text-blue-600 hover:underline">
                  privacy@eduplatform.com
                </a>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Phone</h3>
                <a href="tel:+15551234567" className="text-blue-600 hover:underline">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Mailing Address</h3>
              <p className="text-gray-700">
                EduPlatform<br />
                123 Education Street<br />
                Learning City, LC 12345<br />
                United States
              </p>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/privacy-policy" 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Shield className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Privacy Policy</h3>
                <p className="text-xs text-gray-600">Learn about our data practices</p>
              </Link>
              <Link 
                href="/terms-of-service" 
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Info className="w-6 h-6 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Terms of Service</h3>
                <p className="text-xs text-gray-600">Read our terms and conditions</p>
              </Link>
              <Link 
                href="/contact" 
                className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <Settings className="w-6 h-6 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Contact Us</h3>
                <p className="text-xs text-gray-600">Get in touch with our team</p>
              </Link>
            </div>
          </section>

          {/* Back to Top */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link 
              href="#top" 
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Top
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
