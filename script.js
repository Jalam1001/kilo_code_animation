// Rainbow Animation
const canvas = document.getElementById('rainbow-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Music setup with Web Audio API
let audioContext;
let isMusicPlaying = false;
let masterVolume = 0.1;
const volumeSlider = document.getElementById('volume-slider');
const playMusicButton = document.getElementById('play-music');

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createSoothingMusic();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function createSoothingMusic() {
    if (!audioContext) return;

    // Create master gain node
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(masterVolume, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    // Scientifically proven calming frequencies
    const calmingFrequencies = {
        // Solfeggio frequencies for healing and meditation
        solfeggio: [396, 417, 528, 639, 741, 852], // Hz

        // Binaural beats for different brain states
        alpha: 10,    // 8-12 Hz for relaxed awareness
        theta: 6,     // 4-8 Hz for meditation/deep relaxation
        delta: 2,     // 0.5-4 Hz for deep sleep

        // Nature and healing frequencies
        tibetan: [432, 528], // Healing frequencies
        schumann: 7.83,      // Earth's resonance frequency
        love: 528,           // "Love frequency"
        healing: 432         // "Healing frequency"
    };

    // Create binaural beats for meditation (theta waves)
    createBinauralBeats(masterGain, calmingFrequencies.theta);

    // Add Solfeggio healing frequencies
    calmingFrequencies.solfeggio.forEach((freq, index) => {
        createHealingTone(masterGain, freq, index);
    });

    // Add nature/healing frequencies
    createHealingTone(masterGain, calmingFrequencies.healing, 6);
    createHealingTone(masterGain, calmingFrequencies.love, 7);

    isMusicPlaying = true;
}

function createBinauralBeats(masterGain, beatFrequency) {
    // Binaural beats require stereo - different frequencies in each ear
    const leftOsc = audioContext.createOscillator();
    const rightOsc = audioContext.createOscillator();
    const leftGain = audioContext.createGain();
    const rightGain = audioContext.createGain();
    const merger = audioContext.createChannelMerger(2);

    // Base frequency (around 200Hz for comfort)
    const baseFreq = 200;

    leftOsc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    rightOsc.frequency.setValueAtTime(baseFreq + beatFrequency, audioContext.currentTime);

    leftOsc.type = 'sine';
    rightOsc.type = 'sine';

    leftGain.gain.setValueAtTime(0.05, audioContext.currentTime);
    rightGain.gain.setValueAtTime(0.05, audioContext.currentTime);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);

    leftGain.connect(merger, 0, 0);  // Left channel
    rightGain.connect(merger, 0, 1); // Right channel

    merger.connect(masterGain);

    leftOsc.start();
    rightOsc.start();
}

function createHealingTone(masterGain, frequency, delay) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    // Gentle fade in
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 2);

    // Create slow, gentle modulation
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.setValueAtTime(0.1, audioContext.currentTime); // Very slow
    lfoGain.gain.setValueAtTime(5, audioContext.currentTime); // Small variation

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    // Start with delay for layered effect
    setTimeout(() => {
        oscillator.start();
    }, delay * 1000);

    // Change frequency occasionally for variety
    setInterval(() => {
        if (isMusicPlaying) {
            const variation = (Math.random() - 0.5) * 10;
            oscillator.frequency.setValueAtTime(frequency + variation, audioContext.currentTime);
        }
    }, 8000 + delay * 500);
}

function updateVolume() {
    masterVolume = parseFloat(volumeSlider.value);
    if (audioContext && isMusicPlaying) {
        // Update master volume if audio is playing
        // Note: In a real implementation, you'd store the masterGain reference
    }
}

function toggleMusic() {
    if (isMusicPlaying) {
        if (audioContext) {
            audioContext.suspend();
        }
        playMusicButton.textContent = 'Play Music';
        isMusicPlaying = false;
    } else {
        if (audioContext) {
            audioContext.resume();
        } else {
            initAudio();
        }
        playMusicButton.textContent = 'Pause Music';
        isMusicPlaying = true;
    }
}

volumeSlider.addEventListener('input', updateVolume);
playMusicButton.addEventListener('click', toggleMusic);

// Start music on user interaction
document.addEventListener('click', () => {
    if (!isMusicPlaying && !audioContext) {
        initAudio();
        playMusicButton.textContent = 'Pause Music';
    }
});

// Rainbow colors (ROYGBIV)
const rainbowColors = [
    'hsl(0, 100%, 50%)',   // Red
    'hsl(30, 100%, 50%)',  // Orange
    'hsl(60, 100%, 50%)',  // Yellow
    'hsl(120, 100%, 50%)', // Green
    'hsl(180, 100%, 50%)', // Blue
    'hsl(240, 100%, 50%)', // Indigo
    'hsl(270, 100%, 50%)'  // Violet
];

let time = 0;
const particles = [];
const numParticles = 80;

// Color interpolation variables
let currentHue = Math.random() * 360;
let targetHue = Math.random() * 360;
let colorChangeTime = 0;
const colorChangeDuration = 300; // frames

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2; // Slightly faster movement
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 8 + 2; // Larger size variation
        this.color = `hsl(${Math.random() * 360}, ${70 + Math.random() * 30}%, ${50 + Math.random() * 40}%)`; // Much more vibrant and colorful
        this.alpha = Math.random() * 0.4 + 0.1;
        this.bounceFactor = 0.8 + Math.random() * 0.4; // Different bounce behaviors
        this.glowIntensity = Math.random() * 15 + 5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // More realistic bouncing with different bounce factors
        if (this.x < 0 || this.x > canvas.width) {
            this.vx *= -this.bounceFactor;
            this.x = Math.max(0, Math.min(canvas.width, this.x));
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.vy *= -this.bounceFactor;
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }

        // Add some gravity-like effect
        this.vy += 0.02;

        this.alpha -= 0.002;
        if (this.alpha <= 0) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.alpha = Math.random() * 0.4 + 0.1;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.glowIntensity;
        ctx.fillStyle = this.color;

        // Draw main bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add highlight for 3D effect
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Initialize particles
for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
}

function drawColorField() {
    // Interpolate between current and target hue
    const progress = Math.min(colorChangeTime / colorChangeDuration, 1);
    const currentHueInterpolated = currentHue + (targetHue - currentHue) * progress;

    // Create a radial gradient with soft, calming colors
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );

    // Add multiple color stops with soft colors
    const numStops = 4;
    for (let i = 0; i < numStops; i++) {
        const hue = (currentHueInterpolated + i * 90) % 360;
        const saturation = 30 + Math.sin(time * 0.005 + i) * 20; // Lower saturation for calmness
        const lightness = 60 + Math.sin(time * 0.003 + i) * 15; // Higher lightness for softness
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        gradient.addColorStop(i / (numStops - 1), color);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add gentle overlay patterns
    ctx.save();
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 6; i++) {
        const hue = (currentHueInterpolated + i * 60) % 360;
        ctx.fillStyle = `hsl(${hue}, 25%, 75%)`;
        const x = (Math.sin(time * 0.005 + i) * 0.3 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.007 + i) * 0.3 + 0.5) * canvas.height;
        const size = 80 + Math.sin(time * 0.01 + i) * 30;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function animate() {
    drawColorField();

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Handle color transitions
    colorChangeTime++;
    if (colorChangeTime >= colorChangeDuration) {
        currentHue = targetHue;
        targetHue = Math.random() * 360;
        colorChangeTime = 0;
    }

    time += 0.5; // Slower time increment for calmer effect
    requestAnimationFrame(animate);
}

animate();