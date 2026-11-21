import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { pages } from '../content/pages.mjs';

test('course, project, cookbook, troubleshooting and lab inventories', () => {
  for (let i=1;i<=12;i++) {
    assert.ok(pages.some(({path})=>path==='course/module-'+i));
    assert.equal(pages.filter(({path})=>path.startsWith('course/lesson-'+i+'-')).length,4);
  }
  for (const [prefix,count] of [['projects/',18],['cookbook/',30],['troubleshooting/',21],['tools/',7],['start/',7]]) {
    assert.equal(pages.filter(({path})=>path.startsWith(prefix)).length,count);
  }
});

test('every generated internal page, anchor and asset resolves', async () => {
  for (const {path} of pages) {
    const href=new URL(path ? path+'/' : '', 'https://site.test/');
    const html=await readFile(join('dist',path,'index.html'),'utf8');
    const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(ids.length,new Set(ids).size,path+' contains duplicate IDs');
    for (const match of html.matchAll(/ (?:href|src|action)="([^"]+)"/g)) {
      const target=new URL(match[1],href);
      if (target.origin!==href.origin) continue;
      const file=join('dist',target.pathname,target.pathname.endsWith('/')?'index.html':'');
      assert.ok((await stat(file)).isFile(),file);
      if(target.hash) {
        const targetHtml=target.pathname===href.pathname?html:await readFile(file,'utf8');
        assert.ok(targetHtml.includes('id="'+decodeURIComponent(target.hash.slice(1))+'"'),target.href);
      }
    }
  }
});

test('search inventory includes real content and excludes its own route', async () => {
  const index=JSON.parse(await readFile('dist/search-index.json','utf8'));
  assert.equal(index.length,pages.length-1);
  assert.ok(index.find(page=>page.path==='season').text.includes('NECTAR'));
  assert.ok(index.find(page=>page.path==='course/lesson-7-3').text.includes('MegaTag'));
});

test('lessons render full explanations and fundamentals preserve worked-example links', async () => {
  const course = pages.filter(({path}) => path.startsWith('course/lesson-'));
  for (const {path, sections} of course) {
    const example = sections.find(([heading]) => heading === 'Worked example');
    assert.ok(example, path);
    assert.ok(example[1].filter(block => typeof block === 'string').length >= 2, path);
    assert.ok(sections[0][1].some(block => typeof block === 'string' && block.length > 120), path);
  }
  const html = await readFile('dist/course/lesson-1-1/index.html', 'utf8');
  assert.match(html, /id="worked-example"/);
  assert.match(html, /<table class="lesson-table"><caption>/);
  assert.match(html, /<th scope="col">Camera frame<\/th>/);
  assert.match(html, /<ol><li>Open the telemetry viewer/);
});

test('control walkthrough links the worked calculation, Java update, and simulator', async () => {
  const html = await readFile('dist/course/lesson-6-2/index.html', 'utf8');
  assert.match(html, /Illustrative calculation for the second fresh frame/);
  assert.match(html, /10 ms control-loop interval/);
  assert.match(html, /pid\.update\(tx, dt, newFrame\)/);
  assert.match(html, /href="\.\.\/\.\.\/tools\/pid\/"/);
});
