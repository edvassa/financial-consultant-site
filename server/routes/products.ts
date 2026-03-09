import { Router } from "express";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all active products
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.isActive, 1));
    res.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(req.params.id)));
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create product (admin only)
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { name, description, details, price, category, isMonthly, fileUrl, fileName } =
      req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = await db.insert(products).values({
      name,
      description,
      details,
      price: parseInt(price),
      category,
      isMonthly: isMonthly ? 1 : 0,
      fileUrl,
      fileName,
      isActive: 1,
    });

    res.status(201).json({ success: true, id: newProduct[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product (admin only)
router.patch("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { name, description, details, price, category, isMonthly, fileUrl, fileName, isActive } =
      req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (details !== undefined) updates.details = details;
    if (price !== undefined) updates.price = parseInt(price);
    if (category !== undefined) updates.category = category;
    if (isMonthly !== undefined) updates.isMonthly = isMonthly ? 1 : 0;
    if (fileUrl !== undefined) updates.fileUrl = fileUrl;
    if (fileName !== undefined) updates.fileName = fileName;
    if (isActive !== undefined) updates.isActive = isActive;

    await db
      .update(products)
      .set(updates)
      .where(eq(products.id, parseInt(req.params.id)));

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
