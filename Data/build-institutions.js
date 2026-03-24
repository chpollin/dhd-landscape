/**
 * Aggregation script: Converts individual professorships into institution-level profiles.
 * Run with: node Data/build-institutions.js
 * Output: Data/institutions.json
 */

const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'dh-professorships.json'), 'utf8'));

// Group by university (normalize institution name to base university)
function getUniversityKey(entry) {
    // Extract base university name from detailed institution string
    const inst = entry.institution;
    const city = entry.city;

    // Map to canonical university names
    const mappings = [
        [/Universität Graz|Uni Graz/i, 'Universität Graz'],
        [/Universität Wien/i, 'Universität Wien'],
        [/Universität Klagenfurt/i, 'Universität Klagenfurt'],
        [/Universität für Weiterbildung Krems|Donau-Universität/i, 'Universität für Weiterbildung Krems'],
        [/Universität Zürich/i, 'Universität Zürich'],
        [/Universität Basel/i, 'Universität Basel'],
        [/Universität Bern/i, 'Universität Bern'],
        [/University of Luxembourg/i, 'University of Luxembourg'],
        [/HU Berlin|Humboldt/i, 'Humboldt-Universität zu Berlin'],
        [/FU Berlin|Freie Universität/i, 'Freie Universität Berlin'],
        [/TU Berlin/i, 'Technische Universität Berlin'],
        [/LMU München/i, 'LMU München'],
        [/TU Darmstadt/i, 'TU Darmstadt'],
        [/TU Chemnitz/i, 'TU Chemnitz'],
        [/RWTH Aachen/i, 'RWTH Aachen'],
        [/Universität Erlangen|FAU/i, 'FAU Erlangen-Nürnberg'],
        [/Universität zu Köln/i, 'Universität zu Köln'],
        [/TH Köln/i, 'TH Köln'],
        [/Universität Trier/i, 'Universität Trier'],
        [/Universität Würzburg/i, 'Universität Würzburg'],
        [/Universität Bamberg/i, 'Universität Bamberg'],
        [/Universität Leipzig/i, 'Universität Leipzig'],
        [/HTWK|Leipzig.*HTWK/i, 'HTWK Leipzig'],
        [/Universität Stuttgart/i, 'Universität Stuttgart'],
        [/Universität Göttingen/i, 'Universität Göttingen'],
        [/Universität Heidelberg/i, 'Universität Heidelberg'],
        [/Universität Paderborn/i, 'Universität Paderborn'],
        [/Universität Bielefeld/i, 'Universität Bielefeld'],
        [/Universität Marburg/i, 'Universität Marburg'],
        [/Universität Halle/i, 'Universität Halle-Wittenberg'],
        [/Universität Augsburg/i, 'Universität Augsburg'],
        [/HS Augsburg|Augsburg.*FH|FH.*Augsburg/i, 'Hochschule Augsburg'],
        [/Universität Potsdam/i, 'Universität Potsdam'],
        [/FH Potsdam/i, 'FH Potsdam'],
        [/Universität Passau/i, 'Universität Passau'],
        [/Universität Regensburg/i, 'Universität Regensburg'],
        [/Universität Rostock/i, 'Universität Rostock'],
        [/Universität Hildesheim/i, 'Universität Hildesheim'],
        [/Universität Freiburg/i, 'Universität Freiburg'],
        [/FernUniversität.*Hagen/i, 'FernUniversität in Hagen'],
        [/Universität Jena/i, 'Universität Jena'],
        [/Universität Kiel/i, 'Universität Kiel'],
        [/Universität Magdeburg/i, 'Universität Magdeburg'],
        [/Universität Oldenburg/i, 'Universität Oldenburg'],
        [/Universität Vechta/i, 'Universität Vechta'],
        [/Ruhr-Universität Bochum/i, 'Ruhr-Universität Bochum'],
        [/Universität des Saarlandes/i, 'Universität des Saarlandes'],
        [/Universität Frankfurt/i, 'Universität Frankfurt'],
        [/Bergische Universität Wuppertal/i, 'Bergische Universität Wuppertal'],
        [/ADW Mainz|FH Mainz/i, 'Hochschule Mainz / ADW Mainz'],
        [/THM Gießen/i, 'THM Gießen'],
        [/FH Erfurt/i, 'FH Erfurt'],
    ];

    for (const [regex, name] of mappings) {
        if (regex.test(inst)) return name;
    }

    // Fallback: use city as key
    return inst.split(',')[0].trim();
}

// Aggregate
const groups = {};

for (const entry of raw) {
    const key = getUniversityKey(entry);

    if (!groups[key]) {
        groups[key] = {
            name: key,
            city: entry.city,
            country: entry.country,
            coordinates: entry.coordinates,
            positions: [],
            disciplines: new Set(),
            methods: new Set(),
            denominations: [],
            earliestYear: entry.year,
            openPositions: 0,
            totalPositions: 0
        };
    }

    const g = groups[key];
    g.totalPositions++;
    if (entry.status === 'open') g.openPositions++;
    if (entry.year < g.earliestYear) g.earliestYear = entry.year;

    entry.disciplines.forEach(d => g.disciplines.add(d));
    entry.methods.forEach(m => g.methods.add(m));

    g.positions.push({
        name: entry.name,
        year: entry.year,
        level: entry.level,
        status: entry.status,
        temporary: entry.temporary,
        disciplines: entry.disciplines,
        methods: entry.methods
    });
}

// Convert to array
const institutions = Object.values(groups).map(g => ({
    id: g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: g.name,
    city: g.city,
    country: g.country,
    coordinates: g.coordinates,
    totalPositions: g.totalPositions,
    openPositions: g.openPositions,
    earliestYear: g.earliestYear,
    disciplines: [...g.disciplines].sort(),
    methods: [...g.methods].sort(),
    positions: g.positions.sort((a, b) => b.year - a.year),
    // Placeholder fields for enrichment
    wikidataId: null,
    rorId: null,
    dhPublicationCount: 0,
    url: null
})).sort((a, b) => b.totalPositions - a.totalPositions);

// --- Offset co-located institutions (same city) ---
const cityGroups = {};
institutions.forEach(inst => {
    const key = `${inst.city}-${inst.country}`;
    if (!cityGroups[key]) cityGroups[key] = [];
    cityGroups[key].push(inst);
});
Object.values(cityGroups).forEach(group => {
    if (group.length <= 1) return;
    const offsetStep = 0.015; // ~1.5km
    group.forEach((inst, i) => {
        if (i === 0) return;
        const angle = (i * 2 * Math.PI) / (group.length);
        inst.coordinates = [
            inst.coordinates[0] + offsetStep * Math.cos(angle),
            inst.coordinates[1] + offsetStep * Math.sin(angle)
        ];
    });
    console.log(`  Offset ${group.length} institutions in ${group[0].city}: ${group.map(g => g.name).join(', ')}`);
});

// --- Enrich with OpenAlex data ---
const openalexPath = path.join(__dirname, 'openalex-institutions.json');
if (fs.existsSync(openalexPath)) {
    const openalex = JSON.parse(fs.readFileSync(openalexPath, 'utf8'));
    console.log(`\nEnriching with OpenAlex data (${openalex.length} entries)...`);

    // Build name-matching index (fuzzy: lowercase, remove common prefixes)
    function normalize(name) {
        return name.toLowerCase()
            .replace(/universit[äa]t\s+/g, 'uni ')
            .replace(/university of\s+/g, 'uni ')
            .replace(/-/g, ' ')
            .trim();
    }

    // City-based matching as primary strategy
    let matched = 0;
    for (const inst of institutions) {
        // Try exact city + country match first
        const candidates = openalex.filter(o =>
            o.country === inst.country &&
            o.city && inst.city &&
            o.city.toLowerCase() === inst.city.toLowerCase()
        );

        // Pick the one with highest publication count (likely the main university)
        let best = null;
        if (candidates.length === 1) {
            best = candidates[0];
        } else if (candidates.length > 1) {
            // Try name matching among city candidates
            const normInst = normalize(inst.name);
            best = candidates.find(c => normalize(c.name).includes(normInst.split(' ')[1] || ''));
            if (!best) best = candidates.sort((a, b) => b.dh_publication_count - a.dh_publication_count)[0];
        }

        if (best) {
            inst.wikidataId = best.wikidata_id;
            inst.rorId = best.ror_id;
            inst.dhPublicationCount = best.dh_publication_count;
            inst.url = best.homepage_url;
            matched++;
        }
    }
    console.log(`  Matched ${matched}/${institutions.length} institutions with OpenAlex data.`);
}

// --- Apply Wikidata/ROR overrides ---
const overridesPath = path.join(__dirname, 'wikidata-overrides.json');
if (fs.existsSync(overridesPath)) {
    const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
    let overridden = 0;
    for (const inst of institutions) {
        const ov = overrides[inst.name];
        if (ov) {
            if (ov.wikidataId && !inst.wikidataId) { inst.wikidataId = ov.wikidataId; overridden++; }
            if (ov.rorId && !inst.rorId) { inst.rorId = ov.rorId; }
        }
    }
    console.log(`  Applied ${overridden} Wikidata/ROR overrides.`);
}

// --- Load TaDiRAH mapping ---
const tadirahPath = path.join(__dirname, 'tadirah-mapping.json');
if (fs.existsSync(tadirahPath)) {
    const tadirah = JSON.parse(fs.readFileSync(tadirahPath, 'utf8'));
    console.log(`\nApplying TaDiRAH mappings...`);
    for (const inst of institutions) {
        inst.methods = inst.methods.map(m => {
            const mapping = tadirah[m];
            if (mapping && typeof mapping === 'object' && mapping.uri) {
                return { label: m, tadirahUri: mapping.uri, category: mapping.category || null };
            } else if (typeof mapping === 'string') {
                // Legacy format: plain URI string
                return { label: m, tadirahUri: mapping, category: null };
            }
            return { label: m, tadirahUri: null, category: null };
        });
        // Compute tadirahProfile: count methods per TaDiRAH category
        const profile = {};
        for (const method of inst.methods) {
            if (method.category) {
                profile[method.category] = (profile[method.category] || 0) + 1;
            }
        }
        inst.tadirahProfile = profile;
    }
}

// --- Fuzzy name normalizer for enrichment matching ---
function normalizeName(name) {
    return name.toLowerCase()
        .replace(/universit[äa]t\s*/g, '')
        .replace(/university\s*(of\s*)?/g, '')
        .replace(/hochschule\s*/g, '')
        .replace(/technische\s*/g, '')
        .replace(/fachhochschule\s*/g, '')
        .replace(/\s*(e\.v\.|gmbh|ag)\s*/g, '')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function fuzzyMatch(nameA, nameB) {
    const a = normalizeName(nameA);
    const b = normalizeName(nameB);
    return a === b || a.includes(b) || b.includes(a);
}

// --- Enrich with Wikidata data ---
const wikidataEnrichPath = path.join(__dirname, 'wikidata-enrichment.json');
if (fs.existsSync(wikidataEnrichPath)) {
    const wikidata = JSON.parse(fs.readFileSync(wikidataEnrichPath, 'utf8'));
    console.log(`\nEnriching with Wikidata data (${wikidata.length} entries)...`);
    let matched = 0;
    for (const inst of institutions) {
        // Match by ROR ID first, then by name
        let best = null;
        if (inst.rorId) {
            best = wikidata.find(w => w.rorId && w.rorId === inst.rorId);
        }
        if (!best) {
            best = wikidata.find(w => fuzzyMatch(inst.name, w.name));
        }
        if (best) {
            if (best.founded && !inst.founded) inst.founded = best.founded;
            if (best.gndId) inst.gndId = best.gndId;
            if (best.wikidataId && !inst.wikidataId) inst.wikidataId = best.wikidataId;
            matched++;
        }
    }
    console.log(`  Matched ${matched}/${institutions.length} institutions with Wikidata enrichment.`);
}

// --- Enrich with Zenodo records ---
const zenodoPath = path.join(__dirname, 'zenodo-records.json');
if (fs.existsSync(zenodoPath)) {
    const zenodo = JSON.parse(fs.readFileSync(zenodoPath, 'utf8'));
    const zenodoRecords = Array.isArray(zenodo) ? zenodo : [];
    console.log(`\nEnriching with Zenodo records (${zenodoRecords.length} entries)...`);
    // Count records per institution by parsing creator affiliations
    const zenodoCounts = {};
    for (const record of zenodoRecords) {
        const seen = new Set(); // avoid double-counting per record
        for (const creator of (record.creators || [])) {
            const aff = creator.affiliation;
            if (!aff) continue;
            for (const inst of institutions) {
                if (!seen.has(inst.id) && fuzzyMatch(inst.name, aff)) {
                    zenodoCounts[inst.id] = (zenodoCounts[inst.id] || 0) + 1;
                    seen.add(inst.id);
                }
            }
        }
    }
    let matched = 0;
    for (const inst of institutions) {
        if (zenodoCounts[inst.id]) {
            inst.zenodoRecordCount = zenodoCounts[inst.id];
            matched++;
        }
    }
    console.log(`  Matched ${matched}/${institutions.length} institutions with Zenodo records.`);
}

// --- Enrich with CLARIN centres ---
const clarinPath = path.join(__dirname, 'clarin-centres.json');
if (fs.existsSync(clarinPath)) {
    const clarin = JSON.parse(fs.readFileSync(clarinPath, 'utf8'));
    const clarinEntries = Array.isArray(clarin) ? clarin : [];
    console.log(`\nEnriching with CLARIN centres (${clarinEntries.length} entries)...`);
    let matched = 0;
    for (const inst of institutions) {
        const match = clarinEntries.find(c => fuzzyMatch(inst.name, c.name));
        if (match) {
            inst.clarinCentre = match;
            matched++;
        }
    }
    console.log(`  Matched ${matched}/${institutions.length} institutions with CLARIN centres.`);
}

// --- Enrich with DHCR programmes ---
const dhcrPath = path.join(__dirname, 'dhcr-programmes.json');
if (fs.existsSync(dhcrPath)) {
    const dhcr = JSON.parse(fs.readFileSync(dhcrPath, 'utf8'));
    const dhcrEntries = Array.isArray(dhcr) ? dhcr : [];
    console.log(`\nEnriching with DHCR programmes (${dhcrEntries.length} entries)...`);
    let matched = 0;
    for (const inst of institutions) {
        const courses = dhcrEntries.filter(d => fuzzyMatch(inst.name, d.institution || d.name || ''));
        if (courses.length > 0) {
            inst.dhCourses = courses;
            matched++;
        }
    }
    console.log(`  Matched ${matched}/${institutions.length} institutions with DHCR programmes.`);
}

// --- Enrich with DBLP records ---
const dblpPath = path.join(__dirname, 'dblp-records.json');
if (fs.existsSync(dblpPath)) {
    const dblp = JSON.parse(fs.readFileSync(dblpPath, 'utf8'));
    const dblpEntries = Array.isArray(dblp) ? dblp : [];
    console.log(`\nEnriching with DBLP records (${dblpEntries.length} entries)...`);
    let matched = 0;
    for (const inst of institutions) {
        const count = dblpEntries.filter(d => fuzzyMatch(inst.name, d.institution || d.name || '')).length;
        if (count > 0) {
            inst.dblpPublicationCount = count;
            matched++;
        }
    }
    console.log(`  Matched ${matched}/${institutions.length} institutions with DBLP records.`);
}

// --- Write output ---
fs.writeFileSync(
    path.join(__dirname, 'institutions.json'),
    JSON.stringify(institutions, null, 2),
    'utf8'
);

console.log(`\nAggregated ${raw.length} professorships into ${institutions.length} institutions.`);
console.log(`Top 10:`);
institutions.slice(0, 10).forEach(i =>
    console.log(`  ${i.name}: ${i.totalPositions} positions, ${i.dhPublicationCount} pubs, wikidata: ${i.wikidataId || '-'}, ror: ${i.rorId ? 'yes' : '-'}`)
);
