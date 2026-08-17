const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://soulthread.in';
const PROJECT_ID = 'soulthread-15a72';

// Only real, public, indexable routes from src/app-user/App.jsx. This list
// previously included 9 routes (/explore, /series, /crisis, /care, /groups,
// /hyperfocus-series, /never-finished-series, /ego-id-series,
// /prompt-engineering-series) that were never registered anywhere — Google
// was being told to crawl and index pages that 404 to NotFound, wasted
// crawl budget and a real soft-404 risk. Auth-gated routes (/journal,
// /sessions, /admin, etc.) are intentionally excluded too — nothing for an
// anonymous crawler to index there.
const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/community', priority: '0.8', changefreq: 'daily' },
    { path: '/experts', priority: '0.9', changefreq: 'weekly' },
    { path: '/join-as-expert', priority: '0.6', changefreq: 'monthly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { path: '/terms', priority: '0.5', changefreq: 'monthly' },
];

async function fetchDynamicGuides() {
    return new Promise((resolve) => {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/guides?pageSize=1000`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.documents) return resolve([]);
                    
                    const guideRoutes = json.documents.map(doc => {
                        const id = doc.name.split('/').pop();
                        return { path: `/experts/${id}`, priority: '0.8', changefreq: 'weekly' };
                    });
                    resolve(guideRoutes);
                } catch (e) {
                    console.error('Failed to parse dynamic guides:', e);
                    resolve([]);
                }
            });
        }).on('error', (e) => {
            console.error('Error fetching dynamic guides:', e);
            resolve([]);
        });
    });
}

async function generateSitemap() {
    const dynamicRoutes = await fetchDynamicGuides();
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
    console.log(`✅ Sitemap generated at ${outputPath} with ${dynamicRoutes.length} dynamic expert profiles.`);
}

generateSitemap();
