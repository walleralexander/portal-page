// Dark mode toggle
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Date and time display
function updateDateTime() {
    const el = document.getElementById('datetime');
    const now = new Date();
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    el.textContent = now.toLocaleDateString('de-DE', options);
}

function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Icon SVGs from Lucide (https://lucide.dev/icons)
// Available icons: home, cloud, image, globe/www/website, flag, search, calculator, code,
// help-circle, book, edit, terminal, message-square, play-circle, mail, calendar,
// file-text, clipboard, link, star, heart, settings, user, users, folder, download,
// upload, external-link, rss, database, server, shield, lock, unlock, key, bell, contact
// Country/Region flags: flag-at, flag-de, flag-eu, flag-wien, flag-noe, flag-ooe,
// flag-stmk, flag-ktn, flag-sbg, flag-tirol, flag-vbg, flag-bgld
const icons = {
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'cloud': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    'globe': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    'www': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    'website': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    'flag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    'calculator': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>',
    'code': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    'help-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'book': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    'edit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    'terminal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    'message-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'play-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'calendar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    'clipboard': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'folder': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    'upload': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    'external-link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    'rss': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
    'database': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
    'server': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    'lock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    'unlock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    'key': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>',
    'bell': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    'contact': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect width="18" height="18" x="3" y="4" rx="2"/><circle cx="12" cy="10" r="2"/><line x1="8" x2="8" y1="2" y2="4"/><line x1="16" x2="16" y1="2" y2="4"/></svg>',
    // Country and region flags
    'flag-at': '<svg viewBox="0 0 24 16"><rect width="24" height="16" fill="#ed2939"/><rect y="5.33" width="24" height="5.33" fill="#fff"/></svg>',
    'flag-de': '<svg viewBox="0 0 24 16"><rect width="24" height="5.33" fill="#000"/><rect y="5.33" width="24" height="5.33" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffcc00"/></svg>',
    'flag-eu': '<svg viewBox="0 0 24 16"><rect width="24" height="16" fill="#003399"/><g fill="#ffcc00"><circle cx="12" cy="3" r="1"/><circle cx="12" cy="13" r="1"/><circle cx="7.1" cy="4.5" r="1"/><circle cx="16.9" cy="4.5" r="1"/><circle cx="7.1" cy="11.5" r="1"/><circle cx="16.9" cy="11.5" r="1"/><circle cx="4.5" cy="8" r="1"/><circle cx="19.5" cy="8" r="1"/><circle cx="5.5" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="10.5" r="1"/><circle cx="18.5" cy="10.5" r="1"/></g></svg>',
    'flag-ch': '<svg viewBox="0 0 24 16"><rect width="24" height="16" fill="#ff0000"/><rect x="10" y="3" width="4" height="10" fill="#fff"/><rect x="7" y="6" width="10" height="4" fill="#fff"/></svg>',
    // Austrian Bundesländer
    'flag-wien': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/></svg>',
    'flag-noe': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#1e4785"/><rect y="8" width="24" height="8" fill="#ffd735"/></svg>',
    'flag-ooe': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#ed2939"/></svg>',
    'flag-stmk': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#00873e"/></svg>',
    'flag-ktn': '<svg viewBox="0 0 24 16"><rect width="24" height="5.33" fill="#ffd735"/><rect y="5.33" width="24" height="5.33" fill="#ed2939"/><rect y="10.66" width="24" height="5.34" fill="#fff"/></svg>',
    'flag-sbg': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/></svg>',
    'flag-tirol': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#ed2939"/></svg>',
    'flag-vbg': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/></svg>',
    'flag-bgld': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#ffd735"/></svg>'
};

// Generate a three-color horizontal flag SVG
// Format: couleur-color1-color2-color3 (e.g., couleur-red-white-gold)
function generateColorFlag(colorString) {
    const parts = colorString.split('-');
    if (parts.length !== 4 || parts[0] !== 'couleur') {
        return null;
    }
    const [, color1, color2, color3] = parts;
    return `<svg viewBox="0 0 24 16"><rect width="24" height="5.33" fill="${color1}"/><rect y="5.33" width="24" height="5.33" fill="${color2}"/><rect y="10.66" width="24" height="5.34" fill="${color3}"/></svg>`;
}

function getIcon(iconName) {
    // Check for dynamic color flag
    if (iconName && iconName.startsWith('couleur-')) {
        const colorFlag = generateColorFlag(iconName);
        if (colorFlag) {
            return colorFlag;
        }
    }
    return icons[iconName] || icons['link'];
}

// Load and parse YAML configuration
async function loadConfig() {
    try {
        const response = await fetch('links.yaml');
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error loading config:', error);
        return null;
    }
}

// Render the message banner
function renderMessage(message) {
    const messageText = document.getElementById('message-text');
    const messageBanner = document.getElementById('message-banner');

    if (message && message.trim()) {
        messageText.textContent = message;
        messageBanner.style.display = 'block';
    } else {
        messageBanner.style.display = 'none';
    }
}

// Fetch RSS feed and return items
async function fetchRSSItems(feedUrl, maxItems = 5) {
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (!data.contents) {
            return [];
        }

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');

        const parseError = xml.querySelector('parsererror');
        if (parseError) {
            return [];
        }

        const items = xml.querySelectorAll('item');
        return Array.from(items).slice(0, maxItems).map(item => ({
            title: item.querySelector('title')?.textContent || 'Untitled',
            url: item.querySelector('link')?.textContent || '#',
            pubDate: item.querySelector('pubDate')?.textContent
        }));
    } catch (error) {
        console.error('Error fetching RSS:', error);
        return [];
    }
}

// Create a link card element
function createLinkCard(link) {
    const linkCard = document.createElement('a');
    linkCard.className = 'link-card';
    linkCard.href = link.url;
    linkCard.target = '_blank';
    linkCard.rel = 'noopener noreferrer';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'link-icon';
    iconSpan.innerHTML = getIcon(link.icon || 'rss');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'link-title';
    titleSpan.textContent = link.title;

    // Add date subtitle for RSS items
    if (link.pubDate) {
        const dateStr = new Date(link.pubDate).toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'short'
        });
        titleSpan.innerHTML = `${link.title}<span class="link-date">${dateStr}</span>`;
    }

    linkCard.appendChild(iconSpan);
    linkCard.appendChild(titleSpan);
    return linkCard;
}

// Render links from configuration
async function renderLinks(categories) {
    const container = document.getElementById('links-container');
    container.innerHTML = '';

    if (!categories || categories.length === 0) {
        container.innerHTML = '<p class="error">No links configured</p>';
        return;
    }

    for (const category of categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const titleEl = document.createElement('h2');
        titleEl.className = 'category-title';
        titleEl.textContent = category.name;
        categoryDiv.appendChild(titleEl);

        const linksGrid = document.createElement('div');
        linksGrid.className = 'links-grid';

        // Check if this category has an RSS feed
        if (category.rss_feed) {
            linksGrid.innerHTML = '<span class="loading-text">Laden...</span>';
            categoryDiv.appendChild(linksGrid);
            container.appendChild(categoryDiv);

            // Fetch RSS items asynchronously
            const rssItems = await fetchRSSItems(category.rss_feed, category.rss_items || 5);
            linksGrid.innerHTML = '';

            if (rssItems.length === 0) {
                linksGrid.innerHTML = '<span class="error-text">Keine Artikel gefunden</span>';
            } else {
                rssItems.forEach(item => {
                    item.icon = category.rss_icon || 'rss';
                    linksGrid.appendChild(createLinkCard(item));
                });
            }
        } else if (category.links) {
            // Regular links
            category.links.forEach(link => {
                linksGrid.appendChild(createLinkCard(link));
            });
            categoryDiv.appendChild(linksGrid);
            container.appendChild(categoryDiv);
        }
    }
}

// Fetch and render RSS feed using a CORS proxy
async function loadRSSFeed(feedUrl, maxItems = 5) {
    const container = document.getElementById('rss-container');

    if (!feedUrl) {
        container.innerHTML = '<p class="error">No RSS feed configured</p>';
        return;
    }

    try {
        // Use a CORS proxy to fetch the RSS feed
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (!data.contents) {
            throw new Error('Failed to fetch RSS feed');
        }

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');

        // Check for parsing errors
        const parseError = xml.querySelector('parsererror');
        if (parseError) {
            throw new Error('Failed to parse RSS feed');
        }

        const items = xml.querySelectorAll('item');
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<p class="error">No items in feed</p>';
            return;
        }

        const itemsToShow = Array.from(items).slice(0, maxItems);

        itemsToShow.forEach(item => {
            const title = item.querySelector('title')?.textContent || 'Untitled';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent;
            const description = item.querySelector('description')?.textContent || '';

            const itemDiv = document.createElement('div');
            itemDiv.className = 'rss-item';

            const titleEl = document.createElement('h3');
            titleEl.className = 'rss-item-title';
            const linkEl = document.createElement('a');
            linkEl.href = link;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            linkEl.textContent = title;
            titleEl.appendChild(linkEl);
            itemDiv.appendChild(titleEl);

            if (pubDate) {
                const dateEl = document.createElement('p');
                dateEl.className = 'rss-item-date';
                dateEl.textContent = new Date(pubDate).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                itemDiv.appendChild(dateEl);
            }

            // Strip HTML from description and truncate
            if (description) {
                const descEl = document.createElement('p');
                descEl.className = 'rss-item-description';
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = description;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                descEl.textContent = plainText.length > 150
                    ? plainText.substring(0, 150) + '...'
                    : plainText;
                itemDiv.appendChild(descEl);
            }

            container.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error loading RSS feed:', error);
        container.innerHTML = '<p class="error">Failed to load RSS feed. Please check the URL or try again later.</p>';
    }
}

// Apply site configuration (name, logo, favicon)
function applySiteConfig(config) {
    // Site name
    const siteName = config.site_name || 'Portal';
    document.title = siteName;
    document.getElementById('site-name').textContent = siteName;

    // Logo
    const logoEl = document.getElementById('site-logo');
    if (config.logo) {
        logoEl.src = config.logo;
        logoEl.alt = siteName;
        logoEl.classList.remove('hidden');
    }

    // Favicon
    if (config.favicon) {
        const faviconEl = document.getElementById('favicon');
        faviconEl.href = config.favicon;
    }
}

// Initialize the portal
async function init() {
    initTheme();
    initDateTime();

    const config = await loadConfig();

    if (!config) {
        document.getElementById('links-container').innerHTML = '<p class="error">Failed to load configuration</p>';
        return;
    }

    applySiteConfig(config);
    renderMessage(config.message);
    renderLinks(config.categories);
    loadRSSFeed(config.rss_feed, config.rss_items || 5);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
