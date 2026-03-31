import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Globe, TrendingUp, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import FeaturedBlog from "@/components/FeaturedBlog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

// Consultant photo URL (cleaned version)
const CONSULTANT_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030588662/Cp4PZg8zcaAboFkhLCd7R5/elena_clean_portrait_331f0015.png";

// Services and products data
const PRODUCTS = [
  {
    id: 1,
    name: 'Книга "От хаоса к прибыли"',
    price: 400,
    category: "digital",
    description: "Понятная книга о финансах с юмором и реальными примерами",
    details: "Живая и понятная книга о финансах для тех, кто не хочет разбираться в сложных терминах. С юмором, карикатурами и реальными примерами показывает, где теряются деньги в бизнесе и как навести порядок. Подходит даже для тех, кто считает себя 'чайником' в финансах.",
  },
  {
    id: 2,
    name: "Унифицированные шаблоны",
    category: "digital",
    description: "Готовые формы для учета в малых компаниях",
    details: "Набор простых готовых форм для управления учетом в малых компаниях.",
    showPrice: false,
  },
  {
    id: 3,
    name: "Разовая консультация",
    category: "service",
    description: "Онлайн-встреча 1.5-2 часа для обсуждения конкретных вопросов",
    details: "Онлайн-встреча (1.5-2 часа) для обсуждения конкретного вопроса или проблемы клиента. Включает предварительный просмотр документов.",
    showPrice: false,
  },
  {
    id: 4,
    name: "Финансовый старт",
    category: "service",
    description: "Разработка простой финмодели для стартапа или микробизнеса",
    details: "Разработка и внедрение простой финансовой модели для стартапа или микробизнеса.",
    showPrice: false,
  },
  {
    id: 5,
    name: "Постановка управленческого учета",
    category: "service",
    description: "Полное внедрение системы отчетности (P&L, Cash Flow, Balance)",
    details: "Разработка и внедрение системы отчетности (P&L, Cash Flow, Balance), настройка сбора данных, обучение владельца и/или сотрудников.",
    showPrice: false,
  },
  {
    id: 6,
    name: "Помощь в привлечении финансирования",
    category: "service",
    description: "Подготовка документов для коммерческих банков при подаче заявки на кредит",
    details: "Подготовка документов для коммерческих банков при финансировании бизнеса.",
    showPrice: false,
  },
  {
    id: 7,
    name: "Регламентированная отчетность",
    category: "service",
    description: "Подготовка и сдача отчетности в НБМ",
    details: "Подготовка и сдача отчетности для платежных обществ и небанковских кредитных организаций в НБМ.",
    showPrice: false,
  },
  {
    id: 8,
    name: "Ежемесячный аутсорс финансового директора",
    category: "subscription",
    description: "Ежемесячный управленческий учет, анализ и стратегическая поддержка",
    details: "Ежемесячный управленческий учет, анализ результатов, регулярные встречи с владельцем для обсуждения результатов и планирования, помощь в стратегических решениях.",
    showPrice: false,
  },
];

const BENEFITS = [
  {
    icon: Globe,
    title: "Полная финансовая прозрачность",
    description: "Всегда вы увидите, куда идят деньги и что приносит максимальную прибыль. Я внедряю P&L, Cash Flow и Balance, понятные даже не-финансистам.",
  },
  {
    icon: TrendingUp,
    title: "Фокус на рост прибыли",
    description: "Я не просто считаю, я анализирую и нахожу точки роста. Мои инструменты позволяют принимать решения, которые увеличивают прибыльность бизнеса.",
  },
  {
    icon: Shield,
    title: "Управление рисками",
    description: "Вы увидите потенциальные кассовые разрывы и финансовые угрозы заранее. Я строю предсказуемую финансовую модель, защищая ваш бизнес от неожиданностей.",
  },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [learnMoreContent, setLearnMoreContent] = useState<any>({
    title: "Узнайте больше",
    content: "",
    file_name: "",
    file_url: "",
    file_type: "",
  });

  // Load content from database
  const { data: dbContent } = trpc.content.get.useQuery(
    { pageKey: "home" },
    { retry: 1 }
  );

  useEffect(() => {
    if (dbContent && dbContent.learn_more) {
      setLearnMoreContent(dbContent.learn_more);
    }
  }, [dbContent]);

  const loadLearnMoreContent = () => {
    if (dbContent && dbContent.learn_more) {
      setLearnMoreContent(dbContent.learn_more);
    }
  };

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">FinDirector</div>
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/blog")}
              className="text-slate-600 hover:text-slate-900"
            >
              Блог
            </Button>
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>Админ-панель</Button>
            ) : (
              <Button variant="default" onClick={() => window.location.href = getLoginUrl() + '?redirect=/dashboard'}>Админ-панель</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {dbContent?.hero?.title || "Ваш личный финансовый директор онлайн"}
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              {dbContent?.hero?.subtitle || "Профессиональные инструменты уровня CFO: готовые решения (шаблоны, обучающие материалы) и индивидуальная работа (приватные консультации, поддержка бизнеса). Быстрое внедрение, точные расчеты, прозрачная финансовая система."}
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-green-700 hover:bg-green-800"
                onClick={() => setLocation("/book-consultation")}
              >
                Забронировать консультацию <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  loadLearnMoreContent();
                  setShowLearnMore(true);
                }}
              >
                Узнать больше
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src={CONSULTANT_PHOTO}
              alt="Елена Цуркан - Финансовый консультант"
              className="rounded-lg shadow-xl max-w-md w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <FeaturedBlog />

      {/* Contact Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">{dbContent?.about?.section_title || "Обо мне"}</h2>
            <p className="text-lg text-slate-300 mb-4">
              {dbContent?.about?.paragraph_1 || "Меня зовут Елена Цуркан и мой личный опыт в стратегическом финансовом управлении превышает 15 лет, что позволяет мне превратить финансовый хаос в прозрачную и прибыльную систему. Я предлагаю комплексный подход: от готовых инструментов уровня CFO до индивидуальных консультаций и полной поддержки бизнеса."}
            </p>
            <p className="text-lg text-slate-300">
              {dbContent?.about?.paragraph_2 || "Со мной вы получаете не просто отчетность, а стратегический инструмент для многократного роста прибыли и полного финансового контроля."}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{dbContent?.benefits?.section_title || "Почему работать со мной"}</h2>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Услуги и продукты</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Выберите готовые решения или персонализированные услуги, адаптированные под ваш бизнес
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Все услуги
            </Button>
            <Button
              variant={selectedCategory === "digital" ? "default" : "outline"}
              onClick={() => setSelectedCategory("digital")}
              className={selectedCategory === "digital" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Цифровые продукты
            </Button>
            <Button
              variant={selectedCategory === "service" ? "default" : "outline"}
              onClick={() => setSelectedCategory("service")}
              className={selectedCategory === "service" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Услуги консультирования
            </Button>
            <Button
              variant={selectedCategory === "subscription" ? "default" : "outline"}
              onClick={() => setSelectedCategory("subscription")}
              className={selectedCategory === "subscription" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Подписки
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{product.name}</CardTitle>
                  {product.price && (
                    <CardDescription className="text-green-700 font-semibold">
                      ${product.price}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4">{product.description}</p>
                  <Button
                    size="sm"
                    className="w-full bg-green-700 hover:bg-green-800"
                    onClick={() => setLocation("/book-consultation")}
                  >
                    Узнать подробнее
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">{dbContent?.payment?.section_title || "Реквизиты для оплаты"}</CardTitle>
            <CardDescription>{dbContent?.payment?.subtitle || "Информация для банковского перевода"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-slate-600 mb-2">IBAN</p>
                <p className="text-lg font-mono text-slate-900 mb-6">{dbContent?.payment?.iban || "MD93ML022510000000007084"}</p>
                
                <p className="text-sm text-slate-600 mb-2">Получатель</p>
                <p className="text-lg font-semibold text-slate-900 mb-6">{dbContent?.payment?.recipient || "ELVIAN TRADE PLUS S.R.L."}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Налоговый код</p>
                <p className="text-lg font-mono text-slate-900 mb-6">{dbContent?.payment?.tax_code || "1025600070087"}</p>
                
                <p className="text-sm text-slate-600 mb-2">Валюта</p>
                <p className="text-lg font-semibold text-slate-900 mb-6">{dbContent?.payment?.currency || "MDL (Молдавский лей)"}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                {dbContent?.payment?.note || "После оплаты пожалуйста отправьте подтверждение на edvassa@gmail.com с деталями вашего заказа."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{dbContent?.final_cta?.section_title || "Готовы трансформировать ваш бизнес?"}</h2>
          <p className="text-lg text-green-100 mb-8">
            {dbContent?.final_cta?.subtitle || "Свяжитесь со мной, чтобы обсудить ваши финансовые потребности и найти идеальное решение для вашего бизнеса."}
          </p>
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-slate-100"
            onClick={() => window.location.href = `mailto:edvassa@gmail.com`}
          >
            {dbContent?.final_cta?.button_text || "Email: edvassa@gmail.com"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">{dbContent?.footer?.copyright || "© 2026 FinDirector. Все права защищены."}</p>
            <p className="text-sm">{dbContent?.footer?.author || "Елена Цуркан - Финансовый консультант"}</p>
          </div>
        </div>
      </footer>

      {/* Learn More Modal */}
      <Dialog open={showLearnMore} onOpenChange={setShowLearnMore}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{learnMoreContent.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {learnMoreContent.file_url && (
              <div className="w-full">
                {learnMoreContent.file_type?.startsWith("image/") ? (
                  <img
                    src={learnMoreContent.file_url}
                    alt={learnMoreContent.file_name}
                    className="w-full h-auto rounded-lg"
                  />
                ) : learnMoreContent.file_type === "application/pdf" ? (
                  <iframe
                    src={learnMoreContent.file_url}
                    className="w-full h-[600px] rounded-lg border border-slate-200"
                    title={learnMoreContent.file_name}
                  />
                ) : (
                  <a
                    href={learnMoreContent.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Открыть {learnMoreContent.file_name}
                  </a>
                )}
              </div>
            )}
            {learnMoreContent.content && (
              <p className="text-slate-700 whitespace-pre-wrap">{learnMoreContent.content}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
