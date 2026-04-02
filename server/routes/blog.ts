import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

const router = Router();

// Get all published blog articles
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const articles = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.published, 1));
    res.json(articles);
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    res.status(500).json({ error: "Failed to fetch blog articles" });
  }
});

// Get single article by slug
router.get("/article/:slug", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const article = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.slug, req.params.slug))
      .limit(1);
    
    if (article.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article[0]);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Search articles
router.get("/search/:query", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const query = req.params.query.toLowerCase();
    const allArticles = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.published, 1));
    
    const filtered = allArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query)) ||
        article.content.toLowerCase().includes(query)
    );
    
    res.json(filtered);
  } catch (error) {
    console.error("Error searching articles:", error);
    res.status(500).json({ error: "Failed to search articles" });
  }
});

// Admin: Create new article
router.post("/admin/create", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { title, slug, content, excerpt, published, imageBase64, imageMimeType, seoTitle, seoDescription, seoKeywords } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let imageUrl = null;
    let imageKey = null;

    // Upload image if provided
    if (imageBase64) {
      try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const fileName = `blog-${Date.now()}-${slug}.jpg`;
        const { url, key } = await storagePut(
          `blog-images/${fileName}`,
          buffer,
          imageMimeType || 'image/jpeg'
        );
        imageUrl = url;
        imageKey = key;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const result = await db.insert(blogArticles).values({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      imageUrl,
      imageKey,
      published: published ? 1 : 0,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords: seoKeywords || null,
    });

    res.status(201).json({ success: true, id: result[0] });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Failed to create article" });
  }
});

// Admin: Update article
router.patch("/admin/:id", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { title, slug, content, excerpt, published, imageBase64, imageMimeType, seoTitle, seoDescription, seoKeywords } = req.body;
    const articleId = parseInt(req.params.id);

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (published !== undefined) updates.published = published ? 1 : 0;
    if (seoTitle !== undefined) updates.seoTitle = seoTitle || null;
    if (seoDescription !== undefined) updates.seoDescription = seoDescription || null;
    if (seoKeywords !== undefined) updates.seoKeywords = seoKeywords || null;

    // Handle image upload
    if (imageBase64) {
      try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const fileName = `blog-${Date.now()}-${slug}.jpg`;
        const { url, key } = await storagePut(
          `blog-images/${fileName}`,
          buffer,
          imageMimeType || 'image/jpeg'
        );
        updates.imageUrl = url;
        updates.imageKey = key;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    await db
      .update(blogArticles)
      .set(updates)
      .where(eq(blogArticles.id, articleId));

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Failed to update article" });
  }
});

// Admin: Delete article
router.delete("/admin/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const articleId = parseInt(req.params.id);
    await db.delete(blogArticles).where(eq(blogArticles.id, articleId));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

// Admin: Get all articles (including drafts)
router.get("/admin/all", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const articles = await db.select().from(blogArticles);
    res.json(articles);
  } catch (error) {
    console.error("Error fetching all articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Admin: Get single article by ID
router.get("/admin/:id", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const article = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.id, parseInt(req.params.id)))
      .limit(1);

    if (article.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article[0]);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Admin: Upload image for blog content (Ctrl+V paste)
router.post("/upload-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageMimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data" });
    }

    try {
      const buffer = Buffer.from(imageBase64, 'base64');
      const fileName = `blog-content-${Date.now()}.jpg`;
      const { url } = await storagePut(
        `blog-images/${fileName}`,
        buffer,
        imageMimeType || 'image/jpeg'
      );
      res.json({ success: true, url });
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  } catch (error) {
    console.error("Error in upload-image endpoint:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
