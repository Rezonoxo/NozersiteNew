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
let wakeupOverlayReady = false;
let revealObserver = null;
let deferredHomeWidgetsReady = false;
let deferredPresenceReady = false;
let deferredHomeObserver = null;

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
let miniPlayerDismissed = false;
let aboutFactIndex = -1;
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

function getRevealGroups() {
    return [
        '.discord-profile-card',
        '.spotify-history-card',
        '.music-player-card',
        '.weather-card',
        '.info-grid .info-item',
        '.about-hero-card',
        '.about-card-grid > *',
        '.about-fact-card',
        '.favorites-card',
        '.projects-grid > *',
        '.skills-shell .skills-group',
        '.skills-shell .language-card',
        '.contact-grid > *',
        '.social-links-container > *'
    ];
}

function primeRevealTargets() {
    getRevealGroups().forEach((selector) => {
        const elements = Array.from(document.querySelectorAll(selector));
        elements.forEach((element, index) => {
            if (!(element instanceof HTMLElement)) return;
            if (element.dataset.revealReady === 'true') return;
            element.dataset.reveal = 'true';
            element.dataset.revealReady = 'true';
            element.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 70}ms`);
        });
    });
}

function initScrollReveal(forceRefresh = false) {
    primeRevealTargets();

    const targets = Array.from(document.querySelectorAll('[data-reveal="true"]'));
    if (!targets.length) return;

    const disableReveal = settings.reduceMotion || settings.performanceMode || !('IntersectionObserver' in window);
    if (disableReveal) {
        targets.forEach((element) => {
            if (element instanceof HTMLElement) {
                element.classList.add('is-visible');
            }
        });
        if (revealObserver) {
            revealObserver.disconnect();
            revealObserver = null;
        }
        return;
    }

    if (forceRefresh && revealObserver) {
        revealObserver.disconnect();
        revealObserver = null;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                if (element instanceof HTMLElement) {
                    element.classList.add('is-visible');
                }
                revealObserver?.unobserve(element);
            });
        }, {
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.12
        });
    }

    targets.forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        if (element.classList.contains('is-visible')) return;
        revealObserver.observe(element);
    });
}

function ensureHomeWidgetsReady() {
    if (deferredHomeWidgetsReady) return;
    deferredHomeWidgetsReady = true;
    initWeatherWidget();
    initHomeViewCounter();
}

function ensurePresenceReady() {
    if (deferredPresenceReady) return;
    deferredPresenceReady = true;

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
}

function initDeferredHomeObservers() {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;

    const shouldEagerLoad = currentpage === 'home' && !settings.performanceMode;
    if (shouldEagerLoad) {
        runWhenIdle(() => {
            ensureHomeWidgetsReady();
            ensurePresenceReady();
        }, 900);
        return;
    }

    if (!('IntersectionObserver' in window)) {
        ensureHomeWidgetsReady();
        ensurePresenceReady();
        return;
    }

    if (deferredHomeObserver) {
        deferredHomeObserver.disconnect();
        deferredHomeObserver = null;
    }

    deferredHomeObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        ensureHomeWidgetsReady();
        ensurePresenceReady();
        deferredHomeObserver?.disconnect();
        deferredHomeObserver = null;
    }, {
        rootMargin: '0px 0px -18% 0px',
        threshold: 0.08
    });

    deferredHomeObserver.observe(homeSection);
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

