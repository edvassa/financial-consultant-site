import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Fetch all blog articles from the database
async function generateBlogPages() {
  try {
    const response = await fetch('http://localhost:3000/api/blog/');
    const articles = await response.json();
    
    const publicDir = path.join(__dirname, 'client/public/blog');
    
    // Create blog directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Generate HTML file for each article
    for (const article of articles) {
      const slug = article.slug;
      const title = article.seoTitle || article.title;
      const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
      const image = article.imageUrl || '';
      const url = `https://finconsult-turcanelena.manus.space/blog/${slug}`;
      
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
  <meta property="fb:app_id" content="1234567890" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(url)}" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  
  <!-- Redirect to main app -->
  <script>
    window.location.href = '${escapeHtml(url)}';
  </script>
</head>
<body>
  <p>Redirecting to article...</p>
</body>
</html>`;
      
      const filePath = path.join(publicDir, `${slug}.html`);
      fs.writeFileSync(filePath, html);
      console.log(`Generated: ${filePath}`);
    }
    
    console.log('✅ All blog pages generated successfully!');
  } catch (error) {
    console.error('❌ Error generating blog pages:', error);
    process.exit(1);
  }
}

generateBlogPages();
