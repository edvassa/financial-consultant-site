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

function createMinimalPreviewHtml(articleData: any): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(articleData.title)}</title>
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="${escapeHtml(articleData.description)}" />
  <meta name="keywords" content="${escapeHtml(articleData.keywords)}" />
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(articleData.title)}" />
  <meta property="og:description" content="${escapeHtml(articleData.description)}" />
  <meta property="og:url" content="${escapeHtml(articleData.url)}" />
  <meta property="og:site_name" content="FinDirector" />
  <meta property="og:locale" content="ru_RU" />
  ${articleData.image ? `<meta property="og:image" content="${escapeHtml(articleData.image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />` : ''}
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(articleData.title)}" />
  <meta name="twitter:description" content="${escapeHtml(articleData.description)}" />
  ${articleData.image ? `<meta name="twitter:image" content="${escapeHtml(articleData.image)}" />` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(articleData.url)}" />
</head>
<body>
  <p>Redirecting to article...</p>
  <script>
    // Redirect to actual article page after crawlers have read the meta tags
    window.location.href = '${escapeHtml(articleData.url)}';
  </script>
</body>
</html>`;
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
      // Match any slug including spaces and special characters (URL-encoded)
      const blogMatch = url.match(/^\/blog\/([^/?]+)/);
      if (blogMatch) {
        let slug = blogMatch[1];
        // Decode URL-encoded slug (e.g., theoryof%20games -> theoryof games)
        slug = decodeURIComponent(slug);
        console.log('[SSR] Processing blog article:', slug);
        
        // Detect social media crawlers
        const isSocialMediaCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|pinterest|slack|discord|opengraph|curl|wget/i.test(userAgent);
        
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
              // Get the correct domain - prefer X-Forwarded-Host (from proxy) over Host header
              const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
              const protocol = req.get('x-forwarded-proto') || 'https';
              
              const articleData = {
                title: article.seoTitle || article.title,
                description: article.seoDescription || article.excerpt || article.content.substring(0, 160),
                image: article.imageUrl,
                url: `${protocol}://${host}/blog/${article.slug}`,
                keywords: article.seoKeywords || '',
              };
              console.log('[SSR] Article data:', { title: articleData.title, image: articleData.image });
              
              // If this is a social media crawler, return minimal preview HTML without React
              if (isSocialMediaCrawler) {
                console.log('[SSR] Returning minimal preview HTML for social media crawler');
                const minimalHtml = createMinimalPreviewHtml(articleData);
                res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(minimalHtml);
                return;
              }
              
              // For normal users, inject tags into full React app
              template = injectBlogMetaTags(template, articleData);
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
