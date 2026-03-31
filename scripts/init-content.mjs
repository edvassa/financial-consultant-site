import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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
    subtitle: "Свяжитесь со мной, чтобы обсудить ваши финансовые потребства и найти идеальное решение для вашего бизнеса.",
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

async function initializeContent() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Initializing content in database...');
    
    // Check if content already exists
    const [rows] = await connection.execute(
      'SELECT * FROM contentPages WHERE pageKey = ?',
      ['home']
    );
    
    if (rows.length > 0) {
      console.log('Content already exists, updating...');
      await connection.execute(
        'UPDATE contentPages SET content = ? WHERE pageKey = ?',
        [JSON.stringify(DEFAULT_CONTENT), 'home']
      );
    } else {
      console.log('Creating new content...');
      await connection.execute(
        'INSERT INTO contentPages (pageKey, content) VALUES (?, ?)',
        ['home', JSON.stringify(DEFAULT_CONTENT)]
      );
    }
    
    console.log('✅ Content initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing content:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initializeContent().catch(console.error);
