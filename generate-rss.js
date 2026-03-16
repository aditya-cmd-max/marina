const fs = require("fs");

const siteUrl = "https://aditya-cmd-max.github.io/marina";

// read your JSON file
const articles = JSON.parse(fs.readFileSync("articlesmarina.json", "utf8"));

let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Reverbit Marina</title>
<link>${siteUrl}</link>
<description>Technology News, AI Insights and Software Engineering</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

// create RSS items
articles.forEach(article => {
  rss += `
<item>
<title>${article.title}</title>
<link>${article.link}</link>
<description>${article.description}</description>
<pubDate>${new Date(article.date).toUTCString()}</pubDate>
<guid>${article.link}</guid>
</item>
`;
});

rss += `
</channel>
</rss>
`;

// create rss.xml file
fs.writeFileSync("rss.xml", rss);

console.log("RSS feed generated successfully!");
