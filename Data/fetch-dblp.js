/**
 * Fetch DHd publications from DBLP
 * Run: node Data/fetch-dblp.js
 * Output: Data/dblp-records.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'dblp-records.json');

function httpsGet(url, headers) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(60000, () => { req.destroy(); reject(new Error('Request timeout')); });
    });
}

async function main() {
    try {
        const url = 'https://dblp.org/search/publ/api?q=DHd&format=json&h=500';
        console.log('[DBLP] Fetching DHd publications...');

        const raw = await httpsGet(url, {
            'Accept': 'application/json',
            'User-Agent': 'DHdLandscape/1.0'
        });

        const data = JSON.parse(raw);
        const hits = data.result?.hits?.hit || [];
        const total = parseInt(data.result?.hits?.['@total'] || '0');

        console.log(`[DBLP] Got ${hits.length} records (total available: ${total})`);

        const records = hits.map(hit => {
            const info = hit.info || {};

            // Authors can be a single object or array
            let authors = [];
            if (info.authors?.author) {
                const authorData = info.authors.author;
                if (Array.isArray(authorData)) {
                    authors = authorData.map(a => typeof a === 'string' ? a : a.text || a['#text'] || a.name || '');
                } else {
                    authors = [typeof authorData === 'string' ? authorData : authorData.text || authorData['#text'] || authorData.name || ''];
                }
            }

            return {
                title: info.title || 'Untitled',
                year: info.year ? parseInt(info.year) : null,
                venue: info.venue || null,
                authors: authors.filter(a => a)
            };
        });

        // Sort by year descending
        records.sort((a, b) => (b.year || 0) - (a.year || 0));

        fs.writeFileSync(OUTPUT, JSON.stringify(records, null, 2), 'utf8');
        console.log(`[DBLP] Saved to dblp-records.json`);
    } catch (err) {
        console.error(`[DBLP] Error: ${err.message}`);
        fs.writeFileSync(OUTPUT, JSON.stringify([], null, 2), 'utf8');
        console.log(`[DBLP] Saved empty array to dblp-records.json`);
    }
}

main();
