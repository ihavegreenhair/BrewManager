const fs = require('fs');
const cheerio = require('cheerio');

const slugs = JSON.parse(fs.readFileSync('yeast_slugs.json', 'utf8'));

async function scrapeYeast(slug) {
    const url = `https://beermaverick.com/yeast/${slug}/`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);

        const name = $('h1').text().trim();
        
        const data = {
            name,
            brand: '',
            type: '',
            form: 'Liquid',
            species: 'Unknown',
            attenuation: { range: [0, 0], avg: 0 },
            flocculation: 'Unknown',
            alcoholTolerance: 0,
            tempRange: { f: [0, 0], c: [0, 0] },
            description: '',
            styles: []
        };

        $('table tr').each((i, row) => {
            const header = $(row).find('th').text().trim();
            const td = $(row).find('td');
            const value = td.text().trim();

            if (header.startsWith('Brand')) data.brand = value;
            if (header.startsWith('Type')) data.type = value;
            if (header.startsWith('Packet')) data.form = value.includes('Dry') ? 'Dry' : 'Liquid';
            if (header.startsWith('Species')) data.species = value;
            
            if (header.includes('Alcohol Tolerance')) {
                const val = $(row).find('.text-muted.bold').text().trim();
                data.alcoholTolerance = parseFloat(val) || 0;
            }
            if (header.includes('Attenuation')) {
                const val = $(row).find('.text-muted.bold').text().trim();
                const range = val.match(/(\d+)-(\d+)/);
                if (range) {
                    data.attenuation.range = [parseInt(range[1]), parseInt(range[2])];
                    data.attenuation.avg = (data.attenuation.range[0] + data.attenuation.range[1]) / 2;
                } else if (val.includes('%')) {
                   const singleVal = parseInt(val);
                   data.attenuation.range = [singleVal, singleVal];
                   data.attenuation.avg = singleVal;
                }
            }
            if (header.includes('Flocculation')) {
                data.flocculation = $(row).find('.text-muted.bold').text().trim();
            }
            if (header.includes('Optimal Temperature')) {
                const valF = $(row).find('.text-muted.bold').text().trim();
                const rangeF = valF.match(/(\d+)-(\d+)/);
                if (rangeF) {
                    data.tempRange.f = [parseInt(rangeF[1]), parseInt(rangeF[2])];
                }
                const valC = $(row).find('span').text().trim();
                const rangeC = valC.match(/(\d+)-(\d+)/);
                if (rangeC) {
                    data.tempRange.c = [parseInt(rangeC[1]), parseInt(rangeC[2])];
                }
            }
        });

        // Description
        $('h2, h3, h4').each((i, el) => {
            if ($(el).text().trim().toUpperCase() === 'DESCRIPTION') {
                data.description = $(el).next('p').text().trim();
                if (!data.description) data.description = $(el).next().text().trim();
            }
        });

        // Styles
        $('h2, h3, h4').each((i, el) => {
            if ($(el).text().trim().toUpperCase().includes('COMMON BEER STYLES')) {
                const nextP = $(el).nextAll('p');
                // Usually the second P after the header contains the styles, 
                // but let's look for the first P that contains more than just a short intro
                nextP.each((j, p) => {
                    const txt = $(p).text().trim();
                    if (txt && !txt.includes('popular beer styles') && !txt.includes('let us know') && !txt.includes('Copyright')) {
                        if (data.styles.length === 0) {
                             data.styles = txt.split(/[,&]/).map(s => s.trim()).filter(s => s);
                        }
                    }
                });
            }
        });

        return data;
    } catch (e) {
        console.error(`Error scraping ${slug}: ${e.message}`);
        return null;
    }
}

async function run() {
    const yeasts = [];
    const limit = slugs.length; 
    for (let i = 0; i < limit; i++) {
        if (i % 50 === 0) console.log(`Batch starting at index ${i}...`);
        const data = await scrapeYeast(slugs[i]);
        if (data && data.name) {
            yeasts.push(data);
        }
        if (i % 10 === 0) process.stdout.write('.');
        // Tiny delay
        await new Promise(r => setTimeout(r, 50));
    }

    const output = `import type { YeastVariety } from '../types/brewing';

export const yeasts: YeastVariety[] = ${JSON.stringify(yeasts, null, 2)};
`;

    fs.writeFileSync('src/data/yeasts.ts', output);
    console.log('\nFinished writing src/data/yeasts.ts');
}

run();