#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

async function generateBlogHtml(article, domain) {
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
  const image = article.imageUrl || '';
  const url = `https://${domain}/blog/${encodeURIComponent(article.slug)}`;

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
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  ${image ? `<meta property="og:image:width" content="1200" />` : ''}
  ${image ? `<meta property="og:image:height" content="630" />` : ''}
  
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
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
</body>
</html>`;

  return html;
}

async function prerender() {
  try {
    console.log('🔄 Starting blog article prerender...');

    // Get database connection string from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    // Parse connection string
    const url = new URL(dbUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: url.searchParams.get('ssl') ? { rejectUnauthorized: false } : undefined,
    });

    // Fetch all blog articles
    const [articles] = await connection.execute('SELECT * FROM blogArticles');
    console.log(`📝 Found ${articles.length} articles to prerender`);

    const domain = process.env.VITE_APP_DOMAIN || 'finconsult-turcanelena.manus.space';
    let successCount = 0;
    let errorCount = 0;

    // Generate HTML for each article
    for (const article of articles || []) {
      try {
        const html = await generateBlogHtml(article, domain);
        
        // Create directory structure: dist/blog/[slug]/index.html
        const distBlogDir = path.join(__dirname, '../dist/blog', article.slug);
        if (!fs.existsSync(distBlogDir)) {
          fs.mkdirSync(distBlogDir, { recursive: true });
        }
        
        const filePath = path.join(distBlogDir, 'index.html');
        fs.writeFileSync(filePath, html);
        
        // Also create /share/[slug]/index.html (bypasses Manus proxy)
        const shareDir = path.join(__dirname, '../dist/share', article.slug);
        if (!fs.existsSync(shareDir)) {
          fs.mkdirSync(shareDir, { recursive: true });
        }
        
        const shareFilePath = path.join(shareDir, 'index.html');
        fs.writeFileSync(shareFilePath, html);
        console.log(`✅ Prerendered: ${article.slug} (blog + share)`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error prerendering ${article.slug}:`, error.message);
        errorCount++;
      }
    }

    await connection.end();

    console.log(`\n✅ Prerender complete! Success: ${successCount}, Errors: ${errorCount}`);
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Prerender failed:', error);
    process.exit(1);
  }
}

prerender();
