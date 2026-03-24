/**
 * Fetch DH Course Registry programmes/courses
 * Filter to DE/AT/CH countries
 * Run: node Data/fetch-dhcr.js
 * Output: Data/dhcr-programmes.json
 * NOTE: API may have changed; tries v1, then v2, then saves empty array
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'dhcr-programmes.json');

function httpsGet(url, headers) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                httpsGet(res.headers.location, headers).then(resolve).catch(reject);
                return;
            }
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
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
    });
}

function normalizeCountry(c) {
    if (!c) return null;
    const map = {
        'de': 'DE', 'germany': 'DE', 'deutschland': 'DE',
        'at': 'AT', 'austria': 'AT', 'österreich': 'AT',
        'ch': 'CH', 'switzerland': 'CH', 'schweiz': 'CH'
    };
    return map[c.toString().trim().toLowerCase()] || null;
}

function extractCourses(data) {
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.courses && Array.isArray(data.courses)) return data.courses;
    if (data.results && Array.isArray(data.results)) return data.results;
    for (const key of Object.keys(data)) {
        if (Array.isArray(data[key]) && data[key].length > 0) return data[key];
    }
    return [];
}

async function tryEndpoint(url) {
    console.log(`[DHCR] Trying ${url}...`);
    const raw = await httpsGet(url, {
        'Accept': 'application/json',
        'User-Agent': 'DHdLandscape/1.0'
    });
    return JSON.parse(raw);
}

async function main() {
    try {
        let data = null;

        // Try v1 first
        try {
            data = await tryEndpoint('https://dhcr.clarin-dariah.eu/api/v1/courses');
        } catch (e1) {
            console.log(`[DHCR] v1 failed: ${e1.message}`);
            // Try v2
            try {
                data = await tryEndpoint('https://dhcr.clarin-dariah.eu/api/v2/courses');
            } catch (e2) {
                console.log(`[DHCR] v2 failed: ${e2.message}`);
                throw new Error('Both v1 and v2 endpoints failed');
            }
        }

        const courses = extractCourses(data);
        console.log(`[DHCR] Got ${courses.length} total courses`);

        const filtered = [];
        for (const course of courses) {
            const country = course.country?.name || course.country?.code || course.country ||
                            course.institution?.country?.name || course.institution?.country?.code ||
                            course.institution?.country || '';
            const normalized = normalizeCountry(country.toString());

            if (normalized) {
                filtered.push({
                    name: course.name || course.title || course.course_name || 'Unknown',
                    institution: course.institution?.name || course.institution_name ||
                                 (typeof course.institution === 'string' ? course.institution : null),
                    country: normalized,
                    type_name: course.type?.name || course.type_name || course.type || null,
                    url: course.url || course.website || course.info_url || null
                });
            }
        }

        console.log(`[DHCR] Got ${filtered.length} records in DE/AT/CH`);

        fs.writeFileSync(OUTPUT, JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`[DHCR] Saved to dhcr-programmes.json`);
    } catch (err) {
        console.error(`[DHCR] Error: ${err.message}`);
        // Save empty array with comment
        const output = [];
        fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');
        console.log(`[DHCR] Saved empty array to dhcr-programmes.json (API unavailable)`);
    }
}

main();
