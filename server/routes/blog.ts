import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate static HTML file for blog article with OG tags
async function generateBlogHtmlFile(article: any) {
  try {
    const title = article.seoTitle || article.title;
    const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
    const image = article.imageUrl || '';
    const domain = process.env.VITE_APP_DOMAIN || 'finconsult-turcanelena.manus.space';
    const url = `https://${domain}/blog/${article.slug}`;
    const ogImage = image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '';
    const ogImageWidth = image ? `<meta property="og:image:width" content="1200" />` : '';
    const ogImageHeight = image ? `<meta property="og:image:height" content="630" />` : '';
    const twitterImage = image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : '';
    
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${ogImage}
  ${ogImageWidth}
  ${ogImageHeight}
  
  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="1756111292309631" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(url)}" />
  
  <!-- Redirect to blog article after crawlers read OG tags -->
  <meta http-equiv="refresh" content="0;url=/blog/${encodeURIComponent(article.slug)}" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${twitterImage}
  
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`;
    
    // Save to dist/blog/[slug]/index.html for production (SSG)
    const distBlogDir = path.join(__dirname, '../../dist/blog', article.slug);
    if (!fs.existsSync(distBlogDir)) {
      fs.mkdirSync(distBlogDir, { recursive: true });
    }
    const distFilePath = path.join(distBlogDir, 'index.html');
    fs.writeFileSync(distFilePath, html);
    console.log(`✅ Generated SSG HTML: ${distFilePath}`);
    
    // Also create /share/[slug]/index.html with OG tags and redirect
    // This bypasses Manus proxy which intercepts /blog/* paths
    const shareDir = path.join(__dirname, '../../dist/share', article.slug);
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    const shareFilePath = path.join(shareDir, 'index.html');
    fs.writeFileSync(shareFilePath, html);
    console.log(`✅ Generated share page: ${shareFilePath}`);
  } catch (error) {
    console.error('❌ Error generating blog HTML:', error);
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

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

// Get article preview with meta tags for social media
router.get("/preview/:slug", async (req, res) => {
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
      return res.status(404).send('Article not found');
    }

    const data = article[0];
    const title = data.seoTitle || data.title;
    const description = data.seoDescription || data.excerpt || data.content.substring(0, 160);
    const image = data.imageUrl || '';
    const ogImage = image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '';
    const ogImageWidth = image ? `<meta property="og:image:width" content="1200" />` : '';
    const ogImageHeight = image ? `<meta property="og:image:height" content="630" />` : '';
    const twitterImage = image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : '';
    
    // Debug: log all headers
    console.log('[Preview] Headers:', {
      'x-forwarded-host': req.get('x-forwarded-host'),
      'host': req.get('host'),
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'referer': req.get('referer'),
      'origin': req.get('origin')
    });
    
    // Use the domain from environment or construct from headers
    const host = (process.env.VITE_APP_DOMAIN && process.env.NODE_ENV === 'production') 
      ? process.env.VITE_APP_DOMAIN
      : (req.get('x-forwarded-host') || req.get('host') || 'localhost:3000');
    const protocol = req.get('x-forwarded-proto') || 'https';
    const url = `${protocol}://${host}/blog/${data.slug}`;
    console.log('[Preview] Generated URL:', url);
    const keywords = data.seoKeywords || '';

    // Return minimal HTML with OG tags for social media crawlers
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ''}
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${ogImage}
  ${ogImageWidth}
  ${ogImageHeight}
  
  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="1756111292309631" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(url)}" />
  
  <!-- Redirect to blog article after crawlers read OG tags -->
  <meta http-equiv="refresh" content="0;url=/blog/${encodeURIComponent(data.slug)}" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${twitterImage}
  
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error("Error fetching article preview:", error);
    res.status(500).send('Error loading article');
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

    // Generate HTML file for social media crawlers
    const newArticle = {
      slug,
      title,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      excerpt: excerpt || null,
      content,
      imageUrl
    };
    await generateBlogHtmlFile(newArticle);

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

    // Generate HTML file for updated article
    const updatedArticle = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.id, articleId))
      .limit(1);
    
    if (updatedArticle.length > 0) {
      await generateBlogHtmlFile(updatedArticle[0]);
    }

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

// Admin: Regenerate all blog HTML files
router.post("/admin/regenerate-html", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    
    const allArticles = await db.select().from(blogArticles);
    let count = 0;
    
    for (const article of allArticles) {
      await generateBlogHtmlFile(article);
      count++;
    }
    
    res.json({ success: true, message: `Regenerated ${count} HTML files` });
  } catch (error) {
    console.error("Error regenerating HTML files:", error);
    res.status(500).json({ error: "Failed to regenerate HTML files" });
  }
});

// Public: Get OG tags for social media sharing (minimal HTML, no React)
router.get("/og/:slug", async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).send('<html><head><title>Error</title></head><body>Database error</body></html>');
    }
    
    const slug = req.params.slug;
    const article = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.slug, slug))
      .limit(1);

    if (article.length === 0) {
      return res.status(404).send('<html><head><title>Not Found</title></head><body>Article not found</body></html>');
    }

    const data = article[0];
    const title = data.seoTitle || data.title;
    const description = data.seoDescription || data.excerpt || data.content.substring(0, 160);
    const image = data.imageUrl || '';
    // HARDCODED SITE_URL - never use req.url or req.originalUrl
    const SITE_URL = "https://finconsult-turcanelena.manus.space";
    const url = `${SITE_URL}/blog/${slug}`;

    // Minimal HTML with OG tags - NO React, NO JavaScript, NO div#root
    // IMPORTANT: og:url MUST use hardcoded SITE_URL, never req.url or req.originalUrl
    const ogImage = image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '';
    const ogImageWidth = image ? `<meta property="og:image:width" content="1200" />` : '';
    const ogImageHeight = image ? `<meta property="og:image:height" content="630" />` : '';
    const twitterImage = image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : '';
    
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${SITE_URL}/blog/${slug}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${ogImage}
  ${ogImageWidth}
  ${ogImageHeight}
  
  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="1756111292309631" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(url)}" />
  
  <!-- Redirect to blog article -->
  <meta http-equiv="refresh" content="0;url=/blog/${encodeURIComponent(slug)}" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${twitterImage}
</head>
<body>
</body>
</html>`;

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Link': `<${url}>; rel="canonical"`,
      'X-Canonical-URL': url
    });
    res.send(html);
  } catch (error) {
    console.error("Error fetching OG tags:", error);
    res.status(500).send('<html><head><title>Error</title></head><body>Server error</body></html>');
  }
});

// Admin: Upload image for paste in content
router.post("/upload-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageMimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const buffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
    const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { url } = await storagePut(
      `blog-images/${fileName}`,
      buffer,
      imageMimeType || 'image/jpeg'
    );

    res.json({ url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
