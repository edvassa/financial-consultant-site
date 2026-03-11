import { Router } from "express";
import { getDb } from "../db";
import { consultationBookings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

const router = Router();

// Get all consultation bookings
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const allBookings = await db.select().from(consultationBookings);
    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

// Get single consultation booking
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const booking = await db
      .select()
      .from(consultationBookings)
      .where(eq(consultationBookings.id, parseInt(req.params.id)));
    if (booking.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking[0]);
  } catch (error) {
    console.error("Error fetching consultation:", error);
    res.status(500).json({ error: "Failed to fetch consultation" });
  }
});

// Create consultation booking
router.post("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { clientName, clientEmail, clientPhone, consultationType, preferredDate, message } =
      req.body;

    if (!clientName || !clientEmail || !clientPhone || !consultationType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBooking = await db.insert(consultationBookings).values({
      clientName,
      clientEmail,
      clientPhone,
      consultationType,
      preferredDate,
      message,
      status: "new",
    });

    // Send notification to owner
    const consultationTypeLabel = getConsultationTypeLabel(consultationType);
    const notificationContent = `
Новая заявка на консультацию:

Имя клиента: ${clientName}
Email: ${clientEmail}
Телефон: ${clientPhone}
Тип консультации: ${consultationTypeLabel}
Предпочитаемая дата: ${preferredDate || "Не указана"}

Дополнительная информация:
${message || "Не указана"}
    `.trim();

    await notifyOwner({
      title: "Новая заявка на консультацию",
      content: notificationContent,
    });

    res.status(201).json({ success: true, id: newBooking[0] });
  } catch (error) {
    console.error("Error creating consultation:", error);
    res.status(500).json({ error: "Failed to create consultation" });
  }
});

// Update consultation booking status
router.patch("/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const { status, message } = req.body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (message !== undefined) updates.message = message;

    await db
      .update(consultationBookings)
      .set(updates)
      .where(eq(consultationBookings.id, parseInt(req.params.id)));

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating consultation:", error);
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

// Helper function to get consultation type label
function getConsultationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "one-time": "Разовая консультация",
    "financial-startup": "Финансовый старт",
    "accounting-setup": "Постановка управленческого учета",
    "financing-help": "Помощь в привлечении финансирования",
    "reporting": "Регламентированная отчетность",
    "outsourced-director": "Ежемесячный аутсорс финансового директора",
  };
  return labels[type] || type;
}

export default router;
