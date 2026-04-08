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

// Hint interaction
hintToggle.addEventListener('click', () => {
    hintPopup.classList.toggle('hidden');
});

// Remove error class on type
pinInput.addEventListener('input', () => {
    pinInput.classList.remove('error', 'shake');
});

lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = pinInput.value;
    
    if (pin === '170222') {
        // Success
        isUnlocked = true;
        passwordGate.classList.add('fade-out');
        
        // Wait for fade out to complete before showing main content
        setTimeout(() => {
            passwordGate.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Re-trigger scroll observer and parallax after unlocking
            handleScrollReveal();
            
            // Show notification bahwa musik siap
            showMusicNotification();
            
        }, 500);
    } else {
        // Error
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

// Add CSS animations
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

// --- AUDIO CONTROL WITH WEB AUDIO API (HAPPY BIRTHDAY SYNTHESIZER) ---
const musicToggleBtn = document.getElementById('music-toggle');
const musicIcon = musicToggleBtn.querySelector('i');

function initAudioContext() {
    if (audioContext) return audioContext;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio Context initialized');
    } catch (e) {
        console.log('Web Audio API not supported:', e);
    }
    return audioContext;
}

function playHappyBirthday() {
    if (!audioContext) {
        audioContext = initAudioContext();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Happy Birthday melody notes (frequencies in Hz)
    const notes = [
        // Happy birthday to you
        { freq: 392, duration: 0.4 }, // G
        { freq: 392, duration: 0.4 }, // G
        { freq: 440, duration: 0.8 }, // A
        { freq: 392, duration: 0.8 }, // G
        { freq: 523, duration: 0.8 }, // C
        { freq: 494, duration: 1.2 }, // B
        
        // Happy birthday to you
        { freq: 392, duration: 0.4 }, // G
        { freq: 392, duration: 0.4 }, // G
        { freq: 440, duration: 0.8 }, // A
        { freq: 392, duration: 0.8 }, // G
        { freq: 587, duration: 0.8 }, // D
        { freq: 523, duration: 1.2 }, // C
        
        // Happy birthday dear Astin
        { freq: 392, duration: 0.4 }, // G
        { freq: 392, duration: 0.4 }, // G
        { freq: 784, duration: 0.8 }, // G (high)
        { freq: 659, duration: 0.8 }, // E
        { freq: 523, duration: 0.8 }, // C
        { freq: 494, duration: 0.8 }, // B
        { freq: 440, duration: 1.2 }, // A
        
        // Happy birthday to you
        { freq: 698, duration: 0.4 }, // F
        { freq: 698, duration: 0.4 }, // F
        { freq: 659, duration: 0.8 }, // E
        { freq: 523, duration: 0.8 }, // C
        { freq: 587, duration: 0.8 }, // D
        { freq: 523, duration: 1.2 }  // C
    ];
    
    const now = audioContext.currentTime;
    let time = 0;
    
    // Create a gain node for volume control
    if (currentGainNode) {
        currentGainNode.disconnect();
    }
    
    currentGainNode = audioContext.createGain();
    currentGainNode.gain.value = 0.3; // Volume 30%
    currentGainNode.connect(audioContext.destination);
    
    // Schedule all notes
    notes.forEach((note, index) => {
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        osc.type = 'sine'; // Pure tone for birthday feel
        osc.frequency.value = note.freq;
        
        // Add slight variation for more natural sound
        if (index % 3 === 0) osc.type = 'triangle';
        if (index % 5 === 0) osc.type = 'sine';
        
        noteGain.gain.setValueAtTime(0.3, now + time);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + time + note.duration);
        
        osc.connect(noteGain);
        noteGain.connect(currentGainNode);
        
        osc.start(now + time);
        osc.stop(now + time + note.duration);
        
        time += note.duration;
    });
    
    // Schedule next repetition
    setTimeout(() => {
        if (isPlaying) {
            playHappyBirthday();
        }
    }, time * 1000 + 500); // Repeat after song ends + 500ms pause
    
    console.log('Happy Birthday playing...');
}

function toggleMusic() {
    if (!audioContext) {
        audioContext = initAudioContext();
    }
    
    if (isPlaying) {
        // Stop music
        if (currentGainNode) {
            currentGainNode.gain.value = 0;
        }
        musicIcon.classList.remove('fa-volume-up');
        musicIcon.classList.add('fa-volume-mute');
        isPlaying = false;
        console.log('Music stopped');
    } else {
        // Start music
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Reset gain
        if (currentGainNode) {
            currentGainNode.gain.value = 0.3;
        }
        
        playHappyBirthday();
        musicIcon.classList.remove('fa-volume-mute');
        musicIcon.classList.add('fa-volume-up');
        isPlaying = true;
        console.log('Music started');
    }
}

musicToggleBtn.addEventListener('click', toggleMusic);

// Auto-play attempt after user interaction
document.addEventListener('click', function initAudioOnFirstClick() {
    if (isUnlocked && !isPlaying) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
            toggleMusic();
        }, 500);
    }
}, { once: true });

// Also try to play when main content appears
const contentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'main-content' && 
            !mutation.target.classList.contains('hidden')) {
            // Auto-trigger music after 1 second
            setTimeout(() => {
                if (!isPlaying && isUnlocked) {
                    // Simulate click to start music
                    document.body.click();
                }
            }, 1000);
        }
    });
});

// Start observing if main-content exists
const mainContentElement = document.getElementById('main-content');
if (mainContentElement) {
    contentObserver.observe(mainContentElement, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// --- NAVBAR SCROLL & PARALLAX ---
const navbar = document.getElementById('navbar');
const heroBg = document.getElementById('hero-parallax-bg');
const scrollFish = document.getElementById('scroll-fish');

window.addEventListener('scroll', () => {
    if (!isUnlocked) return;
    
    const scrollY = window.scrollY;
    
    // Navbar background
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Parallax logic
    if (heroBg && scrollY < window.innerHeight) {
        const yOffset = scrollY * 0.5;
        const scale = 1 + (scrollY * 0.0001);
        const clampedScale = Math.min(scale, 1.1);
        
        heroBg.style.transform = `translateY(${yOffset}px) scale(${clampedScale})`;
    }
    
    // Moving fish logic (right to left)
    if (scrollFish) {
        // Mode to the left based on scroll amount
        const offset = scrollY * 1.5; 
        scrollFish.style.transform = `translateX(-${offset}px) translateY(-50%)`;
    }
});

// --- SCROLL REVEAL (Intersection Observer) ---
function handleScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    reveals.forEach(el => observer.observe(el));
    
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('active');
}

// --- SLIDER CONTROLS ---
const slider = document.querySelector('.slider');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', () => {
        slider.scrollBy({ left: -300, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        slider.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// Enable dragging on slider
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
}

// --- 3D INTERACTIVE OBJECT (Three.js) ---
function init3D() {
    const container = document.getElementById('three-container');
    if(!container) return;
    
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
    
    // Create an Icosahedron
    const geometry = new THREE.IcosahedronGeometry(1.8, 1);
    
    // Netflix red themed material
    const material = new THREE.MeshStandardMaterial({
        color: 0xE50914,
        metalness: 0.6,
        roughness: 0.2,
        emissive: new THREE.Color(0x330000),
        emissiveIntensity: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add small spheres around for crown effect
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Gold
        metalness: 0.8,
        roughness: 0.1,
        emissive: new THREE.Color(0x442200),
        emissiveIntensity: 0.3
    });
    
    const positions = [
        [1.5, 1.5, 0.5],
        [-1.5, 1.5, -0.5],
        [0.5, 1.5, 1.5],
        [-0.5, 1.5, -1.5],
        [1.2, 1.2, 1.2]
    ];
    
    positions.forEach(pos => {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(pos[0], pos[1], pos[2]);
        scene.add(sphere);
    });
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight1.position.set(1, 2, 1);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xff6666, 0.8);
    dirLight2.position.set(-1, 1, -1);
    scene.add(dirLight2);
    
    const pointLight = new THREE.PointLight(0xff0000, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    camera.position.z = 5;
    camera.position.y = 0.5;
    
    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    renderer.domElement.addEventListener('mousedown', (e) => { 
        isDragging = true; 
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };
            
            mesh.rotation.y += deltaMove.x * 0.01;
            mesh.rotation.x += deltaMove.y * 0.01;
        }
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
    });
    
    document.addEventListener('mouseup', () => { 
        isDragging = false; 
    });
    
    // Touch support
    renderer.domElement.addEventListener('touchstart', (e) => { 
        isDragging = true; 
        const rect = renderer.domElement.getBoundingClientRect();
        previousMousePosition = { 
            x: e.touches[0].clientX - rect.left, 
            y: e.touches[0].clientY - rect.top 
        };
    }, {passive: true});
    
    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const rect = renderer.domElement.getBoundingClientRect();
            const currentX = e.touches[0].clientX - rect.left;
            const currentY = e.touches[0].clientY - rect.top;
            
            const deltaMove = { 
                x: currentX - previousMousePosition.x, 
                y: currentY - previousMousePosition.y 
            };
            
            mesh.rotation.y += deltaMove.x * 0.01;
            mesh.rotation.x += deltaMove.y * 0.01;
            
            previousMousePosition = { x: currentX, y: currentY };
        }
    }, {passive: false});
    
    document.addEventListener('touchend', () => { 
        isDragging = false; 
    });
    
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        if(!isDragging){
            mesh.rotation.y += 0.003;
            mesh.rotation.x += 0.001;
        }
        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Initialize 3D after a delay
setTimeout(init3D, 2000);

// --- MESSAGE MODAL ---
const openBtn = document.getElementById('open-envelope-btn');
const modal = document.getElementById('message-modal');
const closeBtn = document.querySelector('.close-btn');

if (openBtn && modal && closeBtn) {
    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });
}

// --- AI PLAYLIST GENERATOR ---
const playlists = {
    happy: {
        title: "🎉 Happy Birthday Playlist",
        songs: [
            "Happy Birthday - Traditional",
            "Dance The Night - Dua Lipa",
            "Happy - Pharrell Williams",
            "Uptown Funk - Bruno Mars",
            "Can't Stop the Feeling - Justin Timberlake"
        ]
    },
    chill: {
        title: "🌸 Chill Birthday Vibes",
        songs: [
            "Happy Birthday (Acoustic Version)",
            "Snooze - SZA",
            "Golden Hour - JVKE",
            "Perfect - Ed Sheeran",
            "Lover - Taylor Swift"
        ]
    },
    energetic: {
        title: "⚡ Party Mode Activated",
        songs: [
            "Happy Birthday (Remix)",
            "Speed Drive - Charli XCX",
            "Blinding Lights - The Weeknd",
            "Levitating - Dua Lipa",
            "Don't Start Now - Dua Lipa"
        ]
    }
};

const moodBtns = document.querySelectorAll('.mood-btn');
const playlistResult = document.getElementById('playlist-result');
const playlistTitle = document.getElementById('playlist-title');
const playlistList = document.getElementById('playlist-list');

moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mood = btn.getAttribute('data-mood');
        const data = playlists[mood];
        
        playlistTitle.textContent = data.title;
        playlistList.innerHTML = '';
        
        data.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = song;
            li.style.animation = `fadeIn 0.3s ease ${index * 0.1}s both`;
            playlistList.appendChild(li);
        });
        
        playlistResult.classList.remove('hidden');
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
        
        if (name && text) {
            createSticker(name, text);
            wishForm.reset();
        }
    });

    function createSticker(name, text) {
        const sticker = document.createElement('div');
        sticker.classList.add('sticker');
        
        // Bounds for sticker positioning
        const maxW = Math.max(10, wishFooter.clientWidth - 260);
        const maxH = Math.max(10, wishFooter.clientHeight - 120);
        
        const randomX = Math.min(maxW - 20, Math.max(10, Math.random() * maxW));
        const randomY = Math.min(maxH - 20, Math.max(10, Math.random() * maxH));
        const randomRot = (Math.random() - 0.5) * 20;
        
        sticker.style.left = `${randomX}px`;
        sticker.style.top = `${randomY}px`;
        sticker.style.transform = `rotate(${randomRot}deg)`;
        
        sticker.innerHTML = `
            <div class="sticker-name">${name}</div>
            <div class="sticker-text">${text}</div>
        `;
        
        // Make stickers draggable
        let isStickerDragging = false;
        let offset = {x: 0, y: 0};
        let startX, startY;
        
        sticker.addEventListener('mousedown', (e) => {
            isStickerDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            offset = {
                x: sticker.offsetLeft - e.clientX,
                y: sticker.offsetTop - e.clientY
            };
            sticker.style.zIndex = '1000';
            sticker.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isStickerDragging) {
                const newX = e.clientX + offset.x;
                const newY = e.clientY + offset.y;
                
                // Keep within bounds
                const maxX = wishFooter.clientWidth - sticker.offsetWidth;
                const maxY = wishFooter.clientHeight - sticker.offsetHeight;
                
                sticker.style.left = Math.min(maxX, Math.max(0, newX)) + 'px';
                sticker.style.top = Math.min(maxY, Math.max(0, newY)) + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isStickerDragging) {
                isStickerDragging = false;
                sticker.style.zIndex = '';
                sticker.style.cursor = 'grab';
            }
        });
        
        // Touch support
        sticker.addEventListener('touchstart', (e) => {
            isStickerDragging = true;
            const touch = e.touches[0];
            offset = {
                x: sticker.offsetLeft - touch.clientX,
                y: sticker.offsetTop - touch.clientY
            };
            sticker.style.zIndex = '1000';
            e.preventDefault();
        }, {passive: false});
        
        document.addEventListener('touchmove', (e) => {
            if (isStickerDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                const newX = touch.clientX + offset.x;
                const newY = touch.clientY + offset.y;
                
                const maxX = wishFooter.clientWidth - sticker.offsetWidth;
                const maxY = wishFooter.clientHeight - sticker.offsetHeight;
                
                sticker.style.left = Math.min(maxX, Math.max(0, newX)) + 'px';
                sticker.style.top = Math.min(maxY, Math.max(0, newY)) + 'px';
            }
        }, {passive: false});
        
        document.addEventListener('touchend', () => {
            isStickerDragging = false;
            sticker.style.zIndex = '';
        });
        
        wishFooter.appendChild(sticker);
    }

    // Default initial stickers
    setTimeout(() => {
        if (wishFooter) {
            createSticker("Tristan", "Selamat ulang tahun Astin! Semoga tahun ini sekeren film blockbuster favoritmu! 🎬");
            setTimeout(() => {
                createSticker("Netflix", "Recommended for you: Happy Birthday Astin! 🎂");
            }, 500);
        }
    }, 1500);
}

// Add smooth scroll behavior for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- CLEANUP ON UNLOAD ---
window.addEventListener('beforeunload', () => {
    if (audioContext) {
        audioContext.close();
    }
});

console.log('✅ CANTIKAFLIX JavaScript loaded successfully!');
console.log('🎵 Happy Birthday song ready to play!');