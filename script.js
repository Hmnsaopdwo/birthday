// --- APPLICATION STATE ---
let isUnlocked = false;
let isPlaying = false;
let audioContext = null;
let isWebAudioPlaying = false;
let currentGainNode = null;

// --- PASSWORD GATE LOGIC (PIN Box Style) ---
const passwordGate = document.getElementById('password-gate');
const mainContent = document.getElementById('main-content');
const hintToggle = document.getElementById('hint-toggle');
const hintPopup = document.getElementById('hint-popup');

// Ambil semua kotak PIN
const pinBoxes = [document.getElementById('pin-1'), document.getElementById('pin-2'), document.getElementById('pin-3'), document.getElementById('pin-4'), document.getElementById('pin-5'), document.getElementById('pin-6')];

const correctPin = '170222';

hintToggle.addEventListener('click', () => {
    hintPopup.classList.toggle('hidden');
});

// Fungsi untuk mendapatkan nilai PIN dari semua kotak
function getPinValue() {
    let pin = '';
    pinBoxes.forEach(box => {
        pin += box.value;
    });
    return pin;
}

// Fungsi untuk clear semua kotak
function clearPinBoxes() {
    pinBoxes.forEach(box => {
        box.value = '';
    });
    pinBoxes[0].focus();
}

// Fungsi untuk menghapus class error dari semua kotak
function removeErrorClass() {
    pinBoxes.forEach(box => {
        box.classList.remove('error');
    });
}

// Auto focus ke kotak berikutnya saat diisi
pinBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        // Hanya angka yang diperbolehkan
        box.value = box.value.replace(/[^0-9]/g, '');
        
        if (box.value.length === 1 && index < 5) {
            pinBoxes[index + 1].focus();
        }
        
        removeErrorClass();
    });
    
    // Handle backspace untuk pindah ke kotak sebelumnya
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && box.value === '' && index > 0) {
            pinBoxes[index - 1].focus();
        }
    });
    
    // Hapus error saat mulai mengetik
    box.addEventListener('focus', () => {
        removeErrorClass();
    });
});

// Submit PIN ketika semua kotak terisi
// Submit PIN ketika semua kotak terisi - VERSION 2 (SEDERHANA)
function checkPinAndSubmit() {
    const pin = getPinValue();
    if (pin.length === 6) {
        if (pin === correctPin) {
            // PIN benar
            isUnlocked = true;
            passwordGate.classList.add('fade-out');
            
            setTimeout(() => {
                passwordGate.classList.add('hidden');
                mainContent.classList.remove('hidden');
                handleScrollReveal();
                showMusicNotification();
                initHeroSlider();
                
                setTimeout(() => {
                    if (!isPlaying) {
                        toggleMusic();
                        console.log('🎵 Happy Birthday otomatis diputar!');
                    }
                }, 800);
            }, 500);
        } else {
            // PIN salah
            pinBoxes.forEach(b => b.classList.add('error'));
            setTimeout(() => {
                clearPinBoxes();
                pinBoxes.forEach(b => b.classList.remove('error'));
            }, 300);
            
            // Efek shake
            const container = document.querySelector('.pin-container');
            if (container) {
                container.style.animation = 'shake 0.3s ease-in-out';
                setTimeout(() => {
                    container.style.animation = '';
                }, 300);
            }
        }
    }
}

// Hapus semua event listener lama dengan clone & replace
pinBoxes.forEach((box, index) => {
    const newBox = box.cloneNode(true);
    box.parentNode.replaceChild(newBox, box);
    pinBoxes[index] = newBox;
});

// Refresh pinBoxes array
const freshPinBoxes = [
    document.getElementById('pin-1'),
    document.getElementById('pin-2'),
    document.getElementById('pin-3'),
    document.getElementById('pin-4'),
    document.getElementById('pin-5'),
    document.getElementById('pin-6')
];

// Kosongkan array lalu isi ulang
pinBoxes.length = 0;
freshPinBoxes.forEach(b => pinBoxes.push(b));

// Tambah event listener baru
pinBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        // Hanya angka
        box.value = box.value.replace(/[^0-9]/g, '');
        
        // Auto pindah ke kotak berikutnya
        if (box.value.length === 1 && index < 5) {
            pinBoxes[index + 1].focus();
        }
        
        // Cek PIN
        checkPinAndSubmit();
    });
    
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && box.value === '' && index > 0) {
            pinBoxes[index - 1].focus();
        }
    });
    
    box.addEventListener('focus', () => {
        box.select();
    });
});

// Fokus ke kotak pertama
if (pinBoxes[0]) pinBoxes[0].focus();
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
    
    // 🔥 GANTI DENGAN FILE AUDIO KAMU SENDIRI 🔥
    // Ganti 'images/birthday.mp3' dengan nama file audio kamu
    fetch('images/birthday.mp3')
        .then(response => {
            if (!response.ok) {
                throw new Error('File audio tidak ditemukan: ' + response.status);
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            // Putar audio
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            
            if (currentGainNode) currentGainNode.disconnect();
            currentGainNode = audioContext.createGain();
            currentGainNode.gain.value = 0.7; // Volume 70%
            currentGainNode.connect(audioContext.destination);
            
            source.connect(currentGainNode);
            source.start();
            
            // Loop audio ketika selesai
            source.onended = () => {
                if (isPlaying) {
                    playHappyBirthday();
                }
            };
        })
        .catch(error => {
            console.error('Gagal memuat audio:', error);
            // Fallback ke nada synth jika file tidak ditemukan
            playSynthFallback();
        });
}

// Fallback jika file audio tidak ditemukan (nada synth)
function playSynthFallback() {
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
    currentGainNode.gain.value = 0.7;
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
        if (currentGainNode) currentGainNode.gain.value = 0.7;
        playHappyBirthday();
        musicIcon.classList.remove('fa-volume-mute');
        musicIcon.classList.add('fa-volume-up');
        isPlaying = true;
    }
}

// Musik langsung menyala setelah unlock (tanpa perlu klik)
function startMusicAutomatically() {
    if (isUnlocked && !isPlaying) {
        setTimeout(() => {
            toggleMusic();
            console.log('🎵 Musik otomatis diputar');
        }, 500);
    }
}

// Panggil fungsi ini setelah unlock
// Dan juga untuk pertama kali setelah halaman siap
document.addEventListener('click', function initAudioOnFirstClick() {
    if (isUnlocked && !isPlaying) {
        startMusicAutomatically();
    }
}, { once: true });

// Untuk memastikan musik jalan setelah unlock tanpa perlu klik
// Override: setelah PIN benar, langsung putar musik

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

// --- VIDEO MODAL WITH MUSIC CONTROL (Google Drive Version - FIXED) ---
const openBtn = document.getElementById('open-envelope-btn');
const modal = document.getElementById('message-modal');
const closeBtn = document.querySelector('.close-btn');
const modalVideoPlaceholder = document.querySelector('.modal-video-placeholder');
let wasMusicPlaying = false;
let currentIframe = null;

// Fungsi untuk membuat iframe baru
function createIframe() {
    const iframe = document.createElement('iframe');
    iframe.id = 'pesan-video';
    iframe.src = 'https://drive.google.com/file/d/1ZyNFlFvdfks26XgzKD8S4zfHsrrsSdo4/preview';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.allow = 'autoplay; fullscreen';
    iframe.allowfullscreen = true;
    iframe.frameborder = '0';
    return iframe;
}

// Fungsi untuk memuat iframe
function loadIframe() {
    if (currentIframe) {
        currentIframe.remove();
    }
    currentIframe = createIframe();
    modalVideoPlaceholder.appendChild(currentIframe);
}

// Fungsi untuk menghapus iframe (menghentikan video)
function unloadIframe() {
    if (currentIframe) {
        currentIframe.remove();
        currentIframe = null;
    }
}

openBtn.addEventListener('click', () => {
    // 1. Matikan musik jika sedang diputar
    if (isPlaying) {
        wasMusicPlaying = true;
        toggleMusic();
    } else {
        wasMusicPlaying = false;
    }
    
    // 2. Muat iframe baru
    loadIframe();
    
    // 3. Tampilkan modal
    modal.classList.remove('hidden');
    
    console.log('Modal opened, video loaded');
});

// Fungsi untuk membersihkan modal dan mengembalikan musik
function closeModalAndResumeMusic() {
    // 1. Hapus iframe (menghentikan video)
    unloadIframe();
    
    // 2. Tutup modal
    modal.classList.add('hidden');
    
    // 3. Nyalakan musik kembali jika sebelumnya menyala
    if (wasMusicPlaying && !isPlaying) {
        toggleMusic();
    }
}

// Close button manual
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        closeModalAndResumeMusic();
    });
}

// Klik di luar modal
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalAndResumeMusic();
    }
});

// --- BIRTHDAY WISH CANVAS (Firebase Realtime) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjydD48629p8p8eVdb_tcweF0ssCsW9tOo",
    authDomain: "birthday-778e4.firebaseapp.com",
    projectId: "birthday-778e4",
    storageBucket: "birthday-778e4.firebasestorage.app",
    messagingSenderId: "515329548701",
    appId: "1:515329548701:web:29008fa617f836a32c8f74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const wishForm = document.getElementById('wish-form');
const wishFooter = document.getElementById('wish-footer');
const renderedIds = new Set(); // hindari duplikat

// Kirim ucapan ke Firestore
if (wishForm) {
    wishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('wish-name').value.trim();
        const text = document.getElementById('wish-text').value.trim();
        if (!name || !text) return;

        try {
            await addDoc(collection(db, 'wishes'), {
                name,
                text,
                createdAt: serverTimestamp()
            });
            wishForm.reset();
        } catch (err) {
            console.error('Gagal kirim:', err);
        }
    });
}

// Dengarkan perubahan realtime dari Firestore
if (wishFooter) {
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'asc'));

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const doc = change.doc;
                if (renderedIds.has(doc.id)) return;
                renderedIds.add(doc.id);
                const { name, text } = doc.data();
                createSticker(name, text);
            }
        });
    });
}

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
    document.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; sticker.style.zIndex = ''; sticker.style.cursor = 'grab'; }
    });

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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

window.addEventListener('beforeunload', () => { if (audioContext) audioContext.close(); });

console.log('✅ NDUTFLIX JavaScript loaded successfully!');

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

// ========== VIDEO CARD CONVERTER ==========
function convertVideoCards() {
    // Untuk memory slider
    const memorySlider = document.getElementById('memory-slider');
    if (memorySlider) {
        const cards = memorySlider.querySelectorAll('.card');
        cards.forEach(card => convertCardMedia(card));
    }
    
    // Jika ada galeri lain yang butuh konversi
    const allCards = document.querySelectorAll('.grid-card');
    allCards.forEach(card => convertCardMedia(card));
}

function convertCardMedia(card) {
    const mediaElement = card.querySelector('img');
    if (!mediaElement) return;
    
    const src = mediaElement.getAttribute('src');
    if (!src) return;
    
    // Cek apakah file video
    if (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov')) {
        // Buat elemen video
        const video = document.createElement('video');
        video.src = src;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        
        // Copy atribut penting
        if (mediaElement.alt) {
            video.alt = mediaElement.alt;
        }
        if (mediaElement.className) {
            video.className = mediaElement.className;
        }
        
        // Tambahkan poster fallback (opsional)
        const posterSrc = src.replace(/\.(mp4|webm|mov)$/, '.jpg');
        video.poster = posterSrc;
        
        // Ganti img dengan video
        mediaElement.replaceWith(video);
        
        // Handle error
        video.onerror = () => {
            console.warn(`Video gagal dimuat: ${src}`);
            // Fallback ke placeholder
            const img = document.createElement('img');
            img.src = posterSrc;
            img.alt = video.alt || 'Video tidak tersedia';
            video.replaceWith(img);
        };
    }
}

// Panggil saat halaman load
document.addEventListener('DOMContentLoaded', () => {
    convertVideoCards();
    console.log('✅ Video converter initialized');
});

// Juga panggil jika ada konten dinamis yang dimuat
window.convertVideoCards = convertVideoCards;

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

// --- ✨ NEW: PHOTO FILTER FEATURE (pengganti playlist) ✨ ---
const filterBtns = document.querySelectorAll('.filter-btn');
const previewImg = document.getElementById('previewImage');
const filterEffectDesc = document.getElementById('filterEffectDesc');
let currentFilter = 'original';
let currentImageSrc = 'images/tin14.jpg';

function applyFilter(filterType) {
    if (!previewImg) return;
    switch(filterType) {
        case 'vintage':
            previewImg.style.filter = 'sepia(0.6) contrast(1.1) brightness(0.95) saturate(1.2)';
            if (filterEffectDesc) filterEffectDesc.innerHTML = '📻 Vintage retro - nuansa klasik yang hangat';
            break;
        case 'warm':
            previewImg.style.filter = 'brightness(1.05) contrast(1.1) sepia(0.2) saturate(1.3) hue-rotate(-10deg)';
            if (filterEffectDesc) filterEffectDesc.innerHTML = '🔥 Warm glow - seperti cahaya matahari sore';
            break;
        case 'cool':
            previewImg.style.filter = 'brightness(0.98) contrast(1.05) saturate(1.1) hue-rotate(10deg)';
            if (filterEffectDesc) filterEffectDesc.innerHTML = '❄️ Cool breeze - nuansa segar dan modern';
            break;
        case 'dramatic':
            previewImg.style.filter = 'contrast(1.4) brightness(0.9) saturate(1.5) grayscale(0.2)';
            if (filterEffectDesc) filterEffectDesc.innerHTML = '🎬 Dramatic cinematic - gaya film blockbuster';
            break;
        default:
            previewImg.style.filter = 'none';
            if (filterEffectDesc) filterEffectDesc.innerHTML = '🌈 Original - kenangan polos apa adanya ✨';
    }
}

if (filterBtns.length) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            applyFilter(currentFilter);
        });
    });
}

const downloadBtn = document.getElementById('downloadFilterBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const img = previewImg;
        if (!img || !img.complete) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 450;
        
        ctx.filter = window.getComputedStyle(img).filter;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = `kenangan_${currentFilter}_astin.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function bindGalleryToFilter() {
    const allGalleryImages = document.querySelectorAll('.grid-card img, .card img');
    allGalleryImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (previewImg && img.src) {
                previewImg.src = img.src;
                currentImageSrc = img.src;
                applyFilter(currentFilter);
            }
        });
    });
}

setTimeout(bindGalleryToFilter, 800);

// --- FILTER SWATCHES ---
function initFilterSwatches() {
    const swatches = document.querySelectorAll('.filter-swatch');
    if (!swatches.length) return;

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            const src = swatch.getAttribute('data-src');
            if (previewImg && src) {
                previewImg.src = src;
                currentImageSrc = src;
                applyFilter(currentFilter);
            }
        });
    });
}
setTimeout(initFilterSwatches, 900);

// --- HAMBURGER MENU ---
const hamburgerBtn = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        hamburgerBtn.querySelector('i').className = isOpen ? 'fas fa-bars' : 'fas fa-times';
    });

    // Tutup menu kalau klik link
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        });
    });

    // Tutup menu kalau klik di luar
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && e.target !== hamburgerBtn) {
            mobileMenu.classList.add('hidden');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
}