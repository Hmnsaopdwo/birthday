// --- APPLICATION STATE ---
let isUnlocked = false;
let isPlaying = false;
let audioContext = null;
let isWebAudioPlaying = false;
let currentGainNode = null;

// --- PASSWORD GATE LOGIC ---
const passwordGate = document.getElementById('password-gate');
const mainContent = document.getElementById('main-content');
const lockForm = document.getElementById('lock-form');
const pinInput = document.getElementById('pin-input');
const hintToggle = document.getElementById('hint-toggle');
const hintPopup = document.getElementById('hint-popup');

hintToggle.addEventListener('click', () => {
    hintPopup.classList.toggle('hidden');
});

pinInput.addEventListener('input', () => {
    pinInput.classList.remove('error', 'shake');
});

lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = pinInput.value;
    
    if (pin === '170222') {
        isUnlocked = true;
        passwordGate.classList.add('fade-out');
        
        setTimeout(() => {
            passwordGate.classList.add('hidden');
            mainContent.classList.remove('hidden');
            handleScrollReveal();
            showMusicNotification();
            initHeroSlider(); // ← start slider after unlock
        }, 500);
    } else {
        pinInput.classList.remove('shake');
        void pinInput.offsetWidth;
        pinInput.classList.add('error', 'shake');
        pinInput.value = '';
    }
});

// --- MUSIC NOTIFICATION ---
function showMusicNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #E50914;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 9999;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(229,9,20,0.3);
        cursor: pointer;
    `;
    notification.innerHTML = '🎵 Klik di mana saja untuk memutar lagu Happy Birthday!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// --- AUDIO CONTROL ---
const musicToggleBtn = document.getElementById('music-toggle');
const musicIcon = musicToggleBtn.querySelector('i');

function initAudioContext() {
    if (audioContext) return audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported:', e);
    }
    return audioContext;
}

function playHappyBirthday() {
    if (!audioContext) audioContext = initAudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    
    const notes = [
        { freq: 392, duration: 0.4 }, { freq: 392, duration: 0.4 },
        { freq: 440, duration: 0.8 }, { freq: 392, duration: 0.8 },
        { freq: 523, duration: 0.8 }, { freq: 494, duration: 1.2 },
        { freq: 392, duration: 0.4 }, { freq: 392, duration: 0.4 },
        { freq: 440, duration: 0.8 }, { freq: 392, duration: 0.8 },
        { freq: 587, duration: 0.8 }, { freq: 523, duration: 1.2 },
        { freq: 392, duration: 0.4 }, { freq: 392, duration: 0.4 },
        { freq: 784, duration: 0.8 }, { freq: 659, duration: 0.8 },
        { freq: 523, duration: 0.8 }, { freq: 494, duration: 0.8 },
        { freq: 440, duration: 1.2 }, { freq: 698, duration: 0.4 },
        { freq: 698, duration: 0.4 }, { freq: 659, duration: 0.8 },
        { freq: 523, duration: 0.8 }, { freq: 587, duration: 0.8 },
        { freq: 523, duration: 1.2 }
    ];
    
    const now = audioContext.currentTime;
    let time = 0;
    
    if (currentGainNode) currentGainNode.disconnect();
    currentGainNode = audioContext.createGain();
    currentGainNode.gain.value = 0.3;
    currentGainNode.connect(audioContext.destination);
    
    notes.forEach((note, index) => {
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        osc.type = index % 3 === 0 ? 'triangle' : 'sine';
        osc.frequency.value = note.freq;
        
        noteGain.gain.setValueAtTime(0.3, now + time);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + time + note.duration);
        
        osc.connect(noteGain);
        noteGain.connect(currentGainNode);
        osc.start(now + time);
        osc.stop(now + time + note.duration);
        time += note.duration;
    });
    
    setTimeout(() => {
        if (isPlaying) playHappyBirthday();
    }, time * 1000 + 500);
}

function toggleMusic() {
    if (!audioContext) audioContext = initAudioContext();
    
    if (isPlaying) {
        if (currentGainNode) currentGainNode.gain.value = 0;
        musicIcon.classList.remove('fa-volume-up');
        musicIcon.classList.add('fa-volume-mute');
        isPlaying = false;
    } else {
        if (audioContext.state === 'suspended') audioContext.resume();
        if (currentGainNode) currentGainNode.gain.value = 0.3;
        playHappyBirthday();
        musicIcon.classList.remove('fa-volume-mute');
        musicIcon.classList.add('fa-volume-up');
        isPlaying = true;
    }
}

musicToggleBtn.addEventListener('click', toggleMusic);

document.addEventListener('click', function initAudioOnFirstClick() {
    if (isUnlocked && !isPlaying) {
        setTimeout(() => toggleMusic(), 500);
    }
}, { once: true });

const contentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'main-content' && !mutation.target.classList.contains('hidden')) {
            setTimeout(() => {
                if (!isPlaying && isUnlocked) document.body.click();
            }, 1000);
        }
    });
});

const mainContentElement = document.getElementById('main-content');
if (mainContentElement) {
    contentObserver.observe(mainContentElement, { attributes: true, attributeFilter: ['class'] });
}

// ============================================================
// HERO SLIDER LOGIC
// ============================================================
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const bar     = document.getElementById('heroProgressBar');

    if (!slides.length) return;

    let current  = 0;
    let progress = 0;
    let ticker   = null;
    const DURATION = 6000; // ms per slide
    const TICK     = 60;   // ms interval

    function goTo(n) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
        resetProgress();
    }

    function resetProgress() {
        progress = 0;
        bar.style.width = '0%';
        clearInterval(ticker);
        startTicker();
    }

    function startTicker() {
        ticker = setInterval(() => {
            progress += (TICK / DURATION) * 100;
            bar.style.width = Math.min(progress, 100) + '%';
            if (progress >= 100) goTo(current + 1);
        }, TICK);
    }

    // Arrow buttons
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Dot indicators
    dots.forEach(dot => {
        dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
    });

    // Pause on hover, resume on leave
    const heroSection = document.getElementById('hero');
    heroSection.addEventListener('mouseenter', () => clearInterval(ticker));
    heroSection.addEventListener('mouseleave', () => startTicker());

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Touch swipe support
    let touchStartX = 0;
    heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    heroSection.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    startTicker();
}
// ============================================================
// END HERO SLIDER LOGIC
// ============================================================

// --- NAVBAR SCROLL (no parallax, slider handles bg) ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (!isUnlocked) return;
    const scrollY = window.scrollY;
    
    if (scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    
});

// --- SCROLL REVEAL ---
function handleScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.2 });
    
    reveals.forEach(el => observer.observe(el));
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('active');
}

// --- MEMORY SLIDER CONTROLS ---
const slider = document.querySelector('.slider');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', () => slider.scrollBy({ left: -300, behavior: 'smooth' }));
    rightArrow.addEventListener('click', () => slider.scrollBy({ left: 300, behavior: 'smooth' }));
}

let isDown = false, startX, scrollLeft;
if (slider) {
    slider.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseleave', () => { isDown = false; });
    slider.addEventListener('mouseup', () => { isDown = false; });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeft - (x - startX) * 2;
    });
}

// --- 3D INTERACTIVE OBJECT ---
function init3D() {
    const container = document.getElementById('three-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (container.clientWidth === 0 || container.clientHeight === 0) {
        setTimeout(init3D, 200);
        return;
    }
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    const geometry = new THREE.IcosahedronGeometry(1.8, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0xE50914, metalness: 0.6, roughness: 0.2,
        emissive: new THREE.Color(0x330000), emissiveIntensity: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700, metalness: 0.8, roughness: 0.1,
        emissive: new THREE.Color(0x442200), emissiveIntensity: 0.3
    });
    
    [[1.5,1.5,0.5],[-1.5,1.5,-0.5],[0.5,1.5,1.5],[-0.5,1.5,-1.5],[1.2,1.2,1.2]].forEach(pos => {
        const s = new THREE.Mesh(sphereGeo, sphereMat);
        s.position.set(...pos);
        scene.add(s);
    });
    
    scene.add(new THREE.AmbientLight(0x404040));
    const d1 = new THREE.DirectionalLight(0xffffff, 1); d1.position.set(1,2,1); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xff6666, 0.8); d2.position.set(-1,1,-1); scene.add(d2);
    const p1 = new THREE.PointLight(0xff0000, 1, 10); p1.position.set(2,2,2); scene.add(p1);
    
    camera.position.z = 5;
    camera.position.y = 0.5;
    
    let isDragging = false;
    let prev = { x: 0, y: 0 };
    
    renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            mesh.rotation.y += (e.offsetX - prev.x) * 0.01;
            mesh.rotation.x += (e.offsetY - prev.y) * 0.01;
        }
        prev = { x: e.offsetX, y: e.offsetY };
    });
    document.addEventListener('mouseup', () => isDragging = false);
    
    renderer.domElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        const r = renderer.domElement.getBoundingClientRect();
        prev = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    }, { passive: true });
    
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const r = renderer.domElement.getBoundingClientRect();
        const cx = e.touches[0].clientX - r.left;
        const cy = e.touches[0].clientY - r.top;
        mesh.rotation.y += (cx - prev.x) * 0.01;
        mesh.rotation.x += (cy - prev.y) * 0.01;
        prev = { x: cx, y: cy };
    }, { passive: false });
    
    document.addEventListener('touchend', () => isDragging = false);
    
    (function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) { mesh.rotation.y += 0.003; mesh.rotation.x += 0.001; }
        renderer.render(scene, camera);
    })();
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
setTimeout(init3D, 2000);

// --- MESSAGE MODAL ---
const openBtn = document.getElementById('open-envelope-btn');
const modal = document.getElementById('message-modal');
const closeBtn = document.querySelector('.close-btn');

if (openBtn && modal && closeBtn) {
    const pesanVideo = document.getElementById('pesan-video');

    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (pesanVideo) pesanVideo.play();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (pesanVideo) { pesanVideo.pause(); pesanVideo.currentTime = 0; }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            if (pesanVideo) { pesanVideo.pause(); pesanVideo.currentTime = 0; }
        }
    });
}
// --- PLAYLIST GENERATOR ---
const playlists = {
    happy:     { title: "🎉 Happy Birthday Playlist", songs: ["Happy Birthday - Traditional","Dance The Night - Dua Lipa","Happy - Pharrell Williams","Uptown Funk - Bruno Mars","Can't Stop the Feeling - Justin Timberlake"] },
    chill:     { title: "🌸 Chill Birthday Vibes",    songs: ["Happy Birthday (Acoustic Version)","Snooze - SZA","Golden Hour - JVKE","Perfect - Ed Sheeran","Lover - Taylor Swift"] },
    energetic: { title: "⚡ Party Mode Activated",    songs: ["Happy Birthday (Remix)","Speed Drive - Charli XCX","Blinding Lights - The Weeknd","Levitating - Dua Lipa","Don't Start Now - Dua Lipa"] }
};

document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const data = playlists[btn.getAttribute('data-mood')];
        document.getElementById('playlist-title').textContent = data.title;
        const list = document.getElementById('playlist-list');
        list.innerHTML = '';
        data.songs.forEach((song, i) => {
            const li = document.createElement('li');
            li.textContent = song;
            li.style.animation = `fadeIn 0.3s ease ${i * 0.1}s both`;
            list.appendChild(li);
        });
        document.getElementById('playlist-result').classList.remove('hidden');
    });
});

// --- BIRTHDAY WISH CANVAS ---
const wishForm = document.getElementById('wish-form');
const wishFooter = document.getElementById('wish-footer');

if (wishForm && wishFooter) {
    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('wish-name').value;
        const text = document.getElementById('wish-text').value;
        if (name && text) { createSticker(name, text); wishForm.reset(); }
    });

    function createSticker(name, text) {
        const sticker = document.createElement('div');
        sticker.classList.add('sticker');
        const maxW = Math.max(10, wishFooter.clientWidth - 260);
        const maxH = Math.max(10, wishFooter.clientHeight - 120);
        sticker.style.left = `${Math.min(maxW - 20, Math.max(10, Math.random() * maxW))}px`;
        sticker.style.top  = `${Math.min(maxH - 20, Math.max(10, Math.random() * maxH))}px`;
        sticker.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
        sticker.innerHTML = `<div class="sticker-name">${name}</div><div class="sticker-text">${text}</div>`;
        
        let dragging = false, offset = { x: 0, y: 0 };
        sticker.addEventListener('mousedown', (e) => {
            dragging = true;
            offset = { x: sticker.offsetLeft - e.clientX, y: sticker.offsetTop - e.clientY };
            sticker.style.zIndex = '1000'; sticker.style.cursor = 'grabbing'; e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const maxX = wishFooter.clientWidth - sticker.offsetWidth;
            const maxY = wishFooter.clientHeight - sticker.offsetHeight;
            sticker.style.left = Math.min(maxX, Math.max(0, e.clientX + offset.x)) + 'px';
            sticker.style.top  = Math.min(maxY, Math.max(0, e.clientY + offset.y)) + 'px';
        });
        document.addEventListener('mouseup', () => { if (dragging) { dragging = false; sticker.style.zIndex = ''; sticker.style.cursor = 'grab'; } });
        
        sticker.addEventListener('touchstart', (e) => {
            dragging = true;
            const t = e.touches[0];
            offset = { x: sticker.offsetLeft - t.clientX, y: sticker.offsetTop - t.clientY };
            sticker.style.zIndex = '1000'; e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (!dragging) return; e.preventDefault();
            const t = e.touches[0];
            const maxX = wishFooter.clientWidth - sticker.offsetWidth;
            const maxY = wishFooter.clientHeight - sticker.offsetHeight;
            sticker.style.left = Math.min(maxX, Math.max(0, t.clientX + offset.x)) + 'px';
            sticker.style.top  = Math.min(maxY, Math.max(0, t.clientY + offset.y)) + 'px';
        }, { passive: false });
        document.addEventListener('touchend', () => { dragging = false; sticker.style.zIndex = ''; });
        
        wishFooter.appendChild(sticker);
    }

    setTimeout(() => {
        createSticker("Tristan", "Selamat ulang tahun Astin! Semoga tahun ini sekeren film blockbuster favoritmu! 🎬");
        setTimeout(() => createSticker("Netflix", "Recommended for you: Happy Birthday Astin! 🎂"), 500);
    }, 1500);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

window.addEventListener('beforeunload', () => { if (audioContext) audioContext.close(); });

console.log('✅ CANTIKAFLIX JavaScript loaded successfully!');

// ========== GALERI KENANGAN ==========
function scrollHorizontal(rowId, direction) {
    let trackClip = document.getElementById(`clip${rowId.slice(-1)}`);
    if (!trackClip) return;
    
    const firstCard = document.querySelector(`#${rowId} .grid-card`);
    if (!firstCard) return;
    
    const scrollAmount = (firstCard.offsetWidth + 4) * 3.5;
    let newScroll = trackClip.scrollLeft + (direction === 1 ? scrollAmount : -scrollAmount);
    const maxScroll = trackClip.scrollWidth - trackClip.clientWidth;
    newScroll = Math.max(0, Math.min(newScroll, maxScroll));
    
    trackClip.scrollTo({ left: newScroll, behavior: 'smooth' });
}

function initGalleryWheel() {
    document.querySelectorAll('.row-track-clip').forEach(clip => {
        clip.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > 0) {
                e.preventDefault();
                clip.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    });
}

// Jalankan setelah DOM siap
if (document.querySelector('.galeri-section')) {
    initGalleryWheel();
    document.querySelectorAll('.grid-card').forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(1.23)';
            setTimeout(() => card.style.transform = '', 150);
        });
    });
}