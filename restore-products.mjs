import mysql from 'mysql2/promise';

const PRODUCTS = [
  {
    id: 1,
    name: 'Книга "От хаоса к прибыли"',
    price: "400",
    category: "digital",
    description: "Понятная книга о финансах с юмором и реальными примерами",
    details: "Живая и понятная книга о финансах для тех, кто не хочет разбираться в сложных терминах. С юмором, карикатурами и реальными примерами показывает, где теряются деньги в бизнесе и как навести порядок. Подходит даже для тех, кто считает себя 'чайником' в финансах.",
    isActive: 1,
  },
  {
    id: 2,
    name: "Унифицированные шаблоны",
    price: "2000",
    category: "digital",
    description: "Готовые формы для учета в малых компаниях",
    details: "Набор простых готовых форм для управления учетом в малых компаниях.",
    isActive: 1,
  },
  {
    id: 3,
    name: "Разовая консультация",
    price: "2000",
    category: "service",
    description: "Онлайн-встреча 1.5-2 часа для обсуждения конкретных вопросов",
    details: "Онлайн-встреча (1.5-2 часа) для обсуждения конкретного вопроса или проблемы клиента. Включает предварительный просмотр документов.",
    isActive: 1,
  },
  {
    id: 4,
    name: "Финансовый старт",
    price: "Стоимость по запросу",
    category: "service",
    description: "Разработка простой финмодели для стартапа или микробизнеса",
    details: "Разработка и внедрение простой финансовой модели для стартапа или микробизнеса.",
    isActive: 1,
  },
  {
    id: 5,
    name: "Постановка управленческого учета",
    price: "Стоимость по запросу",
    category: "service",
    description: "Полное внедрение системы отчетности (P&L, Cash Flow, Balance)",
    details: "Разработка и внедрение системы отчетности (P&L, Cash Flow, Balance), настройка сбора данных, обучение владельца и/или сотрудников.",
    isActive: 1,
  },
  {
    id: 6,
    name: "Помощь в привлечении финансирования",
    price: "Стоимость по запросу",
    category: "service",
    description: "Подготовка документов для коммерческих банков при подаче заявки на кредит",
    details: "Подготовка документов для коммерческих банков при финансировании бизнеса.",
    isActive: 1,
  },
  {
    id: 7,
    name: "Регламентированная отчетность",
    price: "Стоимость по запросу",
    category: "service",
    description: "Подготовка и сдача отчетности в НБМ",
    details: "Подготовка и сдача отчетности для платежных обществ и небанковских кредитных организаций в НБМ.",
    isActive: 1,
  },
  {
    id: 8,
    name: "Ежемесячный аутсорс финансового директора",
    price: "Стоимость по запросу",
    category: "subscription",
    description: "Ежемесячный управленческий учет, анализ и стратегическая поддержка",
    details: "Ежемесячный управленческий учет, анализ результатов, регулярные встречи с владельцем для обсуждения результатов и планирования, помощь в стратегических решениях.",
    isActive: 1,
  },
];

async function restoreProducts() {
  let connection;
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error("DATABASE_URL not set");
      process.exit(1);
    }

    connection = await mysql.createConnection(dbUrl);
    
    console.log("🗑️  Deleting all existing products...");
    await connection.execute("DELETE FROM products");
    
    console.log("📝 Inserting correct products...");
    for (const product of PRODUCTS) {
      await connection.execute(
        "INSERT INTO products (id, name, price, category, description, details, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [product.id, product.name, product.price, product.category, product.description, product.details, product.isActive]
      );
    }
    
    console.log("✅ Database restored successfully!");
    console.log(`✅ ${PRODUCTS.length} products inserted`);
    
    // Verify
    const [rows] = await connection.execute("SELECT id, name, price FROM products ORDER BY id");
    console.log("\n📊 Current products in database:");
    rows.forEach((row) => {
      console.log(`  ID ${row.id}: ${row.name} - ${row.price}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

restoreProducts();
