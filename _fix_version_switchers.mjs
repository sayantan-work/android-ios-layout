// _fix_version_switchers.mjs
//
// Single source of truth: /versions.json
//
// What this script does (idempotent — safe to run any time):
//
//   1. Ensure versions.json exists. If not, bootstrap it once by parsing the
//      current "## Versions" table in versions/README.md.
//   2. Sync versions.json with disk:
//      - For every versions/vN/ folder, ensure there's a matching entry. New
//        folders get a placeholder row seeded from their <title>.
//      - Set "current" to the highest version number on disk.
//   3. Regenerate three consumers from versions.json:
//      a. Per-version pill-row switchers in every versions/vN/index.html
//      b. The pill-row switcher at the top of the root /index.html
//      c. The "## Versions" table in versions/README.md
//
// To bump descriptions for a version, edit versions.json and re-run this script.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('/Volumes/Drive C/sayantan/ios-design');
const versionsDir = path.join(projectRoot, 'versions');
const rootIndex   = path.join(projectRoot, 'index.html');
const readmeFile  = path.join(versionsDir, 'README.md');
const jsonFile    = path.join(projectRoot, 'versions.json');

// ── 1. Load or bootstrap versions.json ───────────────────────────────────────
let data = await loadOrBootstrap();

// ── 2. Sync with disk ────────────────────────────────────────────────────────
data = await syncWithDisk(data);

await fs.writeFile(jsonFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`versions.json: ${data.versions.length} entries · current=${data.current}`);

// ── 3. Regenerate consumers from versions.json ───────────────────────────────
await regeneratePerVersionSwitchers(data);
await regenerateRootSwitcher(data);
await regenerateReadmeTable(data);

console.log('\nDone.');

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function loadOrBootstrap() {
  try {
    const raw = await fs.readFile(jsonFile, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    console.log('versions.json not found — bootstrapping from versions/README.md');
    return await bootstrapFromReadme();
  }
}

async function bootstrapFromReadme() {
  const md = await fs.readFile(readmeFile, 'utf8');
  const sectionMatch = md.match(/## Versions\s*\n\s*\n([\s\S]*?)(?=\n##\s|\n*$)/);
  if (!sectionMatch) throw new Error('Could not find "## Versions" section in README');
  const lines = sectionMatch[1].split('\n');
  const rowLines = lines.filter(l => /^\s*\|\s*(?:\*\*)?\[/.test(l));
  const versions = [];
  let current = null;
  for (const row of rowLines) {
    const cells = row.split('|').slice(1, -1).map(c => c.trim());
    const m = cells[0].match(/\[(?:\*\*)?(v\d+)(?:\*\*)?\]/);
    if (!m) continue;
    const id = m[1];
    const isCurrent = /\*\*\(current\)\*\*/.test(cells[0]);
    if (isCurrent) current = id;
    // Only strip outer **bold** from the row that was previously marked current —
    // pre-JSON convention was to bold its theme cell as a visual indicator. Bold
    // on any other row is intentional emphasis and must be preserved.
    const rawTheme = cells[1] || '—';
    const theme = isCurrent ? stripOuterBold(rawTheme) : rawTheme;
    versions.push({
      id,
      href: `versions/${id}/index.html`,
      theme,
      ia: cells[2] || '—',
      headline: cells[3] || '—',
    });
  }
  return { current: current || versions[versions.length - 1]?.id, versions };
}

async function syncWithDisk(data) {
  const dirs = (await fs.readdir(versionsDir, { withFileTypes: true }))
    .filter(d => d.isDirectory() && /^v\d+$/.test(d.name))
    .map(d => d.name)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

  const known = new Set(data.versions.map(v => v.id));
  for (const v of dirs) {
    if (known.has(v)) continue;
    console.log(`  [add]  ${v}: new version on disk — adding to versions.json`);
    const seed = await seedFromVersionFiles(v);
    data.versions.push({
      id: v,
      href: `versions/${v}/index.html`,
      theme: seed.theme,
      ia: '—',
      headline: '— *(fill in from NOTES.md)*',
    });
  }

  data.versions.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));

  if (dirs.length > 0) data.current = dirs[dirs.length - 1];

  const onDisk = new Set(dirs);
  for (const v of data.versions) {
    if (!onDisk.has(v.id)) {
      console.log(`  [warn] ${v.id}: in versions.json but no versions/${v.id}/ folder`);
    }
  }
  return data;
}

// Pull a one-line theme seed for a brand-new version. Priority: NOTES.md h1 →
// <title>'s parenthesized part → bare <title> → id.
async function seedFromVersionFiles(v) {
  try {
    const notes = await fs.readFile(path.join(versionsDir, v, 'NOTES.md'), 'utf8');
    const h1 = notes.match(/^#\s+v\d+\s*[-—–]\s*(.+)$/m);
    if (h1) return { theme: h1[1].trim() };
  } catch {}
  try {
    const html = await fs.readFile(path.join(versionsDir, v, 'index.html'), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/);
    if (title) {
      const t = title[1].replace(/^EasyDo 365\s*[-—–]\s*/, '').trim();
      const paren = t.match(/^v\d+\s*\(([^)]+)\)\s*$/);
      return { theme: paren ? paren[1].trim() : t };
    }
  } catch {}
  return { theme: v };
}

function stripOuterBold(s) {
  return s.replace(/^\*\*(.+)\*\*$/, '$1');
}

// ─── Consumer A: per-version index.html switchers ────────────────────────────
async function regeneratePerVersionSwitchers(data) {
  // v1-v6 keep inline-styled markup; v7+ use class="vsw".
  const inlineLink = (v, current) => current
    ? `<a href="../${v}/index.html" aria-current="page" style="padding:6px 12px;border-radius:var(--r-pill);background:var(--primary);color:var(--primary-fg);font-weight:600;text-decoration:none">${v}</a>`
    : `<a href="../${v}/index.html" style="padding:6px 12px;border-radius:var(--r-pill);color:var(--muted);font-weight:500;text-decoration:none">${v}</a>`;
  const vswLink = (v, current) => current
    ? `<a href="../${v}/index.html" aria-current="page">${v}</a>`
    : `<a href="../${v}/index.html">${v}</a>`;

  const ids = data.versions.map(v => v.id);
  let updated = 0;
  for (const v of ids) {
    const file = path.join(versionsDir, v, 'index.html');
    let html;
    try { html = await fs.readFile(file, 'utf8'); }
    catch { console.log(`  [skip] ${v}: index.html missing`); continue; }

    const navMatch = html.match(/<nav[^>]*Version switcher[^>]*>[\s\S]*?<\/nav>/);
    if (!navMatch) { console.log(`  [skip] ${v}: no version-switcher nav found`); continue; }

    const navHtml = navMatch[0];
    const isInline = !/class="vsw"/.test(navHtml);
    const openTag = navHtml.match(/<nav[^>]*>/)[0];
    const labelMatch = navHtml.match(/<span[^>]*>\s*Version\s*<\/span>/);
    const label = labelMatch ? labelMatch[0] : '<span class="vlabel">Version</span>';
    const linkFn = isInline ? inlineLink : vswLink;
    const links = ids.map(d => linkFn(d, d === v)).join(isInline ? '\n    ' : ' ');
    const rebuilt = `${openTag}\n    ${label}\n    ${links}\n  </nav>`;

    if (rebuilt === navHtml) { console.log(`  [ok]   ${v}: switcher already current`); continue; }
    await fs.writeFile(file, html.replace(navHtml, rebuilt), 'utf8');
    updated++;
    console.log(`  [fix]  ${v}: switcher rebuilt (${isInline ? 'inline' : 'vsw'} style)`);
  }
  console.log(`  Per-version: ${updated} updated of ${ids.length}.`);
}

// ─── Consumer B: root index.html switcher ────────────────────────────────────
async function regenerateRootSwitcher(data) {
  const html = await fs.readFile(rootIndex, 'utf8');
  const linksHtml = data.versions.map(v => `<a href="${v.href}">${v.id}</a>`).join(' ');
  const navBlock =
`<nav aria-label="Version switcher" class="version-switcher">
    <span class="vs-label">Version</span>
    ${linksHtml}
  </nav>`;

  const existing = html.match(/<nav[^>]*Version switcher[^>]*>[\s\S]*?<\/nav>/);
  let next;
  if (existing) {
    if (existing[0] === navBlock) { console.log('  [ok]   root index.html: switcher already current'); return; }
    next = html.replace(existing[0], navBlock);
    console.log(`  [fix]  root index.html: switcher rebuilt (${data.versions.length} links)`);
  } else {
    const pageOpen = html.match(/<div class="page">\s*/);
    if (!pageOpen) { console.log('  [skip] root index.html: no <div class="page"> anchor found'); return; }
    const at = pageOpen.index + pageOpen[0].length;
    next = html.slice(0, at) + '\n  ' + navBlock + '\n\n  ' + html.slice(at);
    console.log(`  [add]  root index.html: switcher inserted (${data.versions.length} links)`);
  }
  await fs.writeFile(rootIndex, next, 'utf8');
}

// ─── Consumer C: versions/README.md "Versions" table ─────────────────────────
async function regenerateReadmeTable(data) {
  const md = await fs.readFile(readmeFile, 'utf8');
  const sectionMatch = md.match(/## Versions\s*\n\s*\n([\s\S]*?)(?=\n##\s|\n*$)/);
  if (!sectionMatch) { console.log('  [skip] README.md: "## Versions" section not found'); return; }

  const headerLine  = '| # | Theme | IA | Headline change |';
  const dividerLine = '|---|---|---|---|';
  const rows = data.versions.map(v => {
    const isCurrent = v.id === data.current;
    const linkLabel = `[${isCurrent ? `**${v.id}**` : v.id}](${jsonHrefToReadmeHref(v.href)})${isCurrent ? ' **(current)**' : ''}`;
    return `| ${linkLabel} | ${v.theme} | ${v.ia} | ${v.headline} |`;
  });

  const rebuiltSection = `## Versions\n\n${[headerLine, dividerLine, ...rows].join('\n')}\n`;
  const next = md.replace(sectionMatch[0], rebuiltSection);
  if (next === md) { console.log('  [ok]   README.md: versions table already current'); return; }
  await fs.writeFile(readmeFile, next, 'utf8');
  console.log(`  [fix]  README.md: versions table rebuilt (${data.versions.length} rows · current=${data.current})`);
}

// JSON stores root-relative href ("versions/v22/index.html"). The README sits
// in versions/, so links there should be relative to that folder ("v22/").
function jsonHrefToReadmeHref(href) {
  return href.replace(/^versions\//, '').replace(/index\.html$/, '');
}
