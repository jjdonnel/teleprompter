// DOM Elements
const scriptInput = document.getElementById('scriptInput');
const prompterContainer = document.getElementById('prompterContainer');
const prompterText = document.getElementById('prompterText');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const startBtn = document.getElementById('startBtn');
const speedControl = document.getElementById('speedControl');
const speedSlider = document.getElementById('speedSlider');
const wordCountDisplay = document.getElementById('wordCountDisplay');
const wpmDisplay = document.getElementById('wpmDisplay');

// State
let isEditing = true;
let isScrolling = false;
let scrollPos = 0;
let animationFrameId = null;

// Metrics Calculation
function updateMetrics() {
  const text = scriptInput.value || scriptInput.innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  if (wordCountDisplay) {
    wordCountDisplay.textContent = `${words} Words`;
  }

  // Pixel rate (at ~60fps) to estimated WPM
  const speed = parseFloat(speedSlider.value);
  const pixelsPerSecond = speed * 60; 
  const linesPerSecond = pixelsPerSecond / 64; 
  const estimatedWpm = Math.round(linesPerSecond * 9 * 60);

  if (wpmDisplay) {
    wpmDisplay.textContent = `~${estimatedWpm} WPM`;
  }
}

// Teleprompter Logic
function toggleView() {
  if (isEditing) {
    const text = scriptInput.value || scriptInput.innerText || '';
    if (!text.trim()) return;

    prompterText.innerHTML = text.replace(/\n/g, '<br>');
    
    scriptInput.classList.add('hidden');
    prompterContainer.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    speedControl.classList.remove('hidden');
    
    toggleViewBtn.textContent = 'Edit Script';
    isEditing = false;
  } else {
    stopScroll();
    
    prompterContainer.classList.add('hidden');
    startBtn.classList.add('hidden');
    speedControl.classList.add('hidden');
    scriptInput.classList.remove('hidden');
    
    toggleViewBtn.textContent = 'Load / Edit Script';
    scrollPos = 0;
    prompterContainer.scrollTop = 0;
    isEditing = true;
  }
}

function scrollLoop() {
  if (!isScrolling) return;
  const speed = parseFloat(speedSlider.value);
  scrollPos += speed;
  prompterContainer.scrollTop = scrollPos;
  animationFrameId = requestAnimationFrame(scrollLoop);
}

// Updated startScroll to toggle active class and label dynamically
function startScroll() {
  isScrolling = !isScrolling;
  
  if (isScrolling) {
    scrollPos = prompterContainer.scrollTop;
    startBtn.classList.add('active'); // Applies the dynamic cyan gradient state
    startBtn.textContent = 'Pause (Space)';
    scrollLoop();
  } else {
    stopScroll();
  }
}

// Updated stopScroll to ensure clean state reset
function stopScroll() {
  isScrolling = false;
  cancelAnimationFrame(animationFrameId);
  startBtn.classList.remove('active'); // Resets gradient back to initial state
  startBtn.textContent = 'Start (Space)';
}

// Listeners
toggleViewBtn.addEventListener('click', toggleView);
startBtn.addEventListener('click', startScroll);

// Dynamic Metrics Listeners
scriptInput.addEventListener('input', updateMetrics);
speedSlider.addEventListener('input', updateMetrics);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isEditing) {
    e.preventDefault();
    startScroll();
  } else if (e.key === 'Escape' && !isEditing) {
    toggleView();
  } else if (e.key === 'ArrowUp' && !isEditing) {
    e.preventDefault();
    speedSlider.value = Math.min(parseFloat(speedSlider.value) + 0.5, 5.0);
    updateMetrics();
  } else if (e.key === 'ArrowDown' && !isEditing) {
    e.preventDefault();
    speedSlider.value = Math.max(parseFloat(speedSlider.value) - 0.5, 0.5);
    updateMetrics();
  }
});

// Initial run for pre-filled text
updateMetrics();