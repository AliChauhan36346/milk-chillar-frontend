

'use client';
import React, { useState } from 'react';
import { ChevronDown, CheckCircle, Clock, Eye, BarChart3, Users, FileText, Database, Menu, X } from 'lucide-react';

export default function MilkChillarLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Centralized Accounting",
      description: "Manage ledgers, track payments, and generate financial reports automatically. Say goodbye to manual bookkeeping."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Effortless Purchase & Sales",
      description: "Track milk purchases from suppliers (Dodhis) and manage sales to buyers. Create and manage 'Parchis' (slips) digitally."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-Time Dashboards",
      description: "Get a live view of your operations. Monitor stock, track cash flow, and make data-driven decisions with role-based dashboards."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Supplier & Buyer Management",
      description: "Maintain a complete database of your suppliers and buyers, with detailed history and account balances."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Request a Demo",
      description: "Schedule a personalized walkthrough with our team."
    },
    {
      number: "02",
      title: "Onboard Your Data",
      description: "We help you easily import your existing suppliers, buyers, and account balances."
    },
    {
      number: "03",
      title: "Go Live & Grow",
      description: "Start using Milk Chillar to manage your daily operations and watch your business grow."
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-12 h-12" />,
      title: "Increase Efficiency",
      description: "Save hours every day by automating manual tasks like entry, calculations, and reporting."
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Reduce Errors",
      description: "Eliminate costly human errors in accounting and billing with a system that calculates everything for you."
    },
    {
      icon: <Eye className="w-12 h-12" />,
      title: "Full Transparency",
      description: "Gain complete visibility into your business finances and operations, from anywhere, at any time."
    }
  ];

  const testimonials = [
    {
      quote: "Milk Chillar has transformed our chilling center. What used to take 4 hours of paperwork now takes 15 minutes.",
      name: "Ramesh Kumar",
      title: "Manager, ABC Dairy"
    },
    {
      quote: "The real-time dashboards give me complete control over my business. I can make decisions faster and with confidence.",
      name: "Priya Sharma",
      title: "Owner, Golden Milk Collection"
    },
    {
      quote: "Our accounting is now accurate and transparent. The automated reports save us so much time every month.",
      name: "Vijay Patel",
      title: "Director, Fresh Dairy Cooperative"
    }
  ];

  const faqs = [
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption and secure cloud storage to protect your data. Your information is backed up regularly and accessible only to authorized users."
    },
    {
      question: "Can I use this on my mobile phone?",
      answer: "Yes! Milk Chillar is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Manage your business from anywhere."
    },
    {
      question: "Do you offer training and support?",
      answer: "Yes, we provide comprehensive onboarding training for you and your team. Our support team is available via phone and email to help you whenever you need assistance."
    },
    {
      question: "Can this software handle multiple collection centers?",
      answer: "Yes, Milk Chillar is designed to manage multiple collection centers from a single dashboard, making it perfect for growing dairy businesses."
    },
    {
      question: "How long does implementation take?",
      answer: "Most businesses are up and running within 1-2 weeks. We handle the data migration and provide hands-on training to ensure a smooth transition."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <img src="/images/dairify-logo.png" alt="Dairify Logo" className="h-14 w-auto" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-blue-900">Dairify</span>
                  <span className="text-sm text-blue-600">Enterprise Dairy Management</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-900 transition">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-900 transition">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-900 transition">Pricing</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-900 transition">FAQ</a>
              <div className="flex items-center gap-4">
                <a href="/login" className="text-blue-900 hover:text-blue-700 font-semibold px-6 py-2 border-2 border-blue-900 rounded-lg transition-all hover:bg-blue-900 hover:text-white">
                  Login
                </a>
                <button className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition font-semibold">
                  Request Demo
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-blue-900">Features</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-900">How It Works</a>
              <a href="#pricing" className="block text-gray-700 hover:text-blue-900">Pricing</a>
              <a href="#faq" className="block text-gray-700 hover:text-blue-900">FAQ</a>
              <div className="flex flex-col gap-2">
                <a href="/login" className="w-full text-blue-900 text-center font-semibold px-6 py-2 border-2 border-blue-900 rounded-lg transition-all hover:bg-blue-900 hover:text-white">
                  Login
                </a>
                <button className="w-full bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition font-semibold">
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                The All-in-One Software for Your Dairy Business
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                From milk collection and sales to automated accounting and real-time reports, Dairify helps you manage your entire dairy business with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-amber-500 text-white px-8 py-4 rounded-lg hover:bg-amber-600 transition font-semibold text-lg shadow-lg">
                  Request a Free Demo
                </button>
                <button className="bg-white/10 backdrop-blur text-white px-8 py-4 rounded-lg hover:bg-white/20 transition font-semibold text-lg border border-white/20">
                  Explore Features
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Today's Overview</h3>
                    <span className="text-green-600 text-sm font-semibold">● Live</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Milk Collected</p>
                      <p className="text-2xl font-bold text-blue-900">2,450 L</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-amber-600">₹1.2L</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Suppliers</p>
                      <p className="text-2xl font-bold text-green-600">48</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-purple-600">₹45K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools designed specifically for dairy collection centers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-amber-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-blue-900 text-white rounded-xl p-8 hover:bg-blue-800 transition">
                  <div className="text-5xl font-bold text-amber-500 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-blue-100">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-amber-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Stop Managing, Start Growing
            </h2>
            <p className="text-xl text-gray-600">
              Transform your dairy business with intelligent automation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition"
              >
                <div className="text-blue-900 mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Dairy Businesses Like Yours
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20"
              >
                <p className="text-white text-lg mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-amber-400 font-bold">
                    {testimonial.name}
                  </p>
                  <p className="text-blue-200 text-sm">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-12 text-white text-center shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Professional Plan</h3>
            <p className="text-xl text-blue-100 mb-8">
              Custom pricing based on your business needs
            </p>
            <ul className="text-left max-w-md mx-auto mb-8 space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Complete accounting & reporting system</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Unlimited suppliers & buyers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Real-time dashboards & analytics</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Multi-device access (mobile & desktop)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <span>Dedicated training & support</span>
              </li>
            </ul>
            <button className="bg-amber-500 text-white px-8 py-4 rounded-lg hover:bg-amber-600 transition font-semibold text-lg shadow-lg">
              Get a Quote
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-lg text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-6 h-6 text-blue-900 transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Digitize Your Dairy?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Take the first step towards a more efficient and profitable business.
          </p>
          <button className="bg-amber-500 text-white px-12 py-5 rounded-lg hover:bg-amber-600 transition font-bold text-xl shadow-2xl">
            Request Your Free Demo Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/dairify-logo.png" alt="Dairify Logo" className="h-12 w-auto" />
                <span className="text-2xl font-bold">Dairify</span>
              </div>
              <p className="text-gray-400 text-sm">
                Digitizing dairy businesses for a more efficient and profitable future.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Training</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: info@dairify.com</li>
                <li>Phone: +91 XXX XXX XXXX</li>
                <li>Address: Your Address Here</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 Dairify. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}