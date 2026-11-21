import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { config } from '../site/config.mjs';
import { pages } from '../content/pages.mjs';

const base = (process.env.SITE_URL ?? config.url).replace(/\/?$/, '/');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nav = [['Course','course'],['Projects','projects'],['Cookbook','cookbook'],['Troubleshooting','troubleshooting'],['Tools','tools'],[config.season,'season'],['Resources','resources'],['Contribute','contribute']];
const pageByPath = new Map(pages.map(page => [page.path, page]));
const anchor = title => title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
if (pageByPath.size !== pages.length) throw new Error('Duplicate page path');
function render(page) {
  const root = '../'.repeat(page.path.split('/').filter(Boolean).length);
  const link = (path, label) => '<a href="' + (root || './') + (path ? path + '/' : '') + '">' + escape(label) + '</a>';
  const navLinks = nav.map(([label, path]) => link(path, label)).join('');
  const cards = paths => '<div class="cards">' + paths.map(path => {
    const item = pageByPath.get(path);
    if (!item) throw new Error('Unknown related page ' + path);
    return '<article class="card">' + link(path,item.title) + '<p>' + escape(item.description) + '</p></article>';
  }).join('') + '</div>';
  const sections = (page.sections ?? []).map(([heading, body]) => '<section id="' + anchor(heading) + '"><h2>' + escape(heading) + ' <a class="anchor" aria-label="Link to this section" href="#' + anchor(heading) + '">#</a></h2>' + body.map(paragraph => typeof paragraph === 'string' ? '<p>' + escape(paragraph) + '</p>' : paragraph.code ? '<div class="code"><button data-copy>Copy code</button><pre><code>' + escape(paragraph.code) + '</code></pre></div>' : paragraph.links ? '<ul>' + paragraph.links.map(([label, url]) => '<li><a href="' + escape(url) + '">' + escape(label) + '</a></li>').join('') + '</ul>' : cards(paragraph.cards)).join('') + '</section>').join('');
  const title = page.path ? page.title + ' | ' + config.name : config.name + ' | FTC Computer Vision';
  const canonical = new URL(page.path ? page.path + '/' : '', base).href;
  const parent = page.path.includes('/') ? page.path.split('/')[0] : '';
  const siblings = page.siblings ?? [];
  const siblingNav = siblings.length ? '<nav class="lesson-nav" aria-label="Lesson sequence">' + siblings.filter(Boolean).map(path => link(path,pageByPath.get(path).title)).join('') + '</nav>' : '';
  const listing = page.listing ? '<label for="filter">Filter by title, topic or hardware</label><input id="filter" type="search"><div id="listing">' + cards(page.listing) + '</div><p id="filter-status" role="status"></p>' : '';
  const toc = (page.sections?.length ?? 0) >= 4 ? '<nav class="toc" aria-label="On this page">' + page.sections.map(([h]) => '<a href="#' + anchor(h) + '">' + escape(h) + '</a>').join('') + '</nav>' : '';
  const analytics = config.analyticsDomain ? '<script defer data-domain="' + escape(config.analyticsDomain) + '" src="https://plausible.io/js/script.js"></script>' : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${escape(canonical)}">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:type" content="website">
<link rel="stylesheet" href="${root}assets/styles.css">${analytics}<script type="module" src="${root}assets/client.mjs"></script></head>
<body data-root="${root}"><a class="skip" href="#main">Skip to content</a><header><div class="header-inner"><a class="brand" href="${root || './'}"><span aria-hidden="true" class="mark">◈</span> ${escape(config.name)}</a><form role="search" action="${root}search/"><label for="query" class="sr">Search documentation</label><input id="query" name="q" type="search" placeholder="Search documentation"></form><button id="theme" aria-label="Change color theme">Theme</button></div></header>
<div class="layout"><aside><details open><summary>Documentation</summary><nav aria-label="Documentation">${navLinks}</nav></details></aside><main id="main"><div class="crumb">${page.path ? link('', 'Home') + (parent ? ' / ' + link(parent,pageByPath.get(parent).title) : '') : escape(config.team)}</div>
<div class="${page.path ? 'intro' : 'hero'}"><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p>${page.meta ? '<p class="meta">' + escape(page.meta) + '</p>' : ''}${page.path ? '' : '<div class="actions">' + link('course','Start learning') + link('projects','Browse projects') + link('cookbook','Code cookbook') + '</div>'}</div>
${toc}${listing}${sections}${page.tool ? '<div id="simulator" data-tool="' + page.tool + '"></div><script type="module" src="' + root + 'assets/tools.mjs"></script>' : ''}${page.path === 'search' ? '<p id="search-status" role="status"></p><ol id="results"></ol>' : ''}${siblingNav}
<footer>${link('about',config.team)} <a href="${config.repository}">GitHub</a></footer></main></div></body></html>`;
}
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
for (const file of ['styles.css','client.mjs','tools.mjs','models.mjs']) {
  await cp('site/' + file, 'dist/assets/' + file);
}
for (const page of pages) {
  const directory = 'dist/' + page.path;
  await mkdir(directory, { recursive: true });
  await writeFile(directory + '/index.html', render(page));
}
await writeFile('dist/search-index.json', JSON.stringify(pages.filter(p => p.path !== 'search').map(({path,title,description,sections}) => ({path,title,description,text:sections?.flatMap(([heading,body]) => [heading,...body.filter(p => typeof p === 'string')]).join(' ')}))));
await writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.filter(p => p.path !== 'search').map(p => '<url><loc>' + escape(new URL(p.path ? p.path + '/' : '',base).href) + '</loc></url>').join('') + '</urlset>');
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + base + 'sitemap.xml\n');
console.log('Built ' + pages.length + ' pages');
