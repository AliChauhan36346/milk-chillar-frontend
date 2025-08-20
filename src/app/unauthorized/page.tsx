import React from 'react';
import { Shield, Lock, Home, LogIn, Milk, AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Milk className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">چوہان ڈیری فارمنگ</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/login"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <LogIn className="w-5 h-5" />
              <span>لاگ ان / Login</span>
            </a>

            <a
              href="/dashboard/dodhi"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              <span>دودھی / dodhi</span>
            </a>
            <a
              href="/dashboard/dodhi"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              <span>انچارج چلر / Chillar Incharge</span>
            </a>
          </div>

        {/* Error Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 mt-8 shadow-xl border border-red-100">
          <div className="flex items-center justify-center gap-3 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h1 className="text-4xl font-bold text-red-600">403</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            رسائی مسترد
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Access Denied - Unauthorized
          </p>

          <div className="bg-red-50 rounded-2xl p-6 mb-6 border border-red-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lock className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-red-700">اجازت کی ضرورت</h3>
            </div>
            <p className="text-red-600 mb-2">
              آپ کو اس صفحے تک رسائی کی اجازت نہیں ہے
            </p>
            <p className="text-red-500 text-sm">
              You do not have permission to access this page
            </p>
          </div>

          


          {/* Possible Reasons */}
          <div className="text-left max-w-md mx-auto mb-6">
            <h4 className="font-bold text-gray-700 mb-3 text-center">ممکنہ وجوہات / Possible Reasons:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>آپ نے لاگ ان نہیں کیا / You are not logged in</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>آپ کا سیشن ختم ہو گیا / Your session has expired</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>غلط کریڈینشلز / Invalid credentials</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>اکاؤنٹ کی تصدیق باقی / Account verification pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">مدد چاہیے؟ / Need Help?</h3>
          <p className="text-blue-700 mb-3">
            اگر آپ کو لگتا ہے کہ یہ غلطی ہے تو ہم سے رابطہ کریں
          </p>
          <p className="text-blue-600 text-sm mb-4">
            If you think this is an error, please contact us
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <a
              href="tel:+923001234567"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              📞 0300-1234567
            </a>
            <span className="hidden sm:inline text-blue-400">|</span>
            <a
              href="mailto:support@chauhandairy.com"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              📧 support@chauhandairy.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>© 2024 چوہان ڈیری فارمنگ - تمام حقوق محفوظ</p>
        </div>
      </div>
    </div>
  );
}
