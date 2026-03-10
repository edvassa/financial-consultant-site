import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Globe, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// Consultant photo URL (cleaned version)
const CONSULTANT_PHOTO = "https://private-us-east-1.manuscdn.com/webdev-static-assets/elena_turcan_portrait_clean.png";

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
    price: 200,
    category: "digital",
    description: "Готовые формы для учета в малых компаниях",
    details: "Набор простых готовых форм для управления учетом в малых компаниях.",
  },
  {
    id: 3,
    name: "Разовая консультация",
    price: 2000,
    category: "service",
    description: "Онлайн-встреча 1.5-2 часа для обсуждения конкретных вопросов",
    details: "Онлайн-встреча (1.5-2 часа) для обсуждения конкретного вопроса или проблемы клиента. Включает предварительный просмотр документов.",
  },
  {
    id: 4,
    name: "Финансовый старт",
    price: 5000,
    category: "service",
    description: "Разработка простой финмодели для стартапа или микробизнеса",
    details: "Разработка и внедрение простой финансовой модели для стартапа или микробизнеса.",
  },
  {
    id: 5,
    name: "Постановка управленческого учета",
    price: 10000,
    category: "service",
    description: "Полное внедрение системы отчетности (P&L, Cash Flow, Balance)",
    details: "Разработка и внедрение системы отчетности (P&L, Cash Flow, Balance), настройка сбора данных, обучение владельца и/или сотрудников.",
  },
  {
    id: 6,
    name: "Помощь в привлечении финансирования",
    price: 20000,
    category: "service",
    description: "Подготовка документов для коммерческих банков при подаче заявки на кредит",
    details: "Подготовка документов для коммерческих банков при финансировании бизнеса.",
  },
  {
    id: 7,
    name: "Регламентированная отчетность",
    price: 20000,
    category: "service",
    description: "Подготовка и сдача отчетности в НБМ",
    details: "Подготовка и сдача отчетности для платежных обществ и небанковских кредитных организаций в НБМ.",
  },
  {
    id: 8,
    name: "Ежемесячный аутсорс финансового директора",
    price: 20000,
    category: "subscription",
    description: "Ежемесячный управленческий учет, анализ и стратегическая поддержка",
    details: "Ежемесячный управленческий учет, анализ результатов, регулярные встречи с владельцем для обсуждения результатов и планирования, помощь в стратегических решениях.",
    isMonthly: true,
  },
];

const BENEFITS = [
  {
    icon: Globe,
    title: "Полная финансовая прозрачность",
    description: "Всегда видьте, куда идут деньги и что приносит максимальную прибыль. Я внедряю P&L, Cash Flow и Balance, понятные даже не-финансистам.",
  },
  {
    icon: TrendingUp,
    title: "Фокус на рост прибыли",
    description: "Я не просто считаю, я анализирую и нахожу точки роста. Мои инструменты позволяют принимать решения, которые увеличивают прибыльность бизнеса.",
  },
  {
    icon: Shield,
    title: "Управление рисками",
    description: "Видьте потенциальные кассовые разрывы и финансовые угрозы заранее. Я строю предсказуемую финансовую модель, защищая ваш бизнес от неожиданностей.",
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
              <Button variant="outline">Панель управления</Button>
            ) : (
              <Button variant="default">Связаться со мной</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Ваш личный финансовый директор онлайн
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Профессиональные инструменты уровня CFO: готовые решения (шаблоны, обучающие материалы) и индивидуальная работа (приватные консультации, поддержка бизнеса). Быстрое внедрение, точные расчеты, прозрачная финансовая система.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-green-700 hover:bg-green-800"
                onClick={() => setLocation("/book-consultation")}
              >
                Забронировать консультацию <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
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

      {/* About Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Обо мне</h2>
            <p className="text-lg text-slate-300 mb-4">
              Меня зовут Елена Цуркан и мой личный опыт в стратегическом финансовом управлении превышает 15 лет, что позволяет мне превратить финансовый хаос в прозрачную и прибыльную систему. Я предлагаю комплексный подход: от готовых инструментов уровня CFO до индивидуальных консультаций и полной поддержки бизнеса.
            </p>
            <p className="text-lg text-slate-300">
              Со мной вы получаете не просто отчетность, а стратегический инструмент для многократного роста прибыли и полного финансового контроля.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Почему работать со мной</h2>
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
              Консультационные услуги
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
                      {product.isMonthly && <span className="text-sm font-normal text-slate-600">/месяц</span>}
                    </div>
                    <Button size="sm" className="bg-green-700 hover:bg-green-800">
                      Выбрать
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
            <CardTitle className="text-slate-900">Реквизиты для оплаты</CardTitle>
            <CardDescription>Информация для банковского перевода</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 font-semibold">IBAN</p>
                <p className="text-lg font-mono text-slate-900">MD93ML022510000000007084</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Получатель</p>
                <p className="text-slate-900">ELVIAN TRADE PLUS S.R.L.</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Налоговый код</p>
                <p className="text-slate-900">1025600070087</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold">Валюта</p>
                <p className="text-slate-900">MDL (Молдавский лей)</p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  После оплаты пожалуйста отправьте подтверждение на <strong>edvassa@gmail.com</strong> с деталями вашего заказа.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Готовы трансформировать ваш бизнес?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Свяжитесь со мной, чтобы обсудить ваши финансовые потребности и найти идеальное решение для вашего бизнеса.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+37369002909">
              <Button size="lg" variant="secondary">
                Позвонить: +373 69 00 29 09
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
            <p>&copy; 2026 FinDirector. Все права защищены.</p>
            <p>Елена Цуркан - Финансовый консультант</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
