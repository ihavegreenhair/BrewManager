const cheerio = require('cheerio');

async function test() {
  const url = 'https://beermaverick.com/yeast/gy003-a-touch-of-spice-belgian-ale-gigayeast/';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Find Description
  let desc = '';
  $('h2, h3, h4, h5, div, span, strong, b').each((i, el) => {
      if ($(el).text().trim().toUpperCase() === 'DESCRIPTION') {
          desc = $(el).next().text().trim();
          if (!desc) desc = $(el).parent().next().text().trim();
      }
  });
  console.log("Description:", desc);
  
  // Find Common Beer Styles
  let styles = '';
  $('h2, h3, h4, h5, div, span, strong, b').each((i, el) => {
      if ($(el).text().trim().toUpperCase().includes('COMMON BEER STYLES')) {
          styles = $(el).next('p').text().trim();
          if (!styles) styles = $(el).parent().next('p').text().trim();
      }
  });
  console.log("Styles:", styles);

  // Print all h2s
  const h2s = [];
  $('h2').each((i, el) => h2s.push($(el).text().trim()));
  console.log("H2s:", h2s);
}

test();