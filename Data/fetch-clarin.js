/**
 * Fetch CLARIN centres from the CLARIN Centre Registry API
 * Filter to DE/AT/CH/LU countries via consortium country codes
 * Run: node Data/fetch-clarin.js
 * Output: Data/clarin-centres.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'clarin-centres.json');

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

const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'DHdLandscape/1.0'
};

async function main() {
    try {
        // First fetch consortiums to build pk -> country_code mapping
        console.log('[CLARIN] Fetching consortium data...');
        const consRaw = await httpsGet('https://centres.clarin.eu/api/model/Consortium', HEADERS);
        const consortiums = JSON.parse(consRaw);
        const consortiumCountry = {};
        for (const c of consortiums) {
            consortiumCountry[c.pk] = c.fields?.country_code || null;
        }

        // Now fetch centres
        console.log('[CLARIN] Fetching centres...');
        const raw = await httpsGet('https://centres.clarin.eu/api/model/Centre', HEADERS);
        const centres = JSON.parse(raw);

        console.log(`[CLARIN] Got ${centres.length} total centres`);

        const ALLOWED = ['DE', 'AT', 'CH', 'LU'];

        // Also fetch CentreType for type names
        let typeNames = {};
        try {
            const typeRaw = await httpsGet('https://centres.clarin.eu/api/model/CentreType', HEADERS);
            const types = JSON.parse(typeRaw);
            for (const t of types) {
                typeNames[t.pk] = t.fields?.type || t.fields?.name || null;
            }
        } catch (e) {
            console.log('[CLARIN] Could not fetch CentreType, using type_status instead');
        }

        const filtered = [];
        for (const centre of centres) {
            const f = centre.fields || {};
            const countryCode = consortiumCountry[f.consortium] || null;

            if (countryCode && ALLOWED.includes(countryCode)) {
                // Resolve type names from type array (pks)
                const centreTypes = (f.type || []).map(pk => typeNames[pk] || null).filter(Boolean);

                filtered.push({
                    name: f.name || 'Unknown',
                    country_code: countryCode,
                    website: f.website_url || null,
                    centre_type: centreTypes.length > 0 ? centreTypes.join(', ') : (f.type_status || null)
                });
            }
        }

        console.log(`[CLARIN] Got ${filtered.length} records in DE/AT/CH/LU`);

        fs.writeFileSync(OUTPUT, JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`[CLARIN] Saved to clarin-centres.json`);
    } catch (err) {
        console.error(`[CLARIN] Error: ${err.message}`);
        fs.writeFileSync(OUTPUT, JSON.stringify([], null, 2), 'utf8');
        console.log(`[CLARIN] Saved empty array to clarin-centres.json`);
    }
}

main();
