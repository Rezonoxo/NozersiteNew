let currentpage = 'home';
let contactCooldownExpiry = 0;
let pendingRedirectUrl = null;
let pendingRedirectTarget = null;
let starIntervalId = null;

const SETTINGS_KEY = 'nozer_settings_v1';
const defaultSettings = {
    mute: false,
    volume: 0.6,
    cursorEnabled: true,
    confirmExternal: true,
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    focusOutlines: false
};

let settings = loadSettings();

const names = ['Nozer', 'Wiktor', 'Heaven'];
let currentNameIndex = 0;

const musicTracks = [
    {
        name: '#habibati',
        artist: 'Poshlaya Molly, HOFMANNITA',
        file: 'audio/MT1.mp3',
        image: 'https://i.pinimg.com/474x/95/e8/27/95e8270466b1aae5199ff8bdc2a7d214.jpg'
    },
    {
        name: 'Чупа Чупс',
        artist: 'Eldzhey, Poshlaya Molly',
        file: 'audio/MT2.mp3',
        image: 'icons/cover2.jpg'
    }
];

let currentMusicTrack = 0;
let musicAudio = null;
let isMusicPlaying = false;

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

function applyAudioSettings() {
    if (!musicAudio) return;
    musicAudio.muted = settings.mute;
    musicAudio.volume = settings.volume;

    const volumeRange = document.getElementById('music-volume-range');
    if (volumeRange) {
        volumeRange.value = Math.round(settings.volume * 100);
    }
}

function syncSettingsUI() {
    const muteToggle = document.getElementById('setting-mute');
    const volumeRange = document.getElementById('setting-volume');
    const cursorToggle = document.getElementById('setting-cursor');
    const confirmToggle = document.getElementById('setting-confirm-redirects');
    const reduceMotionToggle = document.getElementById('setting-reduce-motion');
    const highContrastToggle = document.getElementById('setting-high-contrast');
    const largeTextToggle = document.getElementById('setting-large-text');
    const focusToggle = document.getElementById('setting-focus-outlines');

    if (muteToggle) muteToggle.checked = settings.mute;
    if (volumeRange) volumeRange.value = Math.round(settings.volume * 100);
    if (cursorToggle) cursorToggle.checked = settings.cursorEnabled;
    if (confirmToggle) confirmToggle.checked = settings.confirmExternal;
    if (reduceMotionToggle) reduceMotionToggle.checked = settings.reduceMotion;
    if (highContrastToggle) highContrastToggle.checked = settings.highContrast;
    if (largeTextToggle) largeTextToggle.checked = settings.largeText;
    if (focusToggle) focusToggle.checked = settings.focusOutlines;
}

function applySettings() {
    const body = document.body;
    if (!body) return;

    body.classList.toggle('cursor-disabled', !settings.cursorEnabled);
    body.classList.toggle('reduce-motion', settings.reduceMotion);
    body.classList.toggle('high-contrast', settings.highContrast);
    body.classList.toggle('large-text', settings.largeText);
    body.classList.toggle('focus-outlines', settings.focusOutlines);

    if (settings.reduceMotion) {
        stopStarfield();
    } else if (!starIntervalId) {
        startStarfield();
    }

    applyAudioSettings();
    syncSettingsUI();
}

function startStarfield() {
    if (starIntervalId) return;
    starIntervalId = setInterval(makestar, 200);
}

function stopStarfield() {
    if (!starIntervalId) return;
    clearInterval(starIntervalId);
    starIntervalId = null;
}

function openSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    syncSettingsUI();
}

function closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.classList.remove('active');
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
    overlay.classList.add('active');
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
    overlay.classList.remove('active');
}

function openExternalRedirect(url, target) {
    const overlay = document.getElementById('external-redirect-overlay');
    const urlEl = document.getElementById('external-redirect-url');
    const dontAsk = document.getElementById('external-redirect-dont-ask');
    if (!overlay || !urlEl) return;

    pendingRedirectUrl = url;
    pendingRedirectTarget = target;
    urlEl.textContent = getDisplayUrl(url);
    if (dontAsk) dontAsk.checked = false;
    overlay.classList.add('active');
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
    if (overlay) overlay.classList.remove('active');
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

function confirmExternalRedirect() {
    if (!pendingRedirectUrl) return;

    const url = pendingRedirectUrl;
    const target = pendingRedirectTarget;
    applyRedirectPreference();
    closeExternalRedirect();

    if (target === '_blank') {
        window.open(url, '_blank', 'noopener');
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

function changeName() {
    const nameElement = document.getElementById('changing-name');
    if (nameElement) {
        nameElement.classList.remove('fade-in');
        void nameElement.offsetWidth; // Trigger reflow
        currentNameIndex = (currentNameIndex + 1) % names.length;
        nameElement.textContent = names[currentNameIndex];
        nameElement.classList.add('fade-in');
    }
}

function initNameChanger() {
    setInterval(changeName, 3000);
}

function initMusicPlayer() {
    musicAudio = document.getElementById('music-audio');
    if (!musicAudio) return;
    
    loadTrack(0);
    
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
    musicAudio.addEventListener('ended', nextTrack);
}

function loadTrack(trackIndex) {
    if (trackIndex < 0) trackIndex = musicTracks.length - 1;
    if (trackIndex >= musicTracks.length) trackIndex = 0;
    
    currentMusicTrack = trackIndex;
    const track = musicTracks[trackIndex];
    
    musicAudio.src = track.file;
    document.getElementById('music-title').textContent = track.name;
    document.getElementById('music-album-art').src = track.image;
    document.getElementById('music-artist').textContent = track.artist;
    
    isMusicPlaying = false;
    updatePlayPauseButton();
    updateMusicProgress(); // Update progress after loading
}

function togglePlayPause() {
    if (!musicAudio.src) return;
    
    if (isMusicPlaying) {
        musicAudio.pause();
        isMusicPlaying = false;
    } else {
        musicAudio.play().catch(e => console.log('Autoplay blocked:', e));
        isMusicPlaying = true;
    }
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    const btn = document.getElementById('play-pause-btn');
    const icon = btn.querySelector('i');
    if (isMusicPlaying) {
        icon.className = 'fas fa-pause';
    } else {
        icon.className = 'fas fa-play';
    }
}

function nextTrack() {
    loadTrack(currentMusicTrack + 1);
    musicAudio.play().catch(e => console.log('Autoplay blocked:', e));
    isMusicPlaying = true;
    updatePlayPauseButton();
}

function previousTrack() {
    loadTrack(currentMusicTrack - 1);
}

function updateMusicProgress() {
    if (!musicAudio) return;
    
    const fill = document.getElementById('music-progress-fill');
    const currentTimeEl = document.getElementById('music-current-time');
    const durationEl = document.getElementById('music-duration');
    
    const currentTime = musicAudio.currentTime || 0;
    const duration = musicAudio.duration || 0;
    
    if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        fill.style.width = percent + '%';
    }
    
    currentTimeEl.textContent = formatMusicTime(currentTime);
    durationEl.textContent = formatMusicTime(duration);
}

function formatMusicTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const cursorsys = {
    init: function() {
        this.ismobile = this.ismobile();
        if (!this.ismobile) {
            this.setupevents();
        }
    },

    ismobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    setupevents: function() {
        const cursor = document.getElementById('customCursor');
        if (!cursor) return;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

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

        const hoverElements = document.querySelectorAll('a, button, .nav-link, .invite-card, .social-link');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });

        const textElements = document.querySelectorAll('input, textarea');
        textElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('text');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('text');
            });
        });
    }
};

function hideWakeupOverlay() {
    const overlay = document.getElementById('wakeup-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            // Start music after overlay is removed (first user interaction)
            if (!isMusicPlaying) {
                togglePlayPause();
            }
        }, 500);
    }
}

function checkIfReadyToWakeup() {
    const overlay = document.getElementById('wakeup-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        overlay.addEventListener('click', hideWakeupOverlay);
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                hideWakeupOverlay();
            }
        });
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

    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';

    starfield.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, 3000);
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

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.onclick.toString().includes(page)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    currentpage = page;
}

// Discord Profile Fetching
const DISCORD_USER_ID = '690653953238499369';
const DISCORD_USERNAME = 'rezonoxo'; // Twój username Discord jako fallback

// Zmienne do przechowywania aktualnych danych Spotify
let currentSpotifyData = null;
let spotifyUpdateInterval = null;

async function fetchDiscordProfile() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        
        // Jeśli Lanyard nie działa (404), użyj fallback
        if (!response.ok || response.status === 404) {
            console.log('Lanyard API nie dostępne, używam fallback');
            loadFallbackProfile();
            return;
        }
        
        const data = await response.json();
        if (!data.success) {
            loadFallbackProfile();
            return;
        }
        
        const user = data.data;
        
        // Update avatar
        const avatar = document.getElementById('discord-avatar');
        if (avatar) {
            const avatarUrl = user.discord_user?.avatar 
                ? `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${user.discord_user.avatar}.png?size=256`
                : `https://cdn.discordapp.com/embed/avatars/${(user.discord_user?.discriminator || '0') % 5}.png`;
            avatar.src = avatarUrl;
            avatar.alt = user.discord_user?.display_name || user.discord_user?.username || 'Discord User';
        }
        
        // Update username - prefer display_name over username
        const usernameEl = document.getElementById('discord-username');
        if (usernameEl) {
            const displayName = user.discord_user?.display_name;
            const username = user.discord_user?.username || 'Unknown';
            const globalName = user.discord_user?.global_name;
            const discriminator = user.discord_user?.discriminator;
            
            // Jeśli jest display_name, użyj go, w przeciwnym razie username
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
        
        // Update status
        const status = user.discord_status || 'offline';
        const statusEl = document.getElementById('discord-status');
        const statusTextEl = document.getElementById('discord-status-text');
        
        if (statusEl) {
            statusEl.className = `status-indicator ${status}`;
        }
        
        if (statusTextEl) {
            const statusTexts = {
                'online': 'Online',
                'idle': 'Zaraz wracam',
                'dnd': 'Nie przeszkadzać',
                'offline': 'Offline'
            };
            statusTextEl.textContent = statusTexts[status] || 'Offline';
        }
        
        // Update activities
        const activitiesContainer = document.getElementById('discord-activities');
        if (activitiesContainer) {
            activitiesContainer.innerHTML = '';
            
            // Zatrzymaj poprzedni interval jeśli istnieje
            if (spotifyUpdateInterval) {
                clearInterval(spotifyUpdateInterval);
                spotifyUpdateInterval = null;
            }
            currentSpotifyData = null;
            
            if (user.activities && user.activities.length > 0) {
                user.activities.forEach(activity => {
                    const activityCard = document.createElement('div');
                    activityCard.className = 'activity-card';
                    
                    // Spotify (type: 2)
                    if (activity.type === 2 && activity.name === 'Spotify') {
                        currentSpotifyData = activity;
                        activityCard.classList.add('spotify');
                        activityCard.id = 'spotify-activity-card';
                        const albumArt = activity.assets?.large_image 
                            ? `https://i.scdn.co/image/${activity.assets.large_image.replace('spotify:', '')}`
                            : (user.spotify?.album_art_url || '');
                        const trackName = activity.details || user.spotify?.song || 'Unknown Track';
                        const artistName = activity.state || user.spotify?.artist || 'Unknown Artist';
                        
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
                        `;
                        
                        // Uruchom aktualizację w czasie rzeczywistym dla Spotify
                        if (activity.timestamps) {
                            startSpotifyRealTimeUpdate(activity.timestamps);
                        }
                    }
                    // Playing a game / Rich Presence (type: 0)
                    else if (activity.type === 0) {
                        // VS Code lub inne aplikacje
                        if (activity.name === 'Visual Studio Code' || activity.application_id === '383226320970055681') {
                            activityCard.classList.add('vscode');
                            activityCard.innerHTML = `
                                <div class="activity-header">
                                    <div class="activity-icon">
                                        <i class="fas fa-code"></i>
                                    </div>
                                    <div class="activity-type">${activity.assets?.large_text || 'CODING'}</div>
                                </div>
                                <div class="activity-title">${activity.name}</div>
                                ${activity.details ? `<div class="activity-artist">${activity.details}</div>` : ''}
                                ${activity.state ? `<div class="activity-artist">${activity.state}</div>` : ''}
                            `;
                        } else {
                            // Gry
                            activityCard.innerHTML = `
                                <div class="activity-header">
                                    <div class="activity-icon">
                                        <i class="fas fa-gamepad"></i>
                                    </div>
                                    <div class="activity-type">PLAYING A GAME</div>
                                </div>
                                <div class="activity-title">${activity.name}</div>
                                ${activity.details ? `<div class="activity-artist">${activity.details}</div>` : ''}
                                ${activity.state ? `<div class="activity-artist">${activity.state}</div>` : ''}
                            `;
                        }
                    }
                    // Custom Status (type: 4)
                    else if (activity.type === 4) {
                        activityCard.innerHTML = `
                            <div class="activity-header">
                                <div class="activity-icon">
                                    <i class="fas fa-comment"></i>
                                </div>
                                <div class="activity-type">CUSTOM STATUS</div>
                            </div>
                            <div class="activity-title">${activity.state || 'Brak statusu'}</div>
                        `;
                    }
                    
                    activitiesContainer.appendChild(activityCard);
                });
            } else {
                activitiesContainer.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Brak aktywności</div>';
            }
        }
        
    } catch (error) {
        console.error('Error fetching Discord profile:', error);
        loadFallbackProfile();
    }
}

// Fallback - podstawowe informacje bez Lanyard
function loadFallbackProfile() {
    const avatar = document.getElementById('discord-avatar');
    const usernameEl = document.getElementById('discord-username');
    const statusTextEl = document.getElementById('discord-status-text');
    const statusEl = document.getElementById('discord-status');
    const activitiesContainer = document.getElementById('discord-activities');
    
    // Avatar - użyj domyślnego lub spróbuj pobrać z Discord CDN
    if (avatar) {
        // Spróbuj pobrać avatar z Discord CDN (może nie działać bez pełnego ID)
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
        statusTextEl.textContent = 'Offline (Lanyard nieaktywny)';
    }
    
    // Aktywności - komunikat
    if (activitiesContainer) {
        activitiesContainer.innerHTML = `
            <div style="text-align: center; color: #888; padding: 20px; background: rgba(10, 10, 10, 0.4); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <p style="margin-bottom: 8px; color: #aaa; font-size: 13px;">Aby zobaczyć status i aktywności</p>
                <p style="font-size: 11px; color: #666; margin-bottom: 12px;">dołącz do serwera Lanyard Discord</p>
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
    
    // Zatrzymaj poprzedni interval jeśli istnieje
    if (spotifyUpdateInterval) {
        clearInterval(spotifyUpdateInterval);
        spotifyUpdateInterval = null;
    }
    
    // Aktualizuj co sekundę
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
        
        // Jeśli utwór się skończył, zatrzymaj aktualizację
        if (now >= end) {
            if (spotifyUpdateInterval) {
                clearInterval(spotifyUpdateInterval);
                spotifyUpdateInterval = null;
            }
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', function() {
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
        }
    });

    loadContactCooldown();
    cursorsys.init();
    initNameChanger();
    initMusicPlayer();
    checkIfReadyToWakeup();
    applySettings();

    // Fetch Discord profile
    fetchDiscordProfile();
    // Update every 30 seconds
    setInterval(fetchDiscordProfile, 30000);

    // Dekoduj email
    const emailElement = document.getElementById('email');
    if (emailElement) {
        emailElement.textContent = atob(emailElement.textContent);
    }

    // Ustaw href dla linku emailowego
    const emailLink = document.querySelector('a[href="#"]');
    if (emailLink && emailElement) {
        const decodedEmail = emailElement.textContent;
        emailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${decodedEmail}`;
    }

    const muteToggle = document.getElementById('setting-mute');
    const volumeRange = document.getElementById('setting-volume');
    const cursorToggle = document.getElementById('setting-cursor');
    const confirmToggle = document.getElementById('setting-confirm-redirects');
    const reduceMotionToggle = document.getElementById('setting-reduce-motion');
    const highContrastToggle = document.getElementById('setting-high-contrast');
    const largeTextToggle = document.getElementById('setting-large-text');
    const focusToggle = document.getElementById('setting-focus-outlines');

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

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        if (link.classList.contains('track-item')) return;

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
