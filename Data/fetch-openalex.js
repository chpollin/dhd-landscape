/**
 * Fetch DH institutions from OpenAlex API
 * Topic T12377 = "Digital Humanities and Scholarship"
 * Run: node Data/fetch-openalex.js
 * Output: Data/openalex-institutions.json
 */

const fs = require('fs');
const path = require('path');

const TOPIC_ID = 'T12377';
const COUNTRIES = ['DE', 'AT', 'CH'];
const OUTPUT = path.join(__dirname, 'openalex-institutions.json');

async function fetchInstitutions(countryCode) {
    const url = `https://api.openalex.org/works?filter=topics.id:${TOPIC_ID},authorships.institutions.country_code:${countryCode}&group_by=authorships.institutions.id&per_page=100&mailto=christopher.pollin@uni-graz.at`;

    console.log(`Fetching ${countryCode}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);
    const data = await res.json();

    return data.group_by.map(g => ({
        openalex_id: g.key,
        display_name: g.key_display_name,
        count: g.count,
        country: countryCode
    }));
}

async function enrichWithDetails(institutions) {
    const enriched = [];

    for (let i = 0; i < institutions.length; i++) {
        const inst = institutions[i];
        // openalex_id is like "https://openalex.org/I123456" — extract the ID
        const id = inst.openalex_id.replace('https://openalex.org/', '');
        const url = `https://api.openalex.org/institutions/${id}?mailto=christopher.pollin@uni-graz.at`;

        if (i % 20 === 0) console.log(`  Enriching ${i + 1}/${institutions.length}...`);

        try {
            const res = await fetch(url);
            if (!res.ok) { continue; }
            const result = await res.json();

            enriched.push({
                openalex_id: result.id,
                name: result.display_name,
                country: inst.country,
                city: result.geo?.city || null,
                coordinates: result.geo ? [result.geo.longitude, result.geo.latitude] : null,
                ror_id: result.ids?.ror || null,
                wikidata_id: result.ids?.wikidata ? result.ids.wikidata.replace('https://www.wikidata.org/entity/', '') : null,
                type: result.type || null,
                dh_publication_count: inst.count,
                homepage_url: result.homepage_url || null
            });
        } catch (e) { /* skip */ }

        // Rate limiting — 10 req/sec max
        if (i % 10 === 9) await new Promise(r => setTimeout(r, 1100));
    }

    return enriched;
}

async function main() {
    try {
        // Fetch all countries
        let allInstitutions = [];
        for (const country of COUNTRIES) {
            const institutions = await fetchInstitutions(country);
            allInstitutions = allInstitutions.concat(institutions);
            console.log(`  ${country}: ${institutions.length} institutions`);
            await new Promise(r => setTimeout(r, 200));
        }

        // Filter: at least 3 DH publications
        const filtered = allInstitutions.filter(i => i.count >= 3);
        console.log(`\nTotal: ${allInstitutions.length} institutions, ${filtered.length} with 3+ DH publications`);

        // Enrich with details (coordinates, ROR, Wikidata)
        const enriched = await enrichWithDetails(filtered);

        // Sort by publication count
        enriched.sort((a, b) => b.dh_publication_count - a.dh_publication_count);

        fs.writeFileSync(OUTPUT, JSON.stringify(enriched, null, 2), 'utf8');
        console.log(`\nSaved ${enriched.length} institutions to ${OUTPUT}`);
        console.log('Top 10:');
        enriched.slice(0, 10).forEach(i =>
            console.log(`  ${i.name} (${i.city}, ${i.country}): ${i.dh_publication_count} DH publications`)
        );
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();
