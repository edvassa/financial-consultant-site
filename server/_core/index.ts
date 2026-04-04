import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupVite } from "./vite";
import productsRouter from "../routes/products";
import ordersRouter from "../routes/orders";
import consultationsRouter from "../routes/consultations";
import blogRouter from "../routes/blog";
import subscriptionRouter from "../routes/subscription";
import fileUploadRouter from "../routes/fileUpload";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

  // SSR middleware for social media crawlers
  function isSocialMediaCrawler(userAgent: string): boolean {
    const crawlers = [
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'whatsapp',
      'telegram',
      'pinterest',
      'slack',
      'discord',
      'viber',
      'skype',
      'opengraph',
      'googlebot',
    ];
    return crawlers.some(crawler => userAgent.toLowerCase().includes(crawler));
  }

  async function startServer() {
    const app = express();
    const server = createServer(app);
    // Configure body parser with larger size limit for file uploads
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    
    // Helper function to escape HTML
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
    
    // SSR middleware for social media crawlers - MUST be FIRST
    app.use(async (req, res, next) => {
      const userAgent = req.get('user-agent') || '';
      const path = req.path;
      const url = req.originalUrl;
      
      console.log('[SSR] Request:', { path, url, userAgent: userAgent.substring(0, 50) });
      
      // Check if this is a blog article request (serve SSR HTML for all requests to /blog/)
      // This ensures social media crawlers always get correct meta tags regardless of user-agent
      if (path.startsWith('/blog/')) {
        console.log('[SSR] Blog request detected:', path);
        // Remove query parameters for clean og:url
        let cleanPath = path;
        if (url.includes('?')) {
          cleanPath = path.split('?')[0];
        }
        const blogMatch = cleanPath.match(/^\/blog\/([^/?]+)/);
        console.log('[SSR] Blog match:', blogMatch ? blogMatch[1] : 'no match');
        
        if (blogMatch) {
          console.log('[SSR] Processing blog article:', blogMatch[1]);
          let slug = blogMatch[1];
          // Decode URL-encoded slug (e.g., theoryof%20games -> theoryof games)
          slug = decodeURIComponent(slug);
          // Ensure slug doesn't contain query parameters
          slug = slug.split('?')[0];
          
          try {
            const db = await getDb();
            if (!db) {
              console.log('[SSR] Database connection failed');
            } else if (db) {
              const articles = await db
                .select()
                .from(blogArticles)
                .where(eq(blogArticles.slug, slug))
                .limit(1);
              
              if (articles.length === 0) {
                console.log('[SSR] Article not found in DB:', slug);
              } else if (articles.length > 0) {
                const article = articles[0];
                // Use hardcoded production domain for social media meta tags
                const host = 'finconsult-turcanelena.manus.space';
                const protocol = 'https';
                console.log('[SSR] Found article, returning SSR HTML for:', article.slug, 'host:', host);
                
                const minimalHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(article.seoTitle || article.title)}</title>
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="${escapeHtml(article.seoDescription || article.excerpt || article.content.substring(0, 160))}" />
  <meta name="keywords" content="${escapeHtml(article.seoKeywords || '')}" />
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(article.seoTitle || article.title)}" />
  <meta property="og:description" content="${escapeHtml(article.seoDescription || article.excerpt || article.content.substring(0, 160))}" />
  <meta property="og:url" content="${escapeHtml(`${protocol}://${host}/blog/${encodeURIComponent(article.slug)}`)}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${article.imageUrl ? `<meta property="og:image" content="${escapeHtml(article.imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />` : ''}
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(article.seoTitle || article.title)}" />
  <meta name="twitter:description" content="${escapeHtml(article.seoDescription || article.excerpt || article.content.substring(0, 160))}" />
  ${article.imageUrl ? `<meta name="twitter:image" content="${escapeHtml(article.imageUrl)}" />` : ''}
  
  <!-- Facebook App ID for monetization -->
  <meta property="fb:app_id" content="1756111292309631" />
  
  <!-- Article Meta Tags -->
  <meta property="article:published_time" content="${article.createdAt?.toISOString() || new Date().toISOString()}" />
  <meta property="article:author" content="Елена Цуркан" />
  
  <!-- Canonical URL - MUST be article URL, not homepage -->
  <link rel="canonical" href="${escapeHtml(`${protocol}://${host}/blog/${article.slug}`)}" />
</head>
<body>
  <!-- Minimal content for crawlers -->
  <h1>${escapeHtml(article.seoTitle || article.title)}</h1>
  <p>${escapeHtml(article.seoDescription || article.excerpt || article.content.substring(0, 160))}</p>
</body>
</html>`;
                
                 // Remove manus_scraper parameter from HTML before sending
                let cleanHtml = minimalHtml.replace(/\?manus_scraper=1/g, '');
                
                const canonicalUrl = `${protocol}://${host}/blog/${encodeURIComponent(article.slug)}`;
                res.set({
                  'Content-Type': 'text/html; charset=utf-8',
                  'Cache-Control': 'public, max-age=3600',
                  'Pragma': 'no-cache',
                  'Expires': '0',
                  'Vary': 'User-Agent',
                  'X-Content-Type-Options': 'nosniff',
                  'X-Manus-No-Scraper-Param': 'true',
                  'X-SSR-Rendered': 'true',
                  'Link': `<${canonicalUrl}>; rel="canonical"`
                });
                res.send(cleanHtml);
                return;
              }
            }
          } catch (error) {
            console.error("[SSR] Error fetching article:", error);
            // Continue to next middleware if there's an error
          }
        } else {
          console.log('[SSR] Not a blog URL, path:', path);
        }
      } else {
        console.log('[SSR] Not a social media crawler');
      }
      
      next();
    });
    
    // OAuth callback under /api/oauth/callback
    registerOAuthRoutes(app);
    // Chat API with streaming and tool calling
    registerChatRoutes(app);
    // Product management API
    app.use("/api/products", productsRouter);
    // Orders API
    app.use("/api/orders", ordersRouter);
    // Consultations API
    app.use("/api/consultations", consultationsRouter);
  // Blog API
    app.use("/api/blog", blogRouter);
    // Blog subscription API
    app.use("/api/subscription", subscriptionRouter);
    // File upload API
    app.use("/api", fileUploadRouter);
    // tRPC API
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
    // development mode uses Vite, production mode uses static files
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      // Production: Serve static files from dist
      // Explicit middleware for /blog/* and /share/* to serve generated HTML files
      app.use("/blog", express.static("dist/blog"));
      app.use("/share", express.static("dist/share"));
      
      // Then serve all other static files
      app.use(express.static("dist"));
      
      // Fallback to index.html for SPA - handles all other routes
      app.use("*", (req, res) => {
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.sendFile("dist/index.html");
      });
    }

    const preferredPort = parseInt(process.env.PORT || "3000");
    const port = await findAvailablePort(preferredPort);

    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }

    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }

startServer().catch(console.error);
