import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { config } from '../site/config.mjs';
import { pages } from '../content/pages.mjs';

const base = (process.env.SITE_URL ?? config.url).replace(/\/?$/, '/');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nav = [['Course','course'],['Learning paths','start'],['Projects','projects'],['Cookbook','cookbook'],['Troubleshooting','troubleshooting'],['Tools','tools'],[config.season,'season'],['Resources','resources'],['Contribute','contribute']];
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
    const markers = item.filters ? ' data-filters="' + escape(JSON.stringify(item.filters)) + '"' : '';
    return '<article class="card"' + markers + '>' + link(path,item.title) + '<p>' + escape(item.description) + '</p></article>';
  }).join('') + '</div>';
  const renderBlock = block => {
    if (typeof block === 'string') return '<p>' + escape(block) + '</p>';
    if (block.code) return '<div class="code"><button data-copy>Copy code</button><pre tabindex="0" aria-label="Source code"><code>' + escape(block.code) + '</code></pre></div>';
    if (block.links) return '<ul>' + block.links.map(([label, url]) => '<li><a href="' + escape(url) + '">' + escape(label) + '</a></li>').join('') + '</ul>';
    if (block.steps) return '<ol>' + block.steps.map(step => '<li>' + escape(step) + '</li>').join('') + '</ol>';
    if (block.table) {
      const {caption, headers, rows} = block.table;
      return '<table class="lesson-table"><caption>' + escape(caption) + '</caption><thead><tr>' +
        headers.map(header => '<th scope="col">' + escape(header) + '</th>').join('') +
        '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(cell => '<td>' + escape(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
    }
    return cards(block.cards);
  };
  const sections = (page.sections ?? []).map(([heading, body]) => '<section id="' + anchor(heading) + '"><h2>' + escape(heading) + ' <a class="anchor" aria-label="Link to this section" href="#' + anchor(heading) + '">#</a></h2>' + body.map(renderBlock).join('') + '</section>').join('');
  const title = page.path ? page.title + ' | ' + config.name : config.name + ' | FTC Computer Vision';
  const canonical = new URL(page.path ? page.path + '/' : '', base).href;
  const parent = page.path.includes('/') ? page.path.split('/')[0] : '';
  const siblings = page.siblings ?? [];
  const siblingNav = siblings.length ? '<nav class="lesson-nav" aria-label="Lesson sequence">' + siblings.map((path,index) => path ? link(path,(index ? 'Next · ' : 'Previous · ') + pageByPath.get(path).title) : '').join('') + '</nav>' : '';
  const facetLabels = {difficulty:'Difficulty',camera:'Camera',topic:'Topic',hardware:'Hardware'};
  const facets = page.path === 'projects' ? '<div class="controls">' + Object.entries(facetLabels).map(([key,label]) => {
    const values = [...new Set(page.listing.flatMap(path => pageByPath.get(path).filters[key]))].sort();
    return '<label>' + label + '<select data-facet="' + key + '"><option value="">All</option>' +
      values.map(value => '<option>' + escape(value) + '</option>').join('') + '</select></label>';
  }).join('') + '</div>' : '';
  const listing = page.listing ? '<label for="filter">Filter by title, topic or hardware</label><input id="filter" type="search">' + facets + '<div id="listing">' + cards(page.listing) + '</div><p id="filter-status" role="status"></p>' : '';
  const toc = (page.sections?.length ?? 0) >= 4 ? '<nav class="toc" aria-label="On this page">' + page.sections.map(([h]) => '<a href="#' + anchor(h) + '">' + escape(h) + '</a>').join('') + '</nav>' : '';
  const analytics = config.analyticsScript ? '<script async src="' + escape(config.analyticsScript) + '"></script><script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};plausible.init=plausible.init||function(o){plausible.o=o||{}};plausible.init()</script>' : '';
  const feedback = page.feedback ? `<form id="feedback" data-issues="${escape(config.repository + '/issues/new')}">
  <div class="controls">
    <label>FTC team number (optional)<input name="team" inputmode="numeric" pattern="[0-9]{1,8}"></label>
    <label>Region (optional)<input name="region" maxlength="100"></label>
    <label>Resource used<input name="resource" maxlength="160" required></label>
    <label>Code attempted<select name="attempt"><option>Yes</option><option>No</option></select></label>
    <label>Outcome<select name="outcome"><option>Still testing</option><option>Worked</option><option>Did not work</option><option>Code not attempted</option></select></label>
    <label>Public project URL (optional)<input name="project" type="url" maxlength="250"></label>
    <label>Feedback (optional)<textarea name="comments" maxlength="600"></textarea></label>
  </div>
  <button type="submit">Prepare report</button>
  <label for="feedback-draft">Report draft</label>
  <textarea id="feedback-draft" rows="9" readonly></textarea>
  <a id="feedback-issue" hidden>Open public GitHub issue draft</a>
  </form>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${escape(canonical)}">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:type" content="website">
<link rel="stylesheet" href="${root}assets/styles.css">${analytics}<script type="module" src="${root}assets/client.mjs"></script></head>
<body data-root="${root}"><a class="skip" href="#main">Skip to content</a><header><div class="header-inner"><a class="brand" href="${root || './'}"><span aria-hidden="true" class="mark">◈</span> ${escape(config.name)}</a><form role="search" action="${root}search/"><label for="query" class="sr">Search documentation</label><input id="query" name="q" type="search" placeholder="Search documentation"></form><button id="theme" aria-label="Change color theme">Theme</button></div></header>
<div class="layout"><aside><details open><summary>Documentation</summary><nav aria-label="Documentation">${navLinks}</nav></details></aside><main id="main"${page.lesson ? ' class="lesson"' : ''}><div class="crumb">${page.path ? link('', 'Home') + (parent ? ' / ' + link(parent,pageByPath.get(parent).title) : '') : escape(config.team)}</div>
<div class="${page.path ? 'intro' : 'hero'}"><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p>${page.meta ? '<p class="meta">' + escape(page.meta) + '</p>' : ''}${page.path ? '' : '<div class="actions">' + link('course','Start learning') + link('projects','Browse projects') + link('cookbook','Code cookbook') + '</div>'}</div>
${toc}${listing}${sections}${feedback}${page.tool ? '<div id="simulator" data-tool="' + page.tool + '"></div><script type="module" src="' + root + 'assets/tools.mjs"></script>' : ''}${page.path === 'search' ? '<p id="search-status" role="status"></p><ol id="results"></ol>' : ''}${siblingNav}
<footer>${link('about',config.team)} ${link('feedback','Share a team trial')} <a href="${config.repository}">GitHub</a></footer></main></div></body></html>`;
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
