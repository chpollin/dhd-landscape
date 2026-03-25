/**
 * DHd Landscape — LOD Build Pipeline
 *
 * Merges ALL data sources into a single JSON-LD dataset.
 * Key difference from build-institutions.js:
 *   - Wikidata URI as canonical @id (not slugified name)
 *   - Zenodo abstracts analyzed for topics (not just counted)
 *   - Proper JSON-LD with @context, @id, @type, sameAs
 *   - All identifiers as URIs
 *
 * Run: node Data/build-lod.js
 * Output: Data/institutions-ld.json (frontend), Data/institutions-ld.jsonld (LOD export)
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const load = (file) => {
    const p = path.join(DIR, file);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
};

// ============================================================
// 1. Load all source data
// ============================================================
const sahle = load('dh-professorships.json') || [];
const openalex = load('openalex-institutions.json') || [];
const wikidataEnrich = load('wikidata-enrichment.json') || [];
const overrides = load('wikidata-overrides.json') || {};
const tadirahMap = load('tadirah-mapping.json') || {};
const zenodoRecords = load('zenodo-records.json') || [];
const clarinCentres = load('clarin-centres.json') || [];
const dhcrProgrammes = load('dhcr-programmes.json') || [];
const dblpRecords = load('dblp-records.json') || [];

console.log('=== DHd Landscape LOD Build ===');
console.log(`Sources: Sahle(${sahle.length}) OpenAlex(${openalex.length}) Wikidata(${wikidataEnrich.length}) Zenodo(${zenodoRecords.length}) CLARIN(${clarinCentres.length}) DHCR(${dhcrProgrammes.length}) DBLP(${dblpRecords.length})`);

// ============================================================
// 2. Institution name normalization (from build-institutions.js)
// ============================================================
const NAME_MAPPINGS = [
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

function resolveInstitutionName(inst) {
    for (const [regex, name] of NAME_MAPPINGS) {
        if (regex.test(inst)) return name;
    }
    return inst.split(',')[0].trim();
}

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

// ============================================================
// 3. Aggregate Sahle positions → institution groups
// ============================================================
console.log('\n[1/7] Aggregating Sahle positions...');
const groups = {};

for (const entry of sahle) {
    const key = resolveInstitutionName(entry.institution);
    if (!groups[key]) {
        groups[key] = {
            name: key,
            city: entry.city,
            country: entry.country,
            coordinates: entry.coordinates,
            positions: [],
            disciplines: new Set(),
            methods: new Set(),
            earliestYear: entry.year,
            totalPositions: 0
        };
    }
    const g = groups[key];
    g.totalPositions++;
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

const institutions = Object.values(groups).map(g => ({
    name: g.name,
    city: g.city,
    country: g.country,
    coordinates: [...g.coordinates],
    totalPositions: g.totalPositions,
    earliestYear: g.earliestYear,
    disciplines: [...g.disciplines].sort(),
    methods: [...g.methods].sort(),
    positions: g.positions.sort((a, b) => b.year - a.year),
    // To be filled by enrichment
    wikidataId: null, rorId: null, gndId: null, founded: null, url: null,
    dhPublicationCount: 0, zenodoRecordCount: 0, dblpPublicationCount: 0,
    zenodoTopics: [], clarinCentre: null, dhCourses: [],
    tadirahProfile: {}, sameAs: []
})).sort((a, b) => b.totalPositions - a.totalPositions);

console.log(`  ${sahle.length} positions → ${institutions.length} institutions`);

// ============================================================
// 4. Offset co-located institutions
// ============================================================
const cityGroups = {};
institutions.forEach(inst => {
    const key = `${inst.city}-${inst.country}`;
    (cityGroups[key] = cityGroups[key] || []).push(inst);
});
Object.values(cityGroups).forEach(group => {
    if (group.length <= 1) return;
    const step = 0.015;
    group.forEach((inst, i) => {
        if (i === 0) return;
        const angle = (i * 2 * Math.PI) / group.length;
        inst.coordinates = [
            inst.coordinates[0] + step * Math.cos(angle),
            inst.coordinates[1] + step * Math.sin(angle)
        ];
    });
});

// ============================================================
// 5. Enrich: OpenAlex
// ============================================================
console.log('\n[2/7] Enriching with OpenAlex...');
let oaMatched = 0;
for (const inst of institutions) {
    const candidates = openalex.filter(o =>
        o.country === inst.country && o.city && inst.city &&
        o.city.toLowerCase() === inst.city.toLowerCase()
    );
    let best = candidates.length === 1 ? candidates[0] : null;
    if (!best && candidates.length > 1) {
        const norm = normalizeName(inst.name);
        best = candidates.find(c => normalizeName(c.name).includes(norm.split(' ')[1] || ''));
        if (!best) best = candidates.sort((a, b) => b.dh_publication_count - a.dh_publication_count)[0];
    }
    if (best) {
        inst.wikidataId = best.wikidata_id;
        inst.rorId = best.ror_id;
        inst.dhPublicationCount = best.dh_publication_count;
        inst.url = best.homepage_url;
        oaMatched++;
    }
}
console.log(`  ${oaMatched}/${institutions.length} matched`);

// Apply manual overrides
for (const inst of institutions) {
    const ov = overrides[inst.name];
    if (ov) {
        if (ov.wikidataId && !inst.wikidataId) inst.wikidataId = ov.wikidataId;
        if (ov.rorId && !inst.rorId) inst.rorId = ov.rorId;
    }
}

// ============================================================
// 6. Enrich: Wikidata
// ============================================================
console.log('\n[3/7] Enriching with Wikidata...');
let wdMatched = 0;
for (const inst of institutions) {
    let best = null;
    if (inst.rorId) best = wikidataEnrich.find(w => w.rorId && w.rorId === inst.rorId);
    if (!best) best = wikidataEnrich.find(w => fuzzyMatch(inst.name, w.name));
    if (best) {
        if (best.founded && !inst.founded) inst.founded = best.founded;
        if (best.gndId) inst.gndId = best.gndId;
        if (best.wikidataId && !inst.wikidataId) inst.wikidataId = best.wikidataId;
        wdMatched++;
    }
}
console.log(`  ${wdMatched}/${institutions.length} matched`);

// ============================================================
// 7. TaDiRAH method mapping
// ============================================================
console.log('\n[4/7] Mapping methods to TaDiRAH...');
for (const inst of institutions) {
    inst.methods = inst.methods.map(m => {
        const mapping = tadirahMap[m];
        if (mapping && typeof mapping === 'object' && mapping.uri) {
            return { label: m, tadirahUri: mapping.uri, tadirahCategory: mapping.category || null };
        }
        return { label: m, tadirahUri: null, tadirahCategory: null };
    });
    const profile = {};
    for (const method of inst.methods) {
        if (method.tadirahCategory) {
            profile[method.tadirahCategory] = (profile[method.tadirahCategory] || 0) + 1;
        }
    }
    inst.tadirahProfile = profile;
}

// ============================================================
// 8. Zenodo: Deep analysis — topics per institution
// ============================================================
console.log('\n[5/7] Analyzing Zenodo abstracts...');

// Topic extraction from titles using keyword patterns
const TOPIC_PATTERNS = [
    // Methods
    [/\bTEI\b|Text Encoding/i, 'TEI/XML'],
    [/\bNLP\b|Natural Language Processing|Sprachverarbeitung/i, 'NLP'],
    [/\bOCR\b|Handschriftenerkennung|Texterkennung/i, 'OCR/HTR'],
    [/\bLinked\s*(Open)?\s*Data\b|LOD\b|Knowledge\s*Graph/i, 'Linked Data'],
    [/\bMachine\s*Learning\b|Deep\s*Learning\b|Neural|maschinell/i, 'Machine Learning'],
    [/\bText\s*Mining\b/i, 'Text Mining'],
    [/\bNamed\s*Entity|NER\b/i, 'Named Entity Recognition'],
    [/\bTopic\s*Model/i, 'Topic Modeling'],
    [/\bSentiment|Opinion\s*Mining/i, 'Sentiment Analysis'],
    [/\bStylometr/i, 'Stylometry'],
    [/\bNetwork\s*Analysis|Netzwerkanalyse/i, 'Network Analysis'],
    [/\bGIS\b|Geoinformation|räumlich|spatial/i, 'GIS'],
    [/\b3D\b|Photogramm|Scan/i, '3D Modeling'],
    [/\bVisuali[sz]/i, 'Visualization'],
    [/\bAnnotat/i, 'Annotation'],
    [/\bCorpus|Korpus/i, 'Corpus Linguistics'],
    [/\bOntolog/i, 'Ontology'],
    [/\bSemantic\s*Web|SPARQL|RDF\b/i, 'Semantic Web'],
    [/\bAPI\b|Schnittstelle/i, 'APIs'],
    [/\bCitizen\s*Science/i, 'Citizen Science'],
    [/\bCrowdsourc/i, 'Crowdsourcing'],
    [/\bOpen\s*(Access|Science|Data)\b/i, 'Open Science'],
    [/\bFAIR\b|Forschungsdaten/i, 'Research Data Management'],
    [/\bLLM\b|Large\s*Language|GPT|ChatGPT|Generative\s*AI|Sprachmodell/i, 'Generative AI'],
    [/\bComputer\s*Vision|Bildanalyse|Image\s*Analy/i, 'Computer Vision'],
    [/\bDigital\s*Edition|digitale\s*Edition/i, 'Digital Edition'],
    // Disciplines
    [/\bArchäolog|Archaeolog/i, 'Digital Archaeology'],
    [/\bMusikwissenschaft|Musicolog|Music/i, 'Digital Musicology'],
    [/\bKunstgeschichte|Art\s*History/i, 'Digital Art History'],
    [/\bGeschichtswissenschaft|Historiograph|History/i, 'Digital History'],
    [/\bLiteratur|Literary/i, 'Computational Literary Studies'],
    [/\bTheat[er]|Performan/i, 'Digital Performance Studies'],
    [/\bMuseum|Kulturerbe|Heritage/i, 'Digital Cultural Heritage'],
    [/\bBibliothek|Library|Archiv/i, 'Library & Archive Science'],
    [/\bPhilolog|Editionswiss/i, 'Digital Philology'],
    [/\bLinguist/i, 'Computational Linguistics'],
];

// Build Zenodo topic profiles per institution
const zenodoCounts = {};
const zenodoTopicMap = {};
const zenodoYears = {};

for (const record of zenodoRecords) {
    const title = record.title || '';
    const seen = new Set();

    // Extract topics from title
    const topics = [];
    for (const [pattern, label] of TOPIC_PATTERNS) {
        if (pattern.test(title)) topics.push(label);
    }

    // Match affiliations to institutions
    for (const creator of (record.creators || [])) {
        const aff = creator.affiliation;
        if (!aff) continue;
        for (const inst of institutions) {
            if (!seen.has(inst.name) && fuzzyMatch(inst.name, aff)) {
                seen.add(inst.name);
                zenodoCounts[inst.name] = (zenodoCounts[inst.name] || 0) + 1;

                // Accumulate topics for this institution
                if (!zenodoTopicMap[inst.name]) zenodoTopicMap[inst.name] = {};
                for (const topic of topics) {
                    zenodoTopicMap[inst.name][topic] = (zenodoTopicMap[inst.name][topic] || 0) + 1;
                }

                // Track publication years
                if (record.year) {
                    if (!zenodoYears[inst.name]) zenodoYears[inst.name] = {};
                    zenodoYears[inst.name][record.year] = (zenodoYears[inst.name][record.year] || 0) + 1;
                }
            }
        }
    }
}

let zMatched = 0;
for (const inst of institutions) {
    inst.zenodoRecordCount = zenodoCounts[inst.name] || 0;
    if (inst.zenodoRecordCount > 0) zMatched++;

    // Top topics sorted by frequency
    const topicCounts = zenodoTopicMap[inst.name] || {};
    inst.zenodoTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count]) => ({ topic, count }));

    // Publication activity by year
    inst.zenodoYears = zenodoYears[inst.name] || {};
}
console.log(`  ${zMatched}/${institutions.length} matched, ${Object.keys(TOPIC_PATTERNS).length} topic patterns`);

// Log topic stats
const allTopics = {};
for (const inst of institutions) {
    for (const t of inst.zenodoTopics) {
        allTopics[t.topic] = (allTopics[t.topic] || 0) + t.count;
    }
}
const topTopics = Object.entries(allTopics).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log(`  Top topics across all institutions:`);
topTopics.forEach(([t, c]) => console.log(`    ${t}: ${c}`));

// ============================================================
// 8b. Co-Authorship Network from Zenodo
// ============================================================
console.log('\n[5b/7] Building co-authorship network...');
const coAuthorEdges = {};

for (const record of zenodoRecords) {
    // Find all institutions contributing to this record
    const instNames = new Set();
    for (const creator of (record.creators || [])) {
        if (!creator.affiliation) continue;
        for (const inst of institutions) {
            if (fuzzyMatch(inst.name, creator.affiliation)) {
                instNames.add(inst.name);
            }
        }
    }

    // Create edges between all pairs of institutions
    const names = [...instNames];
    if (names.length < 2) continue;
    for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
            const key = [names[i], names[j]].sort().join('|||');
            if (!coAuthorEdges[key]) {
                coAuthorEdges[key] = { source: names[i], target: names[j], weight: 0, sharedTopics: {} };
            }
            coAuthorEdges[key].weight++;

            // Track shared topics for this collaboration
            const title = record.title || '';
            for (const [pattern, label] of TOPIC_PATTERNS) {
                if (pattern.test(title)) {
                    coAuthorEdges[key].sharedTopics[label] = (coAuthorEdges[key].sharedTopics[label] || 0) + 1;
                }
            }
        }
    }
}

// Convert to array and sort by weight
const collaborations = Object.values(coAuthorEdges)
    .map(e => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
        sharedTopics: Object.entries(e.sharedTopics)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, count }))
    }))
    .filter(e => e.weight >= 2)  // Only show collaborations with 2+ shared papers
    .sort((a, b) => b.weight - a.weight);

console.log(`  ${Object.keys(coAuthorEdges).length} total edges, ${collaborations.length} with weight >= 2`);
collaborations.slice(0, 10).forEach(e =>
    console.log(`    ${e.source} ↔ ${e.target}: ${e.weight} papers`)
);

// Attach collaborators to each institution
for (const inst of institutions) {
    inst.collaborators = collaborations
        .filter(e => e.source === inst.name || e.target === inst.name)
        .map(e => ({
            institution: e.source === inst.name ? e.target : e.source,
            sharedPapers: e.weight,
            sharedTopics: e.sharedTopics.slice(0, 5)
        }))
        .sort((a, b) => b.sharedPapers - a.sharedPapers);
}

// ============================================================
// 9. Enrich: CLARIN, DHCR, DBLP
// ============================================================
console.log('\n[6/7] Enriching with CLARIN, DHCR, DBLP...');
let clMatched = 0, dhcrMatched = 0, dblpMatched = 0;

for (const inst of institutions) {
    // CLARIN
    const clMatch = clarinCentres.find(c => fuzzyMatch(inst.name, c.name));
    if (clMatch) { inst.clarinCentre = clMatch; clMatched++; }

    // DHCR
    const courses = dhcrProgrammes.filter(d => fuzzyMatch(inst.name, d.institution || d.name || ''));
    if (courses.length > 0) { inst.dhCourses = courses; dhcrMatched++; }

    // DBLP
    const dblpCount = dblpRecords.filter(d => fuzzyMatch(inst.name, d.institution || d.name || '')).length;
    if (dblpCount > 0) { inst.dblpPublicationCount = dblpCount; dblpMatched++; }
}
console.log(`  CLARIN: ${clMatched}, DHCR: ${dhcrMatched}, DBLP: ${dblpMatched}`);

// ============================================================
// 10. Build sameAs links & canonical @id
// ============================================================
console.log('\n[7/7] Building LOD identifiers...');
for (const inst of institutions) {
    // Canonical ID: Wikidata URI if available, otherwise slug
    const slug = inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    if (inst.wikidataId) {
        const wdId = inst.wikidataId.startsWith('http') ? inst.wikidataId :
            inst.wikidataId.startsWith('Q') ? `http://www.wikidata.org/entity/${inst.wikidataId}` :
            inst.wikidataId;
        inst['@id'] = wdId;
    } else {
        inst['@id'] = `https://chpollin.github.io/dhd-landscape/institution/${slug}`;
    }

    inst['@type'] = 'ResearchOrganization';

    // Collect sameAs links
    const sameAs = [];
    if (inst.wikidataId) {
        const uri = inst.wikidataId.startsWith('http') ? inst.wikidataId :
            `http://www.wikidata.org/entity/${inst.wikidataId}`;
        sameAs.push(uri);
    }
    if (inst.rorId) {
        sameAs.push(inst.rorId.startsWith('http') ? inst.rorId : `https://ror.org/${inst.rorId}`);
    }
    if (inst.gndId) {
        sameAs.push(inst.gndId.startsWith('http') ? inst.gndId : `https://d-nb.info/gnd/${inst.gndId}`);
    }
    inst.sameAs = sameAs;

    // Normalize ROR to full URI
    if (inst.rorId && !inst.rorId.startsWith('http')) {
        inst.rorId = `https://ror.org/${inst.rorId}`;
    }
    // Normalize Wikidata to entity URI
    if (inst.wikidataId && !inst.wikidataId.startsWith('http')) {
        inst.wikidataId = `http://www.wikidata.org/entity/${inst.wikidataId}`;
    }
    // Normalize GND to URI
    if (inst.gndId && !inst.gndId.startsWith('http')) {
        inst.gndId = `https://d-nb.info/gnd/${inst.gndId}`;
    }
}

// ============================================================
// 11. Write outputs
// ============================================================

// JSON-LD with @context (for LOD export)
const jsonld = {
    '@context': {
        '@vocab': 'https://schema.org/',
        'schema': 'https://schema.org/',
        'wd': 'http://www.wikidata.org/entity/',
        'tadirah': 'https://vocabs.dariah.eu/tadirah/',
        'ror': 'https://ror.org/',
        'gnd': 'https://d-nb.info/gnd/',
        'Institution': 'schema:ResearchOrganization',
        'name': 'schema:name',
        'city': 'schema:addressLocality',
        'country': 'schema:addressCountry',
        'url': { '@id': 'schema:url', '@type': '@id' },
        'sameAs': { '@id': 'schema:sameAs', '@type': '@id', '@container': '@set' },
        'disciplines': 'schema:knowsAbout',
        'methods': 'schema:knowsAbout',
        'founded': 'schema:foundingDate',
        'totalPositions': 'schema:numberOfEmployees',
        'zenodoTopics': 'schema:keywords',
        'zenodoRecordCount': 'schema:interactionStatistic',
        'dhPublicationCount': 'schema:interactionStatistic',
        'positions': { '@id': 'schema:employee', '@container': '@set' },
        'collaborators': { '@id': 'schema:colleague', '@container': '@set' },
        'clarinCentre': { '@id': 'schema:memberOf', '@type': 'schema:Organization' },
        'dhCourses': { '@id': 'schema:hasOfferCatalog', '@container': '@set' }
    },
    '@graph': institutions
};

// Write JSON-LD (LOD export)
fs.writeFileSync(
    path.join(DIR, 'institutions-ld.jsonld'),
    JSON.stringify(jsonld, null, 2), 'utf8'
);

// Write plain JSON (frontend — same data, no @context wrapper)
fs.writeFileSync(
    path.join(DIR, 'institutions-ld.json'),
    JSON.stringify(institutions, null, 2), 'utf8'
);

// Also overwrite institutions.json for backward compatibility
fs.writeFileSync(
    path.join(DIR, 'institutions.json'),
    JSON.stringify(institutions, null, 2), 'utf8'
);

// Write collaborations network
fs.writeFileSync(
    path.join(DIR, 'collaborations.json'),
    JSON.stringify(collaborations, null, 2), 'utf8'
);

console.log(`\n=== Done ===`);
console.log(`  ${institutions.length} institutions`);
console.log(`  ${institutions.filter(i => i.wikidataId).length} with Wikidata URI`);
console.log(`  ${institutions.filter(i => i.rorId).length} with ROR`);
console.log(`  ${institutions.filter(i => i.gndId).length} with GND`);
console.log(`  ${institutions.filter(i => i.zenodoTopics.length > 0).length} with Zenodo topic profiles`);
console.log(`  Output: institutions-ld.jsonld (LOD), institutions-ld.json (frontend), institutions.json (compat)`);
