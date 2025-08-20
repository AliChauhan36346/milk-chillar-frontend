import React from 'react';
import { Milk, Users, DollarSign, FileText, Clock, Shield, ArrowRight, CheckCircle, Smartphone, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-green-600"></div>
          <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-blue-600"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-green-400"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Logo and Brand */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                <Milk className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-800 to-blue-700 bg-clip-text text-transparent mb-4">
                چوہان ڈیری فارمنگ
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-2 font-semibold">
                کسانوں کا قابل اعتماد پارٹنر
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Your Trusted Milk Collection Partner
              </p>
            </div>

            {/* Main Value Proposition */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-3xl p-8 mb-12 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  آپ کے دودھ کی بہترین قیمت
                </h2>
                <p className="text-xl text-green-100">
                  Best Price for Your Milk - Guaranteed!
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-bold mb-2">فوری پیمنٹ</h3>
                  <p className="text-green-100">Instant Payment</p>
                  <p className="text-sm mt-2">24 گھنٹے میں پیسے</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-bold mb-2">آن لائن لیجر</h3>
                  <p className="text-green-100">Online Ledger</p>
                  <p className="text-sm mt-2">ہر لین دین کا ریکارڈ</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h3 className="text-xl font-bold mb-2">مکمل اعتماد</h3>
                  <p className="text-green-100">100% Reliable</p>
                  <p className="text-sm mt-2">15 سال کا تجربہ</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <a
                href="/login"
                className="inline-flex items-center gap-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Users className="w-6 h-6" />
                <span>سپلائر لاگ ان / Supplier Login</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits for Suppliers */}
      <section className="py-20 bg-white/70">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              سپلائرز کے لیے خصوصی فوائد
            </h2>
            <p className="text-xl text-gray-600">Special Benefits for Our Milk Suppliers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Benefit 1 */}
            <div className="group bg-gradient-to-br from-white to-green-50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform mx-auto">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                وقت پر پیمنٹ
              </h3>
              <p className="text-sm text-gray-600 mb-3">On-Time Payment</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>روزانہ پیمنٹ</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>کوئی تاخیر نہیں</span>
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="group bg-gradient-to-br from-white to-blue-50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform mx-auto">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                آن لائن ریکارڈ
              </h3>
              <p className="text-sm text-gray-600 mb-3">Online Records</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>24/7 رسائی</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>شفاف حساب کتاب</span>
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="group bg-gradient-to-br from-white to-purple-50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                بہترین ریٹ
              </h3>
              <p className="text-sm text-gray-600 mb-3">Best Rates</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>مارکیٹ کی بہترین قیمت</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>کوئی چھپی فیس نہیں</span>
                </div>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="group bg-gradient-to-br from-white to-orange-50 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform mx-auto">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                موبائل ایپ
              </h3>
              <p className="text-sm text-gray-600 mb-3">Mobile App</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>آسان استعمال</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>فوری اطلاع</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-20 bg-gradient-to-r from-green-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                کسان کیا کہتے ہیں؟
              </h2>
              <p className="text-xl text-green-100">What Our Farmers Say</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">محمد علی</h4>
                    <p className="text-green-200 text-sm">کسان - گجرات</p>
                  </div>
                </div>
                <p className="text-lg italic text-green-100">
                  "15 سال سے چوہان ڈیری کے ساتھ کام کر رہا ہوں۔ ہمیشہ وقت پر پیسے ملتے ہیں۔"
                </p>
                <p className="text-white/80 mt-2">
                  "Working with Chauhan Dairy for 15 years. Always get paid on time."
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">احمد حسن</h4>
                    <p className="text-blue-200 text-sm">کسان - پنجاب</p>
                  </div>
                </div>
                <p className="text-lg italic text-blue-100">
                  "آن لائن لیجر بہت آسان ہے۔ گھر بیٹھے اپنا حساب دیکھ سکتے ہیں۔"
                </p>
                <p className="text-white/80 mt-2">
                  "Online ledger is very easy. Can check accounts from home."
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300">500+</div>
                  <p className="text-green-200">خوش کسان</p>
                  <p className="text-white/60 text-sm">Happy Farmers</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300">15+</div>
                  <p className="text-green-200">سال تجربہ</p>
                  <p className="text-white/60 text-sm">Years Experience</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300">1000+</div>
                  <p className="text-green-200">لیٹر یومیہ</p>
                  <p className="text-white/60 text-sm">Liters Daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-4">
              آج ہی شامل ہوں
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Join us today and experience the best milk collection service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/login"
                className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                اب رجسٹر کریں / Register Now
              </a>
              <a
                href="tel:+923001234567"
                className="bg-white/20 text-white hover:bg-white/30 font-bold px-8 py-4 rounded-xl border border-white/30 transition-all"
              >
                رابطہ: 0300-1234567
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Milk className="w-10 h-10 text-green-400" />
              <span className="text-3xl font-bold">چوہان ڈیری فارمنگ</span>
            </div>
            <p className="text-blue-200 mb-4 text-lg">
              آپ کے دودھ کا قابل اعتماد خریدار
            </p>
            <p className="text-white/60">
              © 2024 Chauhan Dairy Farming. تمام حقوق محفوظ ہیں۔
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span className="text-green-300">📞 رابطہ: 0300-1234567</span>
              <span className="text-blue-300">📧 info@chauhandairy.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}