import StaticLayout from '@/components/layout/StaticLayout'
import { 
  Award, 
  Users, 
  Globe, 
  BookOpen, 
  Target, 
  Heart, 
  Star,
  Calendar,
  Trophy,
  GraduationCap
} from 'lucide-react'

export const metadata = {
  title: 'About Us - St Haroon Online School',
  description: 'Learn about our mission, vision, and commitment to providing world-class online education.',
}

const milestones = [
  {
    year: '2018',
    title: 'Foundation',
    description: 'St Haroon Online School was established with a vision to make quality education accessible globally.',
  },
  {
    year: '2019',
    title: 'First 1,000 Students',
    description: 'Reached our first milestone of 1,000 enrolled students across 15 countries.',
  },
  {
    year: '2020',
    title: 'Pandemic Response',
    description: 'Rapidly scaled our platform to support students during global school closures.',
  },
  {
    year: '2021',
    title: 'International Accreditation',
    description: 'Received accreditation from leading international education bodies.',
  },
  {
    year: '2022',
    title: '10,000+ Students',
    description: 'Crossed 10,000 active students with 98% satisfaction rate.',
  },
  {
    year: '2023',
    title: 'AI Integration',
    description: 'Launched AI-powered personalized learning paths and assessment tools.',
  },
  {
    year: '2024',
    title: 'Global Expansion',
    description: 'Expanded to 50+ countries with multilingual support and local partnerships.',
  },
]

const teamMembers = [
  {
    name: 'Dr. Haroon Ahmed',
    role: 'Founder & CEO',
    image: '/api/placeholder/150/150',
    bio: 'Former Oxford professor with 20+ years in education technology.',
    credentials: 'PhD Education, Oxford University',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Head of Academics',
    image: '/api/placeholder/150/150',
    bio: 'Curriculum expert with experience in international education standards.',
    credentials: 'M.Ed Curriculum Design, Harvard',
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Chief Technology Officer',
    image: '/api/placeholder/150/150',
    bio: 'EdTech innovator specializing in AI-powered learning platforms.',
    credentials: 'PhD Computer Science, MIT',
  },
  {
    name: 'Emma Roberts',
    role: 'Director of Student Success',
    image: '/api/placeholder/150/150',
    bio: 'Student support specialist ensuring every learner achieves their goals.',
    credentials: 'M.A. Educational Psychology',
  },
  {
    name: 'Prof. David Kim',
    role: 'Head of Teacher Training',
    image: '/api/placeholder/150/150',
    bio: 'Expert in online pedagogy and teacher professional development.',
    credentials: 'PhD Educational Leadership',
  },
  {
    name: 'Lisa Thompson',
    role: 'Director of Operations',
    image: '/api/placeholder/150/150',
    bio: 'Operations expert ensuring smooth delivery of educational services.',
    credentials: 'MBA Operations Management',
  },
]

const achievements = [
  {
    icon: Trophy,
    title: 'Best Online School 2023',
    organization: 'Global Education Awards',
    year: '2023',
  },
  {
    icon: Star,
    title: 'Excellence in Innovation',
    organization: 'EdTech Innovation Summit',
    year: '2022',
  },
  {
    icon: Award,
    title: 'Top Employer in Education',
    organization: 'Education Sector Awards',
    year: '2023',
  },
  {
    icon: GraduationCap,
    title: 'Student Success Recognition',
    organization: 'International Learning Association',
    year: '2024',
  },
]

const statistics = [
  { label: 'Students Graduated', value: '25,000+', icon: GraduationCap },
  { label: 'Countries Served', value: '50+', icon: Globe },
  { label: 'Expert Teachers', value: '500+', icon: Users },
  { label: 'Course Completion Rate', value: '95%', icon: BookOpen },
  { label: 'Student Satisfaction', value: '98%', icon: Heart },
  { label: 'Years of Excellence', value: '6+', icon: Calendar },
]

export default function AboutPage() {
  return (
    <StaticLayout>
      <div className="bg-white">
        {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                St Haroon Online School
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforming education through innovative online learning experiences, 
              expert instruction, and personalized student support since 2018.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                To democratize quality education by providing accessible, engaging, and 
                effective online learning experiences that empower students worldwide to 
                achieve their academic and personal goals, regardless of their geographical 
                location or economic background.
              </p>
            </div>

            <div className="p-8 bg-white rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                To be the world's leading online educational institution, recognized for 
                innovation, excellence, and student success. We envision a future where 
                every learner has access to world-class education that adapts to their 
                unique needs and learning style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape our commitment to educational excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Excellence',
                description: 'We strive for the highest standards in education, continuously improving our curriculum and teaching methods.',
              },
              {
                icon: Users,
                title: 'Inclusivity',
                description: 'We welcome students from all backgrounds and provide equal opportunities for learning and growth.',
              },
              {
                icon: Heart,
                title: 'Student-Centered',
                description: 'Every decision we make prioritizes student success, well-being, and learning outcomes.',
              },
              {
                icon: Globe,
                title: 'Innovation',
                description: 'We embrace technology and innovative teaching methods to enhance the learning experience.',
              },
              {
                icon: Award,
                title: 'Integrity',
                description: 'We maintain the highest ethical standards in all our interactions and educational practices.',
              },
              {
                icon: Target,
                title: 'Accountability',
                description: 'We take responsibility for our students\' success and continuously measure our impact.',
              },
            ].map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600">
              These numbers reflect our commitment to educational excellence and student success.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {statistics.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              Key milestones in our mission to transform online education.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className={`w-full max-w-md p-6 bg-white rounded-lg shadow-md ${index % 2 === 0 ? 'mr-auto pr-8' : 'ml-auto pl-8'}`}>
                    <div className="flex items-center mb-3">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Leadership Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our experienced team of educators, technologists, and leaders are dedicated 
              to providing the best online learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-3">{member.bio}</p>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {member.credentials}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Achievements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Awards & Recognition
            </h2>
            <p className="text-lg text-gray-600">
              Our commitment to excellence has been recognized by leading organizations in education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <div key={index} className="p-6 bg-white rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">{achievement.organization}</p>
                  <span className="inline-block px-3 py-1 border border-gray-300 rounded-full text-sm">{achievement.year}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Accreditations & Certifications
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We maintain the highest educational standards through recognized accreditations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              'International Baccalaureate',
              'Cambridge Assessment',
              'Pearson Edexcel',
              'Quality Assurance Agency',
              'UNESCO Education',
              'British Council',
              'NEASC Accreditation',
              'ISO 21001 Certified',
            ].map((accreditation, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-gray-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">{accreditation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of students who are already achieving their academic goals with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Enroll Now
              </a>
              <a
                href="/contact"
                className="border border-gray-600 hover:border-gray-400 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </StaticLayout>
  )
}