const fs = require('fs');

const articles = require('./articlesmarina.json');
const categories = require('./categoriesmarina.json');
// ❌ REMOVE TAGS (important)
// const tags = require('./tagsmarina.json');

const BASE_URL = "https://marina.reverbit.in";

// helper to format date
const getDate = () => new Date().toISOString().split('T')[0];

// helper to clean URLs (important)
const cleanUrl = (url) => {
  if (!url) return null;
  return url.endsWith('/') ? url : url + '/';
};

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

// ================= STATIC PAGES =================
const staticPages = [
  { url: `${BASE_URL}/`, priority: "1.0" },
  { url: `${BASE_URL}/articles/`, priority: "0.9" },
  { url: `${BASE_URL}/articles/categories/`, priority: "0.7" },
  { url: `${BASE_URL}/profiles/adityajha/`, priority: "0.6" }
];

staticPages.forEach(page => {
  sitemap += `
<url>
  <loc>${cleanUrl(page.url)}</loc>
  <lastmod>${getDate()}</lastmod>
  <changefreq>daily</changefreq>
  <priority>${page.priority}</priority>
</url>`;
});

// ================= ARTICLES =================
articles.forEach(article => {
  const url = cleanUrl(article.link);
  if (!url) return;

  sitemap += `
<url>
  <loc>${url}</loc>
  <lastmod>${getDate()}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>`;
});

// ================= CATEGORIES (LIMITED) =================
categories.forEach(cat => {
  const url = cleanUrl(cat.link);
  if (!url) return;

  sitemap += `
<url>
  <loc>${url}</loc>
  <lastmod>${getDate()}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.6</priority>
</url>`;
});

// ================= CLOSE =================
sitemap += `
</urlset>`;

// ================= SAVE =================
fs.writeFileSync('sitemap.xml', sitemap);

console.log("Copyright, Aditya Jha");
