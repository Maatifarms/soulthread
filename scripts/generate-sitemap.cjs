const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://soulthread.in';
const PROJECT_ID = 'soulthread-15a72';

const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/explore', priority: '0.9', changefreq: 'daily' },
    { path: '/series', priority: '0.9', changefreq: 'weekly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/crisis', priority: '0.8', changefreq: 'weekly' },
    { path: '/care', priority: '0.8', changefreq: 'weekly' },
    { path: '/groups', priority: '0.7', changefreq: 'weekly' },
    { path: '/hyperfocus-series', priority: '0.9', changefreq: 'weekly' },
    { path: '/never-finished-series', priority: '0.9', changefreq: 'weekly' },
    { path: '/ego-id-series', priority: '0.9', changefreq: 'weekly' },
    { path: '/prompt-engineering-series', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { path: '/terms', priority: '0.5', changefreq: 'monthly' },
];

async function fetchDynamicPosts() {
    return new Promise((resolve) => {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/posts?pageSize=1000`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.documents) return resolve([]);
                    
                    const postRoutes = json.documents.map(doc => {
                        const id = doc.name.split('/').pop();
                        return { path: `/post/${id}`, priority: '0.6', changefreq: 'monthly' };
                    });
                    resolve(postRoutes);
                } catch (e) {
                    console.error('Failed to parse dynamic posts:', e);
                    resolve([]);
                }
            });
        }).on('error', (e) => {
            console.error('Error fetching dynamic posts:', e);
            resolve([]);
        });
    });
}

async function generateSitemap() {
    const dynamicRoutes = await fetchDynamicPosts();
    const allRoutes = [...staticRoutes, ...dynamicRoutes];

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    const publicDir = path.join(__dirname, '..', 'public');
    
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, sitemapContent);
    console.log(`✅ Sitemap generated at ${outputPath} with ${dynamicRoutes.length} dynamic stories.`);
}

generateSitemap();
