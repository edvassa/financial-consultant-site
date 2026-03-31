import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Save, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

// Default content structure matching the website
const DEFAULT_CONTENT = {
  hero: {
    title: "Ваш личный финансовый директор онлайн",
    subtitle: "Профессиональные инструменты уровня CFO: готовые решения (шаблоны, обучающие материалы) и индивидуальная работа (приватные консультации, поддержка бизнеса). Быстрое внедрение, точные расчеты, прозрачная финансовая система.",
    cta_primary: "Забронировать консультацию",
    cta_secondary: "Узнать больше",
  },
  about: {
    section_title: "Обо мне",
    paragraph_1: "Меня зовут Елена Цуркан и мой личный опыт в стратегическом финансовом управлении превышает 15 лет, что позволяет мне превратить финансовый хаос в прозрачную и прибыльную систему. Я предлагаю комплексный подход: от готовых инструментов уровня CFO до индивидуальных консультаций и полной поддержки бизнеса.",
    paragraph_2: "Со мной вы получаете не просто отчетность, а стратегический инструмент для многократного роста прибыли и полного финансового контроля.",
  },
  benefits: {
    section_title: "Почему работать со мной",
    benefit_1_title: "Полная финансовая прозрачность",
    benefit_1_desc: "Всегда вы увидите, куда идят деньги и что приносит максимальную прибыль. Я внедряю P&L, Cash Flow и Balance, понятные даже не-финансистам.",
    benefit_2_title: "Фокус на рост прибыли",
    benefit_2_desc: "Я не просто считаю, я анализирую и нахожу точки роста. Мои инструменты позволяют принимать решения, которые увеличивают прибыльность бизнеса.",
    benefit_3_title: "Управление рисками",
    benefit_3_desc: "Вы увидите потенциальные кассовые разрывы и финансовые угрозы заранее. Я строю предсказуемую финансовую модель, защищая ваш бизнес от неожиданностей.",
  },
  payment: {
    section_title: "Реквизиты для оплаты",
    subtitle: "Информация для банковского перевода",
    iban: "MD93ML022510000000007084",
    recipient: "ELVIAN TRADE PLUS S.R.L.",
    tax_code: "1025600070087",
    currency: "MDL (Молдавский лей)",
    note: "После оплаты пожалуйста отправьте подтверждение на edvassa@gmail.com с деталями вашего заказа.",
  },
  final_cta: {
    section_title: "Готовы трансформировать ваш бизнес?",
    subtitle: "Свяжитесь со мной, чтобы обсудить ваши финансовые потребности и найти идеальное решение для вашего бизнеса.",
    button_text: "Email: edvassa@gmail.com",
  },
  footer: {
    copyright: "© 2026 FinDirector. Все права защищены.",
    author: "Елена Цуркан - Финансовый консультант",
  },
  learn_more: {
    title: "Узнайте больше",
    content: "",
    file_name: "",
    file_url: "",
    file_type: "",
  },
};

const SECTIONS = [
  { key: "hero", label: "Главный баннер (Hero)" },
  { key: "about", label: "Обо мне" },
  { key: "benefits", label: "Почему работать со мной" },
  { key: "payment", label: "Реквизиты для оплаты" },
  { key: "final_cta", label: "Финальный призыв к действию" },
  { key: "footer", label: "Подвал сайта" },
  { key: "learn_more", label: "Узнать больше" },
];

export default function ContentManager() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSection, setSelectedSection] = useState<string>("hero");
  const [formData, setFormData] = useState<Record<string, any>>(DEFAULT_CONTENT);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Load content from database on mount
  const { data: dbContent, isLoading } = trpc.content.get.useQuery(
    { pageKey: "home" },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (dbContent) {
      setFormData(dbContent);
    }
  }, [dbContent]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const currentSection = SECTIONS.find((s) => s.key === selectedSection);
  const sectionData = formData[selectedSection] || {};

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [selectedSection]: {
        ...prev[selectedSection],
        [fieldName]: value,
      },
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleFieldChange("file_url", base64);
        handleFieldChange("file_name", file.name);
        handleFieldChange("file_type", file.type);
        setSaveMessage("✅ Файл загружен!");
        setTimeout(() => setSaveMessage(""), 3000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setSaveMessage("❌ Ошибка при загрузке файла");
    }
  };

  const saveContentMutation = trpc.content.upsert.useMutation();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await saveContentMutation.mutateAsync({
        pageKey: "home",
        content: formData,
      });
      setSaveMessage("✅ Изменения сохранены!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage("❌ Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      [selectedSection]: DEFAULT_CONTENT[selectedSection as keyof typeof DEFAULT_CONTENT],
    }));
    setSaveMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Управление контентом</h1>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            ← Назад в админ-панель
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Section List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Разделы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setSelectedSection(section.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                        selectedSection === section.key
                          ? "bg-green-700 text-white"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Form */}
          <div className="lg:col-span-3">
            {currentSection && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentSection.label}</CardTitle>
                  <CardDescription>
                    Отредактируйте текст для этого раздела
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(sectionData).map(([key, value]: [string, any]) => {
                      if (key === "file_url" || key === "file_type") return null;
                      
                      const label = key
                        .replace(/_/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase());

                      if (key === "file_name") {
                        return (
                          <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Загрузить файл (PDF, Word, JPG)
                            </label>
                            <div className="flex items-center gap-4">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                className="flex-1"
                                id="file-upload"
                              />
                              {value && typeof value === "string" && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                                  <span className="text-sm text-green-700">
                                    ✓ {value}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleFieldChange("file_url", "");
                                      handleFieldChange("file_name", "");
                                      handleFieldChange("file_type", "");
                                    }}
                                    className="text-green-700 hover:text-green-900"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={key}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            {label}
                          </label>
                          {typeof value === "string" && value.length > 100 ? (
                            <textarea
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(key, e.target.value)
                              }
                              rows={4}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                              placeholder={`Введите ${label.toLowerCase()}`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(key, e.target.value)
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                              placeholder={`Введите ${label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      );
                    })}

                    {/* Save Message */}
                    {saveMessage && (
                      <div
                        className={`p-4 rounded-lg text-sm ${
                          saveMessage.includes("✅")
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {saveMessage}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="bg-green-700 hover:bg-green-800 flex items-center gap-2"
                      >
                        {isSaving || isLoading ? (
                          <>Сохранение...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Сохранить изменения
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isSaving}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Отменить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
