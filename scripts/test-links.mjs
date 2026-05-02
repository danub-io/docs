import http from 'http';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function testLinks() {
  const baseUrl = 'http://localhost:4322';
  const startUrl = baseUrl + '/docs/';
  console.log(`Buscando ${startUrl}...`);

  const { statusCode, data } = await fetchUrl(startUrl);
  if (statusCode !== 200) {
    console.error(`Falha ao acessar página inicial: ${statusCode}`);
    return;
  }

  const linkRegex = /href="([^"]+)"/g;
  let match;
  const links = new Set();
  while ((match = linkRegex.exec(data)) !== null) {
    let href = match[1];
    if (!href.startsWith('http')) {
      links.add(href);
    }
  }

  console.log(`Encontrados ${links.size} links locais na página inicial. Testando...`);

  let broken = 0;
  for (const link of links) {
    let resolvedPath = link;
    if (!link.startsWith('/')) {
        resolvedPath = '/docs/' + link;
    }
    const url = baseUrl + resolvedPath;
    const res = await fetchUrl(url);
    if (res.statusCode >= 400) {
      console.error(`❌ LINK QUEBRADO: ${link} -> ${url} (Status: ${res.statusCode})`);
      broken++;
    } else {
      console.log(`✅ OK: ${link} -> ${url}`);
    }
  }

  console.log(`\nTeste concluído. ${broken} link(s) quebrado(s).`);
}

testLinks().catch(console.error);