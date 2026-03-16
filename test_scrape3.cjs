const cheerio = require('cheerio');

async function test() {
  const url = 'https://beermaverick.com/yeast/gy003-a-touch-of-spice-belgian-ale-gigayeast/';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  $('table tr').each((i, el) => {
    console.log("TR HTML:", $(el).html());
  });
}

test();