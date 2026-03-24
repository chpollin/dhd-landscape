/**
 * Fetch university data from Wikidata SPARQL endpoint
 * Universities in DE, AT, CH, LU with optional ROR, GND, founding date
 * Run: node Data/fetch-wikidata.js
 * Output: Data/wikidata-enrichment.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'wikidata-enrichment.json');

const SPARQL = `SELECT ?item ?itemLabel ?rorId ?founded ?gndId ?country WHERE {
  ?item wdt:P31/wdt:P279* wd:Q3918 .
  ?item wdt:P17 ?countryItem .
  VALUES ?countryItem { wd:Q183 wd:Q40 wd:Q39 wd:Q32 }
  ?countryItem wdt:P297 ?country .
  OPTIONAL { ?item wdt:P6782 ?rorId }
  OPTIONAL { ?item wdt:P571 ?founded }
  OPTIONAL { ?item wdt:P227 ?gndId }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" }
}`;

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
        const encoded = encodeURIComponent(SPARQL);
        const url = `https://query.wikidata.org/sparql?query=${encoded}`;
        console.log('[Wikidata] Fetching SPARQL results...');

        const raw = await httpsGet(url, {
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'DHdLandscape/1.0'
        });

        const json = JSON.parse(raw);
        const bindings = json.results.bindings;

        const records = bindings.map(b => ({
            name: b.itemLabel ? b.itemLabel.value : null,
            wikidataId: b.item ? b.item.value.replace('http://www.wikidata.org/entity/', '') : null,
            rorId: b.rorId ? b.rorId.value : null,
            founded: b.founded ? new Date(b.founded.value).getFullYear() : null,
            gndId: b.gndId ? b.gndId.value : null,
            country: b.country ? b.country.value : null
        }));

        // Deduplicate by wikidataId (multiple rows for same entity with different optional values)
        const seen = new Map();
        for (const r of records) {
            if (!seen.has(r.wikidataId)) {
                seen.set(r.wikidataId, r);
            } else {
                const existing = seen.get(r.wikidataId);
                if (!existing.rorId && r.rorId) existing.rorId = r.rorId;
                if (!existing.founded && r.founded) existing.founded = r.founded;
                if (!existing.gndId && r.gndId) existing.gndId = r.gndId;
            }
        }

        const deduped = Array.from(seen.values());
        console.log(`[Wikidata] Got ${deduped.length} records (from ${bindings.length} raw bindings)`);

        fs.writeFileSync(OUTPUT, JSON.stringify(deduped, null, 2), 'utf8');
        console.log(`[Wikidata] Saved to wikidata-enrichment.json`);
    } catch (err) {
        console.error(`[Wikidata] Error: ${err.message}`);
        fs.writeFileSync(OUTPUT, JSON.stringify([], null, 2), 'utf8');
        console.log(`[Wikidata] Saved empty array to wikidata-enrichment.json`);
    }
}

main();
