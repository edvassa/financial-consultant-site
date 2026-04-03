import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import productsRouter from "../routes/products";
import ordersRouter from "../routes/orders";
import consultationsRouter from "../routes/consultations";
import blogRouter from "../routes/blog";
import subscriptionRouter from "../routes/subscription";
import fileUploadRouter from "../routes/fileUpload";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
  
  // SSR middleware for blog articles when accessed by social media crawlers
  app.use(async (req, res, next) => {
    const userAgent = req.get('user-agent') || '';
    const url = req.originalUrl;
    
    // Check if this is a blog article request from a social media crawler
    if (isSocialMediaCrawler(userAgent)) {
      const blogMatch = url.match(/^\/blog\/([a-zA-Z0-9\-]+)/);
      
      if (blogMatch) {
        const slug = blogMatch[1];
        
        try {
          const db = await getDb();
          if (db) {
            const articles = await db
              .select()
              .from(blogArticles)
              .where(eq(blogArticles.slug, slug))
              .limit(1);
            
            if (articles.length > 0) {
              const article = articles[0];
              const title = article.seoTitle || article.title;
              const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
              const image = article.imageUrl || '';
              const articleUrl = `https://${req.get('host')}/blog/${article.slug}`;
              const keywords = article.seoKeywords || '';
              
              // Helper to escape HTML
              const escapeHtml = (text: string): string => {
                const map: { [key: string]: string } = {
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  '"': '&quot;',
                  "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, (char) => map[char]);
              };
              
              // Return HTML with OG tags for social media crawlers
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
  <meta property="og:url" content="${escapeHtml(articleUrl)}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  ${image ? `<meta property="og:image:width" content="1200" />` : ''}
  ${image ? `<meta property="og:image:height" content="630" />` : ''}
  <meta property="article:published_time" content="${new Date(article.createdAt || Date.now()).toISOString()}" />
  <meta property="article:author" content="Елена Цуркан" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  
  <!-- Redirect to actual article page -->
  <script>window.location.href = '${escapeHtml(articleUrl)}';</script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;
              
              res.set('Content-Type', 'text/html; charset=utf-8');
              res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
              return res.send(html);
            }
          }
        } catch (error) {
          console.error("[SSR] Error fetching article for social media crawler:", error);
          // Continue to next middleware if error
        }
      }
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
    serveStatic(app);
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
