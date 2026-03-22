const fs = require('fs');

const articles = require('https://marina.reverbit.in/articlesmarina.json');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

sitemap += `
  <url>
    <loc>https://marina.reverbit.in/</loc>
  </url>`;

sitemap += `
  <url>
    <loc>https://marina.reverbit.in/articles/</loc>
  </url>`;

articles.forEach(article => {
  sitemap += `
  <url>
    <loc>https://marina.reverbit.in/articles/${article.slug}</loc>
  </url>`;
});

sitemap += `\n</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);
console.log("Sitemap generated!");
