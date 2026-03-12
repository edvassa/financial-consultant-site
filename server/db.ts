import { eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, consultationBookings, blogArticles } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, 1));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

// Order queries
export async function getOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data);
}

// Consultation queries
export async function getConsultations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(consultationBookings);
}

export async function createConsultation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(consultationBookings).values(data);
}

// Blog article queries
export async function getBlogArticles(published: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  if (published) {
    return db.select().from(blogArticles).where(eq(blogArticles.published, 1));
  }
  return db.select().from(blogArticles);
}

export async function getBlogArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(blogArticles).where(eq(blogArticles.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getBlogArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(blogArticles).where(eq(blogArticles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function searchBlogArticles(query: string) {
  const db = await getDb();
  if (!db) return [];
  const searchPattern = `%${query}%`;
  return db.select().from(blogArticles)
    .where(eq(blogArticles.published, 1));
}

export async function createBlogArticle(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(blogArticles).values(data);
}

export async function updateBlogArticle(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(blogArticles).set(data).where(eq(blogArticles.id, id));
}

export async function deleteBlogArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(blogArticles).where(eq(blogArticles.id, id));
}

// TODO: add feature queries here as your schema grows.
