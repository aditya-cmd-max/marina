async function generateRSS() {
  const siteUrl = "https://aditya-cmd-max.github.io/marina";

  const res = await fetch("/marina/articlesmarina.json");
  const articles = await res.json();

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

  document.body.textContent = rss;
}

generateRSS();
