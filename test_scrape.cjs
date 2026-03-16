const cheerio = require('cheerio');

async function test() {
  const url = 'https://beermaverick.com/yeast/gy003-a-touch-of-spice-belgian-ale-gigayeast/';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  console.log("H1:", $('h1').text());
  
  const tables = [];
  $('table tr').each((i, el) => {
    tables.push($(el).text().replace(/\s+/g, ' '));
  });
  console.log("Tables:", tables);

  const h3s = [];
  $('h3').each((i, el) => {
    h3s.push($(el).text().trim());
  });
  console.log("H3s:", h3s);

  console.log("Description block:", $('h3:contains("DESCRIPTION")').next('p').text());

  // Let's find attenuation, flocculation etc
  console.log("Attenuation text:", $('*:contains("Attenuation")').last().parent().text().replace(/\s+/g, ' '));
  console.log("Flocculation text:", $('*:contains("Flocculation")').last().parent().text().replace(/\s+/g, ' '));
  console.log("Optimal Temp text:", $('*:contains("Optimal Temperature")').last().parent().text().replace(/\s+/g, ' '));
  console.log("Styles text:", $('*:contains("COMMON BEER STYLES")').last().next('p').text().replace(/\s+/g, ' '));

  // Let's find properties div
  console.log("Property classes:", $('[class*="prop"]').length);
  $('[class*="prop"]').each((i, el) => console.log('prop class:', $(el).attr('class')));

  // What contains the 81-84%
  console.log("81-84% is in:", $('*:contains("81-84%")').last().html());
}

test();