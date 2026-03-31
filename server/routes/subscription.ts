import { Router } from "express";
import { subscribeToBlog, getBlogSubscribers, unsubscribeFromBlog } from "../db";
import { notifyOwner } from "../_core/notification";

const router = Router();

// Subscribe to blog
router.post("/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    await subscribeToBlog(email, name);

    // Notify owner about new subscriber
    await notifyOwner({
      title: "New Blog Subscriber",
      content: `${name || email} has subscribed to your blog newsletter.`,
    });

    res.json({ success: true, message: "Successfully subscribed to blog" });
  } catch (error: any) {
    if (error.message?.includes("Duplicate entry")) {
      return res.status(400).json({ error: "Email already subscribed" });
    }
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Get all active subscribers (admin only)
router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await getBlogSubscribers();
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// Unsubscribe from blog
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await unsubscribeFromBlog(email);
    res.json({ success: true, message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
