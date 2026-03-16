const fs = require("fs");

const siteUrl = "https://aditya-cmd-max.github.io/marina";

const articles = JSON.parse(fs.readFileSync("articlesmarina.json"));

let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>Reverbit Marina</title>
<link>${siteUrl}</link>
<description>Technology News, AI Insights and Software Engineering</description>
<language>en-us</language>
`;

articles.forEach(article => {
  rss += `
  <item>
  <title>${article.title}</title>
  <link>${siteUrl}/articles/${article.slug}.html</link>
  <description>${article.description}</description>
  <pubDate>${new Date(article.date).toUTCString()}</pubDate>
  <guid>${siteUrl}/articles/${article.slug}.html</guid>
  </item>
  `;
});

rss += `
</channel>
</rss>
`;

fs.writeFileSync("rss.xml", rss);

console.log("RSS feed generated!");
