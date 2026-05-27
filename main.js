/* ===========================
   5s压榨工作台 · main.js
   =========================== */

// ── 图标 & 背景 配置 ────────────────────────────────────────
const FAVICON_PROVIDER = 'real';
const PROXY = '';
const ENABLE_RANDOM_BACKGROUND = false;

function withProxy(originUrl) {
  if (!PROXY) return originUrl;
  return PROXY + '/' + originUrl.replace(/^https?:\/\//, '');
}

function buildFaviconUrl(domain) {
  if (!domain) return DEFAULT_ICON;
  if (FAVICON_PROVIDER === 'google')
    return withProxy(`https://www.google.com/s2/favicons?sz=64&domain=${domain}`);
  if (FAVICON_PROVIDER === 'duckduckgo')
    return withProxy(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  return DEFAULT_ICON;
}

// ── 内外网切换 ────────────────────────────────────────────────
let isIntranet = localStorage.getItem('netMode') === 'intranet';
let _linksData = null;

function getCardUrl(item) {
  return (isIntranet && item.intranet) ? item.intranet : item.url;
}

function toggleNetMode() {
  isIntranet = !isIntranet;
  localStorage.setItem('netMode', isIntranet ? 'intranet' : 'internet');
  updateNetToggleBtn();
  document.querySelectorAll('.card[data-url][data-intranet]').forEach(a => {
    const url = isIntranet ? a.dataset.intranet : a.dataset.url;
    a.href = url;
    const popup = a.querySelector('.info-popup');
    if (popup) popup.textContent = getDomain(url) ?? url;
    const badge = a.querySelector('.net-badge');
    if (badge) badge.textContent = isIntranet ? '内' : '外';
  });
}
window.toggleNetMode = toggleNetMode;

function updateNetToggleBtn() {
  const btn = document.getElementById('netToggleBtn');
  if (!btn) return;
  btn.textContent = isIntranet ? '内网' : '外网';
  btn.classList.toggle('intranet-active', isIntranet);
}

function injectNetToggleBtn() {
  if (document.getElementById('netToggleBtn')) return;
  const btn = document.createElement('button');
  btn.id        = 'netToggleBtn';
  btn.className = 'net-toggle-btn';
  btn.addEventListener('click', function () { toggleNetMode(); });
  document.body.appendChild(btn);
}

// ────────────────────────────────────────────────────────────
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const BG_API = isMobile
  ? 'https://imgapi.cn/api.php?zd=mobile&fl=fengjing&gs=images&t='
  : 'https://imgapi.cn/api.php?fl=dongman&gs=images&t=';
const LINKS_FILE = 'links.json';
const LOCAL_ICON_DIR = 'assets/icons/';
const CUSTOM_SITES_KEY = 'fiveSecondWorkbenchCustomSites';
const SORT_ORDER_KEY = 'fiveSecondWorkbenchSortOrder';
const DEFAULT_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjxwYXRoIGQ9Ik0yIDEyaDIwIj48L3BhdGg+PHBhdGggZD0iTTEyIDJhMTUuMyAxNS4zIDAgMCAxIDQgMTAgMTUuMyAxNS4zIDAgMCAxLTQgMTAgMTUuMyAxNS4zIDAgMCAxLTQtMTAgMTUuMyAxNS4zIDAgMCAxIDQtMTB6Ij48L3BhdGg+PC9zdmc+';

const MANUAL_FAVICONS = {
  'chatgpt.com': 'https://chatgpt.com/favicon.ico',
  'claude.ai': 'https://claude.ai/favicon.ico',
  'github.com': 'assets/icons/github-real.png',
  'gemini.google.com': 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png',
  'aistudio.google.com': 'https://www.gstatic.com/aistudio/ai_studio_favicon_2_192x192.png',
  'runwayml.com': 'https://runwayml.com/favicon.ico',
  'dev.runwayml.com': 'https://runwayml.com/favicon.ico',
  'jimeng.jianying.com': 'https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/jimeng/favicon.ico',
  'dreamina.jianying.com': 'https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/jimeng/favicon.ico',
  'klingai.com': 'https://klingai.com/favicon.ico',
  'hailuoai.com': 'https://hailuoai.com/favicon.ico',
  'pika.art': 'https://pika.art/favicon.ico',
  'lumalabs.ai': 'https://lumalabs.ai/favicon.ico',
  'midjourney.com': 'https://www.midjourney.com/favicon.ico',
  'huggingface.co': 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
  'civitai.com': 'https://civitai.com/favicon.ico',
  'replicate.com': 'https://replicate.com/favicon.ico',
  'openrouter.ai': 'https://openrouter.ai/favicon.ico',
  'cursor.com': 'https://cursor.com/favicon.ico',
  'bilibili.com': 'https://www.bilibili.com/favicon.ico',
  'search.bilibili.com': 'https://www.bilibili.com/favicon.ico',
  'feishu.cn': 'https://www.feishu.cn/favicon.ico',
  'doubao.com': 'https://www.doubao.com/favicon.ico'
  ,
  'baidu.com': 'https://www.baidu.com/favicon.ico',
  'xiaohongshu.com': 'https://www.xiaohongshu.com/favicon.ico',
  'douyin.com': 'https://www.douyin.com/favicon.ico',
  'zhihu.com': 'https://static.zhihu.com/heifetz/favicon.ico',
  'weibo.com': 'https://weibo.com/favicon.ico',
  'suno.com': 'https://suno.com/favicon.ico',
  'elevenlabs.io': 'https://elevenlabs.io/favicon.ico',
  'minimax.io': 'https://www.minimax.io/favicon.ico',
  'xfyun.cn': 'https://www.xfyun.cn/favicon.ico',
  'tingwu.aliyun.com': 'https://tingwu.aliyun.com/favicon.ico',
  'capcut.cn': 'https://www.capcut.cn/favicon.ico'
  ,
  'liblib.tv': 'assets/icons/libtv-real.ico',
  'chat.deepseek.com': 'assets/icons/deepseek-real.ico',
  'prompthub.xin': 'assets/icons/prompthub-real.ico'
};

/* ── 搜索分类数据 ── */
const SEARCH_CATEGORIES = [
  {
    id: 'engine', label: '引擎', icon: '🔍',
    engines: [
      { name: '百度',       icon: '🔵', url: 'https://www.baidu.com/s?wd=',           domain: 'baidu.com' },
      { name: 'Google',     icon: '🌐', url: 'https://www.google.com/search?q=',      domain: 'google.com' },
      { name: 'Brave',      icon: '🦁', url: 'https://search.brave.com/search?q=',    domain: 'search.brave.com' },
      { name: '搜狗',       icon: '🐶', url: 'https://www.sogou.com/web?query=',      domain: 'sogou.com' },
      { name: 'Bing',       icon: '🔷', url: 'https://www.bing.com/search?q=',        domain: 'bing.com' },
      { name: 'DuckDuckGo', icon: '🦆', url: 'https://duckduckgo.com/?q=',            domain: 'duckduckgo.com' },
      { name: '360',        icon: '🟢', url: 'https://www.so.com/s?q=',               domain: 'so.com' },
      { name: '夸克',       icon: '⚡', url: 'https://www.quark.cn/s?q=',             domain: 'quark.cn' },
    ]
  },
  {
    id: 'community', label: '社区', icon: '💬',
    engines: [
      { name: 'GitHub', icon: '🐱', url: 'https://github.com/search?q=',             domain: 'github.com' },
      { name: '微博',   icon: '🌊', url: 'https://s.weibo.com/weibo?q=',              domain: 'weibo.com' },
      { name: '知乎',   icon: '🔵', url: 'https://www.zhihu.com/search?q=',           domain: 'zhihu.com' },
      { name: '豆瓣',   icon: '🟢', url: 'https://www.douban.com/search?q=',          domain: 'douban.com' },
      { name: '贴吧',   icon: '🟠', url: 'https://tieba.baidu.com/f/search/res?qw=',  domain: 'tieba.baidu.com' },
      { name: 'Reddit', icon: '🔴', url: 'https://www.reddit.com/search/?q=',         domain: 'reddit.com' },
    ]
  },
  {
    id: 'video', label: '视频', icon: '🎬',
    engines: [
      { name: 'B站',    icon: '📺', url: 'https://search.bilibili.com/all?keyword=', domain: 'bilibili.com' },
      { name: '腾讯',   icon: '🐧', url: 'https://v.qq.com/search.html#stag=0&s=',  domain: 'v.qq.com' },
      { name: '爱奇艺', icon: '🟢', url: 'https://so.iqiyi.com/so/q_',              domain: 'iqiyi.com' },
      { name: '优酷',   icon: '🔵', url: 'https://so.youku.com/search_video/q_',    domain: 'youku.com' },
      { name: '芒果',   icon: '🟡', url: 'https://so.mgtv.com/so/k-',               domain: 'mgtv.com' },
    ]
  },
  {
    id: 'music', label: '音乐', icon: '🎵',
    engines: [
      { name: 'QQ音乐', icon: '🟢', url: 'https://y.qq.com/portal/search.html#page=1&searchid=1&remoteplace=txt.yqq.top&t=song&w=', domain: 'y.qq.com' },
      { name: '网易云', icon: '🔴', url: 'https://music.163.com/#/search/m/?s=',                                                    domain: 'music.163.com' },
    ]
  },
  {
    id: 'life', label: '生活', icon: '🛒',
    engines: [
      { name: '淘宝',   icon: '🟠', url: 'https://s.taobao.com/search?q=',                              domain: 'taobao.com' },
      { name: '京东',   icon: '🔴', url: 'https://search.jd.com/Search?keyword=',                       domain: 'jd.com' },
      { name: '拼多多', icon: '🟣', url: 'https://mobile.yangkeduo.com/search_result.html?search_key=',  domain: 'pinduoduo.com' },
      { name: '做菜',   icon: '🍳', url: 'https://www.xiachufang.com/search/?keyword=',                  domain: 'xiachufang.com' },
      { name: '翻译',   icon: '🌐', url: 'https://fanyi.baidu.com/#zh/en/',                             domain: 'fanyi.baidu.com' },
    ]
  },
  {
    id: 'job', label: '求职', icon: '💼',
    engines: [
      { name: '智联招聘', icon: '🔵', url: 'https://sou.zhaopin.com/?jl=530&kw=',                         domain: 'zhaopin.com' },
      { name: 'BOSS直聘', icon: '🟡', url: 'https://www.zhipin.com/web/geek/job?query=',                  domain: 'zhipin.com' },
      { name: '猎聘',     icon: '🟠', url: 'https://www.liepin.com/zhaopin/?key=',                        domain: 'liepin.com' },
      { name: '前程无忧', icon: '🔴', url: 'https://search.51job.com/list/000000,000000,0000,00,9,99,',   domain: '51job.com' },
      { name: '拉勾网',   icon: '🟢', url: 'https://www.lagou.com/wn/jobs?kd=',                           domain: 'lagou.com' },
    ]
  },
];

let currentCategoryId = 'engine';
let currentEngine     = SEARCH_CATEGORIES[0].engines[0];
let enginePanelOpen   = false;

/* ── 工具 ── */
function getDomain(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

function normalizeDomain(domain) {
  return domain ? domain.replace(/^www\./, '') : '';
}

function localIconSrc(domain) {
  const key = normalizeDomain(domain);
  if (!key) return DEFAULT_ICON;
  const file = key.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${LOCAL_ICON_DIR}${file}.svg`;
}

function faviconSrc(url) {
  const domain = getDomain(url);
  const key = normalizeDomain(domain);
  if (FAVICON_PROVIDER === 'local') return localIconSrc(domain);
  if (FAVICON_PROVIDER === 'real') {
    return MANUAL_FAVICONS[key] || withProxy(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }
  return MANUAL_FAVICONS[key] || buildFaviconUrl(domain);
}
function engineFavicon(engine) { return buildFaviconUrl(engine.domain); }

function fallbackIcon(title, url) {
  const label = (title || normalizeDomain(getDomain(url)) || '5').trim().slice(0, 1).toUpperCase();
  const hue = [...(title || url)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="hsl(${hue} 64% 38%)"/>
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#fff">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCustomSites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_SITES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomSites(sites) {
  localStorage.setItem(CUSTOM_SITES_KEY, JSON.stringify(sites));
}

function getSortOrder() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SORT_ORDER_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveSectionSortOrder(sectionName, keys) {
  const order = getSortOrder();
  order[sectionName] = keys;
  localStorage.setItem(SORT_ORDER_KEY, JSON.stringify(order));
}

function getItemKey(item) {
  return normalizeDomain(getDomain(item.url)) || item.url;
}

function applySectionSort(sectionName, items) {
  const saved = getSortOrder()[sectionName];
  if (!Array.isArray(saved) || !saved.length) return items;

  const index = new Map(saved.map((key, order) => [key, order]));
  return [...items].sort((a, b) => {
    const aIndex = index.has(getItemKey(a)) ? index.get(getItemKey(a)) : Number.MAX_SAFE_INTEGER;
    const bIndex = index.has(getItemKey(b)) ? index.get(getItemKey(b)) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

function normalizeUrl(url) {
  const trimmed = url.trim().replace(/\s+/g, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function titleFromUrl(url) {
  const domain = normalizeDomain(getDomain(url));
  if (!domain) return '新网站';
  const main = domain.split('.')[0] || domain;
  return main.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function mergeCustomSites(sections, customSites) {
  const merged = sections.map(section => ({
    section: section.section,
    items: [...section.items]
  }));

  customSites.forEach(site => {
    const sectionName = site.section || '其他';
    let section = merged.find(item => item.section === sectionName);
    if (!section) {
      section = { section: sectionName, items: [] };
      merged.push(section);
    }
    section.items.unshift({
      ...site,
      desc: site.desc || '本地新增网站',
      'data-desc': `${site.title || ''} ${site.desc || ''} ${site.url || ''}`
    });
  });

  return merged;
}

function refreshCards() {
  if (!_linksData) return;
  renderCards(mergeCustomSites(_linksData, getCustomSites()));
}

function renderCustomSiteList() {
  const box = document.getElementById('customSites');
  if (!box) return;
  const sites = getCustomSites();
  box.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'custom-sites-title';
  title.textContent = sites.length ? '本地新增' : '暂无本地新增网站';
  box.appendChild(title);

  sites.forEach(site => {
    const row = document.createElement('div');
    row.className = 'custom-site-row';

    const info = document.createElement('div');
    info.className = 'custom-site-info';
    const name = document.createElement('strong');
    name.textContent = site.title;
    const meta = document.createElement('span');
    meta.textContent = `${site.section || '其他'} · ${getDomain(site.url) || site.url}`;
    info.appendChild(name);
    info.appendChild(meta);

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '删除';
    del.addEventListener('click', () => {
      saveCustomSites(getCustomSites().filter(item => item.id !== site.id));
      renderCustomSiteList();
      refreshCards();
    });

    row.appendChild(info);
    row.appendChild(del);
    box.appendChild(row);
  });
}

function openManageModal() {
  const modal = document.getElementById('manageModal');
  if (!modal) return;
  renderCustomSiteList();
  modal.hidden = false;
  document.getElementById('siteUrl')?.focus();
}

function openAddSiteModal(sectionName) {
  document.getElementById('siteSection').value = sectionName || '其他';
  document.getElementById('targetSectionName').textContent = sectionName || '其他';
  document.getElementById('siteUrl').value = '';
  document.getElementById('siteTitle').value = '';
  document.getElementById('siteDesc').value = '';
  openManageModal();
}

function closeManageModal() {
  const modal = document.getElementById('manageModal');
  if (modal) modal.hidden = true;
}

function initLocalManager() {
  document.getElementById('closeManageBtn')?.addEventListener('click', closeManageModal);
  document.getElementById('manageModal')?.addEventListener('click', event => {
    if (event.target.id === 'manageModal') closeManageModal();
  });

  document.getElementById('siteForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const url = normalizeUrl(document.getElementById('siteUrl').value);
    const title = document.getElementById('siteTitle').value.trim() || titleFromUrl(url);
    const section = document.getElementById('siteSection').value;
    const desc = document.getElementById('siteDesc').value.trim() || '本地新增网站';
    if (!title || !url) return;

    const domain = getDomain(url);
    if (!domain) {
      document.getElementById('siteUrl').focus();
      return;
    }

    const sites = getCustomSites().filter(site => getDomain(site.url) !== domain);
    sites.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      url,
      section,
      desc
    });
    saveCustomSites(sites);
    event.target.reset();
    document.getElementById('siteSection').value = section;
    document.getElementById('targetSectionName').textContent = section;
    renderCustomSiteList();
    refreshCards();
  });
}

/* ── 渲染分类 Tab ── */
function renderSearchTabs() {
  const tabsEl = document.getElementById('searchTabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = '';
  SEARCH_CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'search-tab' + (cat.id === currentCategoryId ? ' active' : '');
    btn.innerHTML = `<span class="tab-icon">${cat.icon}</span><span class="tab-label">${cat.label}</span>`;
    btn.onclick = () => {
      selectCategory(cat.id);
      // 切换分类时若面板已开，刷新内容
      if (enginePanelOpen) renderEnginePanel();
    };
    tabsEl.appendChild(btn);
  });
}

/* ── 更新搜索框显示的引擎 ── */
function updateSearchBoxEngine() {
  const icon   = document.getElementById('search-engine-icon');
  const nameEl = document.getElementById('engineName');
  if (!icon || !nameEl) return;
  icon.src = engineFavicon(currentEngine);
  icon.onerror = () => { icon.src = DEFAULT_ICON; icon.onerror = null; };
  nameEl.textContent = currentEngine.name;
}

/* ── 切换分类 ── */
function selectCategory(catId) {
  currentCategoryId = catId;
  const cat = SEARCH_CATEGORIES.find(c => c.id === catId);
  currentEngine = cat.engines[0];
  renderSearchTabs();
  updateSearchBoxEngine();
}

/* ── 切换引擎 ── */
function selectEngine(engine) {
  currentEngine = engine;
  updateSearchBoxEngine();
  renderEnginePanel(); // 刷新高亮
  document.getElementById('searchInput').focus();
}

/* ── 渲染内联引擎面板（只显示当前分类） ── */
function renderEnginePanel() {
  const panel = document.getElementById('enginePanel');
  if (!panel) return;
  panel.innerHTML = '';
  const cat = SEARCH_CATEGORIES.find(c => c.id === currentCategoryId);
  if (!cat) return;

  cat.engines.forEach(engine => {
    const btn = document.createElement('button');
    btn.className = 'engine-btn' + (engine === currentEngine ? ' active' : '');

    const img = document.createElement('img');
    img.src = engineFavicon(engine);
    img.alt = engine.name;
    img.onerror = function () {
      const d = engine.domain;
      if (d && !this.dataset.fallbackTried) {
        this.dataset.fallbackTried = '1';
        this.src = `https://${d}/favicon.ico`;
      } else {
        this.src = DEFAULT_ICON;
        this.onerror = null;
      }
    };

    const label = document.createElement('span');
    label.textContent = engine.name;

    btn.appendChild(img);
    btn.appendChild(label);
    btn.onclick = () => selectEngine(engine);
    panel.appendChild(btn);
  });
}

/* ── 开关内联面板 ── */
function toggleEnginePanel() {
  enginePanelOpen ? closeEnginePanel() : openEnginePanel();
}

function openEnginePanel() {
  const panel = document.getElementById('enginePanel');
  if (!panel) return;
  enginePanelOpen = true;
  renderEnginePanel();
  panel.style.display = 'flex';
  const arrow = document.getElementById('engineArrow');
  if (arrow) arrow.style.transform = 'rotate(180deg)';
}

function closeEnginePanel() {
  enginePanelOpen = false;
  const panel = document.getElementById('enginePanel');
  if (panel) panel.style.display = 'none';
  const arrow = document.getElementById('engineArrow');
  if (arrow) arrow.style.transform = '';
}

/* ── 清空搜索框 ── */
function clearSearch() {
  const input   = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  input.value   = '';
  clearBtn.style.display = 'none';
  input.focus();
  filterLinks();
}
window.clearSearch = clearSearch;

/* ── 同步清空按钮显隐 ── */
function syncClearBtn() {
  const input    = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  clearBtn.style.display = input.value.length > 0 ? 'flex' : 'none';
}

/* ── 执行搜索 ── */
function doSearch() {
  const kw = document.getElementById('searchInput').value.trim();
  if (kw) window.open(currentEngine.url + encodeURIComponent(kw), '_blank');
}
window.doSearch = doSearch;

/* ── 站内筛选 ── */
function filterLinks() {
  syncClearBtn();
  const query = document.getElementById('searchInput').value.toLowerCase().trim();

  document.querySelectorAll('.card').forEach(card => {
    if (!query) {
      card.classList.remove('hidden');
    } else {
      const title    = card.querySelector('.title')?.innerText.toLowerCase() ?? '';
      const datadesc = (card.dataset.desc ?? '').toLowerCase();
      card.classList.toggle('hidden', !title.includes(query) && !datadesc.includes(query));
    }
  });

  document.querySelectorAll('.section').forEach(section => {
    if (!query) {
      section.classList.remove('section-hidden');
    } else {
      const visible = section.querySelectorAll('.card:not(.hidden)');
      section.classList.toggle('section-hidden', visible.length === 0);
    }
  });
}
window.filterLinks = filterLinks;

/* ── 动态渲染卡片 ── */
function renderCards(sections) {
  const main = document.getElementById('main-content');
  main.innerHTML = '';

  const seen = new Set();

  sections.forEach(({ section, items }) => {
    const uniqueItems = items.filter(item => {
      const key = getDomain(item.url) || item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (!uniqueItems.length) return;
    const sortedItems = applySectionSort(section, uniqueItems);

    const sec = document.createElement('div');
    sec.className = 'section';

    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = section;
    sec.appendChild(h2);

    const grid = document.createElement('div');
    grid.className = 'link-container';

    sortedItems.forEach(item => {
      const a = document.createElement('a');
      a.href         = getCardUrl(item);
      a.target       = '_blank';
      a.className    = 'card';
      a.dataset.desc = item['data-desc'] ?? item.desc ?? '';
      a.dataset.section = section;
      a.dataset.key = getItemKey(item);
      a.rel          = 'noopener noreferrer';
      a.draggable    = true;
      if (item.intranet) {
        a.dataset.url      = item.url;
        a.dataset.intranet = item.intranet;
      }

      const img = document.createElement('img');
      img.className = 'favicon';
      img.loading   = 'lazy';
      img.alt       = `${item.title} logo`;
      img.src       = faviconSrc(item.url);
      img.onerror   = function () {
        const domain = getDomain(item.url);
        if (!this.dataset.localFallbackTried) {
          this.dataset.localFallbackTried = '1';
          this.src = localIconSrc(domain);
        } else if (FAVICON_PROVIDER !== 'local' && domain && !this.dataset.rootFallbackTried) {
          this.dataset.rootFallbackTried = '1';
          this.dataset.fallbackTried = '1';
          this.src = `https://${domain}/favicon.ico`;
        } else {
          this.src = fallbackIcon(item.title, item.url);
          this.onerror = null;
        }
      };

      const top = document.createElement('div');
      top.className = 'card-top';
      const titleEl = document.createElement('span');
      titleEl.className = 'title';
      titleEl.textContent = item.title;
      top.appendChild(img);
      top.appendChild(titleEl);

      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = item.desc ?? '';

      const popup = document.createElement('div');
      popup.className = 'info-popup';
      popup.textContent = getDomain(getCardUrl(item)) ?? getCardUrl(item);

      a.appendChild(top);
      a.appendChild(desc);
      a.appendChild(popup);
      grid.appendChild(a);
    });

    const addCard = document.createElement('button');
    addCard.type = 'button';
    addCard.className = 'card add-card';
    addCard.setAttribute('aria-label', `新增到${section}`);
    addCard.innerHTML = '<span class="add-card-plus">+</span>';
    addCard.addEventListener('click', () => openAddSiteModal(section));
    grid.appendChild(addCard);

    sec.appendChild(grid);
    main.appendChild(sec);
  });

  bindDragSort();
  bindTouchTooltip();
}

function getDragTarget(container, x, y) {
  const cards = [...container.querySelectorAll('.card:not(.dragging):not(.add-card):not(.hidden)')];

  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const distance = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2));
    if (distance < closest.distance) return { distance, element: child, box };
    return closest;
  }, { distance: Number.POSITIVE_INFINITY, element: null, box: null });
}

function saveGridOrder(grid) {
  const sectionName = grid.closest('.section')?.querySelector('.section-title')?.textContent;
  if (!sectionName) return;
  const keys = [...grid.querySelectorAll('.card:not(.add-card)')]
    .map(card => card.dataset.key)
    .filter(Boolean);
  saveSectionSortOrder(sectionName, keys);
}

function bindDragSort() {
  document.querySelectorAll('.link-container').forEach(grid => {
    grid.addEventListener('dragover', event => {
      event.preventDefault();
      const dragging = document.querySelector('.card.dragging');
      if (!dragging || dragging.parentElement !== grid) return;
      const addCard = grid.querySelector('.add-card');
      const target = getDragTarget(grid, event.clientX, event.clientY);
      if (!target.element) {
        grid.insertBefore(dragging, addCard);
      } else if (event.clientY < target.box.top + target.box.height / 2 ||
        (Math.abs(event.clientY - (target.box.top + target.box.height / 2)) < target.box.height / 2 &&
          event.clientX < target.box.left + target.box.width / 2)) {
        grid.insertBefore(dragging, target.element);
      } else {
        grid.insertBefore(dragging, target.element.nextSibling === addCard ? addCard : target.element.nextSibling);
      }
    });

    grid.addEventListener('drop', event => {
      event.preventDefault();
      saveGridOrder(grid);
    });
  });

  document.querySelectorAll('.card:not(.add-card)').forEach(card => {
    card.addEventListener('dragstart', () => {
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      saveGridOrder(card.closest('.link-container'));
    });
  });
}

/* ── 移动端长按 Tooltip ── */
function bindTouchTooltip() {
  if (window.matchMedia('(hover: none)').matches) {
    let timer = null;
    let activeCard = null;

    function clearActive() {
      if (activeCard) { activeCard.classList.remove('touch-active'); activeCard = null; }
      clearTimeout(timer); timer = null;
    }

    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('touchstart', () => {
        clearActive();
        timer = setTimeout(() => {
          card.classList.add('touch-active');
          activeCard = card;
          setTimeout(clearActive, 2000);
        }, 500);
      }, { passive: true });

      card.addEventListener('touchend',  () => { if (timer) clearTimeout(timer); });
      card.addEventListener('touchmove', () => { clearTimeout(timer); timer = null; }, { passive: true });
    });

    document.addEventListener('touchstart', e => {
      if (activeCard && !activeCard.contains(e.target)) clearActive();
    }, { passive: true });
  }
}

/* ── 随机背景 ── */
function changeBackground() {
  if (!ENABLE_RANDOM_BACKGROUND) return;
  const url = `${BG_API}${Date.now()}`;
  document.getElementById('bgLayer').style.backgroundImage = `url('${url}')`;
}

/* ── 入口 ── */
document.addEventListener('DOMContentLoaded', async () => {
  changeBackground();
  initLocalManager();

  renderSearchTabs();
  updateSearchBoxEngine();

  // 引擎触发器点击
  document.getElementById('engineTrigger')?.addEventListener('click', () => {
    toggleEnginePanel();
  });

  // 搜索框键盘事件
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
    if (e.key === 'Escape') closeEnginePanel();
  });

  try {
    const res  = await fetch(LINKS_FILE);
    const data = await res.json();
    _linksData = data;
    refreshCards();
  } catch (err) {
    console.error('加载 links.json 失败：', err);
    document.getElementById('main-content').innerHTML =
      '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:2rem;">链接数据加载失败，请检查 links.json 文件。</p>';
  }
});
