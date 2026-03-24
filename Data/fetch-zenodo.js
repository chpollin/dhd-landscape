/**
 * Fetch DHd community records from Zenodo
 * Run: node Data/fetch-zenodo.js
 * Output: Data/zenodo-records.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'zenodo-records.json');

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
        const PAGE_SIZE = 25;
        let allHits = [];
        let page = 1;
        let totalRecords = null;

        console.log('[Zenodo] Fetching DHd community records...');

        while (true) {
            const url = `https://zenodo.org/api/records?communities=dhd&size=${PAGE_SIZE}&sort=mostrecent&page=${page}`;
            console.log(`[Zenodo] Fetching page ${page}...`);

            const raw = await httpsGet(url, {
                'Accept': 'application/json',
                'User-Agent': 'DHdLandscape/1.0'
            });

            const data = JSON.parse(raw);
            const hits = data.hits?.hits || [];

            if (totalRecords === null) {
                totalRecords = data.hits?.total || 0;
                console.log(`[Zenodo] Total available: ${totalRecords}`);
            }

            if (hits.length === 0) break;
            allHits = allHits.concat(hits);

            if (allHits.length >= totalRecords) break;
            page++;
            // Rate limit between paginated requests
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`[Zenodo] Got ${allHits.length} records`);

        const records = allHits.map(hit => {
            const m = hit.metadata || {};
            const creators = (m.creators || []).map(c => ({
                name: c.name || null,
                affiliation: c.affiliation || null
            }));
            return {
                title: m.title || 'Untitled',
                doi: m.doi || hit.doi || null,
                year: m.publication_date ? parseInt(m.publication_date.substring(0, 4)) : null,
                resource_type: m.resource_type?.type || m.resource_type?.title || null,
                creators
            };
        });

        fs.writeFileSync(OUTPUT, JSON.stringify(records, null, 2), 'utf8');
        console.log(`[Zenodo] Saved to zenodo-records.json`);
    } catch (err) {
        console.error(`[Zenodo] Error: ${err.message}`);
        fs.writeFileSync(OUTPUT, JSON.stringify([], null, 2), 'utf8');
        console.log(`[Zenodo] Saved empty array to zenodo-records.json`);
    }
}

main();
