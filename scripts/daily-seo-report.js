import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with your Google Cloud Service Account JSON file name
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');
// The exact URL property you verify in Search Console (include trailing slash if needed)
const SITE_URL = 'https://soulthread.in/';

async function getDailySeoReport() {
    try {
        if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
            console.error(`❌ Error: Service account file not found at ${SERVICE_ACCOUNT_FILE}`);
            console.error('1. Create a service account in Google Cloud Platform.');
            console.error('2. Download the JSON key file and save it as "gsc-service-account.json" in the scripts folder.');
            console.error('3. Add the service account email as a "Restricted user" or "Full user" in Google Search Console.');
            process.exit(1);
        }

        console.log('🔄 Authenticating with Google Search Console API...');
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const webmasters = google.webmasters({ version: 'v3', auth });

        // Search Console data usually has a 2-day delay
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() - 2); 
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30); // Pulling data for the past 30 days up to the latest available day

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        console.log(`📊 Fetching SEO data for ${SITE_URL} (${startStr} to ${endStr})`);

        const response = await webmasters.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startStr,
                endDate: endStr,
                dimensions: ['date', 'query'],
                rowLimit: 100,
            },
        });

        const rawData = response.data.rows || [];
        
        // Summarize stats
        let totalClicks = 0;
        let totalImpressions = 0;
        let positionSum = 0;
        
        rawData.forEach(row => {
            totalClicks += row.clicks;
            totalImpressions += row.impressions;
            positionSum += row.position * row.impressions; // weighted position
        });

        const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
        const avgPosition = totalImpressions > 0 ? (positionSum / totalImpressions).toFixed(1) : 0;

        const reportOutput = [
            '=======================================',
            `📈 DAILY SEO REPORT for soulthread.in`,
            '=======================================',
            `📅 Date Range: ${startStr} - ${endStr}`,
            `🖱️  Total Clicks: ${totalClicks}`,
            `👁️  Total Impressions: ${totalImpressions}`,
            `🎯 Average CTR: ${avgCtr}%`,
            `🔎 Average Position: ${avgPosition}`,
            '\n🏆 Top Performing Queries:'
        ];

        // Aggregate by query
        const queryMap = new Map();
        rawData.forEach(row => {
            const query = row.keys[1]; // index 1 is 'query', index 0 is 'date'
            if (!queryMap.has(query)) {
                queryMap.set(query, { clicks: 0, impressions: 0 });
            }
            queryMap.get(query).clicks += row.clicks;
            queryMap.get(query).impressions += row.impressions;
        });

        const sortedQueries = Array.from(queryMap.entries())
            .sort((a, b) => b[1].clicks - a[1].clicks) // sort by clicks
            .slice(0, 5); // top 5 queries

        sortedQueries.forEach(([q, stats], index) => {
            reportOutput.push(`  ${index + 1}. "${q}" - ${stats.clicks} clicks, ${stats.impressions} impressions`);
        });

        reportOutput.push('=======================================');
        
        const finalReport = reportOutput.join('\n');
        console.log('\n' + finalReport + '\n');
        
        // Send to Discord Webhook
        const webhookUrl = process.env.DISCORD_SEO_WEBHOOK_URL;
        if (webhookUrl) {
            console.log('🔗 Sending report to Discord...');
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: `**Google Search Console Update**\n\`\`\`text\n${finalReport}\n\`\`\`` 
                })
            });
            if (response.ok) {
                console.log('✅ Successfully sent to Discord!');
            } else {
                console.error(`❌ Failed to send to Discord. Status: ${response.status}`);
            }
        } else {
            console.log('ℹ️ No DISCORD_SEO_WEBHOOK_URL found in .env. Skipping Discord notification.');
        }

    } catch (error) {
        console.error('❌ Failed to retrieve SEO data. Make sure the Service Account email is added to your Search Console properties.');
        console.error(error.message);
    }
}

getDailySeoReport();
