const cheerio = require('cheerio');

async function test() {
  const url = 'https://beermaverick.com/yeast/oyl-018-abbey-ale-c-omega-yeast/';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const h2 = $('h2:contains("Common Beer Styles")');
  console.log("H2 text:", h2.text());
  console.log("Next P:", h2.next('p').text());
  console.log("Next Next P:", h2.next('p').next('p').text());
  
  // What about parent?
  const parent = h2.parent();
  console.log("Parent find P count:", parent.find('p').length);
  parent.find('p').each((i, el) => console.log('P', i, $(el).text().trim()));
}

test();