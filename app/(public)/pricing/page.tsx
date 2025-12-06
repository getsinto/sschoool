'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StaticLayout from '@/components/layout/StaticLayout'
import { 
  Check, 
  X, 
  Star, 
  Users, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Award,
  Clock,
  Globe,
  Shield,
  Zap
} from 'lucide-react'

const pricingPlans = {
  'online-school': [
    {
      name: 'Basic',
      price: 99,
      originalPrice: 149,
      period: 'month',
      description: 'Perfect for individual students starting their online learning journey',
      popular: false,
      features: [
        'Access to 5 subjects',
        'Live classes 3x per week',
        'Recorded session access',
        'Basic assignments & quizzes',
        'Email support',
        'Digital certificates',
        'Mobile app access',
        'Parent progress reports'
      ],
      notIncluded: [
        'One-on-one tutoring',
        'Advanced analytics',
        'Priority support',
        'Custom learning paths'
      ]
    },
    {
      name: 'Standard',
      price: 199,
      originalPrice: 299,
      period: 'month',
      description: 'Most popular choice for comprehensive K-12 education',
      popular: true,
      features: [
        'Access to all subjects',
        'Live classes 5x per week',
        'Recorded session access',
        'Advanced assignments & projects',
        'Chat & email support',
        'Digital certificates',
        'Mobile app access',
        'Parent progress reports',
        'Monthly progress meetings',
        'Homework assistance',
        'Exam preparation materials'
      ],
      notIncluded: [
        'One-on-one tutoring',
        'Custom learning paths'
      ]
    },
    {
      name: 'Premium',
      price: 349,
      originalPrice: 499,
      period: 'month',
      description: 'Complete educational solution with personalized attention',
      popular: false,
      features: [
        'Everything in Standard',
        '2 hours one-on-one tutoring/month',
        'Custom learning paths',
        'Advanced analytics & insights',
        'Priority 24/7 support',
        'College counseling sessions',
        'Career guidance workshops',
        'Scholarship assistance',
        'University application support'
      ],
      notIncluded: []
    }
  ],
  'spoken-english': [
    {
      name: 'Beginner',
      price: 79,
      originalPrice: 119,
      period: 'month',
      description: 'Start your English speaking journey with confidence',
      popular: false,
      features: [
        '8 live conversation classes/month',
        'Basic grammar lessons',
        'Pronunciation practice',
        'Vocabulary building exercises',
        'Speaking confidence activities',
        'Progress tracking',
        'Mobile app access',
        'Community forum access'
      ],
      notIncluded: [
        'Business English modules',
        'Advanced grammar',
        'IELTS/TOEFL preparation',
        'One-on-one sessions'
      ]
    },
    {
      name: 'Intermediate',
      price: 149,
      originalPrice: 219,
      period: 'month',
      description: 'Enhance your fluency and communication skills',
      popular: true,
      features: [
        '12 live conversation classes/month',
        'Advanced grammar lessons',
        'Accent reduction training',
        'Business English basics',
        'Public speaking practice',
        'Writing skills development',
        'Progress tracking & analytics',
        'Mobile app access',
        'Community forum access',
        'Monthly assessment tests'
      ],
      notIncluded: [
        'IELTS/TOEFL preparation',
        'One-on-one sessions'
      ]
    },
    {
      name: 'Advanced',
      price: 249,
      originalPrice: 349,
      period: 'month',
      description: 'Master English for professional and academic success',
      popular: false,
      features: [
        'Everything in Intermediate',
        '4 one-on-one sessions/month',
        'IELTS/TOEFL preparation',
        'Advanced business English',
        'Interview preparation',
        'Academic writing skills',
        'Presentation skills training',
        'Cultural communication training',
        'Priority support'
      ],
      notIncluded: []
    }
  ],
  'tuition': [
    {
      name: 'Subject Focus',
      price: 129,
      originalPrice: 179,
      period: 'month',
      description: 'Intensive support for specific subjects',
      popular: false,
      features: [
        'Choose 2 subjects',
        '8 live classes/month per subject',
        'Homework help sessions',
        'Practice tests & quizzes',
        'Progress monitoring',
        'Exam preparation materials',
        'Mobile app access',
        'Parent progress reports'
      ],
      notIncluded: [
        'One-on-one tutoring',
        'All subjects access',
        'College prep services',
        'Advanced analytics'
      ]
    },
    {
      name: 'Exam Prep',
      price: 229,
      originalPrice: 329,
      period: 'month',
      description: 'Comprehensive preparation for major exams',
      popular: true,
      features: [
        'SAT/ACT preparation',
        'AP course support',
        '12 live classes/month',
        'Mock exams & practice tests',
        'Personalized study plans',
        'Score improvement guarantee',
        'College application guidance',
        'Scholarship search assistance',
        'Priority support',
        'Progress analytics'
      ],
      notIncluded: [
        'One-on-one tutoring'
      ]
    },
    {
      name: 'Elite Tutoring',
      price: 399,
      originalPrice: 599,
      period: 'month',
      description: 'Premium one-on-one tutoring for maximum results',
      popular: false,
      features: [
        'Everything in Exam Prep',
        '8 hours one-on-one tutoring/month',
        'Customized curriculum',
        'Flexible scheduling',
        'Expert tutor matching',
        'Advanced progress tracking',
        'College admission consulting',
        'Interview preparation',
        '24/7 priority support'
      ],
      notIncluded: []
    }
  ]
}

const features = [
  {
    icon: Video,
    title: 'Live Interactive Classes',
    description: 'Engage with expert teachers in real-time virtual classrooms'
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Curriculum',
    description: 'Access to complete K-12 curriculum aligned with international standards'
  },
  {
    icon: Users,
    title: 'Small Class Sizes',
    description: 'Maximum 15 students per class for personalized attention'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Choose class times that work with your schedule across time zones'
  },
  {
    icon: Award,
    title: 'Certified Teachers',
    description: 'Learn from qualified educators with years of teaching experience'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with students from around the world'
  },
  {
    icon: Shield,
    title: 'Safe Learning Environment',
    description: 'COPPA compliant platform with robust safety measures'
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Start learning immediately after enrollment'
  }
]

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = useState('online-school')
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  const currentPlans = pricingPlans[selectedCategory as keyof typeof pricingPlans]

  const getDiscountedPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 0.8) : price
  }

  const getSavings = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 0.2 * 12) : 0
  }

  return (
    <StaticLayout>
      <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the perfect plan for your learning journey. All plans include our core features 
              with no hidden fees or long-term commitments.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${billingPeriod === 'yearly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingPeriod === 'yearly' && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-white shadow-lg rounded-xl p-2">
              <TabsTrigger 
                value="online-school"
                className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Online School
              </TabsTrigger>
              <TabsTrigger 
                value="spoken-english"
                className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Spoken English
              </TabsTrigger>
              <TabsTrigger 
                value="tuition"
                className="text-lg font-semibold py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Tuition
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {currentPlans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
                    : 'hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ${getDiscountedPrice(plan.price)}
                      </span>
                      <span className="text-gray-500">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    
                    {billingPeriod === 'monthly' && plan.originalPrice > plan.price && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg text-gray-500 line-through">
                          ${plan.originalPrice}
                        </span>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          Save ${plan.originalPrice - plan.price}
                        </Badge>
                      </div>
                    )}
                    
                    {billingPeriod === 'yearly' && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 line-through">
                          ${plan.price * 12}/year
                        </p>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Save ${getSavings(plan.price)}/year
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    size="lg"
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    Get Started
                  </Button>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.notIncluded.length > 0 && (
                      <>
                        <h4 className="font-semibold text-gray-900 mb-3 mt-6">Not included:</h4>
                        {plan.notIncluded.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-3">
                            <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              All plans include these essential features to ensure the best learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Have questions about our pricing? We've got answers.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: 'Can I change my plan anytime?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
              },
              {
                question: 'Is there a free trial available?',
                answer: 'We offer a 7-day free trial for all new students. No credit card required to start your trial.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, Stripe, and Razorpay. We also offer flexible payment plans for annual subscriptions.'
              },
              {
                question: 'Can I get a refund if I\'m not satisfied?',
                answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not completely satisfied, we\'ll refund your payment in full.'
              },
              {
                question: 'Are there any setup fees or hidden costs?',
                answer: 'No, there are no setup fees, hidden costs, or long-term commitments. The price you see is exactly what you pay.'
              },
              {
                question: 'Do you offer discounts for multiple children?',
                answer: 'Yes, we offer family discounts starting at 15% off for the second child and 25% off for three or more children.'
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already learning with us. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      </div>
    </StaticLayout>
  )
}