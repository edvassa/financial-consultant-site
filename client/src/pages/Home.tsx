import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Globe, TrendingUp, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import FeaturedBlog from "@/components/FeaturedBlog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

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

// Icon mapping for benefits
const ICON_MAP: Record<string, any> = {
  "globe": Globe,
  "trending": TrendingUp,
  "shield": Shield,
};

// Default content structure
const DEFAULT_CONTENT = {
  final_cta: {
    section_title: "Готовы трансформировать ваш бизнес?",
    subtitle: "Свяжитесь со мной, чтобы обсудить ваши финансовые потребства и найти идеальное решение для вашего бизнеса.",
    button_text: "Связаться со мной",
  },
};

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


  // Load content from database
  const { data: dbContent, isLoading } = trpc.content.get.useQuery(
    { pageKey: "home" },
    { retry: 1 }
  );



  const filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  // Build benefits from database content
  const getBenefits = () => {
    if (!dbContent?.benefits) return [];
    
    const benefits = [];
    
    if (dbContent.benefits.benefit_1_title) {
      benefits.push({
        icon: Globe,
        title: dbContent.benefits.benefit_1_title,
        description: dbContent.benefits.benefit_1_desc,
      });
    }
    
    if (dbContent.benefits.benefit_2_title) {
      benefits.push({
        icon: TrendingUp,
        title: dbContent.benefits.benefit_2_title,
        description: dbContent.benefits.benefit_2_desc,
      });
    }
    
    if (dbContent.benefits.benefit_3_title) {
      benefits.push({
        icon: Shield,
        title: dbContent.benefits.benefit_3_title,
        description: dbContent.benefits.benefit_3_desc,
      });
    }
    
    return benefits;
  };

  const benefits = getBenefits();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">FinDirector</div>
          <div className="flex gap-6 items-center">
            <div className="flex gap-4 text-sm text-slate-600">
              <div>Email: edvassa@gmail.com</div>
              <div>+37369002909</div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/blog")}
              className="text-slate-600 hover:text-slate-900"
            >
              Блог
            </Button>
            {/* Admin button hidden from public - use /admin route instead */}
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
                {dbContent?.hero?.cta_primary || "Забронировать консультацию"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/learn-more")}
              >
                {dbContent?.hero?.cta_secondary || "Узнать больше"}
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
          {benefits.length > 0 ? (
            benefits.map((benefit, index) => {
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
            })
          ) : (
            <div className="col-span-3 text-center text-slate-600">
              Контент загружается...
            </div>
          )}
        </div>
      </section>

      {/* Services & Products Section */}
      <section className="bg-slate-50 py-16" data-section="services">
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
              Услуги
            </Button>
            <Button
              variant={selectedCategory === "subscription" ? "default" : "outline"}
              onClick={() => setSelectedCategory("subscription")}
              className={selectedCategory === "subscription" ? "bg-green-700 hover:bg-green-800" : ""}
            >
              Подписка
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1 flex flex-col">
                    {product.details && (
                      <p className="text-sm text-slate-600">{product.details}</p>
                    )}
                    {product.price && (
                      <div className="text-2xl font-bold text-green-700">{product.price} MDL</div>
                    )}
                    <Button
                      className="w-full bg-green-700 hover:bg-green-800 mt-auto"
                      onClick={() => setLocation(`/book-consultation?product=${product.id}`)}
                    >
                      Связаться со мной
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <FeaturedBlog />

      {/* Final CTA Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {dbContent?.final_cta?.section_title || "Готовы трансформировать ваш бизнес?"}
          </h2>
          <p className="text-lg mb-8 text-green-100">
            {dbContent?.final_cta?.subtitle || "Свяжитесь со мной, чтобы обсудить ваши финансовые потребства и найти идеальное решение для вашего бизнеса."}
          </p>
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-slate-100"
            onClick={() => setLocation("/book-consultation")}
          >
            {DEFAULT_CONTENT.final_cta.button_text}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">FinDirector</h3>
              <p className="text-sm">{dbContent?.footer?.author || "Елена Цуркан - Финансовый консультант"}</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Быстрые ссылки</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white cursor-pointer">Главная</button></li>
                <li><button onClick={() => {
                  const servicesSection = document.querySelector('[data-section="services"]');
                  if (servicesSection) servicesSection.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-white cursor-pointer">Услуги</button></li>
                <li><button onClick={() => setLocation('/blog')} className="hover:text-white cursor-pointer">Блог</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: edvassa@gmail.com</li>
                <li>Телефон: +37369002909</li>
              </ul>
            </div>

          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>{dbContent?.footer?.copyright || "© 2026 FinDirector. Все права защищены."}</p>
          </div>
        </div>
      </footer>


    </div>
  );
}
