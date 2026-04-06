import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Generate static HTML file for blog article with OG tags
async function generateBlogHtmlFile(article: any) {
  try {
    const title = article.seoTitle || article.title;
    const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
    const image = article.imageUrl || '';
    const SITE_URL = "https://finconsult-turcanelena.manus.space";
    const url = `${SITE_URL}/blog/${article.slug}`;
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
  <meta property="og:url" content="${url}" />
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
</body>
</html>`;

    // Save to dist/blog/[slug]/index.html
    const blogDir = path.join(__dirname, '../../dist/blog', article.slug);
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    fs.writeFileSync(path.join(blogDir, 'index.html'), html);

    // Also save to dist/share/[slug]/index.html with redirect
    const shareDir = path.join(__dirname, '../../dist/share', article.slug);
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    fs.writeFileSync(path.join(shareDir, 'index.html'), html);

  } catch (error) {
    console.error("Error generating blog HTML file:", error);
  }
}

// Public: Get blog articles list - MUST be before /blog/:slug
router.get("/list", async (req, res) => {
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
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Reserved paths that should not be treated as article slugs
const RESERVED_BLOG_PATHS = ['list', 'search', 'category', 'tag', 'page', 'create', 'edit', 'delete', 'article', 'og', 'admin', 'regenerate-html', 'upload-image'];

// Public: Detect social media bots and return OG tags for /blog/:slug
router.get("/blog/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    
    // Skip reserved paths - pass to next route
    if (RESERVED_BLOG_PATHS.includes(slug)) {
      return next();
    }
    
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isSocialBot = userAgent.includes('facebookexternalhit') ||
                        userAgent.includes('linkedinbot') ||
                        userAgent.includes('twitterbot') ||
                        userAgent.includes('manus_scraper');
    
    if (isSocialBot) {
      // Return OG tags for social media bots
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
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${ogImage}
  ${ogImageWidth}
  ${ogImageHeight}
  
  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="1756111292309631" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(url)}" />
  
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
        'X-Canonical-URL': url,
        'X-Bot-Response': 'true'
      });
      return res.send(html);
    }
    
    // For real users, pass to next middleware (React app)
    next();
  } catch (error) {
    console.error("Error in blog bot detection:", error);
    next();
  }
});



// Public: Get single article by slug
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

// Admin: Create article
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { title, content, seoTitle, seoDescription, excerpt, imageUrl, slug, published } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const result = await db.insert(blogArticles).values({
      title,
      content,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || '',
      excerpt: excerpt || content.substring(0, 160),
      imageUrl: imageUrl || '',
      slug,
      published: published ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate HTML file for this article
    const article = {
      title,
      content,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || '',
      excerpt: excerpt || content.substring(0, 160),
      imageUrl: imageUrl || '',
      slug,
    };
    await generateBlogHtmlFile(article);

    res.json({ success: true, id: result });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Failed to create article" });
  }
});

// Admin: Update article
router.put("/update/:id", async (req: Request, res: Response) => {
  try {
    const { title, content, seoTitle, seoDescription, excerpt, imageUrl, slug, published } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const articleId = parseInt(req.params.id);
    await db.update(blogArticles).set({
      title,
      content,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || '',
      excerpt: excerpt || content.substring(0, 160),
      imageUrl: imageUrl || '',
      slug,
      published: published ? 1 : 0,
      updatedAt: new Date(),
    }).where(eq(blogArticles.id, articleId));

    // Generate HTML file for this article
    const article = {
      title,
      content,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || '',
      excerpt: excerpt || content.substring(0, 160),
      imageUrl: imageUrl || '',
      slug,
    };
    await generateBlogHtmlFile(article);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ error: "Failed to update article" });
  }
});

// Admin: Delete article
router.delete("/delete/:id", async (req: Request, res: Response) => {
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
