// Leonida Trophy Guide — checklist tracker + cited guides, offline, no network requests.
// Data lives in data/trophies.json (55 official trophies) and data/roadmap.json (platinum roadmap).
// Progress and the spoiler setting live in localStorage; export/import move progress as a .json file.

const EARNED_KEY = 'gta6-trophy-guide-earned-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';
const TOTAL = 55;

const trophyListEl = document.getElementById('trophyList');
const missableListEl = document.getElementById('missableList');
const detailPanelEl = document.getElementById('detailPanel');
const searchInputEl = document.getElementById('searchInput');
const spoilerToggleEl = document.getElementById('spoilerToggle');
const earnedCountEl = document.getElementById('earnedCount');
const progressFillEl = document.getElementById('progressFill');
const progressBarEl = document.getElementById('progressBar');
const progressLabelEl = document.getElementById('progressLabel');
const listHeadingEl = document.getElementById('listHeading');
const emptyNoteEl = document.getElementById('emptyNote');
const ioNoteEl = document.getElementById('ioNote');

let allTrophies = [];
let roadmapData = null;
let earnedIds = loadEarnedIds();
let spoilersHidden = loadSpoilerSetting();
let currentFilter = 'all';
let currentView = 'checklist';
let searchText = '';
let selectedId = null;

function loadEarnedIds() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL));
  } catch {
    return new Set();
  }
}

function saveEarnedIds() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earnedIds].sort((a, b) => a - b)));
}

function loadSpoilerSetting() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

function saveSpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, spoilersHidden ? '1' : '0');
}

async function loadTrophyData() {
  const [trophiesRes, roadmapRes] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/roadmap.json'),
  ]);
  const trophiesDoc = await trophiesRes.json();
  roadmapData = await roadmapRes.json();
  allTrophies = trophiesDoc.trophies;
}

function trophyIsHidden(trophy) {
  return spoilersHidden && trophy.kind === 'story' && !earnedIds.has(trophy.id);
}

function trophyMatchesFilter(trophy) {
  if (currentFilter === 'all') return true;
  if (currentFilter === 'missable') return trophy.missable === true;
  if (currentFilter === 'online') return false;
  return trophy.kind === currentFilter;
}

function trophyMatchesSearch(trophy) {
  if (!searchText) return true;
  const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return hay.includes(searchText);
}

function gradeLabel(trophy) {
  return trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
}

function kindLabel(kind) {
  if (kind === 'platinum') return 'Platinum';
  if (kind === 'completion') return '100%';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function renderTrophyRow(trophy) {
  const li = document.createElement('li');
  const earned = earnedIds.has(trophy.id);
  const hidden = trophyIsHidden(trophy);
  li.className = 'trophy' + (earned ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : '');
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = earned;
  check.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  check.addEventListener('change', () => {
    if (check.checked) earnedIds.add(trophy.id);
    else earnedIds.delete(trophy.id);
    saveEarnedIds();
    renderAll();
  });
  const body = document.createElement('button');
  body.type = 'button';
  body.className = 'trophy-body';
  body.style.cssText = 'all:unset;display:block;cursor:pointer;flex:1;min-width:0;';
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden trophy — earn it to reveal' : trophy.name;
  const desc = document.createElement('span');
  desc.className = 'trophy-desc';
  desc.style.display = 'block';
  desc.textContent = hidden ? 'A story trophy. Its name and description stay hidden while spoilers are on.' : trophy.description;
  const meta = document.createElement('span');
  meta.className = 'trophy-meta';
  meta.style.display = 'flex';
  const grade = document.createElement('span');
  grade.className = 'grade grade-' + trophy.grade;
  grade.textContent = gradeLabel(trophy);
  meta.appendChild(grade);
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = kindLabel(trophy.kind);
  meta.appendChild(kind);
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag tag-missable';
    miss.textContent = '⚠ Missable';
    meta.appendChild(miss);
  }
  if (trophy.hidden) {
    const hid = document.createElement('span');
    hid.className = 'tag tag-hidden';
    hid.textContent = 'Hidden on PS5';
    meta.appendChild(hid);
  }
  if (hidden) {
    const sp = document.createElement('span');
    sp.className = 'tag tag-spoiler';
    sp.textContent = 'Spoiler hidden';
    meta.appendChild(sp);
  }
  body.append(name, desc, meta);
  body.addEventListener('click', () => {
    selectedId = trophy.id;
    renderAll();
    detailPanelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  const count = document.createElement('span');
  count.className = 'trophy-count';
  count.textContent = '#' + trophy.id;
  li.append(check, body, count);
  return li;
}

function renderTrophyList() {
  const visible = allTrophies.filter((t) => trophyMatchesFilter(t) && trophyMatchesSearch(t));
  trophyListEl.replaceChildren(...visible.map(renderTrophyRow));
  const filterName = currentFilter === 'all' ? 'All trophies' : kindLabel(currentFilter) + ' trophies';
  listHeadingEl.textContent = `${filterName} — showing ${visible.length} of 55`;
  emptyNoteEl.hidden = visible.length !== 0;
  const missable = allTrophies.filter((t) => t.missable);
  missableListEl.replaceChildren(...missable.map(renderTrophyRow));
}

function renderDetailPanel() {
  const trophy = allTrophies.find((t) => t.id === selectedId);
  if (!trophy) {
    detailPanelEl.innerHTML = '';
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy on the left to read its guide, with the sources behind every step. Every guide is written in my own words for this page; the name and description above it are the official PlayStation text.';
    detailPanelEl.appendChild(empty);
    return;
  }
  const earned = earnedIds.has(trophy.id);
  const hidden = trophyIsHidden(trophy);
  detailPanelEl.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Official name and description hidden until earned (spoiler setting is on).'
    : `Official: “${trophy.description}” — ${gradeLabel(trophy)} trophy.`;
  const guideHeading = document.createElement('h4');
  guideHeading.textContent = 'Guide — in my own words';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  // A hidden story trophy hides its guide too: the guide names the chapter and
  // mission, which is itself a spoiler. The sources stay visible — their names
  // do not spoil anything.
  guide.textContent = hidden
    ? 'Guide hidden until this trophy is earned (spoiler setting is on). Tick the box beside it in your checklist once you unlock it.'
    : trophy.guide;
  detailPanelEl.append(title, official, guideHeading, guide);
  if (!hidden && /unconfirmed/i.test(trophy.guide)) {
    const note = document.createElement('p');
    note.className = 'unconfirmed';
    note.textContent = '⚠ Unconfirmed at launch: this trophy’s exact method is not yet verified. The guide above says so instead of inventing a method — check the sources below for updates.';
    detailPanelEl.appendChild(note);
  }
  const sourcesHeading = document.createElement('h4');
  sourcesHeading.textContent = 'Sources for this guide';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const source of trophy.sources || []) {
    const item = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      item.appendChild(link);
    } else {
      item.textContent = source.name;
    }
    sources.appendChild(item);
  }
  const state = document.createElement('p');
  state.textContent = earned ? '✓ You have marked this trophy earned.' : 'Not earned yet — tick the box beside it when you unlock it.';
  detailPanelEl.append(sourcesHeading, sources, state);
}

function renderRoadmap() {
  if (!roadmapData) return;
  document.getElementById('roadmapTitle').textContent = roadmapData.title;
  document.getElementById('roadmapEst').textContent = roadmapData.estimate + '. Source: ' + roadmapData.source + '.';
  const list = document.getElementById('roadmapList');
  list.replaceChildren(...roadmapData.stages.map((stage) => {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = 'Stage ' + stage.n + ' — ' + stage.title;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const covers = document.createElement('p');
    covers.className = 'covers';
    covers.textContent = 'Covers: ' + stage.trophies;
    item.append(heading, text, covers);
    return item;
  }));
}

function updateProgressCounts() {
  const earned = earnedIds.size;
  earnedCountEl.textContent = String(earned);
  const pct = Math.round((earned / TOTAL) * 100);
  progressFillEl.style.width = pct + '%';
  progressBarEl.setAttribute('aria-valuenow', String(earned));
  progressLabelEl.textContent = pct + '% to the Platinum';
  const counts = { all: TOTAL, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of allTrophies) {
    if (t.kind === 'story') counts.story++;
    if (t.kind === 'collectibles') counts.collectibles++;
    if (t.kind === 'activities') counts.activities++;
    if (t.missable) counts.missable++;
  }
  document.getElementById('countAll').textContent = counts.all;
  document.getElementById('countStory').textContent = counts.story;
  document.getElementById('countMissable').textContent = counts.missable;
  document.getElementById('countCollectibles').textContent = counts.collectibles;
  document.getElementById('countActivities').textContent = counts.activities;
  document.getElementById('countOnline').textContent = 0;
  document.getElementById('missableCount').textContent = '(' + counts.missable + ')';
}

function setCurrentView(view) {
  currentView = view;
  document.getElementById('viewChecklist').hidden = view !== 'checklist';
  document.getElementById('viewRoadmap').hidden = view !== 'roadmap';
  document.getElementById('viewMissable').hidden = view !== 'missable';
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}

function renderAll() {
  renderTrophyList();
  renderDetailPanel();
  updateProgressCounts();
}

function exportProgressFile() {
  const payload = {
    guide: 'Leonida Trophy Guide — GTA VI',
    exportedAt: new Date().toISOString(),
    earned: [...earnedIds].sort((a, b) => a - b),
    total: TOTAL,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  ioNoteEl.textContent = 'Exported ' + earnedIds.size + ' earned trophies to gta6-trophy-progress.json.';
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      const valid = ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL);
      earnedIds = new Set(valid);
      saveEarnedIds();
      renderAll();
      ioNoteEl.textContent = 'Imported ' + valid.length + ' earned trophies from ' + file.name + '.';
    } catch {
      ioNoteEl.textContent = 'Could not import ' + file.name + ' — it is not a progress file from this guide.';
    }
  };
  reader.readAsText(file);
}

function applyHashRoute() {
  const hash = location.hash || '';
  if (hash === '#roadmap') setCurrentView('roadmap');
  else if (hash === '#missable') setCurrentView('missable');
  else if (hash.startsWith('#trophy-')) {
    const id = Number(hash.slice('#trophy-'.length));
    if (Number.isInteger(id) && id >= 1 && id <= TOTAL) {
      selectedId = id;
      setCurrentView('checklist');
    }
  }
}

function wireControls() {
  document.getElementById('filterGroup').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    currentFilter = chip.dataset.filter;
    for (const c of document.querySelectorAll('.chip')) c.classList.toggle('active', c === chip);
    renderAll();
  });
  searchInputEl.addEventListener('input', () => {
    searchText = searchInputEl.value.trim().toLowerCase();
    renderAll();
  });
  spoilerToggleEl.checked = spoilersHidden;
  spoilerToggleEl.addEventListener('change', () => {
    spoilersHidden = spoilerToggleEl.checked;
    saveSpoilerSetting();
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgressFile);
  const importFileEl = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFileEl.click());
  importFileEl.addEventListener('change', () => {
    if (importFileEl.files && importFileEl.files[0]) importProgressFile(importFileEl.files[0]);
    importFileEl.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies in this browser?')) {
      earnedIds = new Set();
      saveEarnedIds();
      renderAll();
      ioNoteEl.textContent = 'Progress reset — 0 of 55 earned.';
    }
  });
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => setCurrentView(tab.dataset.view));
  }
  window.addEventListener('hashchange', () => {
    applyHashRoute();
    renderAll();
  });
}

async function startGuideApp() {
  await loadTrophyData();
  wireControls();
  applyHashRoute();
  renderRoadmap();
  renderAll();
}

startGuideApp();
