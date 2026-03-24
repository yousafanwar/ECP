import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "./components/ProviderWrapper";
import { Header } from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bird Buzz — Modern E-Commerce",
  description: "Shop the latest products at Bird Buzz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProviderWrapper>
          <Header />
          <main className="min-h-[calc(100vh-72px)]">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Bird Buzz</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Your destination for quality products at great prices.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Shop</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li>New Arrivals</li>
                    <li>Best Sellers</li>
                    <li>Categories</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Support</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li>Contact Us</li>
                    <li>FAQs</li>
                    <li>Shipping Info</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Company</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li>About Us</li>
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Bird Buzz. All rights reserved.
              </div>
            </div>
          </footer>
        </ProviderWrapper>
      </body>
    </html>
  );
}
