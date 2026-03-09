import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Globe, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// Consultant photo URL
const CONSULTANT_PHOTO = "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310419663030588662/BjigmLSAKPwiyBHJ.png?Expires=1804340150&Signature=GQSMxBDjzE48RAmwwMNoKHnShdfkTDhc0qKQRnjx6qSEs~JxdBPPOWcDjzvh1NUmgsXF26b6H7HpzzbDLW0tMbaSkcyXHHcWJM~l~hsoFuKrWfDlrI6zUugt1AvrB7NffwEn5XZPe9oQWx11s~lJVGdzlQuhi6vYQiiXvrd67C59IAXGsTa0N~j8g-6EJIcMge4O-hw8tD6lzhum8mlp8u8gbTYwRcbJD1SV8M9b8NI39JTxE97qlsTbsJwzdQdHx7P-bFOCJ~mDRw4~33WOi9RbXcd4-sZOVwcWZM8w1mzVSw2S2LkkVaa6BSJtgqI4UYZTbCKjXxgcaFlsXKJZMQ__&Key-Pair-Id=K2HSFNDJXOU9YS";

// Services and products data
const PRODUCTS = [
  {
    id: 1,
    name: 'Book "From Chaos to Profit"',
    price: 400,
    category: "digital",
    description: "Easy-to-understand finance book with humor and real examples",
    details: "Lively and understandable book about finances for those who don't want to deal with complex terms. With humor, caricatures and real examples, it shows where money is lost in business and how to put things in order. Suitable even for those who consider themselves 'dummies' in finance.",
  },
  {
    id: 2,
    name: "Unified Templates",
    price: 200,
    category: "digital",
    description: "Ready-made forms for accounting in small companies",
    details: "Set of simple ready-made forms for managing accounting in small companies.",
  },
  {
    id: 3,
    name: "One-time Consultation",
    price: 2000,
    category: "service",
    description: "1.5-2 hours online meeting for discussing specific questions",
    details: "Online meeting (1.5-2 hours) to discuss a specific question or client problem. Includes preliminary document review.",
  },
  {
    id: 4,
    name: "Financial Startup",
    price: 5000,
    category: "service",
    description: "Development of simple financial model for startup or micro-business",
    details: "Development and implementation of a simple financial model for a startup or micro-business.",
  },
  {
    id: 5,
    name: "Setting up Management Accounting",
    price: 10000,
    category: "service",
    description: "Full implementation of reporting system (P&L, Cash Flow, Balance)",
    details: "Development and implementation of a reporting system (P&L, Cash Flow, Balance), data collection setup, training for owner and/or employees.",
  },
  {
    id: 6,
    name: "Help with Financing",
    price: 20000,
    category: "service",
    description: "Document preparation for commercial banks when applying for credit",
    details: "Preparation of documents for commercial banks when financing a business.",
  },
  {
    id: 7,
    name: "Regulated Reporting",
    price: 20000,
    category: "service",
    description: "Preparation and submission of reports to NBM",
    details: "Preparation and submission of reports for payment societies and non-bank credit organizations to NBM.",
  },
  {
    id: 8,
    name: "Monthly Outsourced Financial Director",
    price: 20000,
    category: "subscription",
    description: "Monthly management accounting, analysis, and strategic support",
    details: "Monthly management accounting, performance analysis, regular meetings with owner for results discussion and planning, help with strategic decision-making.",
    isMonthly: true,
  },
];

const BENEFITS = [
  {
    icon: Globe,
    title: "Complete Financial Transparency",
    description: "Always see where money goes and what brings maximum profit. I implement P&L, Cash Flow, and Balance, understandable even to non-financiers.",
  },
  {
    icon: TrendingUp,
    title: "Profit Growth Focus",
    description: "I don't just count, I analyze and find growth points. My tools allow you to make decisions that increase business profitability.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "See potential cash gaps and financial threats in advance. I build a predictable financial model, protecting your business from surprises.",
  },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">FinDirector</div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Button variant="outline">Dashboard</Button>
            ) : (
              <Button variant="default">Contact Me</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Your Personal Financial Director Online
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Professional CFO-level tools: ready-made solutions (templates, educational materials) and individual work (private consultations, business support). Fast implementation, accurate calculations, transparent financial system.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-green-700 hover:bg-green-800"
                onClick={() => setLocation("/book-consultation")}
              >
                Book Consultation <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src={CONSULTANT_PHOTO}
              alt="Elena Turcan - Financial Consultant"
              className="rounded-lg shadow-xl max-w-md w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">About Me</h2>
            <p className="text-lg text-slate-300 mb-4">
              My name is Elena Turcan and my personal experience in strategic financial management exceeds 15 years, which allows me to transform financial chaos into a transparent and profitable system. I offer a comprehensive approach: from ready-made CFO-level tools to individual consultations and full business support.
            </p>
            <p className="text-lg text-slate-300">
              With me, you get not just reporting, but a strategic tool for multiple profit growth and complete financial control.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Work With Me</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-slate-200">
                <CardHeader>
                  <Icon className="h-8 w-8 text-green-700 mb-4" />
                  <CardTitle className="text-slate-900">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Services & Products Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Services & Products</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Choose from ready-made solutions or personalized services tailored to your business needs
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-green-700 hover:bg-green-800" : ""}
            >
              All Services
            </Button>
            <Button
              variant={selectedCategory === "digital" ? "default" : "outline"}
              onClick={() => setSelectedCategory("digital")}
              className={selectedCategory === "digital" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Digital Products
            </Button>
            <Button
              variant={selectedCategory === "service" ? "default" : "outline"}
              onClick={() => setSelectedCategory("service")}
              className={selectedCategory === "service" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Consulting Services
            </Button>
            <Button
              variant={selectedCategory === "subscription" ? "default" : "outline"}
              onClick={() => setSelectedCategory("subscription")}
              className={selectedCategory === "subscription" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Subscriptions
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-slate-900">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-6">{product.details}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-700">
                      {product.price.toLocaleString()} MDL
                      {product.isMonthly && <span className="text-sm font-normal text-slate-600">/month</span>}
                    </div>
                    <Button size="sm" className="bg-green-700 hover:bg-green-800">
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Information Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-slate-900">Payment Details</CardTitle>
            <CardDescription>Bank transfer information for payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 font-semibold">IBAN</p>
                <p className="text-lg font-mono text-slate-900">MD93ML022510000000007084</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Beneficiary</p>
                <p className="text-slate-900">ELVIAN TRADE PLUS S.R.L.</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Tax Code</p>
                <p className="text-slate-900">1025600070087</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Currency</p>
                <p className="text-slate-900">MDL (Moldovan Leu)</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  After payment, please send confirmation to <strong>edvassa@gmail.com</strong> with your order details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Contact me to discuss your financial needs and find the perfect solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+37369002909">
              <Button size="lg" variant="secondary">
                Call: +373 69 00 29 09
              </Button>
            </a>
            <a href="mailto:edvassa@gmail.com">
              <Button size="lg" variant="secondary">
                Email: edvassa@gmail.com
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p>&copy; 2026 FinDirector. All rights reserved.</p>
            <p>Elena Turcan - Financial Consultant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
