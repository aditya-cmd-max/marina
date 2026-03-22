const fs = require('fs');

const articles = require('./articlesmarina.json');
const categories = require('./categoriesmarina.json');
const tags = require('./tagsmarina.json');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// ✅ STATIC PAGES
sitemap += `
<url>
  <loc>https://marina.reverbit.in/</loc>
</url>

<url>
  <loc>https://marina.reverbit.in/articles/</loc>
</url>

<url>
  <loc>https://marina.reverbit.in/articles/categories/</loc>
</url>

<url>
  <loc>https://marina.reverbit.in/tags/</loc>
</url>

<url>
  <loc>https://marina.reverbit.in/profiles/adityajha</loc>
</url>
`;

// ✅ ARTICLES (perfect - already correct)
articles.forEach(article => {
  sitemap += `
<url>
  <loc>${article.link}</loc>
</url>`;
});

// ✅ CATEGORIES (use direct links)
categories.forEach(cat => {
  sitemap += `
<url>
  <loc>${cat.link}</loc>
</url>`;
});

// ✅ TAGS (build links manually)
tags.forEach(tag => {
  sitemap += `
<url>
  <loc>https://marina.reverbit.in/articles/tags/${tag.slug}/</loc>
</url>`;
});

// ✅ CLOSE
sitemap += `
</urlset>`;

// ✅ SAVE
fs.writeFileSync('sitemap.xml', sitemap);

console.log("🔥 Sitemap generated successfully!");
