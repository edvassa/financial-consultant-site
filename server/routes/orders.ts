import { Router } from "express";
import { getDb } from "../db";
import { orders, products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

const router = Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const allOrders = await db.select().from(orders);
    res.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(req.params.id)));
    if (order.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Create order
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { productId, customerName, customerEmail, customerPhone, price, notes } = req.body;

    if (!productId || !customerName || !customerEmail || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = await db.insert(orders).values({
      productId: parseInt(productId),
      customerName,
      customerEmail,
      customerPhone,
      price: parseInt(price),
      status: "pending",
      paymentMethod: "bank_transfer",
      notes,
    });

    // Get product name
    const product = await db.select().from(products).where(eq(products.id, parseInt(productId)));
    const productName = product.length > 0 ? product[0].name : "Unknown Product";

    // Send email notification to owner
    try {
      const notificationContent = `
Новый заказ:

Продукт: ${productName}
Имя клиента: ${customerName}
Email: ${customerEmail}
Телефон: ${customerPhone}
Цена: ${price} MDL
Примечания: ${notes || "Нет"}
      `.trim();

      await notifyOwner({
        title: "Новый заказ",
        content: notificationContent,
      });
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
    }

    res.status(201).json({ success: true, id: newOrder[0] });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order status
router.patch("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { status, notes } = req.body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(req.params.id)));

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const orderId = parseInt(req.params.id);
    
    await db.delete(orders).where(eq(orders.id, orderId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
