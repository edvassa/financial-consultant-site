import { Router } from "express";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

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
    const id = parseInt(req.params.id);
    console.log("GET /api/products/:id - Requested ID:", req.params.id, "Parsed ID:", id);
    
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return res.status(500).json({ error: "Database not available" });
    }
    
    if (isNaN(id)) {
      console.error("Invalid ID:", req.params.id);
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    
    console.log("GET /api/products/:id - Found products:", product.length);
    
    if (product.length === 0) {
      console.warn("Product not found for ID:", id);
      return res.status(404).json({ error: "Product not found" });
    }
    
    console.log("GET /api/products/:id - Returning product:", product[0].id, product[0].name);
    res.json(product[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    console.error("Error details:", (error as any).message, (error as any).stack);
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

    const result = await db.insert(products).values({
      name,
      description: description || "",
      details: details || "",
      price: String(price),
      category,
      isMonthly: isMonthly ? 1 : 0,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      isActive: 1,
    });

    res.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product (admin only) - PATCH endpoint
router.patch("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log("PATCH /api/products/:id - Product ID:", productId);
    console.log("PATCH /api/products/:id - Request body keys:", Object.keys(req.body));
    
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return res.status(500).json({ error: "Database not available" });
    }
    
    const { name, description, details, price, category, isMonthly, fileUrl, fileName, isActive } =
      req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (details !== undefined) updates.details = details;
    // Keep price as string - it can be "400", "2000", or "Стоимость по запросу"
    if (price !== undefined) updates.price = String(price).trim();
    if (category !== undefined) updates.category = category;
    if (isMonthly !== undefined) updates.isMonthly = isMonthly ? 1 : 0;
    if (fileUrl !== undefined) updates.fileUrl = fileUrl;
    if (fileName !== undefined) updates.fileName = fileName;
    if (isActive !== undefined) updates.isActive = isActive;

    console.log("PATCH /api/products/:id - Updates to apply:", Object.keys(updates));
    console.log("PATCH /api/products/:id - Price value:", updates.price);

    await db
      .update(products)
      .set(updates)
      .where(eq(products.id, productId));

    console.log("PATCH /api/products/:id - Product updated successfully");
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    console.error("Error message:", (error as any).message);
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

// POST file upload for product
router.post("/:id/file", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { fileBase64, fileName, fileSize } = req.body;
    const productId = parseInt(req.params.id);

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Missing file data" });
    }

    if (fileSize > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large (max 50MB)" });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const fileKey = `products/${productId}/${Date.now()}-${fileName}`;

    const { url } = await storagePut(fileKey, buffer, "application/octet-stream");

    await db
      .update(products)
      .set({
        fileUrl: url,
        fileName: fileName,
      })
      .where(eq(products.id, productId));

    res.json({ success: true, fileUrl: url });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
