const fs = require('fs');
const articles = require('./articlesmarina.json');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// Homepage
sitemap += `
<url>
  <loc>https://marina.reverbit.in/</loc>
</url>`;

// Articles
articles.forEach(article => {
  sitemap += `
  <url>
    <loc>${article.link}</loc>
  </url>`;
});

sitemap += `
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);

console.log("Sitemap generated!");
