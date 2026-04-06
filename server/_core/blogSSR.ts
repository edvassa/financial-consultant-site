'use client';

import { type Express, type Request, type Response, type NextFunction } from "express";
import { getDb } from "../db";
import { blogArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SITE_URL } from "../../config.js";

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

export async function setupBlogSSR(app: Express) {
  // Middleware to inject dynamic OG tags for blog articles
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    
    // Check if this is a blog article request
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
            
            // Store article data in response locals so we can use it in the HTML template
            // Use hardcoded SITE_URL from config - never use req.get('host')
            res.locals.article = {
              title: article.seoTitle || article.title,
              description: article.seoDescription || article.excerpt || article.content.substring(0, 160),
              image: article.imageUrl,
              url: `${SITE_URL}/blog/${article.slug}`,
              keywords: article.seoKeywords || '',
            };
          }
        }
      } catch (error) {
        console.error("Error fetching article for SSR:", error);
        // Continue without article data - client-side will handle it
      }
    }
    
    next();
  });
}

export function injectBlogMetaTags(template: string, article?: any): string {
  if (!article) {
    console.log('[SSR] No article data provided');
    return template;
  }

  console.log('[SSR] Injecting tags for article:', article.title);
  
  let result = template;
  
  // Helper function to replace meta tags with flexible whitespace handling
  const replaceMetaTag = (html: string, property: string, value: string, isProperty: boolean = true): string => {
    const attr = isProperty ? 'property' : 'name';
    const escapedValue = escapeHtml(value);
    
    // Create pattern that matches the meta tag with flexible whitespace
    // This pattern handles: <meta property="og:title" content="..." /> or with newlines/spaces
    const pattern = new RegExp(
      `<meta\\s+${attr}\\s*=\\s*["\']${property}["\']\\s+content\\s*=\\s*["\'][^"']*["\']\\s*/?\\s*>`,
      'i'
    );
    
    if (pattern.test(html)) {
      console.log('[SSR] Found and replacing tag:', property);
      // Replace with the new value
      return html.replace(pattern, `<meta ${attr}="${property}" content="${escapedValue}" />`);
    }
    
    // Try alternate pattern with reversed attribute order
    const altPattern = new RegExp(
      `<meta\\s+content\\s*=\\s*["\'][^"']*["\']\\s+${attr}\\s*=\\s*["\']${property}["\']\\s*/?\\s*>`,
      'i'
    );
    
    if (altPattern.test(html)) {
      console.log('[SSR] Found and replacing tag (reversed order):', property);
      return html.replace(altPattern, `<meta ${attr}="${property}" content="${escapedValue}" />`);
    }
    
    console.log('[SSR] Tag not found for replacement:', property);
    return html;
  };
  
  // Replace OG tags
  result = replaceMetaTag(result, 'og:type', 'article', true);
  result = replaceMetaTag(result, 'og:title', article.title, true);
  result = replaceMetaTag(result, 'og:description', article.description, true);
  result = replaceMetaTag(result, 'og:url', article.url, true);
  
  if (article.image) {
    result = replaceMetaTag(result, 'og:image', article.image, true);
  }
  
  // Replace description meta tag
  result = replaceMetaTag(result, 'description', article.description, false);
  
  // Replace keywords meta tag
  if (article.keywords) {
    result = replaceMetaTag(result, 'keywords', article.keywords, false);
  }
  
  // Replace Twitter tags
  result = replaceMetaTag(result, 'twitter:title', article.title, false);
  result = replaceMetaTag(result, 'twitter:description', article.description, false);
  
  if (article.image) {
    result = replaceMetaTag(result, 'twitter:image', article.image, false);
  }
  
  console.log('[SSR] Meta tags injection complete');
  return result;
}
