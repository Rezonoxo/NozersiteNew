let currentpage = 'home';
let contactCooldownExpiry = 0;
let pendingRedirectUrl = null;
let pendingRedirectTarget = null;
let starIntervalId = null;
let activeModalState = null;
let contentData = null;
let musicFadeFrame = null;
let activeSettingsCategory = 'sound';
let nameTypewriterTimeout = null;

// Manual notice toggle for visitors.
const SITE_NOTICE_CONFIG = {
    enabled: true,
    dismissible: true,
    message: 'The website is currently being rebuilt, so some features may not work as expected.'
};

const SETTINGS_KEY = 'nozer_settings_v1';
const DEFAULT_SHORTCUTS = {
    togglePlayPause: 'Space',
    previousTrack: 'ArrowLeft',
    nextTrack: 'ArrowRight',
    openPlaylist: 'KeyP',
    openSettings: 'KeyO',
    gotoHome: 'Digit1',
    gotoAbout: 'Digit2',
    gotoProjects: 'Digit3',
    gotoSkills: 'Digit4',
    gotoContact: 'Digit5'
};

const SHORTCUT_ACTIONS = [
    { id: 'togglePlayPause', title: 'Play / Pause', desc: 'Toggle the current track.' },
    { id: 'previousTrack', title: 'Previous Track', desc: 'Go to the previous song.' },
    { id: 'nextTrack', title: 'Next Track', desc: 'Go to the next song.' },
    { id: 'openPlaylist', title: 'Open Playlist', desc: 'Open the playlist panel.' },
    { id: 'openSettings', title: 'Open Settings', desc: 'Open the settings modal.' },
    { id: 'gotoHome', title: 'Go to Home', desc: 'Switch to Home page.' },
    { id: 'gotoAbout', title: 'Go to About', desc: 'Switch to About page.' },
    { id: 'gotoProjects', title: 'Go to Projects', desc: 'Switch to Projects page.' },
    { id: 'gotoSkills', title: 'Go to Skills', desc: 'Switch to Skills page.' },
    { id: 'gotoContact', title: 'Go to Contact', desc: 'Switch to Contact page.' }
];

const defaultSettings = {
    mute: false,
    volume: 0.6,
    cursorEnabled: true,
    confirmExternal: true,
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    focusOutlines: false,
    dyslexiaFont: false,
    floatingPlayerEnabled: true,
    miniPlayerSnapAssist: true,
    shortcuts: { ...DEFAULT_SHORTCUTS },
    miniPlayerCollapsed: false,
    partnersVisible: true,
    performanceMode: false
};

let settings = loadSettings();
settings.shortcuts = { ...DEFAULT_SHORTCUTS, ...(settings.shortcuts || {}) };

let names = ['Nozer', 'Wiktor', 'Heaven'];
let pageTitles = {
    base: 'Nozer',
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    skills: 'Skills',
    contact: 'Contact'
};
let currentNameIndex = 0;

let musicTracks = [
    {
        name: 'Ride or Die, Pt. 2',
        artist: 'Sevdaliza, Tokischa & Villano Antillano',
        file: 'audio/MT3.mp3',
        image: 'icons/cover3.jpg'
    },
    {
        name: '#habibati',
        artist: 'Poshlaya Molly, HOFMANNITA',
        file: 'audio/MT1.mp3',
        image: 'https://i.pinimg.com/474x/95/e8/27/95e8270466b1aae5199ff8bdc2a7d214.jpg'
    },
    {
        name: 'Đ§ŃĐżĐ° Đ§ŃĐżŃ',
        artist: 'Eldzhey, Poshlaya Molly',
        file: 'audio/MT2.mp3',
        image: 'icons/cover2.jpg'
    },
    {
        name: 'ĐĐ´ŃĐşĐ°ŃŹ ĐşĐľĐ»Ń‹Đ±ĐµĐ»ŃŚĐ˝Đ°ŃŹ',
        artist: 'Poshlaya Molly',
        file: 'audio/MT4.mp3',
        image: 'icons/cover4.jpg'
    },
    {
        name: 'ĐˇŃ‚Ń€Đ¸Đż ĐşĐ»Đ°Đ±',
        artist: 'Poshlaya Molly',
        file: 'audio/MT5.mp3',
        image: 'icons/cover5.jpg'
    },
    {
        name: 'LOYALTY',
        artist: 'Daniel Di Angelo',
        file: 'audio/MT6.mp3',
        image: 'icons/cover6.png'
    },
    {
        name: 'Headlock',
        artist: 'Imogen Heap',
        file: 'audio/MT7.mp3',
        image: 'icons/cover7.png'
    },
    {
        name: '$WERVIN',
        artist: 'purge!',
        file: 'audio/MT8.mp3',
        image: 'icons/cover8.png'
    }
];

let currentMusicTrack = 0;
let musicAudio = null;
let isMusicPlaying = false;
let miniMusicObserver = null;
let isMainPlayerVisible = true;
let aboutFactIndex = -1;
let partnersCarouselState = null;
let partnersSectionCollapsed = false;
const FALLBACK_PARTNER_BANNER = 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=1400&q=80';
let PARTNERS = [
    {
        name: 'winterboard.pl',
        role: 'Promotional partner',
        description: 'WinterBoard is a modern platform that allows Discord server administrators to effectively advertise their communities and attract new members.',
        linkUrl: 'https://winterboard.pl/',
        linkLabel: 'Visit partner',
        logoUrl: 'icons/partners/winterboard-logo.png',
        logoAlt: 'winterboard.pl logo',
        fallbackIconClass: 'fas fa-store',
        bannerUrl: 'icons/partners/winterboardBaner.png'
    },
    {
        name: 'Your Brand Here',
        role: 'Become a Partner',
        description: 'This slot is available. Promote your brand here by becoming an official partner.',
        linkUrl: 'https://nozer.site/',
        linkLabel: 'Become partner',
        logoUrl: 'icons/icon.png',
        logoAlt: 'Partner placeholder logo',
        fallbackIconClass: 'fas fa-handshake',
        bannerUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80'
    }
];
let PROJECTS = [
    {
        id: 'lyute-ai',
        title: 'lyute ai',
        subtitle: 'AI assistant for shop support and customer guidance',
        summary: 'The dedicated AI assistant for my shop, designed to handle inquiries, reduce response time, and keep conversations structured for customers.',
        banner: 'linear-gradient(135deg, rgba(255, 123, 172, 0.82), rgba(75, 27, 95, 0.88) 52%, rgba(9, 14, 32, 0.94))',
        metrics: [
            { label: 'Build Time', value: 'active' },
            { label: 'Role', value: 'full creator' },
            { label: 'Category', value: 'AI support' }
        ],
        tech: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
        highlights: ['Fast answer flow for recurring questions', 'Designed to reduce manual support load', 'Brand-aligned UI and conversation structure'],
        links: [
            { label: 'Website', url: null },
            { label: 'Source', url: null }
        ]
    },
    {
        id: 'spotnif',
        title: 'spotnif',
        subtitle: 'Spotify presence visualizer powered by Lanyard data',
        summary: 'A versatile tool that generates a Lanyard-based Spotify presence card with a cleaner visual system and a more dynamic presentation layer.',
        banner: 'linear-gradient(135deg, rgba(81, 219, 255, 0.84), rgba(20, 67, 116, 0.9) 50%, rgba(6, 13, 28, 0.96))',
        metrics: [
            { label: 'Build Time', value: 'rapid' },
            { label: 'Role', value: 'frontend dev' },
            { label: 'Category', value: 'music widget' }
        ],
        tech: ['HTML', 'CSS', 'JavaScript', 'Lanyard API'],
        highlights: ['Presence-focused interface', 'Optimized for embed-style layouts', 'Built around real-time music activity'],
        links: [
            { label: 'Website', url: null },
            { label: 'Source', url: null }
        ]
    },
    {
        id: 'imagify',
        title: 'imagify',
        subtitle: 'Image editor concept for creators who want speed',
        summary: 'A polished image editor built for creators who want quick, clean results with minimal friction and a straightforward editing flow.',
        banner: 'linear-gradient(135deg, rgba(59, 130, 246, 0.82), rgba(18, 45, 88, 0.9) 52%, rgba(7, 11, 22, 0.96))',
        metrics: [
            { label: 'Build Time', value: 'concept' },
            { label: 'Role', value: 'product + ui' },
            { label: 'Category', value: 'creative tool' }
        ],
        tech: ['HTML', 'CSS', 'JavaScript'],
        highlights: ['Clean interface for quick edits', 'Creator-focused workflow', 'Strong emphasis on ease of use'],
        links: [
            { label: 'Website', url: null },
            { label: 'Source', url: null }
        ]
    },
    {
        id: 'seent',
        title: 'seent',
        subtitle: 'Community-oriented Discord utility bot',
        summary: 'A Discord bot focused on reminders, lightweight announcements, and helpful automations for online communities that need structure without clutter.',
        banner: 'linear-gradient(135deg, rgba(170, 110, 255, 0.84), rgba(61, 35, 105, 0.9) 50%, rgba(10, 12, 26, 0.96))',
        metrics: [
            { label: 'Build Time', value: 'stable' },
            { label: 'Role', value: 'backend dev' },
            { label: 'Category', value: 'discord bot' }
        ],
        tech: ['discord.py', 'Python'],
        highlights: ['Reminder and utility modules', 'Designed for community moderation support', 'Keeps server workflows lightweight'],
        links: [
            { label: 'Website', url: null },
            { label: 'Source', url: null }
        ]
    },
    {
        id: 'void-discord-bot',
        title: 'void discord bot',
        subtitle: 'Moderation, logging, and server tools in one system',
        summary: 'A multi-purpose Discord bot that combines moderation, logging, and server utilities into one manageable toolkit for admins.',
        banner: 'linear-gradient(135deg, rgba(67, 181, 129, 0.82), rgba(24, 73, 56, 0.9) 52%, rgba(6, 16, 18, 0.96))',
        metrics: [
            { label: 'Build Time', value: 'ongoing' },
            { label: 'Role', value: 'system dev' },
            { label: 'Category', value: 'automation' }
        ],
        tech: ['discord.py', 'Python', 'SENAPI'],
        highlights: ['Moderation and event logging', 'Server-side tooling for daily admin work', 'Built to centralize multiple utility flows'],
        links: [
            { label: 'Website', url: null },
            { label: 'Source', url: null }
        ]
    },
    {
        id: 'lyute-bshop',
        title: 'lyute @bshop',
        subtitle: 'Storefront and collaboration space for the community',
        summary: 'A digital storefront for my community, support flow, and collaboration space, designed to feel more structured than a typical simple link hub.',
        banner: 'linear-gradient(135deg, rgba(255, 170, 80, 0.84), rgba(108, 59, 18, 0.9) 50%, rgba(18, 12, 6, 0.96))',
        metrics: [
            { label: 'Build Time', value: 'active' },
            { label: 'Role', value: 'owner' },
            { label: 'Category', value: 'storefront' }
        ],
        tech: ['B2B', 'Shop', 'Community'],
        highlights: ['Community-first storefront layout', 'Built for support and sales together', 'Simple journey from discovery to contact'],
        links: [
            { label: 'Join', url: null },
            { label: 'Source', url: null }
        ]
    },
    {
        id: 'behance-portfolio',
        title: 'nozercode on behance',
        subtitle: 'Branding, social visuals, and graphic portfolio',
        summary: 'A collection of branding work, concept visuals, social media graphics, and presentation pieces published in one portfolio space.',
        banner: 'linear-gradient(135deg, rgba(61, 133, 255, 0.84), rgba(20, 49, 101, 0.9) 52%, rgba(8, 11, 24, 0.96))',
        metrics: [
            { label: 'Type', value: 'visual work' },
            { label: 'Role', value: 'designer' },
            { label: 'Platform', value: 'behance' }
        ],
        tech: ['Branding', 'Social Media', 'Concept Work', 'Behance'],
        highlights: ['Central place for graphic projects', 'Used as public portfolio for visual work', 'Keeps design output separate but inside the main project list'],
        links: [
            { label: 'Portfolio', url: 'https://www.behance.net/nozercode' },
            { label: 'Source', url: null }
        ]
    }
];
let aboutFacts = [
    { text: 'In 2025, I won the biggest graphic design contest at my local school, earning prizes worth over USD 1,000.', tag: 'Achievement' },
    { text: 'I have already traveled to more than eight countries.', tag: 'Travel' },
    { text: 'I have two pets: a cockatiel parrot and a crested gecko.', tag: 'Pets' },
    { text: 'I reached Rysy peak in Slovakia and also climbed other mountain peaks in Poland and Slovakia.', tag: 'Mountains' },
    { text: 'I participated in the Erasmus+ program in Malaga, Spain.', tag: 'Erasmus+' },
    { text: 'I can move my left ear and crack three fingers on my hands.', tag: 'Fun Skill' },
    { text: 'I love playing Roblox, especially meeting new people on voice chat.', tag: 'Roblox' }
];

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...defaultSettings };
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed };
    } catch (error) {
        return { ...defaultSettings };
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderFavoritesFromContent(favorites) {
    if (!favorites) return;
    const card = document.getElementById('favorites-card');
    if (!card) return;

    const subtitleEl = card.querySelector('.favorites-subtitle');
    const introEl = card.querySelector('.favorites-intro');
    const tabsContainer = card.querySelector('.favorites-tabs');
    const grid = card.querySelector('.favorites-grid');
    if (!tabsContainer || !grid) return;

    if (subtitleEl && favorites.subtitle) subtitleEl.textContent = favorites.subtitle;
    if (introEl && favorites.intro) introEl.textContent = favorites.intro;

    const categories = Array.isArray(favorites.categories) ? favorites.categories : [];
    const items = Array.isArray(favorites.items) ? favorites.items : [];

    tabsContainer.innerHTML = categories.map((category, index) => `
        <button class="fav-tab ${index === 0 ? 'active' : ''}" data-fav="${escapeHtml(category.id)}" type="button">${escapeHtml(category.label)}</button>
    `).join('');

    grid.innerHTML = items.map((item) => `
        <div class="favorite-item" data-fav="${escapeHtml(item.category)}">
            <a class="favorite-tile" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="--fav-accent: ${escapeHtml(item.accent)};">
                <div class="favorite-media">
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || item.name)}" loading="lazy" decoding="async">
                    <span class="favorite-badge">${escapeHtml(item.badge || '')}</span>
                </div>
                <div class="favorite-meta">
                    <div class="favorite-topline">
                        <h4 class="favorite-name">${escapeHtml(item.name)}</h4>
                        <span class="favorite-link"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></span>
                    </div>
                    <p class="favorite-desc">${escapeHtml(item.description || '')}</p>
                </div>
            </a>
        </div>
    `).join('');
}

function applyContentConfig(data) {
    if (!data || typeof data !== 'object') return;
    contentData = data;

    if (Array.isArray(data.names) && data.names.length) {
        names = data.names.slice();
    }

    if (data.pageTitles && typeof data.pageTitles === 'object') {
        pageTitles = { ...pageTitles, ...data.pageTitles };
    }

    if (Array.isArray(data.musicTracks) && data.musicTracks.length) {
        musicTracks = data.musicTracks.slice();
    }

    if (Array.isArray(data.partners) && data.partners.length) {
        PARTNERS = data.partners.slice();
    }

    if (Array.isArray(data.projects) && data.projects.length) {
        PROJECTS = data.projects.slice();
    }

    if (Array.isArray(data.randomFacts) && data.randomFacts.length) {
        aboutFacts = data.randomFacts.slice();
    }

    if (data.siteNotice) {
        SITE_NOTICE_CONFIG.enabled = data.siteNotice.enabled !== false;
        SITE_NOTICE_CONFIG.dismissible = data.siteNotice.dismissible !== false;
        SITE_NOTICE_CONFIG.message = data.siteNotice.message || SITE_NOTICE_CONFIG.message;
    }

    const changingName = document.getElementById('changing-name');
    if (changingName && names.length) {
        changingName.textContent = names[0];
    }

    if (data.home?.taglinePrefix && changingName?.parentNode?.firstChild) {
        changingName.parentNode.firstChild.textContent = `${data.home.taglinePrefix} `;
    }

    if (Array.isArray(data.home?.invites)) {
        data.home.invites.slice(0, 2).forEach((invite, index) => {
            const offset = index + 1;
            const nameEl = document.getElementById(`invite-${offset}-name`);
            const descEl = document.getElementById(`invite-${offset}-description`);
            const btnEl = document.getElementById(`invite-${offset}-button`);
            if (nameEl && invite.name) nameEl.textContent = invite.name;
            if (descEl && invite.description) descEl.textContent = invite.description;
            if (btnEl) {
                if (invite.buttonLabel) btnEl.textContent = invite.buttonLabel.toUpperCase();
                if (invite.url) btnEl.onclick = () => safeOpenExternal(invite.url);
            }
        });
    }

    const locationEl = document.getElementById('home-location-value');
    const timezoneEl = document.getElementById('home-timezone-value');
    if (locationEl && data.home?.info?.location) locationEl.textContent = data.home.info.location;
    if (timezoneEl && data.home?.info?.timezone) timezoneEl.textContent = data.home.info.timezone;

    const weatherLocationEl = document.getElementById('weather-location');
    const weatherSubtitleEl = document.getElementById('weather-subtitle');
    if (weatherLocationEl && data.weather?.locationLabel) weatherLocationEl.textContent = data.weather.locationLabel;
    if (weatherSubtitleEl && data.weather?.subtitle) weatherSubtitleEl.textContent = data.weather.subtitle;

    if (data.about?.randomFactPlaceholder) {
        const placeholder = document.getElementById('about-fact-text');
        if (placeholder) placeholder.textContent = data.about.randomFactPlaceholder;
    }

    if (Array.isArray(data.about?.cards)) {
        const cardContentEls = Array.from(document.querySelectorAll('#about [data-about-card-index]'));
        data.about.cards.forEach((card, index) => {
            const target = cardContentEls[index];
            if (!target) return;
            const titleEl = target.querySelector('h3');
            const textEl = target.querySelector('.about-panel-text');
            if (titleEl && card.title) titleEl.textContent = card.title;
            if (textEl && card.text) textEl.textContent = card.text;
        });
    }

    if (data.about?.finalCard) {
        const finalCard = document.querySelector('.about-growth-card');
        if (finalCard) {
            const titleEl = finalCard.querySelector('h3');
            const textEl = finalCard.querySelector('.about-panel-text');
            if (titleEl && data.about.finalCard.title) titleEl.textContent = data.about.finalCard.title;
            if (textEl && data.about.finalCard.text) textEl.textContent = data.about.finalCard.text;
        }
    }

    if (data.workStatus) {
        const workStatus = document.getElementById('work-status');
        const workText = document.getElementById('work-status-text');
        if (workStatus) {
            if (data.workStatus.openLabel) workStatus.dataset.openLabel = data.workStatus.openLabel;
            if (data.workStatus.closedLabel) workStatus.dataset.closedLabel = data.workStatus.closedLabel;
        }
        if (workText && data.workStatus.openLabel) {
            workText.textContent = data.workStatus.openLabel;
        }
    }

    if (data.contact) {
        const contactTagline = document.getElementById('contact-tagline');
        const responseNote = document.getElementById('contact-response-note');
        const primaryCta = document.querySelector('#contact .contact-now-btn span');
        const secondaryCta = document.querySelector('#contact .contact-secondary-btn span');

        if (contactTagline && data.contact.tagline) contactTagline.textContent = data.contact.tagline;
        if (responseNote && data.contact.responseNote) {
            responseNote.innerHTML = `<i class="fas fa-clock" aria-hidden="true"></i> ${escapeHtml(data.contact.responseNote)}`;
        }
        if (primaryCta && data.contact.primaryCta) primaryCta.textContent = data.contact.primaryCta;
        if (secondaryCta && data.contact.secondaryCta) secondaryCta.textContent = data.contact.secondaryCta;
    }

    if (data.favorites) {
        renderFavoritesFromContent(data.favorites);
    }

    updateDocumentTitle(currentpage);
}

async function loadContentConfig() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Unable to load content.json');
        const data = await response.json();
        applyContentConfig(data);
    } catch (error) {
        console.warn('Using embedded fallback content.', error);
    }
}

function runWhenIdle(callback, timeout = 1200) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => callback(), { timeout });
        return;
    }
    setTimeout(callback, 220);
}

function optimizeStaticMediaLoading() {
    const images = Array.from(document.querySelectorAll('img'));
    images.forEach((img, index) => {
        if (!img.getAttribute('loading')) {
            img.setAttribute('loading', index < 6 ? 'eager' : 'lazy');
        }
        if (!img.getAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
        if (!img.getAttribute('fetchpriority')) {
            img.setAttribute('fetchpriority', index < 2 ? 'high' : 'auto');
        }
    });
}

function normalizeShortcutCode(value) {
    if (typeof value !== 'string') return '';
    return value.trim();
}

function getShortcutLabel(code) {
    if (!code) return 'Unassigned';
    const map = {
        Space: 'Space',
        ArrowLeft: 'Arrow Left',
        ArrowRight: 'Arrow Right',
        ArrowUp: 'Arrow Up',
        ArrowDown: 'Arrow Down',
        Escape: 'Escape',
        Enter: 'Enter',
        Backspace: 'Backspace',
        Tab: 'Tab'
    };
    if (map[code]) return map[code];
    if (code.startsWith('Key')) return code.slice(3).toUpperCase();
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`;
    return code;
}

function executeShortcutAction(actionId) {
    switch (actionId) {
        case 'togglePlayPause':
            togglePlayPause();
            return true;
        case 'previousTrack':
            previousTrack();
            return true;
        case 'nextTrack':
            nextTrack();
            return true;
        case 'openPlaylist':
            openPlaylistOverlay();
            return true;
        case 'openSettings':
            openSettings();
            return true;
        case 'gotoHome':
            showpage('home');
            return true;
        case 'gotoAbout':
            showpage('about');
            return true;
        case 'gotoProjects':
            showpage('projects');
            return true;
        case 'gotoSkills':
            showpage('skills');
            return true;
        case 'gotoContact':
            showpage('contact');
            return true;
        default:
            return false;
    }
}

function handleGlobalShortcut(event) {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;
    if (isTyping || document.body.classList.contains('capturing-shortcut')) return false;
    if (activeModalState?.overlay) return false;
    if (event.altKey || event.ctrlKey || event.metaKey) return false;

    const code = normalizeShortcutCode(event.code);
    if (!code) return false;

    const shortcuts = settings.shortcuts || {};
    const action = Object.keys(shortcuts).find((id) => normalizeShortcutCode(shortcuts[id]) === code);
    if (!action) return false;

    event.preventDefault();
    return executeShortcutAction(action);
}

function initSettingsCategories() {
    const modal = document.querySelector('.settings-modal');
    if (!modal) return;

    const tabs = Array.from(modal.querySelectorAll('.settings-category-btn'));
    const sections = Array.from(modal.querySelectorAll('.settings-section[data-settings-category]'));
    const searchInput = document.getElementById('settings-search');
    const resetAllBtn = document.getElementById('setting-reset-all');
    const emptyState = document.getElementById('settings-search-empty');
    if (!tabs.length || !sections.length) return;

    const updateSectionsVisibility = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const hasQuery = query.length > 0;
        let matchCount = 0;

        tabs.forEach((tab) => {
            const active = tab.dataset.settingsCategory === activeSettingsCategory;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        sections.forEach((section) => {
            const isActivePage = section.dataset.settingsCategory === activeSettingsCategory;
            const sectionItems = Array.from(section.querySelectorAll('.settings-item, .shortcut-item'));
            section.hidden = !isActivePage;
            if (!isActivePage) return;

            if (hasQuery && sectionItems.length) {
                sectionItems.forEach((item) => {
                    const text = (item.textContent || '').toLowerCase();
                    const match = text.includes(query);
                    item.hidden = !match;
                    if (match) matchCount += 1;
                });
                return;
            }

            sectionItems.forEach((item) => { item.hidden = false; });
            matchCount += sectionItems.length;
        });

        if (emptyState) {
            emptyState.hidden = !hasQuery || matchCount > 0;
        }
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            activeSettingsCategory = tab.dataset.settingsCategory || 'sound';
            updateSectionsVisibility();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', updateSectionsVisibility);
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            const accepted = window.confirm('Reset all settings to defaults?');
            if (!accepted) return;

            settings = {
                ...defaultSettings,
                shortcuts: { ...DEFAULT_SHORTCUTS }
            };
            saveSettings();
            applySettings();
            syncSettingsUI();
            activeSettingsCategory = 'sound';
            if (searchInput) searchInput.value = '';
            const miniPlayer = document.getElementById('mini-music-player');
            if (miniPlayer) {
                miniPlayer.style.left = '';
                miniPlayer.style.top = '';
                miniPlayer.style.right = '';
                miniPlayer.style.bottom = '';
            }
            updateSectionsVisibility();

            const shortcutButtons = Array.from(document.querySelectorAll('.shortcut-bind-btn'));
            shortcutButtons.forEach((button) => {
                const actionId = button.getAttribute('data-shortcut-action');
                if (!actionId) return;
                button.textContent = getShortcutLabel(settings.shortcuts?.[actionId] || '');
            });
        });
    }

    const defaultTab = tabs.find((tab) => tab.classList.contains('active')) || tabs[0];
    if (defaultTab) {
        activeSettingsCategory = defaultTab.dataset.settingsCategory || 'sound';
    }
    updateSectionsVisibility();
}

function renderProjectsSection() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = PROJECTS.map((project) => {
        const tagsHtml = (project.tech || []).slice(0, 4).map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('');
        const searchBlob = [
            project.title,
            project.subtitle,
            project.summary,
            ...(project.tech || []),
            ...(project.highlights || [])
        ].join(' ').toLowerCase();

        return `
            <article class="project-card project-showcase-card simple-project-card" data-project-id="${escapeHtml(project.id)}" data-project-search="${escapeHtml(searchBlob)}">
                <div class="project-banner" style="background:${escapeHtml(project.banner)}">
                    <span class="project-banner-pill">${escapeHtml((project.tech || [])[0] || 'project')}</span>
                </div>
                <div class="project-card-body">
                    <h3 class="project-title">${escapeHtml(project.title)}</h3>
                    <p class="project-subtitle">${escapeHtml(project.subtitle)}</p>
                    <p class="project-desc">${escapeHtml(project.summary)}</p>
                    <div class="project-tags">${tagsHtml}</div>
                    <div class="project-actions">
                        <button class="project-action project-action-primary" type="button" onclick="openProjectDetails('${escapeHtml(project.id)}')">
                            View Project Details <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function initProjectsSearch() {
    const input = document.getElementById('projects-search');
    const emptyState = document.getElementById('projects-search-empty');
    const cards = Array.from(document.querySelectorAll('#projects .project-card'));
    if (!input || !cards.length) return;

    const applyFilter = () => {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = card.getAttribute('data-project-search') || '';
            const match = !query || haystack.includes(query);
            card.hidden = !match;
            if (match) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.hidden = !query || visibleCount > 0;
        }
    };

    input.addEventListener('input', applyFilter);
    applyFilter();
}

function initAboutSearch() {
    const input = document.getElementById('about-search');
    const emptyState = document.getElementById('about-search-empty');
    const cards = Array.from(document.querySelectorAll('#about [data-about-card]'));
    if (!input || !cards.length) return;

    const applyFilter = () => {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const title = card.querySelector('h3')?.textContent || '';
            const text = card.querySelector('.about-panel-text')?.textContent || '';
            const tags = Array.from(card.querySelectorAll('.about-panel-tags span')).map((tag) => tag.textContent || '').join(' ');
            const searchBlob = `${card.getAttribute('data-about-search') || ''} ${title} ${text} ${tags}`.toLowerCase();
            const match = !query || searchBlob.includes(query);
            card.hidden = !match;
            if (match) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.hidden = !query || visibleCount > 0;
        }
    };

    input.addEventListener('input', applyFilter);
    applyFilter();
}

function getProjectById(projectId) {
    return PROJECTS.find((project) => project.id === projectId) || null;
}

function renderProjectDetails(project) {
    const bannerEl = document.getElementById('project-modal-banner');
    const titleEl = document.getElementById('project-modal-title');
    const subtitleEl = document.getElementById('project-modal-subtitle');
    const metricsEl = document.getElementById('project-modal-metrics');
    const descriptionEl = document.getElementById('project-modal-description');
    const tagsEl = document.getElementById('project-modal-tags');
    const highlightsEl = document.getElementById('project-modal-highlights');
    const linksEl = document.getElementById('project-modal-links');
    if (!project || !bannerEl || !titleEl || !subtitleEl || !metricsEl || !descriptionEl || !tagsEl || !highlightsEl || !linksEl) return;

    bannerEl.style.background = project.banner || 'linear-gradient(135deg, rgba(70, 90, 255, 0.75), rgba(8, 12, 24, 0.94))';
    titleEl.textContent = project.title || 'Project';
    subtitleEl.textContent = project.subtitle || '';
    descriptionEl.textContent = project.summary || '';

    metricsEl.innerHTML = (project.metrics || []).map((metric) => `
        <span class="project-modal-metric">
            <small>${escapeHtml(metric.label)}</small>
            <strong>${escapeHtml(metric.value)}</strong>
        </span>
    `).join('');

    tagsEl.innerHTML = (project.tech || []).map((tag) => `<span class="project-modal-tag">${escapeHtml(tag)}</span>`).join('');
    highlightsEl.innerHTML = (project.highlights || []).map((highlight) => `
        <div class="project-modal-highlight">
            <i class="fas fa-check"></i>
            <span>${escapeHtml(highlight)}</span>
        </div>
    `).join('');

    linksEl.innerHTML = (project.links || []).map((link) => {
        if (!link.url) {
            return `
                <span class="project-modal-link disabled">
                    <span>${escapeHtml(link.label)}</span>
                    <small>Private</small>
                </span>
            `;
        }

        return `
            <a class="project-modal-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                <span>${escapeHtml(link.label)}</span>
                <i class="fas fa-arrow-up-right-from-square"></i>
            </a>
        `;
    }).join('');
}

function openProjectDetails(projectId) {
    const project = getProjectById(projectId);
    const overlay = document.getElementById('project-overlay');
    const modal = overlay ? overlay.querySelector('.project-modal') : null;
    if (!project || !overlay || !modal) return;
    renderProjectDetails(project);
    activateModal(overlay, modal, '.project-modal-close');
}

function closeProjectDetails() {
    const overlay = document.getElementById('project-overlay');
    if (overlay) deactivateModal(overlay);
}

function initProjectDetailsOverlay() {
    const overlay = document.getElementById('project-overlay');
    if (!overlay) return;
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeProjectDetails();
        }
    });
}

function initSkillsSearch() {
    const input = document.getElementById('skills-search');
    const countEl = document.getElementById('skills-search-count');
    const emptyState = document.getElementById('skills-search-empty');
    const cards = Array.from(document.querySelectorAll('#skills .language-card'));
    const groups = Array.from(document.querySelectorAll('#skills .skills-group'));
    if (!input || !cards.length || !groups.length) return;
    const totalSkills = cards.length;

    const applyFilter = () => {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const name = card.querySelector('.language-name')?.textContent || '';
            const alt = card.querySelector('img')?.getAttribute('alt') || '';
            const groupTitle = card.closest('.skills-group')?.querySelector('.skills-section-title span')?.textContent || '';
            const haystack = `${name} ${alt} ${groupTitle}`.toLowerCase();
            const match = !query || haystack.includes(query);
            card.hidden = !match;
            if (match) visibleCount += 1;
        });

        groups.forEach((group) => {
            const groupCards = Array.from(group.querySelectorAll('.language-card'));
            const hasVisible = groupCards.some((card) => !card.hidden);
            group.hidden = !hasVisible;
            const badge = group.querySelector('.skills-group-count');
            if (badge) {
                const visibleInGroup = groupCards.filter((card) => !card.hidden).length;
                badge.textContent = String(visibleInGroup);
            }
        });

        if (emptyState) {
            emptyState.hidden = !query || visibleCount > 0;
        }

        if (countEl) {
            if (!query) {
                countEl.textContent = `showing all ${totalSkills} skills`;
            } else {
                countEl.textContent = `showing ${visibleCount} of ${totalSkills} skills`;
            }
        }
    };

    input.addEventListener('input', applyFilter);
    applyFilter();
}

function initShortcutSettings() {
    const list = document.getElementById('shortcut-list');
    const resetBtn = document.getElementById('shortcut-reset-btn');
    if (!list || !resetBtn) return;
    let captureHandler = null;

    const render = () => {
        list.innerHTML = '';
        SHORTCUT_ACTIONS.forEach((action) => {
            const row = document.createElement('div');
            row.className = 'shortcut-item';
            row.innerHTML = `
                <div class="shortcut-info">
                    <div class="shortcut-title">${action.title}</div>
                    <div class="shortcut-desc">${action.desc}</div>
                </div>
                <button type="button" class="shortcut-bind-btn" data-shortcut-action="${action.id}">
                    ${getShortcutLabel(settings.shortcuts?.[action.id] || '')}
                </button>
            `;
            list.appendChild(row);
        });

        Array.from(list.querySelectorAll('.shortcut-bind-btn')).forEach((btn) => {
            btn.addEventListener('click', () => {
                if (captureHandler) return;
                const actionId = btn.dataset.shortcutAction;
                if (!actionId) return;

                document.body.classList.add('capturing-shortcut');
                btn.classList.add('capturing');
                btn.textContent = 'Press key...';

                captureHandler = (event) => {
                    event.preventDefault();
                    const code = normalizeShortcutCode(event.code);
                    if (!code) return;

                    if (code === 'Escape') {
                        document.removeEventListener('keydown', captureHandler, true);
                        captureHandler = null;
                        document.body.classList.remove('capturing-shortcut');
                        render();
                        return;
                    }

                    if (code === 'Backspace') {
                        settings.shortcuts[actionId] = '';
                    } else {
                        const duplicatedAction = Object.keys(settings.shortcuts || {}).find((id) => settings.shortcuts[id] === code && id !== actionId);
                        if (duplicatedAction) {
                            settings.shortcuts[duplicatedAction] = '';
                        }
                        settings.shortcuts[actionId] = code;
                    }

                    saveSettings();
                    document.removeEventListener('keydown', captureHandler, true);
                    captureHandler = null;
                    document.body.classList.remove('capturing-shortcut');
                    render();
                };

                document.addEventListener('keydown', captureHandler, true);
            });
        });

        const searchInput = document.getElementById('settings-search');
        if (searchInput) {
            searchInput.dispatchEvent(new Event('input'));
        }
    };

    resetBtn.addEventListener('click', () => {
        settings.shortcuts = { ...DEFAULT_SHORTCUTS };
        saveSettings();
        render();
    });

    render();
}

function applyAudioSettings() {
    if (!musicAudio) return;
    musicAudio.muted = false;
    musicAudio.volume = getTargetMusicVolume();

    const volumeRange = document.getElementById('music-volume-range');
    const miniVolumeRange = document.getElementById('mini-player-volume-range');
    if (volumeRange) {
        volumeRange.value = Math.round(settings.volume * 100);
    }
    if (miniVolumeRange) {
        miniVolumeRange.value = Math.round(settings.volume * 100);
    }
}

function syncSettingsUI() {
    const muteToggle = document.getElementById('setting-mute');
    const volumeRange = document.getElementById('setting-volume');
    const cursorToggle = document.getElementById('setting-cursor');
    const confirmToggle = document.getElementById('setting-confirm-redirects');
    const floatingPlayerToggle = document.getElementById('setting-floating-player');
    const snapAssistToggle = document.getElementById('setting-mini-player-snap-assist');
    const showPartnersToggle = document.getElementById('setting-show-partners');
    const reduceMotionToggle = document.getElementById('setting-reduce-motion');
    const highContrastToggle = document.getElementById('setting-high-contrast');
    const largeTextToggle = document.getElementById('setting-large-text');
    const focusToggle = document.getElementById('setting-focus-outlines');
    const dyslexiaFontToggle = document.getElementById('setting-dyslexia-font');
    const performanceToggle = document.getElementById('setting-performance-mode');

    if (muteToggle) muteToggle.checked = settings.mute;
    if (volumeRange) volumeRange.value = Math.round(settings.volume * 100);
    if (cursorToggle) cursorToggle.checked = settings.cursorEnabled;
    if (confirmToggle) confirmToggle.checked = settings.confirmExternal;
    if (floatingPlayerToggle) floatingPlayerToggle.checked = settings.floatingPlayerEnabled;
    if (snapAssistToggle) snapAssistToggle.checked = settings.miniPlayerSnapAssist;
    if (showPartnersToggle) showPartnersToggle.checked = settings.partnersVisible;
    if (reduceMotionToggle) reduceMotionToggle.checked = settings.reduceMotion;
    if (highContrastToggle) highContrastToggle.checked = settings.highContrast;
    if (largeTextToggle) largeTextToggle.checked = settings.largeText;
    if (focusToggle) focusToggle.checked = settings.focusOutlines;
    if (dyslexiaFontToggle) dyslexiaFontToggle.checked = settings.dyslexiaFont;
    if (performanceToggle) performanceToggle.checked = settings.performanceMode;
}

function applySettings() {
    const body = document.body;
    if (!body) return;

    const useCustomCursor = settings.cursorEnabled && !settings.performanceMode && !window.matchMedia('(pointer: coarse)').matches;
    body.classList.toggle('custom-cursor-enabled', useCustomCursor);
    body.classList.toggle('cursor-disabled', !useCustomCursor);
    body.classList.toggle('reduce-motion', settings.reduceMotion);
    body.classList.toggle('high-contrast', settings.highContrast);
    body.classList.toggle('large-text', settings.largeText);
    body.classList.toggle('focus-outlines', settings.focusOutlines);
    body.classList.toggle('dyslexia-font', settings.dyslexiaFont);
    body.classList.toggle('performance-mode', settings.performanceMode);

    if (settings.reduceMotion || settings.performanceMode) {
        stopStarfield();
    } else if (!starIntervalId) {
        startStarfield();
    }

    applyAudioSettings();
    syncSettingsUI();
    updateMiniMusicPlayerVisibility();
    updateGlobalPartnersVisibility();
    if (partnersCarouselState?.refreshAutoplay) {
        partnersCarouselState.refreshAutoplay();
    }
}

function initSiteNotice() {
    const notice = document.getElementById('site-notice');
    const noticeText = document.getElementById('site-notice-text');
    const dismissBtn = document.getElementById('site-notice-dismiss');
    if (!notice || !noticeText) return;

    const enabled = !!SITE_NOTICE_CONFIG.enabled;
    noticeText.textContent = SITE_NOTICE_CONFIG.message || '';
    notice.hidden = !enabled;
    document.body.classList.toggle('site-notice-active', enabled);

    if (!dismissBtn) return;
    dismissBtn.hidden = !SITE_NOTICE_CONFIG.dismissible;
    dismissBtn.onclick = () => {
        notice.hidden = true;
        document.body.classList.remove('site-notice-active');
    };
}

function startStarfield() {
    if (starIntervalId) return;
    starIntervalId = setInterval(makestar, 160);
}

function stopStarfield() {
    if (!starIntervalId) return;
    clearInterval(starIntervalId);
    starIntervalId = null;
}

function seedAmbientStars() {
    const starfield = document.getElementById('starfield');
    if (!starfield || starfield.dataset.seeded === 'true') return;

    for (let i = 0; i < 55; i += 1) {
        const star = document.createElement('div');
        star.className = 'star ambient';
        const variant = Math.random();
        if (variant < 0.34) star.classList.add('small');
        else if (variant < 0.78) star.classList.add('medium');
        else star.classList.add('large');
        if (Math.random() < 0.55) star.classList.add('twinkle');
        else star.classList.add('float');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 18}px`);
        star.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 18}px`);
        star.style.animationDelay = `${Math.random() * 4}s`;
        starfield.appendChild(star);
    }

    starfield.dataset.seeded = 'true';
}

function getFocusableElements(container) {
    if (!container) return [];
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector)).filter((element) => {
        const styles = window.getComputedStyle(element);
        return styles.display !== 'none' && styles.visibility !== 'hidden';
    });
}

function trapModalFocus(event) {
    if (event.key !== 'Tab' || !activeModalState?.modal) return;

    const focusable = getFocusableElements(activeModalState.modal);
    if (!focusable.length) {
        event.preventDefault();
        activeModalState.modal.focus();
        return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

function activateModal(overlay, modal, initialFocusSelector) {
    if (!overlay || !modal) return;

    if (activeModalState && activeModalState.overlay !== overlay) {
        deactivateModal(activeModalState.overlay, false);
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    activeModalState = { overlay, modal, previouslyFocused };
    document.addEventListener('keydown', trapModalFocus, true);

    requestAnimationFrame(() => {
        const initialFocus = initialFocusSelector ? modal.querySelector(initialFocusSelector) : null;
        const focusable = getFocusableElements(modal);
        const target = initialFocus || focusable[0] || modal;
        if (target instanceof HTMLElement) {
            target.focus();
        }
    });
}

function deactivateModal(overlay, restoreFocus = true) {
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    if (!activeModalState || activeModalState.overlay !== overlay) return;

    const previousFocus = activeModalState.previouslyFocused;
    activeModalState = null;
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', trapModalFocus, true);

    if (restoreFocus && previousFocus && previousFocus.isConnected) {
        previousFocus.focus();
    }
}

function openSettings() {
    const overlay = document.getElementById('settings-overlay');
    const modal = overlay ? overlay.querySelector('.settings-modal') : null;
    if (!overlay || !modal) return;
    activateModal(overlay, modal, '.settings-close');
    const searchInput = document.getElementById('settings-search');
    if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
    syncSettingsUI();
}

function closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) deactivateModal(overlay);
}

function loadContactCooldown() {
    const stored = sessionStorage.getItem('contact_cooldown');
    if (stored) {
        contactCooldownExpiry = parseInt(stored);
        const now = Date.now();
        if (now >= contactCooldownExpiry) {
            sessionStorage.removeItem('contact_cooldown');
            contactCooldownExpiry = 0;
        }
    }
}

function openContactForm() {
    const overlay = document.getElementById('contact-overlay');
    const modal = overlay ? overlay.querySelector('.contact-modal') : null;
    if (!overlay || !modal) return;
    activateModal(overlay, modal, '#contact-name');
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-message').value = '';
    document.getElementById('char-counter').textContent = '0';
    document.getElementById('form-message-container').innerHTML = '';
    loadContactCooldown();
    const now = Date.now();
    if (contactCooldownExpiry > now) {
        const remainingSeconds = Math.ceil((contactCooldownExpiry - now) / 1000);
        showFormMessage('warning', `Please wait ${remainingSeconds} seconds before sending another message.`);
        document.getElementById('submit-btn').disabled = true;
    }
}

function closeContactForm() {
    const overlay = document.getElementById('contact-overlay');
    if (overlay) deactivateModal(overlay);
}

async function copyContactEmail() {
    const emailElement = document.getElementById('email');
    const copyButtonLabel = document.querySelector('#contact .contact-secondary-btn span');
    const defaultText = contentData?.contact?.secondaryCta || 'Copy Email';
    const value = emailElement ? emailElement.textContent.trim() : '';
    if (!value) return;
    try {
        await navigator.clipboard.writeText(value);
        if (copyButtonLabel) copyButtonLabel.textContent = 'Copied';
    } catch (error) {
        if (copyButtonLabel) copyButtonLabel.textContent = 'Copy failed';
    } finally {
        if (copyButtonLabel) {
            setTimeout(() => {
                copyButtonLabel.textContent = defaultText;
            }, 1500);
        }
    }
}

function openExternalRedirect(url, target) {
    const overlay = document.getElementById('external-redirect-overlay');
    const modal = overlay ? overlay.querySelector('.external-redirect-modal') : null;
    const urlEl = document.getElementById('external-redirect-url');
    const dontAsk = document.getElementById('external-redirect-dont-ask');
    if (!overlay || !modal || !urlEl) return;

    pendingRedirectUrl = url;
    pendingRedirectTarget = target;
    urlEl.textContent = getDisplayUrl(url);
    if (dontAsk) dontAsk.checked = false;
    activateModal(overlay, modal, '.external-redirect-btn.primary');
}

function getDisplayUrl(url) {
    try {
        const parsed = new URL(url);
        const path = parsed.pathname.length > 1 ? parsed.pathname : '';
        return `${parsed.hostname}${path}`;
    } catch (error) {
        return url;
    }
}

function closeExternalRedirect() {
    const overlay = document.getElementById('external-redirect-overlay');
    if (overlay) deactivateModal(overlay);
    pendingRedirectUrl = null;
    pendingRedirectTarget = null;
}

function applyRedirectPreference() {
    const dontAsk = document.getElementById('external-redirect-dont-ask');
    if (dontAsk && dontAsk.checked) {
        settings.confirmExternal = false;
        saveSettings();
        syncSettingsUI();
    }
}

function cancelExternalRedirect() {
    applyRedirectPreference();
    closeExternalRedirect();
}

function safeOpenExternal(url, target = '_blank') {
    if (!url) return;

    if (settings.confirmExternal) {
        openExternalRedirect(url, target);
        return;
    }

    if (target === '_blank') {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        window.location.href = url;
    }
}

function confirmExternalRedirect() {
    if (!pendingRedirectUrl) return;

    const url = pendingRedirectUrl;
    const target = pendingRedirectTarget;
    applyRedirectPreference();
    closeExternalRedirect();

    if (target === '_blank') {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        window.location.href = url;
    }
}

function updateCharCount() {
    const textarea = document.getElementById('contact-message');
    const counter = document.getElementById('char-counter');
    const charCount = document.querySelector('.char-count');

    const length = textarea.value.length;
    counter.textContent = length;

    if (length > 900) {
        charCount.classList.add('error');
        charCount.classList.remove('warning');
    } else if (length > 800) {
        charCount.classList.add('warning');
        charCount.classList.remove('error');
    } else {
        charCount.classList.remove('warning', 'error');
    }
}

function showFormMessage(type, message) {
    const container = document.getElementById('form-message-container');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-hourglass-half'
    };

    container.innerHTML = `
        <div class="form-message ${type}">
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        </div>
    `;
}

async function submitContactForm(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('contact-form');
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
        showFormMessage('error', 'Please fill in all fields.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormMessage('error', 'Please enter a valid email address.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('sending');
    submitBtn.innerHTML = '<div class="spinner"></div><span>Sending...</span>';

    try {
        const data = { name, email, message };
        const response = await fetch('https://formspree.io/f/mdaenbbj', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showFormMessage('success', 'Message sent successfully!');
            form.reset();
            document.getElementById('char-counter').textContent = '0';
            closeContactForm();
            contactCooldownExpiry = Date.now() + 60000; // 1 minute cooldown
            sessionStorage.setItem('contact_cooldown', contactCooldownExpiry.toString());
        } else {
            throw new Error('Failed to send');
        }
    } catch (error) {
        showFormMessage('error', 'Failed to send message. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('sending');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send Message</span>';
    }
}

function updateDocumentTitle(page = currentpage) {
    const base = pageTitles.base || 'Nozer';
    const sectionTitle = pageTitles[page] || 'Home';
    document.title = page === 'home' ? base : `${sectionTitle} | ${base}`;
}

function initNameChanger() {
    const nameElement = document.getElementById('changing-name');
    if (!nameElement || !names.length) return;

    nameElement.classList.add('typewriter');
    if (nameTypewriterTimeout) {
        clearTimeout(nameTypewriterTimeout);
        nameTypewriterTimeout = null;
    }

    let deleting = false;
    let charIndex = 0;
    currentNameIndex = 0;

    const tick = () => {
        if (!names.length) return;
        const fullText = names[currentNameIndex] || '';

        if (settings.reduceMotion) {
            nameElement.textContent = fullText;
            currentNameIndex = (currentNameIndex + 1) % names.length;
            nameTypewriterTimeout = setTimeout(tick, 1900);
            return;
        }

        if (!deleting) {
            charIndex = Math.min(fullText.length, charIndex + 1);
            nameElement.textContent = fullText.slice(0, charIndex);
            if (charIndex >= fullText.length) {
                deleting = true;
                nameTypewriterTimeout = setTimeout(tick, 1100);
                return;
            }
            nameTypewriterTimeout = setTimeout(tick, 85);
            return;
        }

        charIndex = Math.max(0, charIndex - 1);
        nameElement.textContent = fullText.slice(0, charIndex);
        if (charIndex <= 0) {
            deleting = false;
            currentNameIndex = (currentNameIndex + 1) % names.length;
            nameTypewriterTimeout = setTimeout(tick, 220);
            return;
        }
        nameTypewriterTimeout = setTimeout(tick, 45);
    };

    nameElement.textContent = '';
    tick();
}

function getTargetMusicVolume() {
    if (settings.mute) return 0;
    return Math.max(0, Math.min(1, settings.volume));
}

function clampUnit(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(1, numeric));
}

function cancelMusicFade() {
    if (musicFadeFrame !== null) {
        cancelAnimationFrame(musicFadeFrame);
        musicFadeFrame = null;
    }
}

function fadeMusicVolume(targetVolume, duration = 220) {
    return new Promise((resolve) => {
        if (!musicAudio) {
            resolve();
            return;
        }

        cancelMusicFade();
        const startVolume = clampUnit(musicAudio.volume);
        const target = clampUnit(targetVolume);
        if (duration <= 0 || Math.abs(startVolume - target) < 0.005) {
            musicAudio.volume = target;
            resolve();
            return;
        }

        const start = performance.now();
        const step = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextVolume = startVolume + (target - startVolume) * eased;
            musicAudio.volume = clampUnit(nextVolume);

            if (progress < 1) {
                musicFadeFrame = requestAnimationFrame(step);
                return;
            }

            musicAudio.volume = target;
            musicFadeFrame = null;
            resolve();
        };

        musicFadeFrame = requestAnimationFrame(step);
    });
}

async function playCurrentTrackWithFade() {
    if (!musicAudio || !musicAudio.src) return;

    const finalVolume = getTargetMusicVolume();
    const shouldFade = !settings.reduceMotion && !settings.performanceMode && finalVolume > 0;

    cancelMusicFade();
    if (shouldFade) {
        musicAudio.volume = 0;
    } else {
        musicAudio.volume = finalVolume;
    }

    try {
        await musicAudio.play();
        isMusicPlaying = true;
        updatePlayPauseButton();
        if (shouldFade) {
            await fadeMusicVolume(finalVolume, 230);
        }
    } catch (error) {
        console.log('Autoplay blocked:', error);
        isMusicPlaying = false;
        updatePlayPauseButton();
    }
}

async function pauseCurrentTrackWithFade() {
    if (!musicAudio || !isMusicPlaying) return;
    const shouldFade = !settings.reduceMotion && !settings.performanceMode;

    if (shouldFade) {
        await fadeMusicVolume(0, 170);
    }

    musicAudio.pause();
    musicAudio.volume = getTargetMusicVolume();
    isMusicPlaying = false;
    updatePlayPauseButton();
}

async function switchTrack(trackIndex) {
    if (!musicAudio) return;
    const shouldResume = isMusicPlaying;

    if (shouldResume && !settings.reduceMotion && !settings.performanceMode) {
        await fadeMusicVolume(0, 130);
    }

    loadTrack(trackIndex, { preservePlayingState: shouldResume });

    if (shouldResume) {
        await playCurrentTrackWithFade();
    } else {
        musicAudio.volume = getTargetMusicVolume();
        updatePlayPauseButton();
    }
}

function initMusicPlayer() {
    musicAudio = document.getElementById('music-audio');
    if (!musicAudio) return;
    
    loadTrack(0);
    initMiniMusicPlayer();
    initPlaylistOverlay();
    initMusicPlayerVisibilityObserver();
    
    const volumeRange = document.getElementById('music-volume-range');
    if (volumeRange) {
        volumeRange.value = Math.round(settings.volume * 100);
        volumeRange.addEventListener('input', (e) => {
            const value = Number(e.target.value);
            settings.volume = Math.max(0, Math.min(1, value / 100));
            saveSettings();
            applyAudioSettings();
        });
    }

    musicAudio.addEventListener('timeupdate', updateMusicProgress);
    musicAudio.addEventListener('loadedmetadata', updateMusicProgress);
    musicAudio.addEventListener('ended', () => {
        nextTrack();
    });
}

function loadTrack(trackIndex, options = {}) {
    const { preservePlayingState = false } = options;
    if (trackIndex < 0) trackIndex = musicTracks.length - 1;
    if (trackIndex >= musicTracks.length) trackIndex = 0;
    
    currentMusicTrack = trackIndex;
    const track = musicTracks[trackIndex];
    if (!track || !musicAudio) return;
    
    musicAudio.src = track.file;
    document.getElementById('music-title').textContent = track.name;
    document.getElementById('music-album-art').src = track.image;
    document.getElementById('music-artist').textContent = track.artist;
    syncMiniMusicPlayerMeta();
    
    if (!preservePlayingState) {
        isMusicPlaying = false;
    }
    updatePlayPauseButton();
    updateMusicProgress();
    updateMusicTrackIndicators();
    renderPlaylistItems();
}

async function togglePlayPause() {
    if (!musicAudio.src) return;
    
    if (isMusicPlaying) {
        await pauseCurrentTrackWithFade();
    } else {
        await playCurrentTrackWithFade();
    }
}

function updatePlayPauseButton() {
    const btn = document.getElementById('play-pause-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isMusicPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    const miniBtn = document.getElementById('mini-player-play-btn');
    if (miniBtn) {
        const miniIcon = miniBtn.querySelector('i');
        if (miniIcon) {
            miniIcon.className = isMusicPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    renderPlaylistItems();
}

async function nextTrack() {
    await switchTrack(currentMusicTrack + 1);
}

async function previousTrack() {
    await switchTrack(currentMusicTrack - 1);
}

function updateMusicProgress() {
    if (!musicAudio) return;
    
    const fill = document.getElementById('music-progress-fill');
    const currentTimeEl = document.getElementById('music-current-time');
    const durationEl = document.getElementById('music-duration');
    const miniFill = document.getElementById('mini-player-progress-fill');
    
    const currentTime = musicAudio.currentTime || 0;
    const duration = musicAudio.duration || 0;
    
    if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        if (fill) fill.style.width = percent + '%';
        if (miniFill) miniFill.style.width = percent + '%';
    } else {
        if (fill) fill.style.width = '0%';
        if (miniFill) miniFill.style.width = '0%';
    }
    
    if (currentTimeEl) currentTimeEl.textContent = formatMusicTime(currentTime);
    if (durationEl) durationEl.textContent = formatMusicTime(duration);
}

function updateMusicTrackIndicators() {
    const totalTracks = musicTracks.length || 0;
    const currentTrackNumber = totalTracks ? currentMusicTrack + 1 : 0;
    const slotEl = document.getElementById('music-slot-indicator');
    const playlistCountEl = document.getElementById('playlist-summary-count');

    if (slotEl) slotEl.textContent = `${currentTrackNumber}/${totalTracks}`;
    if (playlistCountEl) playlistCountEl.textContent = `${currentTrackNumber} of ${totalTracks}`;
}

function syncMiniMusicPlayerMeta() {
    const track = musicTracks[currentMusicTrack];
    if (!track) return;

    const titleEl = document.getElementById('mini-player-title');
    const artistEl = document.getElementById('mini-player-artist');
    const artEl = document.getElementById('mini-player-art');
    const playlistTitleEl = document.getElementById('playlist-summary-title');
    const playlistArtistEl = document.getElementById('playlist-summary-artist');
    const playlistArtEl = document.getElementById('playlist-summary-art');

    if (titleEl) titleEl.textContent = track.name;
    if (artistEl) artistEl.textContent = track.artist;
    if (artEl) artEl.src = track.image;
    if (playlistTitleEl) playlistTitleEl.textContent = track.name;
    if (playlistArtistEl) playlistArtistEl.textContent = track.artist;
    if (playlistArtEl) playlistArtEl.src = track.image;
    updateMusicTrackIndicators();
    renderPlaylistItems();
}

function renderPlaylistItems() {
    const list = document.getElementById('playlist-list');
    if (!list) return;

    list.innerHTML = '';
    musicTracks.forEach((track, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `playlist-item ${index === currentMusicTrack ? 'active' : ''}`;
        button.innerHTML = `
            <span class="playlist-item-order">${index + 1}</span>
            <img src="${escapeHtml(track.image)}" alt="${escapeHtml(track.name)}" loading="lazy" decoding="async">
            <span class="playlist-item-meta">
                <strong>${escapeHtml(track.name)}</strong>
                <small>${escapeHtml(track.artist)}</small>
            </span>
            <span class="playlist-item-state">${index === currentMusicTrack ? (isMusicPlaying ? 'Playing' : 'Selected') : 'Queue'}</span>
        `;
        button.addEventListener('click', async () => {
            if (index === currentMusicTrack && isMusicPlaying) {
                await togglePlayPause();
                return;
            }
            await switchTrack(index);
            if (!isMusicPlaying) {
                await playCurrentTrackWithFade();
            }
        });
        list.appendChild(button);
    });
    updateMusicTrackIndicators();
}

function openPlaylistOverlay() {
    const overlay = document.getElementById('playlist-overlay');
    const modal = overlay ? overlay.querySelector('.playlist-modal') : null;
    if (!overlay || !modal) return;
    renderPlaylistItems();
    activateModal(overlay, modal, '.playlist-close');
}

function closePlaylistOverlay() {
    const overlay = document.getElementById('playlist-overlay');
    if (overlay) deactivateModal(overlay);
}

function initPlaylistOverlay() {
    const playlistOpenMainBtn = document.getElementById('music-playlist-btn');
    const playlistOpenMiniBtn = document.getElementById('mini-player-playlist');
    const overlay = document.getElementById('playlist-overlay');

    if (playlistOpenMainBtn) {
        playlistOpenMainBtn.addEventListener('click', openPlaylistOverlay);
    }
    if (playlistOpenMiniBtn) {
        playlistOpenMiniBtn.addEventListener('click', openPlaylistOverlay);
    }
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closePlaylistOverlay();
            }
        });
    }
}

function updateMiniMusicPlayerVisibility() {
    const miniPlayer = document.getElementById('mini-music-player');
    if (!miniPlayer) return;

    const shouldShow = settings.floatingPlayerEnabled && (!isMainPlayerVisible || currentpage !== 'home');
    miniPlayer.classList.toggle('visible', shouldShow);
}

function initMiniMusicPlayer() {
    const miniPlayer = document.getElementById('mini-music-player');
    if (!miniPlayer) return;

    const minimizeBtn = document.getElementById('mini-player-minimize');
    const closeBtn = document.getElementById('mini-player-close');
    const setMiniCollapsedState = (collapsed) => {
        miniPlayer.classList.toggle('collapsed', collapsed);
        if (minimizeBtn) {
            const icon = minimizeBtn.querySelector('i');
            if (icon) {
                icon.className = collapsed ? 'fas fa-expand-alt' : 'fas fa-compress-alt';
            }
        }
    };

    setMiniCollapsedState(!!settings.miniPlayerCollapsed);

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            settings.miniPlayerCollapsed = !settings.miniPlayerCollapsed;
            setMiniCollapsedState(settings.miniPlayerCollapsed);
            saveSettings();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            settings.floatingPlayerEnabled = false;
            saveSettings();
            applySettings();
        });
    }

    const miniMain = miniPlayer.querySelector('.mini-player-main');
    if (miniMain) {
        miniMain.addEventListener('click', togglePlayPause);
    }

    const miniVolumeRange = document.getElementById('mini-player-volume-range');
    if (miniVolumeRange) {
        miniVolumeRange.value = Math.round(settings.volume * 100);
        miniVolumeRange.addEventListener('input', (e) => {
            const value = Number(e.target.value);
            settings.volume = Math.max(0, Math.min(1, value / 100));
            saveSettings();
            applyAudioSettings();
        });
    }

    syncMiniMusicPlayerMeta();
    updatePlayPauseButton();
    updateMusicProgress();
    keepMiniPlayerInViewport({ resetOnMobile: true });
    initMiniMusicPlayerDrag();
    updateMiniMusicPlayerVisibility();
}

function keepMiniPlayerInViewport(options = {}) {
    const { resetOnMobile = false } = options;
    const miniPlayer = document.getElementById('mini-music-player');
    if (!miniPlayer) return;

    const isDesktopDragMode = window.matchMedia('(min-width: 769px) and (pointer: fine)').matches;
    if (resetOnMobile && !isDesktopDragMode) {
        miniPlayer.style.left = '';
        miniPlayer.style.top = '';
        miniPlayer.style.right = '';
        miniPlayer.style.bottom = '';
        return;
    }

    const rect = miniPlayer.getBoundingClientRect();
    const hasCustomPosition = miniPlayer.style.left !== '' || miniPlayer.style.top !== '';
    if (!hasCustomPosition) return;

    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

    const nextX = Math.min(maxX, Math.max(margin, rect.left));
    const nextY = Math.min(maxY, Math.max(margin, rect.top));

    miniPlayer.style.left = `${Math.round(nextX)}px`;
    miniPlayer.style.top = `${Math.round(nextY)}px`;
    miniPlayer.style.right = 'auto';
    miniPlayer.style.bottom = 'auto';
}

function initMiniMusicPlayerDrag() {
    const miniPlayer = document.getElementById('mini-music-player');
    const dragHandle = miniPlayer ? miniPlayer.querySelector('.mini-player-header') : null;
    if (!miniPlayer || !dragHandle) return;
    // keep dragging limited to fine-pointer desktop devices to avoid interfering with touch
    if (!window.matchMedia('(min-width: 769px) and (pointer: fine)').matches) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let pointerLastX = 0;
    let pointerLastY = 0;
    let pointerLastTs = 0;
    let inertiaFrame = null;
    let snapGhostEl = null;
    let nearestDock = null;

    const getDockPoints = (width, height) => {
        const margin = 10;
        const maxX = Math.max(margin, window.innerWidth - width - margin);
        const maxY = Math.max(margin, window.innerHeight - height - margin);
        const midX = Math.round((window.innerWidth - width) / 2);
        const midY = Math.round((window.innerHeight - height) / 2);

        return [
            { key: 'top-left', x: margin, y: margin },
            { key: 'top-center', x: midX, y: margin },
            { key: 'top-right', x: maxX, y: margin },
            { key: 'middle-left', x: margin, y: midY },
            { key: 'middle-right', x: maxX, y: midY },
            { key: 'bottom-left', x: margin, y: maxY },
            { key: 'bottom-center', x: midX, y: maxY },
            { key: 'bottom-right', x: maxX, y: maxY }
        ];
    };

    const ensureSnapGhost = () => {
        if (snapGhostEl && snapGhostEl.isConnected) return snapGhostEl;
        snapGhostEl = document.createElement('div');
        snapGhostEl.className = 'mini-player-snap-ghost';
        document.body.appendChild(snapGhostEl);
        return snapGhostEl;
    };

    const hideSnapGhost = () => {
        const ghost = ensureSnapGhost();
        ghost.classList.remove('visible', 'strong');
        ghost.style.opacity = '0';
    };

    const updateSnapGhost = () => {
        if (!settings.miniPlayerSnapAssist) {
            hideSnapGhost();
            nearestDock = null;
            return;
        }

        const rect = miniPlayer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const docks = getDockPoints(rect.width, rect.height);
        const ghost = ensureSnapGhost();

        nearestDock = docks[0];
        let nearestDist = Number.POSITIVE_INFINITY;
        docks.forEach((dock) => {
            const dockCenterX = dock.x + rect.width / 2;
            const dockCenterY = dock.y + rect.height / 2;
            const dist = Math.hypot(centerX - dockCenterX, centerY - dockCenterY);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestDock = dock;
            }
        });

        ghost.style.width = `${Math.round(rect.width)}px`;
        ghost.style.height = `${Math.round(rect.height)}px`;
        ghost.style.left = `${Math.round(nearestDock.x)}px`;
        ghost.style.top = `${Math.round(nearestDock.y)}px`;
        ghost.classList.add('visible');
        // make the snap ghost more forgiving on close approach
        ghost.classList.toggle('strong', nearestDist <= 120);
        ghost.style.opacity = nearestDist <= 200 ? '1' : '0.45';
    };

    const snapIfCloseEnough = () => {
        if (!settings.miniPlayerSnapAssist || !nearestDock) return false;
        const rect = miniPlayer.getBoundingClientRect();
        const currentCenterX = rect.left + rect.width / 2;
        const currentCenterY = rect.top + rect.height / 2;
        const dockCenterX = nearestDock.x + rect.width / 2;
        const dockCenterY = nearestDock.y + rect.height / 2;
        const distance = Math.hypot(currentCenterX - dockCenterX, currentCenterY - dockCenterY);
        // slightly larger threshold so the player snaps more eagerly
        if (distance > 120) return false;
        miniPlayer.style.left = `${Math.round(nearestDock.x)}px`;
        miniPlayer.style.top = `${Math.round(nearestDock.y)}px`;
        miniPlayer.style.right = 'auto';
        miniPlayer.style.bottom = 'auto';
        return true;
    };

    const snapToNearestDock = () => {
        const rect = miniPlayer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const docks = getDockPoints(rect.width, rect.height);

        let closest = docks[0];
        let closestDist = Number.POSITIVE_INFINITY;

        docks.forEach((dock) => {
            const dockCenterX = dock.x + rect.width / 2;
            const dockCenterY = dock.y + rect.height / 2;
            const dx = centerX - dockCenterX;
            const dy = centerY - dockCenterY;
            const dist = Math.hypot(dx, dy);
            if (dist < closestDist) {
                closestDist = dist;
                closest = dock;
            }
        });

        miniPlayer.style.left = `${Math.round(closest.x)}px`;
        miniPlayer.style.top = `${Math.round(closest.y)}px`;
        miniPlayer.style.right = 'auto';
        miniPlayer.style.bottom = 'auto';
    };

    const stopInertia = () => {
        if (inertiaFrame !== null) {
            cancelAnimationFrame(inertiaFrame);
            inertiaFrame = null;
        }
    };

    const runInertia = () => {
        if (settings.reduceMotion || settings.performanceMode) {
            snapIfCloseEnough();
            return;
        }

        const friction = 0.94;
        const minSpeed = 0.05;
        const bounce = 0.75;

        const step = () => {
            const rect = miniPlayer.getBoundingClientRect();
            const maxX = Math.max(0, window.innerWidth - rect.width);
            const maxY = Math.max(0, window.innerHeight - rect.height);

            let nextX = rect.left + velocityX;
            let nextY = rect.top + velocityY;

            if (nextX <= 0) {
                nextX = 0;
                velocityX = Math.abs(velocityX) * bounce;
            } else if (nextX >= maxX) {
                nextX = maxX;
                velocityX = -Math.abs(velocityX) * bounce;
            }

            if (nextY <= 0) {
                nextY = 0;
                velocityY = Math.abs(velocityY) * bounce;
            } else if (nextY >= maxY) {
                nextY = maxY;
                velocityY = -Math.abs(velocityY) * bounce;
            }

            miniPlayer.style.left = `${nextX}px`;
            miniPlayer.style.top = `${nextY}px`;
            miniPlayer.style.right = 'auto';
            miniPlayer.style.bottom = 'auto';

            velocityX *= friction;
            velocityY *= friction;

            if (Math.abs(velocityX) < minSpeed && Math.abs(velocityY) < minSpeed) {
                stopInertia();
                snapIfCloseEnough();
                return;
            }

            inertiaFrame = requestAnimationFrame(step);
        };

        stopInertia();
        inertiaFrame = requestAnimationFrame(step);
    };

    const onPointerMove = (event) => {
        if (!isDragging) return;

        const maxX = Math.max(0, window.innerWidth - miniPlayer.offsetWidth);
        const maxY = Math.max(0, window.innerHeight - miniPlayer.offsetHeight);
        const nextX = Math.min(maxX, Math.max(0, event.clientX - offsetX));
        const nextY = Math.min(maxY, Math.max(0, event.clientY - offsetY));

        miniPlayer.style.left = `${nextX}px`;
        miniPlayer.style.top = `${nextY}px`;
        miniPlayer.style.right = 'auto';
        miniPlayer.style.bottom = 'auto';

        const now = performance.now();
        const dt = Math.max(1, now - pointerLastTs);
        const dx = event.clientX - pointerLastX;
        const dy = event.clientY - pointerLastY;
        const smooth = 0.3;
        velocityX = velocityX * (1 - smooth) + (dx / dt) * smooth * 16;
        velocityY = velocityY * (1 - smooth) + (dy / dt) * smooth * 16;
        pointerLastX = event.clientX;
        pointerLastY = event.clientY;
        pointerLastTs = now;
        updateSnapGhost();
    };

    const onPointerUp = (event) => {
        if (!isDragging) return;
        isDragging = false;
        miniPlayer.classList.remove('dragging');
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        if (event && dragHandle.hasPointerCapture && dragHandle.hasPointerCapture(event.pointerId)) {
            dragHandle.releasePointerCapture(event.pointerId);
        }
        hideSnapGhost();
        runInertia();
    };

    dragHandle.addEventListener('pointerdown', (event) => {
        const isInteractive = event.target.closest('button, input, a, .mini-player-header-actions');
        if (isInteractive) return;

        event.preventDefault();
        stopInertia();
        isDragging = true;
        const rect = miniPlayer.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        pointerLastX = event.clientX;
        pointerLastY = event.clientY;
        pointerLastTs = performance.now();
        velocityX = 0;
        velocityY = 0;
        miniPlayer.classList.add('dragging');
        updateSnapGhost();
        if (dragHandle.setPointerCapture) {
            dragHandle.setPointerCapture(event.pointerId);
        }
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    });

    window.addEventListener('resize', () => {
        keepMiniPlayerInViewport({ resetOnMobile: true });
        if (window.matchMedia('(min-width: 769px) and (pointer: fine)').matches && settings.miniPlayerSnapAssist) {
            snapToNearestDock();
        }
    });
}

function initMusicPlayerVisibilityObserver() {
    const playerCard = document.querySelector('.music-player-card.now-playing-card');
    if (!playerCard) return;

    if (miniMusicObserver) {
        miniMusicObserver.disconnect();
        miniMusicObserver = null;
    }

    if ('IntersectionObserver' in window) {
        miniMusicObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            isMainPlayerVisible = entry.isIntersecting && entry.intersectionRatio > 0.35;
            updateMiniMusicPlayerVisibility();
        }, { threshold: [0, 0.35, 1] });

        miniMusicObserver.observe(playerCard);
    } else {
        const fallbackUpdate = () => {
            const rect = playerCard.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            isMainPlayerVisible = rect.top < viewportHeight * 0.65 && rect.bottom > viewportHeight * 0.25;
            updateMiniMusicPlayerVisibility();
        };

        window.addEventListener('scroll', fallbackUpdate, { passive: true });
        window.addEventListener('resize', fallbackUpdate);
        fallbackUpdate();
    }
}

function initAboutFacts() {
    const factTextEl = document.getElementById('about-fact-text');
    const factChipEl = document.getElementById('about-fact-chip');
    const factCardEl = document.getElementById('about-fact-card');
    const shuffleBtn = document.getElementById('about-fact-btn');

    if (!factTextEl || !factChipEl || !factCardEl || !shuffleBtn) return;
    if (!Array.isArray(aboutFacts) || !aboutFacts.length) return;

    const renderFact = () => {
        let nextIndex = Math.floor(Math.random() * aboutFacts.length);
        if (aboutFacts.length > 1 && nextIndex === aboutFactIndex) {
            nextIndex = (nextIndex + 1) % aboutFacts.length;
        }

        aboutFactIndex = nextIndex;
        factTextEl.textContent = aboutFacts[nextIndex].text;
        factChipEl.textContent = aboutFacts[nextIndex].tag;
        factCardEl.classList.remove('fact-animate');
        void factCardEl.offsetWidth;
        factCardEl.classList.add('fact-animate');
    };

    shuffleBtn.addEventListener('click', renderFact);
    renderFact();
}

function weatherCodeToInfo(code) {
    if (code === 0) return { label: 'Clear', icon: 'fa-sun' };
    if ([1, 2].includes(code)) return { label: 'Partly Cloudy', icon: 'fa-cloud-sun' };
    if (code === 3) return { label: 'Overcast', icon: 'fa-cloud' };
    if ([45, 48].includes(code)) return { label: 'Fog', icon: 'fa-smog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', icon: 'fa-cloud-rain' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', icon: 'fa-cloud-showers-heavy' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', icon: 'fa-snowflake' };
    if ([95, 96, 99].includes(code)) return { label: 'Thunder', icon: 'fa-bolt' };
    return { label: 'Cloudy', icon: 'fa-cloud' };
}

function updateWeatherIcon(elementId, code) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const info = weatherCodeToInfo(code);
    el.innerHTML = `<i class="fas ${info.icon}"></i>`;
    return info.label;
}

function initWeatherWidget() {
    const card = document.getElementById('weather-card');
    if (!card) return;

    const lat = 50.0413;
    const lon = 21.999;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=celsius&timezone=auto&forecast_days=3`;

    async function fetchWeather() {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather API error');
            const data = await response.json();

            const currentTemp = Math.round(data.current.temperature_2m);
            const apparentTemp = Math.round(data.current.apparent_temperature);
            const currentCode = data.current.weather_code;
            const currentLabel = updateWeatherIcon('weather-icon-current', currentCode);
            const currentTempEl = document.getElementById('weather-temp-current');
            const currentDescEl = document.getElementById('weather-desc-current');
            const currentRangeEl = document.getElementById('weather-current-range');
            const currentFeelsEl = document.getElementById('weather-feels-like');
            const todayHigh = Math.round(data.daily.temperature_2m_max[0]);
            const todayLow = Math.round(data.daily.temperature_2m_min[0]);

            if (currentTempEl) currentTempEl.textContent = `${currentTemp}°C`;
            if (currentDescEl) currentDescEl.textContent = currentLabel || '--';
            if (currentRangeEl) currentRangeEl.textContent = `H: ${todayHigh}°C / L: ${todayLow}°C`;
            if (currentFeelsEl) currentFeelsEl.textContent = `Feels like ${apparentTemp}°C`;

            for (let i = 1; i <= 2; i++) {
                const dayCode = data.daily.weather_code[i];
                updateWeatherIcon(`weather-day-${i}-icon`, dayCode);
                const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
                const minTemp = Math.round(data.daily.temperature_2m_min[i]);
                const rainChance = Math.round(data.daily.precipitation_probability_max?.[i] ?? 0);
                const tempEl = document.getElementById(`weather-day-${i}-temp`);
                const rangeEl = document.getElementById(`weather-day-${i}-range`);
                const noteEl = document.getElementById(`weather-day-${i}-note`);
                const labelEl = document.getElementById(`weather-day-${i}-label`);
                if (tempEl) tempEl.textContent = `${maxTemp}°C`;
                if (rangeEl) rangeEl.textContent = `${minTemp}°C / ${maxTemp}°C`;
                if (noteEl) noteEl.textContent = `Rain chance ${rainChance}%`;
                if (labelEl && Array.isArray(data.daily.time)) {
                    const dayDate = new Date(data.daily.time[i]);
                    labelEl.textContent = dayDate.toLocaleDateString('en-GB', { weekday: 'short' });
                }
            }

            const updatedEl = document.getElementById('weather-updated');
            if (updatedEl && data.current && data.current.time) {
                const time = new Date(data.current.time);
                const label = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                updatedEl.textContent = `Updated ${label}`;
            }
        } catch (error) {
            const updatedEl = document.getElementById('weather-updated');
            if (updatedEl) updatedEl.textContent = 'Weather unavailable';
        }
    }

    fetchWeather();
    setInterval(fetchWeather, 30 * 60 * 1000);
}

function initFavoritesWidget() {
    const card = document.getElementById('favorites-card');
    if (!card) return;

    const toggle = card.querySelector('.favorites-toggle');
    const tabs = Array.from(card.querySelectorAll('.fav-tab'));
    const items = Array.from(card.querySelectorAll('.favorite-item'));
    const grid = card.querySelector('.favorites-grid');
    let isTransitioning = false;

    if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        const toggleLabel = toggle.querySelector('span');
        if (toggleLabel) toggleLabel.textContent = 'Close';
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            card.classList.toggle('collapsed');
            const expanded = !card.classList.contains('collapsed');
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            const toggleLabel = toggle.querySelector('span');
            if (toggleLabel) toggleLabel.textContent = expanded ? 'Close' : 'Open';
        });
    }

    function setActive(category) {
        tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.fav === category));

        let visibleIndex = 0;
        items.forEach(item => {
            const isActive = item.dataset.fav === category;
            item.classList.toggle('active', isActive);
            item.classList.toggle('is-hidden', !isActive);
            if (isActive) {
                item.style.setProperty('--fav-delay', `${visibleIndex * 35}ms`);
                visibleIndex += 1;
            }
        });
    }

    function switchCategory(category) {
        if (!grid || isTransitioning) {
            setActive(category);
            return;
        }

        isTransitioning = true;
        grid.classList.add('switching');
        window.setTimeout(() => {
            setActive(category);
            requestAnimationFrame(() => {
                grid.classList.remove('switching');
                window.setTimeout(() => {
                    isTransitioning = false;
                }, 220);
            });
        }, 140);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchCategory(tab.dataset.fav));
    });

    const initialCategory = tabs[0]?.dataset.fav || 'games';
    setActive(initialCategory);
}

function initWorkAvailabilityStatus() {
    const workStatus = document.getElementById('work-status');
    const textEl = document.getElementById('work-status-text');
    if (!workStatus || !textEl) return;

    const openLabel = workStatus.dataset.openLabel || 'ACTIVE';
    const closedLabel = workStatus.dataset.closedLabel || 'INACTIVE';

    function isOpenNowInWarsaw() {
        const now = new Date();
        const weekdayString = new Intl.DateTimeFormat('en-GB', {
            weekday: 'short',
            timeZone: 'Europe/Warsaw'
        }).format(now);

        const hourString = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            hour12: false,
            timeZone: 'Europe/Warsaw'
        }).format(now);

        const minuteString = new Intl.DateTimeFormat('en-GB', {
            minute: '2-digit',
            timeZone: 'Europe/Warsaw'
        }).format(now);

        const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
        const day = dayMap[weekdayString] ?? 0;
        const totalMinutes = Number(hourString) * 60 + Number(minuteString);

        const weekdayOpen = day >= 1 && day <= 5 && totalMinutes >= (15 * 60) && totalMinutes < (19 * 60);
        const saturdayOpen = day === 6 && totalMinutes >= (9 * 60) && totalMinutes < (19 * 60);

        return weekdayOpen || saturdayOpen;
    }

    function applyStatus() {
        const openNow = isOpenNowInWarsaw();
        workStatus.classList.toggle('is-open', openNow);
        workStatus.classList.toggle('is-closed', !openNow);
        textEl.textContent = openNow ? openLabel : closedLabel;
    }

    applyStatus();
    setInterval(applyStatus, 60000);
}

function formatCounterValue(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '--';
    return numeric.toLocaleString('en-US');
}

const VIEW_COUNTER_ENDPOINTS = [
    'https://api.countapi.xyz'
];
const VIEW_COUNTER_FALLBACK_KEY = 'nozersite_home_views_local_fallback_v1';

function getLocalFallbackViewCount() {
    const current = Number(localStorage.getItem(VIEW_COUNTER_FALLBACK_KEY)) || 0;
    const nextValue = current + 1;
    localStorage.setItem(VIEW_COUNTER_FALLBACK_KEY, String(nextValue));
    return nextValue;
}

async function countApiHit(namespace, key) {
    const encodedNamespace = encodeURIComponent(namespace);
    const encodedKey = encodeURIComponent(key);

    for (const baseUrl of VIEW_COUNTER_ENDPOINTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
            const url = `${baseUrl}/hit/${encodedNamespace}/${encodedKey}`;
            const response = await fetch(url, {
                cache: 'no-store',
                signal: controller.signal
            });
            if (!response.ok) throw new Error('Counter hit failed');
            const payload = await response.json();
            if (payload && Number.isFinite(Number(payload.value))) return payload;
        } catch (error) {
            // Try next endpoint.
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new Error('All counter endpoints failed');
}

async function initHomeViewCounter() {
    const viewEl = document.getElementById('home-view-count');
    if (!viewEl) return;

    const namespace = 'nozersite';
    const key = 'home-views-v1';

    try {
        const data = await countApiHit(namespace, key);
        viewEl.textContent = formatCounterValue(data.value);
    } catch (error) {
        const fallbackValue = getLocalFallbackViewCount();
        viewEl.textContent = formatCounterValue(fallbackValue);
    }
}

function sanitizeAssetUrl(value) {
    return String(value || '').trim().replace(/\\/g, '/');
}

function createPartnerSlide(partner) {
    const slide = document.createElement('article');
    slide.className = 'partner-slide';

    const brand = document.createElement('div');
    brand.className = 'partner-brand';

    const logoWrap = document.createElement('span');
    logoWrap.className = 'partner-logo';

    const logo = document.createElement('img');
    logo.className = 'partner-logo-image';
    logo.src = sanitizeAssetUrl(partner.logoUrl);
    logo.alt = partner.logoAlt || `${partner.name} logo`;
    logo.loading = 'lazy';
    logo.decoding = 'async';

    const fallbackIcon = document.createElement('i');
    fallbackIcon.className = `${partner.fallbackIconClass} partner-logo-fallback`;
    fallbackIcon.style.display = 'none';
    logo.addEventListener('error', () => {
        logo.style.display = 'none';
        fallbackIcon.style.display = 'inline-flex';
    });

    logoWrap.append(logo, fallbackIcon);

    const brandMeta = document.createElement('div');
    brandMeta.className = 'partner-brand-meta';
    const name = document.createElement('h4');
    name.textContent = partner.name;
    const role = document.createElement('span');
    role.textContent = partner.role;
    brandMeta.append(name, role);
    brand.append(logoWrap, brandMeta);

    const copy = document.createElement('p');
    copy.className = 'partner-copy';
    copy.textContent = partner.description;

    const link = document.createElement('a');
    link.className = 'partner-link';
    link.href = partner.linkUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(document.createTextNode(`${partner.linkLabel} `));
    const externalIcon = document.createElement('i');
    externalIcon.className = 'fas fa-arrow-up-right-from-square';
    link.appendChild(externalIcon);

    slide.setAttribute('role', 'listitem');
    slide.append(brand, copy, link);
    return slide;
}

function renderPartnersSlides(track) {
    track.innerHTML = '';
    PARTNERS.forEach((partner) => {
        track.appendChild(createPartnerSlide(partner));
    });
}

function initPartnersCarousel() {
    const track = document.getElementById('partners-track');
    const carousel = document.getElementById('partners-carousel');
    const prevBtn = document.getElementById('partners-prev');
    const nextBtn = document.getElementById('partners-next');
    if (!track || !carousel) return;

    renderPartnersSlides(track);
    const slides = Array.from(track.querySelectorAll('.partner-slide'));
    if (!slides.length) return;

    // on small screens we switch to a simple grid instead of a JS carousel
    const isMobileView = window.matchMedia('(max-width: 768px)').matches;
    if (isMobileView) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        // allow CSS grid/scroll to handle layout, no further logic needed
        return;
    }

    if (!prevBtn || !nextBtn) return;
    const hideBtn = document.getElementById('partners-hide-btn');
    let currentIndex = 0;

    const render = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        prevBtn.disabled = slides.length <= 1;
        nextBtn.disabled = slides.length <= 1;
    };

    const goTo = (index) => {
        const lastIndex = slides.length - 1;
        if (index < 0) currentIndex = lastIndex;
        else if (index > lastIndex) currentIndex = 0;
        else currentIndex = index;
        render();
    };

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            goTo(currentIndex - 1);
        }
        if (event.key === 'ArrowRight') {
            goTo(currentIndex + 1);
        }
    });

    if (hideBtn) {
        hideBtn.addEventListener('click', () => {
            partnersSectionCollapsed = !partnersSectionCollapsed;
            updateGlobalPartnersVisibility();
            hideBtn.textContent = partnersSectionCollapsed ? 'Show section' : 'Hide section';
            hideBtn.setAttribute('aria-expanded', partnersSectionCollapsed ? 'false' : 'true');
        });
    }

    partnersCarouselState = {
        refreshAutoplay: () => render(),
        stopAutoplay: () => {}
    };

    render();
}

function updateGlobalPartnersVisibility() {
    const partnersSection = document.getElementById('global-partners');
    const hideBtn = document.getElementById('partners-hide-btn');
    if (!partnersSection) return;
    const shouldHide = currentpage === 'contact' || !settings.partnersVisible;
    partnersSection.classList.toggle('hidden', shouldHide);
    partnersSection.classList.toggle('collapsed', partnersSectionCollapsed);
    if (hideBtn) {
        hideBtn.textContent = partnersSectionCollapsed ? 'Show section' : 'Hide section';
        hideBtn.setAttribute('aria-expanded', partnersSectionCollapsed ? 'false' : 'true');
    }

    if (partnersCarouselState?.refreshAutoplay) {
        partnersCarouselState.refreshAutoplay();
    }
}

function formatMusicTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const cursorsys = {
    init: function() {
        this.isMobile = this.isTouchLikeDevice();
        this.setupevents();
    },

    isTouchLikeDevice: function() {
        return window.matchMedia('(pointer: coarse)').matches;
    },

    setupevents: function() {
        const cursor = document.getElementById('customCursor');
        if (!cursor) return;

        let rafId = null;
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        const textInputSelector = 'input, textarea, [contenteditable="true"]';
        const interactiveSelector = [
            'a',
            'button',
            '[role="button"]',
            '.nav-link',
            '.social-link',
            '.partner-link',
            '.project-action',
            '.settings-toggle',
            '.settings-category-btn',
            '.settings-switch',
            '.settings-slider',
            '.settings-reset-all',
            '.shortcut-bind-btn',
            '.shortcut-reset-btn',
            '.partners-nav',
            '.join-btn-modern',
            '.mini-player-control',
            '.mini-player-header-btn',
            '.section-search',
            '.settings-search-wrap',
            '.section-search input',
            '.settings-search-wrap input'
        ].join(', ');

        const applyCursorClassesForTarget = (target) => {
            if (!(target instanceof Element)) {
                cursor.classList.remove('hover', 'text');
                return;
            }

            const isTextField = !!target.closest(textInputSelector);
            if (isTextField) {
                cursor.classList.add('text');
                cursor.classList.remove('hover');
                return;
            }

            cursor.classList.remove('text');
            if (target.closest(interactiveSelector)) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        };

        const animateCursor = () => {
            const smoothing = activeModalState?.overlay ? 0.34 : 0.42;
            currentX += (targetX - currentX) * smoothing;
            currentY += (targetY - currentY) * smoothing;
            cursor.style.left = `${currentX}px`;
            cursor.style.top = `${currentY}px`;
            rafId = window.requestAnimationFrame(animateCursor);
        };

        rafId = window.requestAnimationFrame(animateCursor);

        const updateCursorPosition = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            const dx = Math.abs(targetX - currentX);
            const dy = Math.abs(targetY - currentY);
            // Prevent "heavy" trailing when moving quickly across the page.
            if (dx + dy > 90) {
                currentX = targetX;
                currentY = targetY;
                cursor.style.left = `${currentX}px`;
                cursor.style.top = `${currentY}px`;
            }
        };

        if ('PointerEvent' in window) {
            document.addEventListener('pointermove', updateCursorPosition);
        } else {
            document.addEventListener('mousemove', updateCursorPosition);
        }

        document.addEventListener('mousedown', () => {
            cursor.classList.add('click');
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('click');
        });

        document.addEventListener('mouseenter', () => {
            cursor.classList.remove('hidden');
        });

        document.addEventListener('mouseleave', () => {
            cursor.classList.add('hidden');
        });

        document.addEventListener('pointerover', (e) => {
            const target = e.target;
            applyCursorClassesForTarget(target);
        });

        document.addEventListener('pointerout', (e) => {
            const toEl = e.relatedTarget;
            applyCursorClassesForTarget(toEl);
        });

        document.addEventListener('focusin', (e) => {
            applyCursorClassesForTarget(e.target);
        });

        document.addEventListener('focusout', () => {
            const active = document.activeElement;
            if (active instanceof Element) {
                applyCursorClassesForTarget(active);
                return;
            }
            cursor.classList.remove('text');
        });

        document.addEventListener('touchstart', () => {
            cursor.classList.add('hidden');
        }, { passive: true });

        window.addEventListener('beforeunload', () => {
            if (rafId) window.cancelAnimationFrame(rafId);
        });
    }
};

function hideWakeupOverlay(playMusic = true) {
    const overlay = document.getElementById('wakeup-overlay');
    if (playMusic && !isMusicPlaying) {
        // Try to start music inside the same user gesture to avoid autoplay blocking.
        startMusicOnWakeup();
    }
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            // Fallback attempt if first start was blocked.
            if (playMusic && !isMusicPlaying) {
                startMusicOnWakeup();
            }
        }, 500);
    }
}

function enterWithoutMusic(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    hideWakeupOverlay(false);
}

function startMusicOnWakeup() {
    if (!musicAudio) return;
    if (!musicAudio.src) {
        loadTrack(currentMusicTrack);
    }

    // "Normal enter" should always start with audible sound.
    let shouldPersist = false;
    if (settings.mute) {
        settings.mute = false;
        shouldPersist = true;
    }
    if (!Number.isFinite(settings.volume) || settings.volume <= 0.01) {
        settings.volume = Math.max(defaultSettings.volume || 0.6, 0.35);
        shouldPersist = true;
    }
    if (shouldPersist) {
        saveSettings();
        syncSettingsUI();
    }

    applyAudioSettings();
    playCurrentTrackWithFade();
}

function checkIfReadyToWakeup() {
    const overlay = document.getElementById('wakeup-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        overlay.addEventListener('click', () => hideWakeupOverlay(true));
        const noMusicBtn = document.getElementById('wakeup-no-music-btn');
        if (noMusicBtn) {
            noMusicBtn.addEventListener('click', enterWithoutMusic);
        }
        // add listener once and remove itself after execution to avoid blocking spaces later
        const keyHandler = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                hideWakeupOverlay();
                document.removeEventListener('keydown', keyHandler);
            }
        };
        document.addEventListener('keydown', keyHandler);
    }
}

function makestar() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    const star = document.createElement('div');
    star.className = 'star';

    const size = Math.random();
    if (size < 0.5) {
        star.classList.add('small');
    } else if (size < 0.8) {
        star.classList.add('medium');
    } else {
        star.classList.add('large');
    }

    const behavior = Math.random();
    const lifetime = behavior < 0.55 ? 5200 : 7600;

    if (behavior < 0.55) {
        star.classList.add('twinkle');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2.5}s`;
    } else {
        star.classList.add('float');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 28}px`);
        star.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 28}px`);
        star.style.animationDelay = `${Math.random() * 2.5}s`;
    }

    starfield.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, lifetime);
}

function showpage(page) {
    const pages = document.querySelectorAll('.container');
    pages.forEach(p => {
        if (p.id === page) {
            p.classList.remove('hidden');
        } else {
            p.classList.add('hidden');
        }
    });

    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
        const targetPage = link.dataset.page || '';
        const isActive = targetPage === page || link.onclick.toString().includes(page);
        if (isActive) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    currentpage = page;
    if (page !== 'home') {
        isMainPlayerVisible = false;
    }
    updateDocumentTitle(page);
    updateMiniMusicPlayerVisibility();
    updateGlobalPartnersVisibility();
}

// Discord Profile Fetching
const DISCORD_USER_ID = '690653953238499369';
const DISCORD_USERNAME = 'lastanswtcf'; // Twoj username Discord jako fallback

const DISCORD_STATUS_TEXT = {
    online: 'Online',
    idle: 'Away',
    dnd: 'Do Not Disturb',
    offline: 'Offline'
};

function getDiscordDeviceInfo(user) {
    const devices = [];

    if (user.active_on_discord_mobile) {
        devices.push('Mobile');
    }
    if (user.active_on_discord_desktop) {
        devices.push('Desktop');
    }
    if (user.active_on_discord_web) {
        devices.push('Web');
    }

    if (devices.length === 0) {
        return {
            chipIconsHtml: '<i class="fas fa-desktop"></i>',
            tileIconsHtml: '<span class="presence-icon"><i class="fas fa-desktop"></i></span>',
            tooltip: 'No active device'
        };
    }

    const deviceIconMap = {
        Mobile: 'fas fa-mobile-alt',
        Desktop: 'fas fa-desktop',
        Web: 'fas fa-globe'
    };

    const chipIconsHtml = devices
        .map(device => `<i class="${deviceIconMap[device] || 'fas fa-desktop'}"></i>`)
        .join(' ');

    const tileIconsHtml = devices
        .map(device => `<span class="presence-icon"><i class="${deviceIconMap[device] || 'fas fa-desktop'}"></i></span>`)
        .join('');

    return {
        chipIconsHtml,
        tileIconsHtml,
        tooltip: `Active on ${devices.join(' + ')}`
    };
}

// Zmienne do przechowywania aktualnych danych Spotify i presence
let currentSpotifyData = null;
let spotifyUpdateInterval = null;
let discordElapsedInterval = null;
let discordPollInterval = null;
let discordIdleSince = null;
let discordCurrentStatus = 'offline';
let lanyardSocket = null;
let lanyardHeartbeatInterval = null;
let lanyardReconnectTimer = null;
let lanyardReconnectAttempts = 0;
let lanyardConnected = false;

function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, char => (
        {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]
    ));
}

function formatElapsedClock(start) {
    if (!start) return '0:00';
    const totalSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getActivityButtons(activity) {
    const labels = Array.isArray(activity?.buttons) ? activity.buttons : [];
    const urls = Array.isArray(activity?.buttons_urls)
        ? activity.buttons_urls
        : (Array.isArray(activity?.metadata?.button_urls) ? activity.metadata.button_urls : []);
    const maxCount = Math.min(labels.length, urls.length, 2);
    if (maxCount === 0) return '';

    let html = '<div class="activity-buttons">';
    for (let i = 0; i < maxCount; i++) {
        const label = escapeHtml(labels[i]);
        const url = escapeHtml(urls[i]);
        html += `<a class="activity-button" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
    html += '</div>';
    return html;
}

function readIdleSince(user) {
    const rawIdle = user?.idle_since || user?.discord_idle_since || user?.kv?.idle_since;
    if (typeof rawIdle === 'number') {
        return rawIdle > 1e12 ? rawIdle : rawIdle * 1000;
    }
    return null;
}

function updateDynamicDiscordTime() {
    document.querySelectorAll('.discord-elapsed[data-start]').forEach((el) => {
        const start = Number(el.dataset.start);
        if (!Number.isFinite(start) || start <= 0) return;
        el.textContent = `Elapsed ${formatElapsedClock(start)}`;
    });

    const statusTextEl = document.getElementById('discord-status-text');
    if (statusTextEl && discordCurrentStatus === 'idle' && discordIdleSince) {
        statusTextEl.textContent = `Away · ${formatElapsedClock(discordIdleSince)}`;
    }
}

function startDiscordDynamicTime() {
    if (discordElapsedInterval) {
        clearInterval(discordElapsedInterval);
        discordElapsedInterval = null;
    }
    updateDynamicDiscordTime();
    discordElapsedInterval = setInterval(updateDynamicDiscordTime, 1000);
}

function renderDiscordProfile(user) {
    const avatar = document.getElementById('discord-avatar');
    if (avatar) {
        const avatarUrl = user.discord_user?.avatar
            ? `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${user.discord_user.avatar}.png?size=256`
            : `https://cdn.discordapp.com/embed/avatars/${(user.discord_user?.discriminator || '0') % 5}.png`;
        avatar.src = avatarUrl;
        avatar.alt = user.discord_user?.display_name || user.discord_user?.username || 'Discord User';
    }

    const usernameEl = document.getElementById('discord-username');
    if (usernameEl) {
        const displayName = user.discord_user?.display_name;
        const username = user.discord_user?.username || 'Unknown';
        const globalName = user.discord_user?.global_name;
        const discriminator = user.discord_user?.discriminator;

        if (displayName && displayName.trim() !== '') {
            usernameEl.textContent = displayName;
        } else if (globalName && globalName.trim() !== '') {
            usernameEl.textContent = globalName;
        } else {
            usernameEl.textContent = discriminator && discriminator !== '0'
                ? `${username}#${discriminator}`
                : `@${username}`;
        }
    }

    const status = user.discord_status || 'offline';
    discordCurrentStatus = status;
    const statusEl = document.getElementById('discord-status');
    const statusTextEl = document.getElementById('discord-status-text');
    const statusChipEl = document.getElementById('discord-status-chip');
    const deviceChipEl = document.getElementById('discord-device-chip');
    const statusLabel = DISCORD_STATUS_TEXT[status] || DISCORD_STATUS_TEXT.offline;
    const deviceInfo = getDiscordDeviceInfo(user);

    if (statusEl) {
        statusEl.className = `status-indicator ${status}`;
    }

    if (statusChipEl) {
        statusChipEl.textContent = statusLabel;
    }

    if (status === 'idle') {
        const apiIdleSince = readIdleSince(user);
        if (apiIdleSince) {
            discordIdleSince = apiIdleSince;
        } else if (!discordIdleSince) {
            discordIdleSince = Date.now();
        }
    } else {
        discordIdleSince = null;
    }

    if (statusTextEl) {
        statusTextEl.textContent = status === 'idle' && discordIdleSince
            ? `Away · ${formatElapsedClock(discordIdleSince)}`
            : statusLabel;
    }

    if (deviceChipEl) {
        deviceChipEl.innerHTML = deviceInfo.chipIconsHtml;
        deviceChipEl.title = deviceInfo.tooltip;
    }

    const customTileEl = document.getElementById('discord-custom-tile');
    const customTextEl = document.getElementById('discord-custom-text');
    let customStatus = null;

    const activitiesContainer = document.getElementById('discord-activities');
    if (activitiesContainer) {
        activitiesContainer.innerHTML = '';

        if (spotifyUpdateInterval) {
            clearInterval(spotifyUpdateInterval);
            spotifyUpdateInterval = null;
        }
        currentSpotifyData = null;

        const activities = Array.isArray(user.activities) ? user.activities : [];
        const visibleActivities = activities.filter(activity => activity.type !== 4);

        activities.forEach(activity => {
            if (activity.type === 4 && activity.state) {
                customStatus = activity.state;
            }
        });

        if (visibleActivities.length > 0) {
            visibleActivities.forEach(activity => {
                const activityCard = document.createElement('div');
                activityCard.className = 'activity-card';
                const buttonsHtml = getActivityButtons(activity);

                if (activity.type === 2 && activity.name === 'Spotify') {
                    currentSpotifyData = activity;
                    activityCard.classList.add('spotify');
                    activityCard.id = 'spotify-activity-card';
                    const albumArt = activity.assets?.large_image
                        ? `https://i.scdn.co/image/${activity.assets.large_image.replace('spotify:', '')}`
                        : (user.spotify?.album_art_url || '');
                    const trackName = escapeHtml(activity.details || user.spotify?.song || 'Unknown Track');
                    const artistName = escapeHtml(activity.state || user.spotify?.artist || 'Unknown Artist');

                    activityCard.innerHTML = `
                        <div class="activity-header">
                            <div class="activity-icon">
                                <i class="fab fa-spotify"></i>
                            </div>
                            <div class="activity-type">LISTENING TO SPOTIFY</div>
                        </div>
                        <div class="spotify-content">
                            <div class="spotify-album-container">
                                <img class="spotify-album-art" src="${albumArt}" alt="Album Art" onerror="this.src='https://i.scdn.co/image/ab67616d0000b27398016188d6fa7307f840603f'">
                            </div>
                            <div class="spotify-track-info">
                                <div class="activity-title">${trackName}</div>
                                <div class="activity-artist">${artistName}</div>
                            </div>
                        </div>
                        ${activity.timestamps ? `
                            <div class="progress-container">
                                <div class="progress-bar" id="spotify-progress-bar" style="width: ${calculateProgress(activity.timestamps)}%"></div>
                            </div>
                            <div class="progress-time">
                                <span id="spotify-current-time">${formatElapsed(activity.timestamps.start)}</span>
                                <span id="spotify-duration">${formatDuration(activity.timestamps.start, activity.timestamps.end)}</span>
                            </div>
                        ` : ''}
                        ${buttonsHtml}
                    `;

                    if (activity.timestamps) {
                        startSpotifyRealTimeUpdate(activity.timestamps);
                    }
                } else if (activity.type === 0) {
                    const isVscode = activity.name === 'Visual Studio Code' || activity.application_id === '383226320970055681';
                    const details = escapeHtml(activity.details || activity.name || 'Active now');
                    const state = escapeHtml(activity.state || '');
                    const elapsedHtml = activity.timestamps?.start
                        ? `<div class="activity-elapsed discord-elapsed" data-start="${activity.timestamps.start}">Elapsed ${formatElapsedClock(activity.timestamps.start)}</div>`
                        : '';

                    if (isVscode) {
                        activityCard.classList.add('vscode', 'rich');
                        activityCard.innerHTML = `
                            <div class="activity-header">
                                <div class="activity-icon">
                                    <i class="fas fa-code"></i>
                                </div>
                                <div class="activity-type">PLAYING VISUAL STUDIO CODE</div>
                            </div>
                            <div class="activity-content">
                                <div class="activity-app-icon">
                                    <i class="fab fa-html5"></i>
                                </div>
                                <div class="activity-copy">
                                    <div class="activity-title">${details}</div>
                                    ${state ? `<div class="activity-artist">${state}</div>` : ''}
                                    ${elapsedHtml}
                                </div>
                            </div>
                            ${buttonsHtml}
                        `;
                    } else {
                        const gameName = escapeHtml(activity.name || 'Game');
                        activityCard.innerHTML = `
                            <div class="activity-header">
                                <div class="activity-icon">
                                    <i class="fas fa-gamepad"></i>
                                </div>
                                <div class="activity-type">PLAYING A GAME</div>
                            </div>
                            <div class="activity-title">${gameName}</div>
                            ${activity.details ? `<div class="activity-artist">${escapeHtml(activity.details)}</div>` : ''}
                            ${activity.state ? `<div class="activity-artist">${escapeHtml(activity.state)}</div>` : ''}
                            ${elapsedHtml}
                            ${buttonsHtml}
                        `;
                    }
                } else {
                    const activityName = escapeHtml(activity.name || 'ACTIVE NOW');
                    const elapsedHtml = activity.timestamps?.start
                        ? `<div class="activity-elapsed discord-elapsed" data-start="${activity.timestamps.start}">Elapsed ${formatElapsedClock(activity.timestamps.start)}</div>`
                        : '';
                    activityCard.innerHTML = `
                        <div class="activity-header">
                            <div class="activity-icon">
                                <i class="fas fa-circle"></i>
                            </div>
                            <div class="activity-type">${activityName}</div>
                        </div>
                        ${activity.details ? `<div class="activity-title">${escapeHtml(activity.details)}</div>` : ''}
                        ${activity.state ? `<div class="activity-artist">${escapeHtml(activity.state)}</div>` : ''}
                        ${elapsedHtml}
                        ${buttonsHtml}
                    `;
                }

                activitiesContainer.appendChild(activityCard);
            });
        } else {
            activitiesContainer.innerHTML = '<div class="activity-placeholder">No activities right now</div>';
        }
    }

    if (customTileEl) {
        customTileEl.hidden = !customStatus;
    }

    if (customTextEl) {
        customTextEl.textContent = customStatus || '';
    }

    startDiscordDynamicTime();
}

async function fetchDiscordProfile() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        if (!response.ok || response.status === 404) {
            loadFallbackProfile();
            return;
        }

        const data = await response.json();
        if (!data.success || !data.data) {
            loadFallbackProfile();
            return;
        }

        renderDiscordProfile(data.data);
    } catch (error) {
        console.error('Error fetching Discord profile:', error);
        loadFallbackProfile();
    }
}

function clearLanyardSocketState() {
    if (lanyardHeartbeatInterval) {
        clearInterval(lanyardHeartbeatInterval);
        lanyardHeartbeatInterval = null;
    }
    if (lanyardSocket) {
        try {
            lanyardSocket.close();
        } catch (_) {
            // ignore close errors
        }
    }
    lanyardSocket = null;
    lanyardConnected = false;
}

function connectLanyardSocket() {
    if (typeof WebSocket === 'undefined' || lanyardSocket) {
        return;
    }

    try {
        lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');
    } catch (_) {
        lanyardSocket = null;
        return;
    }

    lanyardSocket.addEventListener('open', () => {
        lanyardConnected = true;
        lanyardReconnectAttempts = 0;
    });

    lanyardSocket.addEventListener('message', (event) => {
        let payload;
        try {
            payload = JSON.parse(event.data);
        } catch (_) {
            return;
        }

        if (payload.op === 1) {
            const heartbeatInterval = Number(payload.d?.heartbeat_interval || 30000);
            if (lanyardHeartbeatInterval) {
                clearInterval(lanyardHeartbeatInterval);
            }
            lanyardHeartbeatInterval = setInterval(() => {
                if (lanyardSocket && lanyardSocket.readyState === WebSocket.OPEN) {
                    lanyardSocket.send(JSON.stringify({ op: 3 }));
                }
            }, heartbeatInterval);

            if (lanyardSocket.readyState === WebSocket.OPEN) {
                lanyardSocket.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_to_id: DISCORD_USER_ID }
                }));
            }
            return;
        }

        if (payload.op !== 0 || !payload.d) {
            return;
        }

        const eventType = payload.t;
        if (eventType === 'INIT_STATE' && payload.d[DISCORD_USER_ID]) {
            renderDiscordProfile(payload.d[DISCORD_USER_ID]);
            return;
        }

        if (eventType === 'PRESENCE_UPDATE' || eventType === 'PRESENCE_UPDATE_V1') {
            const userPayload = payload.d?.discord_user || payload.d?.activities ? payload.d : null;
            if (userPayload) {
                renderDiscordProfile(userPayload);
            }
        }
    });

    lanyardSocket.addEventListener('close', () => {
        clearLanyardSocketState();
        const reconnectDelay = Math.min(30000, 2000 * Math.max(1, lanyardReconnectAttempts + 1));
        lanyardReconnectAttempts += 1;
        if (lanyardReconnectTimer) {
            clearTimeout(lanyardReconnectTimer);
        }
        lanyardReconnectTimer = setTimeout(connectLanyardSocket, reconnectDelay);
    });

    lanyardSocket.addEventListener('error', () => {
        clearLanyardSocketState();
        if (lanyardReconnectTimer) {
            clearTimeout(lanyardReconnectTimer);
        }
        lanyardReconnectTimer = setTimeout(connectLanyardSocket, 5000);
    });
}

// Fallback - podstawowe informacje bez Lanyard
function loadFallbackProfile() {
    discordCurrentStatus = 'offline';
    discordIdleSince = null;
    if (spotifyUpdateInterval) {
        clearInterval(spotifyUpdateInterval);
        spotifyUpdateInterval = null;
    }
    if (discordElapsedInterval) {
        clearInterval(discordElapsedInterval);
        discordElapsedInterval = null;
    }
    const avatar = document.getElementById('discord-avatar');
    const usernameEl = document.getElementById('discord-username');
    const statusTextEl = document.getElementById('discord-status-text');
    const statusEl = document.getElementById('discord-status');
    const statusChipEl = document.getElementById('discord-status-chip');
    const deviceChipEl = document.getElementById('discord-device-chip');
    const activitiesContainer = document.getElementById('discord-activities');
    const customTileEl = document.getElementById('discord-custom-tile');
    const customTextEl = document.getElementById('discord-custom-text');
    const activityLabelEl = document.getElementById('discord-activity-label');
    const activityTextEl = document.getElementById('discord-activity-text');
    
    // Avatar - uĹĽyj domyĹ›lnego lub sprĂłbuj pobraÄ‡ z Discord CDN
    if (avatar) {
        // SprĂłbuj pobraÄ‡ avatar z Discord CDN (moĹĽe nie dziaĹ‚aÄ‡ bez peĹ‚nego ID)
        avatar.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(DISCORD_USER_ID) % 5}.png`;
        avatar.alt = DISCORD_USERNAME;
    }
    
    // Username
    if (usernameEl) {
        usernameEl.textContent = `@${DISCORD_USERNAME}`;
    }
    
    // Status - zawsze offline w fallback
    if (statusEl) {
        statusEl.className = 'status-indicator offline';
    }
    
    if (statusTextEl) {
        statusTextEl.textContent = DISCORD_STATUS_TEXT.offline;
    }

    if (statusChipEl) {
        statusChipEl.textContent = DISCORD_STATUS_TEXT.offline;
    }

    if (deviceChipEl) {
        deviceChipEl.innerHTML = '<i class="fas fa-desktop"></i>';
        deviceChipEl.title = 'No active device';
    }

    if (customTileEl) {
        customTileEl.hidden = true;
    }

    if (customTextEl) {
        customTextEl.textContent = '';
    }

    if (activityLabelEl) {
        activityLabelEl.textContent = 'CURRENTLY OFFLINE';
    }

    if (activityTextEl) {
        activityTextEl.textContent = 'No active apps detected Â· Probably chilling';
    }
    
    // AktywnoĹ›ci - komunikat
    if (activitiesContainer) {
        activitiesContainer.innerHTML = `
            <div class="activity-placeholder">
                <p style="margin-bottom: 8px; color: #aaa; font-size: 13px;">Enable Discord presence via Lanyard</p>
                <p style="font-size: 11px; color: #666; margin-bottom: 12px;">Join the Lanyard Discord server to display live status</p>
                <a href="https://discord.gg/lanyard" target="_blank" style="color: #5865f2; text-decoration: none; font-size: 12px; font-weight: 500; display: inline-block; padding: 6px 12px; background: rgba(88, 101, 242, 0.1); border-radius: 6px; border: 1px solid rgba(88, 101, 242, 0.2); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(88, 101, 242, 0.2)'" onmouseout="this.style.background='rgba(88, 101, 242, 0.1)'">
                    discord.gg/lanyard
                </a>
            </div>
        `;
    }
}

function calculateProgress(timestamps) {
    if (!timestamps.start || !timestamps.end) return 0;
    const now = Date.now();
    const start = timestamps.start;
    const end = timestamps.end;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function formatTime(timestamp) {
    if (!timestamp) return '0:00';
    const date = new Date(timestamp);
    const totalSeconds = Math.floor(date.getTime() / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function formatDuration(start, end) {
    if (!start || !end) return '0:00';
    const totalSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function formatElapsed(start) {
    if (!start) return '0:00';
    const totalSeconds = Math.floor((Date.now() - start) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Funkcja do aktualizacji Spotify w czasie rzeczywistym
function startSpotifyRealTimeUpdate(timestamps) {
    if (!timestamps.start || !timestamps.end) return;
    
    // Zatrzymaj poprzedni interval jeĹ›li istnieje
    if (spotifyUpdateInterval) {
        clearInterval(spotifyUpdateInterval);
        spotifyUpdateInterval = null;
    }
    
    // Aktualizuj co sekundÄ™
    spotifyUpdateInterval = setInterval(() => {
        const progressBar = document.getElementById('spotify-progress-bar');
        const currentTimeEl = document.getElementById('spotify-current-time');
        const durationEl = document.getElementById('spotify-duration');
        
        if (!progressBar || !currentTimeEl || !durationEl) {
            if (spotifyUpdateInterval) {
                clearInterval(spotifyUpdateInterval);
                spotifyUpdateInterval = null;
            }
            return;
        }
        
        const now = Date.now();
        const start = timestamps.start;
        const end = timestamps.end;
        const total = end - start;
        const elapsed = now - start;
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        
        progressBar.style.width = progress + '%';
        currentTimeEl.textContent = formatElapsed(start);
        durationEl.textContent = formatDuration(start, end);
        
        // JeĹ›li utwĂłr siÄ™ skoĹ„czyĹ‚, zatrzymaj aktualizacjÄ™
        if (now >= end) {
            if (spotifyUpdateInterval) {
                clearInterval(spotifyUpdateInterval);
                spotifyUpdateInterval = null;
            }
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadContentConfig();
    optimizeStaticMediaLoading();

    const messageTextarea = document.getElementById('contact-message');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', updateCharCount);
    }

    const overlay = document.getElementById('contact-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeContactForm();
            }
        });
    }

    const redirectOverlay = document.getElementById('external-redirect-overlay');
    if (redirectOverlay) {
        redirectOverlay.addEventListener('click', (e) => {
            if (e.target === redirectOverlay) {
                cancelExternalRedirect();
            }
        });
    }

    const settingsOverlay = document.getElementById('settings-overlay');
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) {
                closeSettings();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeContactForm();
            cancelExternalRedirect();
            closeSettings();
            closePlaylistOverlay();
            closeProjectDetails();
            return;
        }

        handleGlobalShortcut(e);
    });

    loadContactCooldown();
    cursorsys.init();
    seedAmbientStars();
    initNameChanger();
    renderProjectsSection();
    initMusicPlayer();
    initFavoritesWidget();
    initProjectsSearch();
    initAboutSearch();
    initSkillsSearch();
    initWorkAvailabilityStatus();
    initAboutFacts();
    initProjectDetailsOverlay();
    runWhenIdle(() => {
        initWeatherWidget();
        initPartnersCarousel();
        initHomeViewCounter();
    }, 1000);
    checkIfReadyToWakeup();
    initSiteNotice();
    initSettingsCategories();
    initShortcutSettings();
    applySettings();
    updateGlobalPartnersVisibility();
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopStarfield();
            return;
        }
        if (!settings.reduceMotion && !settings.performanceMode) {
            startStarfield();
        }
    });

    runWhenIdle(() => {
        fetchDiscordProfile();
        connectLanyardSocket();
        if (discordPollInterval) {
            clearInterval(discordPollInterval);
        }
        discordPollInterval = setInterval(() => {
            if (!lanyardConnected) {
                fetchDiscordProfile();
            }
        }, 60000);
    }, 1500);

    // Decode obfuscated email.
    const emailElement = document.getElementById('email');
    if (emailElement) {
        emailElement.textContent = atob(emailElement.textContent);
    }

    // Configure email link target.
    const emailLink = document.getElementById('contact-email-link');
    if (emailLink && emailElement) {
        const decodedEmail = emailElement.textContent;
        emailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${decodedEmail}`;
    }

    const muteToggle = document.getElementById('setting-mute');
    const volumeRange = document.getElementById('setting-volume');
    const cursorToggle = document.getElementById('setting-cursor');
    const confirmToggle = document.getElementById('setting-confirm-redirects');
    const floatingPlayerToggle = document.getElementById('setting-floating-player');
    const snapAssistToggle = document.getElementById('setting-mini-player-snap-assist');
    const showPartnersToggle = document.getElementById('setting-show-partners');
    const reduceMotionToggle = document.getElementById('setting-reduce-motion');
    const highContrastToggle = document.getElementById('setting-high-contrast');
    const largeTextToggle = document.getElementById('setting-large-text');
    const focusToggle = document.getElementById('setting-focus-outlines');
    const dyslexiaFontToggle = document.getElementById('setting-dyslexia-font');
    const performanceToggle = document.getElementById('setting-performance-mode');

    if (muteToggle) {
        muteToggle.addEventListener('change', (e) => {
            settings.mute = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (volumeRange) {
        volumeRange.addEventListener('input', (e) => {
            const value = Number(e.target.value);
            settings.volume = Math.max(0, Math.min(1, value / 100));
            saveSettings();
            applyAudioSettings();
        });
    }

    if (cursorToggle) {
        cursorToggle.addEventListener('change', (e) => {
            settings.cursorEnabled = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (confirmToggle) {
        confirmToggle.addEventListener('change', (e) => {
            settings.confirmExternal = e.target.checked;
            saveSettings();
            syncSettingsUI();
        });
    }

    if (floatingPlayerToggle) {
        floatingPlayerToggle.addEventListener('change', (e) => {
            settings.floatingPlayerEnabled = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (snapAssistToggle) {
        snapAssistToggle.addEventListener('change', (e) => {
            settings.miniPlayerSnapAssist = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (showPartnersToggle) {
        showPartnersToggle.addEventListener('change', (e) => {
            settings.partnersVisible = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (reduceMotionToggle) {
        reduceMotionToggle.addEventListener('change', (e) => {
            settings.reduceMotion = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (highContrastToggle) {
        highContrastToggle.addEventListener('change', (e) => {
            settings.highContrast = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (largeTextToggle) {
        largeTextToggle.addEventListener('change', (e) => {
            settings.largeText = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (focusToggle) {
        focusToggle.addEventListener('change', (e) => {
            settings.focusOutlines = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (dyslexiaFontToggle) {
        dyslexiaFontToggle.addEventListener('change', (e) => {
            settings.dyslexiaFont = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    if (performanceToggle) {
        performanceToggle.addEventListener('change', (e) => {
            settings.performanceMode = e.target.checked;
            saveSettings();
            applySettings();
        });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) return;
        if (link.dataset.noConfirm === 'true') return;

        if (href.startsWith('#')) return;

        let url;
        try {
            url = new URL(href, window.location.href);
        } catch {
            return;
        }

        const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
        const isExternal = url.origin !== window.location.origin;

        if (!isHttp || !isExternal) return;
        if (!settings.confirmExternal) return;

        e.preventDefault();
        openExternalRedirect(url.href, link.getAttribute('target'));
    });
});
