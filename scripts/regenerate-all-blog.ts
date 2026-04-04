import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb } from '../server/db';
import { blogArticles } from '../drizzle/schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to escape HTML
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate HTML for a blog article
function generateBlogHtml(article: any): string {
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
  const image = article.imageUrl || '';
  const domain = process.env.VITE_APP_DOMAIN || 'finconsult-turcanelena.manus.space';
  const url = `https://${domain}/blog/${article.slug}`;

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

async function regenerateAllBlogArticles() {
  try {
    console.log('🔄 Connecting to database...');
    
    const db = await getDb();
    if (!db) {
      console.error('❌ Database not available');
      process.exit(1);
    }
    
    // Get all articles
    const articles = await db.select().from(blogArticles);
    console.log(`📝 Found ${articles.length} articles in database`);

    let successCount = 0;
    let errorCount = 0;

    // Generate HTML for each article
    for (const article of articles) {
      try {
        const html = generateBlogHtml(article);
        
        // Create directory structure: dist/blog/[slug]/index.html
        const distBlogDir = path.join(__dirname, '../dist/blog', article.slug);
        if (!fs.existsSync(distBlogDir)) {
          fs.mkdirSync(distBlogDir, { recursive: true });
        }
        
        const filePath = path.join(distBlogDir, 'index.html');
        fs.writeFileSync(filePath, html);
        
        // Also create /share/[slug]/index.html
        const shareDir = path.join(__dirname, '../dist/share', article.slug);
        if (!fs.existsSync(shareDir)) {
          fs.mkdirSync(shareDir, { recursive: true });
        }
        
        const shareFilePath = path.join(shareDir, 'index.html');
        fs.writeFileSync(shareFilePath, html);
        
        console.log(`✅ Regenerated: ${article.slug}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error regenerating ${article.slug}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Regeneration complete! Success: ${successCount}, Errors: ${errorCount}`);
    
    // Verify files exist
    const blogDir = path.join(__dirname, '../dist/blog');
    if (fs.existsSync(blogDir)) {
      const blogFiles = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());
      console.log(`\n✅ Files in dist/blog/: ${blogFiles.length}`);
      blogFiles.forEach(f => console.log(`   - ${f}/index.html`));
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

regenerateAllBlogArticles();
