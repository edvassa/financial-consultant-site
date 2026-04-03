import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { injectBlogMetaTags } from "./blogSSR";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    const userAgent = req.get('user-agent') || '';
    const host = req.get('host') || '';
    console.log('[SSR] Processing URL:', url, '| Host:', host, '| UA:', userAgent.substring(0, 50));

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      // Check if this is a blog article request and inject dynamic OG tags
      const blogMatch = url.match(/^\/blog\/([a-zA-Z0-9\-]+)/);
      if (blogMatch) {
        const slug = blogMatch[1];
        console.log('[SSR] Processing blog article:', slug);
        
        // Detect social media crawlers
        const userAgent = req.get('user-agent') || '';
        const isSocialMediaCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|pinterest|slack|discord|opengraph|curl|wget/i.test(userAgent);
        
        console.log('[SSR] User-Agent:', userAgent);
        console.log('[SSR] Is social media crawler:', isSocialMediaCrawler);
        
        // Disable caching for blog pages so social media crawlers get fresh meta tags
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate, public, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
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
              console.log('[SSR] Found article:', article.title);
              const articleData = {
                title: article.seoTitle || article.title,
                description: article.seoDescription || article.excerpt || article.content.substring(0, 160),
                image: article.imageUrl,
                url: `https://${req.get('host')}/blog/${article.slug}`,
                keywords: article.seoKeywords || '',
              };
              console.log('[SSR] Article data:', { title: articleData.title, image: articleData.image });
              template = injectBlogMetaTags(template, articleData);
              
              // If this is a social media crawler, return preview HTML directly without React
              if (isSocialMediaCrawler) {
                console.log('[SSR] Returning preview HTML for social media crawler');
                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
                return;
              }
            } else {
              console.log('[SSR] Article not found for slug:', slug);
            }
          }
        } catch (error) {
          console.error("Error fetching article for SSR:", error);
          // Continue without article data - client-side will handle it
        }
      }

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
