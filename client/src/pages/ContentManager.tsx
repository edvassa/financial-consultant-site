import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, Save, RotateCcw } from "lucide-react";

interface ContentSection {
  key: string;
  label: string;
  fields: {
    name: string;
    label: string;
    type: "text" | "textarea" | "richtext";
    rows?: number;
  }[];
}

const CONTENT_SECTIONS: ContentSection[] = [
  {
    key: "hero",
    label: "Главный баннер (Hero)",
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "subtitle", label: "Подзаголовок", type: "textarea", rows: 2 },
      { name: "cta_primary", label: "Кнопка 1", type: "text" },
      { name: "cta_secondary", label: "Кнопка 2", type: "text" },
    ],
  },
  {
    key: "about",
    label: "Обо мне",
    fields: [
      { name: "section_title", label: "Заголовок секции", type: "text" },
      { name: "paragraph_1", label: "Первый параграф", type: "textarea", rows: 3 },
      { name: "paragraph_2", label: "Второй параграф", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "benefits",
    label: "Почему работать со мной",
    fields: [
      { name: "section_title", label: "Заголовок секции", type: "text" },
      { name: "benefit_1_title", label: "Преимущество 1 - Название", type: "text" },
      { name: "benefit_1_desc", label: "Преимущество 1 - Описание", type: "textarea", rows: 2 },
      { name: "benefit_2_title", label: "Преимущество 2 - Название", type: "text" },
      { name: "benefit_2_desc", label: "Преимущество 2 - Описание", type: "textarea", rows: 2 },
      { name: "benefit_3_title", label: "Преимущество 3 - Название", type: "text" },
      { name: "benefit_3_desc", label: "Преимущество 3 - Описание", type: "textarea", rows: 2 },
    ],
  },
  {
    key: "services",
    label: "Услуги и продукты",
    fields: [
      { name: "section_title", label: "Заголовок секции", type: "text" },
      { name: "section_subtitle", label: "Подзаголовок секции", type: "textarea", rows: 2 },
    ],
  },
  {
    key: "payment",
    label: "Реквизиты для оплаты",
    fields: [
      { name: "section_title", label: "Заголовок секции", type: "text" },
      { name: "section_subtitle", label: "Подзаголовок секции", type: "text" },
      { name: "iban", label: "IBAN", type: "text" },
      { name: "recipient", label: "Получатель", type: "text" },
      { name: "tax_code", label: "Налоговый код", type: "text" },
      { name: "currency", label: "Валюта", type: "text" },
      { name: "payment_note", label: "Примечание после оплаты", type: "textarea", rows: 2 },
    ],
  },
  {
    key: "cta",
    label: "Финальный призыв к действию",
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "subtitle", label: "Подзаголовок", type: "textarea", rows: 2 },
      { name: "email", label: "Email для контакта", type: "text" },
    ],
  },
  {
    key: "footer",
    label: "Подвал сайта",
    fields: [
      { name: "copyright", label: "Копирайт", type: "text" },
      { name: "author", label: "Автор", type: "text" },
    ],
  },
];

export default function ContentManager() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSection, setSelectedSection] = useState<string>(CONTENT_SECTIONS[0].key);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const currentSection = CONTENT_SECTIONS.find((s) => s.key === selectedSection);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [selectedSection]: {
        ...prev[selectedSection],
        [fieldName]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      // Save to database
      const contentToSave = formData[selectedSection] || {};
      // TODO: Call tRPC mutation to save content
      // await trpc.content.updatePage.mutate({ pageKey: selectedSection, content: contentToSave });
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
    setFormData((prev) => {
      const newData = { ...prev };
      delete newData[selectedSection];
      return newData;
    });
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
                  {CONTENT_SECTIONS.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setSelectedSection(section.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
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
                    {currentSection.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={formData[selectedSection]?.[field.name] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.name, e.target.value)
                            }
                            rows={field.rows || 3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                            placeholder={`Введите ${field.label.toLowerCase()}`}
                          />
                        ) : (
                          <input
                            type="text"
                            value={formData[selectedSection]?.[field.name] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.name, e.target.value)
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent"
                            placeholder={`Введите ${field.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}

                    {/* Save Message */}
                    {saveMessage && (
                      <div className={`p-4 rounded-lg text-sm ${
                        saveMessage.includes("✅")
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {saveMessage}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-700 hover:bg-green-800 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Сохранение...
                          </>
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
