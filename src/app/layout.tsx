import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milk Chillar Dashboard",
  description: "Role-based dashboard system for Milk Chillar operations",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            unstyled: false,
            classNames: {
              toast: '!bg-white !border !border-gray-200 !shadow-lg !rounded-lg !p-4',
              title: '!font-medium !text-gray-800',
              description: '!text-sm !text-gray-600',
              success: '!border-green-100 !bg-green-50',
              error: '!border-red-100 !bg-red-50',
              actionButton: '!bg-blue-600 !text-white',
              cancelButton: '!bg-gray-100 !text-gray-800',
            },
          }}
        />
      </body>
    </html>
  );
}