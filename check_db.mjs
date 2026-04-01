import { getDb } from "./server/db.ts";
import { products } from "./drizzle/schema.ts";

async function checkDB() {
  const db = await getDb();
  if (!db) {
    console.log("DB not available");
    return;
  }
  
  const allProducts = await db.select().from(products);
  console.log("Current products in DB:");
  console.log(JSON.stringify(allProducts, null, 2));
}

checkDB().catch(console.error);
