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
    { value: "one-time", label: "Разовая консультация" },
    { value: "financial-startup", label: "Финансовый старт" },
    { value: "accounting-setup", label: "Постановка управленческого учета" },
    { value: "financing-help", label: "Помощь в привлечении финансирования" },
    { value: "reporting", label: "Регламентированная отчетность" },
    { value: "outsourced-director", label: "Ежемесячный аутсорс финансового директора" },
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
        toast.success("Ваша заявка на консультацию отправлена! Я свяжусь с вами в ближайшее время.");
        setTimeout(() => setLocation("/"), 3000);
      } else {
        toast.error("Ошибка при отправке заявки");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
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
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Спасибо!</h2>
            <p className="text-slate-600 mb-6">
              Ваша заявка на консультацию получена. Я свяжусь с вами в течение 24 часов для подтверждения деталей.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="w-full bg-green-700 hover:bg-green-800"
            >
              На главную
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
          Назад
        </Button>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-t-lg px-6 py-6">
            <CardTitle className="text-2xl">Забронировать консультацию</CardTitle>
            <CardDescription className="text-green-100">
              Давайте обсудим ваши финансовые потребности и найдем идеальное решение для вашего бизнеса
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-slate-700 font-semibold">
                  Полное имя *
                </Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-slate-700 font-semibold">
                  Email адрес *
                </Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="ваш@email.com"
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-slate-700 font-semibold">
                  Номер телефона *
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
                  Тип консультации *
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
                  Предпочитаемая дата
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
                  Дополнительная информация
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Расскажите о вашем бизнесе и что вы хотели бы обсудить..."
                  className="border-slate-300 min-h-32 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 text-lg"
              >
                {loading ? "Отправка..." : "Отправить заявку на консультацию"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                После подтверждения платежа я свяжусь с вами для согласования времени консультации.
              </p>
            </form>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
