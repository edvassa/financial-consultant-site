import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function BookConsultation() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    consultationType: "one-time",
    preferredDate: "",
    message: "",
  });

  const consultationTypes = [
    { value: "one-time", label: "One-time Consultation - 2,000 MDL" },
    { value: "financial-startup", label: "Financial Startup - 5,000 MDL" },
    { value: "accounting-setup", label: "Setting up Management Accounting - 10,000 MDL" },
    { value: "financing-help", label: "Help with Financing - 20,000 MDL" },
    { value: "reporting", label: "Regulated Reporting - 20,000 MDL" },
    { value: "outsourced-director", label: "Monthly Outsourced Financial Director - 20,000 MDL/month" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, consultationType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Consultation request submitted! I'll contact you soon.");
        setTimeout(() => setLocation("/"), 3000);
      } else {
        toast.error("Failed to submit consultation request");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-green-200 bg-white">
          <CardContent className="pt-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-600 mb-6">
              Your consultation request has been received. I'll contact you within 24 hours to confirm the details.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="w-full bg-green-700 hover:bg-green-800"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Book a Consultation</CardTitle>
            <CardDescription className="text-green-100">
              Let's discuss your financial needs and find the perfect solution for your business
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-slate-700 font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-slate-700 font-semibold">
                  Email Address *
                </Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-slate-700 font-semibold">
                  Phone Number *
                </Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  placeholder="+373 69 00 00 00"
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Consultation Type */}
              <div className="space-y-2">
                <Label htmlFor="consultationType" className="text-slate-700 font-semibold">
                  Consultation Type *
                </Label>
                <Select value={formData.consultationType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {consultationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Date */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate" className="text-slate-700 font-semibold">
                  Preferred Date
                </Label>
                <Input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="border-slate-300"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-700 font-semibold">
                  Additional Information
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your business and what you'd like to discuss..."
                  className="border-slate-300 min-h-32 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 text-lg"
              >
                {loading ? "Submitting..." : "Submit Consultation Request"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                After payment confirmation, I'll contact you to schedule the consultation at your preferred time.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Payment Info Card */}
        <Card className="mt-8 border-slate-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-slate-900">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-slate-700">
              <strong>IBAN:</strong> MD93ML022510000000007084
            </p>
            <p className="text-slate-700">
              <strong>Beneficiary:</strong> ELVIAN TRADE PLUS S.R.L.
            </p>
            <p className="text-slate-700">
              <strong>Currency:</strong> MDL (Moldovan Leu)
            </p>
            <p className="text-slate-600 mt-4">
              After making the payment, please send confirmation to <strong>edvassa@gmail.com</strong> with your order details.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
