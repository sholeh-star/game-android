const player = document.getElementById('player');
const target = document.getElementById('target');
const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highscore');
const finalScoreDisplay = document.getElementById('final-score');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const gameContainer = document.getElementById('game-container');

// Elemen Layar Menu
const menuScreen = document.getElementById('menu-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');

let playerX = window.innerWidth / 2 - 30;
let score = 0;
let highscore = localStorage.getItem('tangkapKotakHighScore') || 0;
let targetY = 0;
let targetX = Math.random() * (window.innerWidth - 30);
let gameSpeed = 3;
let isPlaying = false;

// Tampilkan Highscore awal
highscoreDisplay.textContent = highscore;

// --- FUNGSI EFEK SUARA (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'score') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'gameover') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

// --- FUNGSI KONTROL TOMBOL MENU ---
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

menuBtn.addEventListener('click', () => {
    gameoverScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
});

quitBtn.addEventListener('click', () => {
    if (confirm("Apakah Anda yakin ingin keluar dari game?")) {
        window.close();
        window.location.href = "about:blank";
    }
});

function startGame() {
    menuScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    
    score = 0;
    gameSpeed = 3;
    scoreDisplay.textContent = score;
    playerX = gameContainer.clientWidth / 2 - 35;
    player.style.left = playerX + 'px';
    resetTarget();
    
    isPlaying = true;
}

// Kontrol Gerak Player
leftBtn.addEventListener('click', () => {
    if (!isPlaying) return;
    playerX = Math.max(0, playerX - 35);
    player.style.left = playerX + 'px';
});

rightBtn.addEventListener('click', () => {
    if (!isPlaying) return;
    playerX = Math.min(gameContainer.clientWidth - 70, playerX + 35);
    player.style.left = playerX + 'px';
});

// Loop Game Utama
function updateGame() {
    if (isPlaying) {
        targetY += gameSpeed;
        target.style.top = targetY + 'px';
        target.style.left = targetX + 'px';

        // Deteksi Tangkap (Tabrakan)
        const playerRect = player.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        if (
            targetRect.bottom >= playerRect.top &&
            targetRect.left >= playerRect.left &&
            targetRect.right <= playerRect.right &&
            targetRect.bottom <= playerRect.bottom + 20
        ) {
            score++;
            scoreDisplay.textContent = score;
            playSound('score');
            resetTarget();
            gameSpeed += 0.2; 
        }

        // Jika target jatuh sampai bawah (Game Over)
        if (targetY > gameContainer.clientHeight) {
            isPlaying = false;
            playSound('gameover');
            
            if (score > highscore) {
                highscore = score;
                localStorage.setItem('tangkapKotakHighScore', highscore);
                highscoreDisplay.textContent = highscore;
            }

            finalScoreDisplay.textContent = score;
            gameoverScreen.classList.remove('hidden');
        }
    }

    requestAnimationFrame(updateGame);
}

function resetTarget() {
    targetY = 0;
    targetX = Math.random() * (gameContainer.clientWidth - 32);
}

requestAnimationFrame(updateGame);