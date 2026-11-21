const root = document.body.dataset.root;
const theme = document.querySelector('#theme');
try { document.documentElement.dataset.theme = localStorage.getItem('theme') ?? ''; } catch {}
theme.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  theme.textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
});
function event(name) { window.plausible?.(name); }
document.addEventListener('click', async ({ target }) => {
  const button = target.closest('[data-copy]');
  if (button) {
    const code = button.nextElementSibling.textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied';
      event('Code copied');
    } catch { button.textContent = 'Select and copy the code'; }
  }
  if (target.closest('a[href^="https://github.com/"]')) event('GitHub clicked');
});
const filter = document.querySelector('#filter');
filter?.addEventListener('input', () => {
  const terms = filter.value.toLowerCase().trim().split(/\s+/);
  let visible = 0;
  for (const card of document.querySelectorAll('#listing .card')) {
    card.hidden = !terms.every(term => card.textContent.toLowerCase().includes(term));
    visible += Number(!card.hidden);
  }
  document.querySelector('#filter-status').textContent = visible + ' results';
});
const results = document.querySelector('#results');
if (results) {
  const query = new URLSearchParams(location.search).get('q')?.trim() ?? '';
  document.querySelector('#query').value = query;
  const status = document.querySelector('#search-status');
  if (!query) status.textContent = 'Enter a term to search the documentation.';
  else {
    try {
      const response = await fetch(root + 'search-index.json');
      if (!response.ok) throw new Error('Index unavailable');
      const terms = query.toLowerCase().split(/\s+/);
      const matches = (await response.json()).map(entry => {
        const title = entry.title.toLowerCase();
        const summary = (entry.title + ' ' + entry.description).toLowerCase();
        const content = (summary + ' ' + (entry.text ?? '')).toLowerCase();
        const score = terms.every(term => content.includes(term)) ? terms.reduce((sum,term) => sum + (title.includes(term) ? 5 : summary.includes(term) ? 3 : 1),0) : 0;
        return { ...entry, score };
      }).filter(item => item.score > 0).sort((a,b) => b.score - a.score);
      status.textContent = matches.length + ' results';
      for (const item of matches.slice(0,60)) {
        const li = document.createElement('li');
        const anchor = document.createElement('a');
        const summary = document.createElement('p');
        anchor.href = root + (item.path ? item.path + '/' : '');
        anchor.textContent = item.title;
        summary.textContent = item.description;
        li.append(anchor,summary);
        results.append(li);
      }
    } catch { status.textContent = 'Search is temporarily unavailable. Browse the documentation sidebar.'; }
  }
}

const feedback = document.querySelector('#feedback');
feedback?.addEventListener('submit', submit => {
  submit.preventDefault();
  const data = new FormData(feedback);
  const lines = [
    ['FTC team', 'team'], ['Region', 'region'], ['Resource', 'resource'],
    ['Code attempted', 'attempt'], ['Outcome', 'outcome'],
    ['Public project', 'project'], ['Feedback', 'comments'],
  ].map(([label, key]) => label + ': ' + (data.get(key)?.trim() || '—'));
  const body = lines.join('\n');
  document.querySelector('#feedback-draft').value = body;
  const issue = document.querySelector('#feedback-issue');
  const query = new URLSearchParams({title:'FTC VisionStack trial report',body});
  issue.href = feedback.dataset.issues + '?' + query;
  issue.hidden = false;
  event('Trial report prepared');
});
