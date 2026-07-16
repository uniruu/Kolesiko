// Стартовые варианты: их можно менять, добавлять и удалять на странице.
const defaultOptions = [
  "🍕 Пицца", "🎬 Кино", "🍦 Мороженое", "🎮 Игры", "📚 Книга",
  "🎵 Музыка", "☕ Кофе", "🚗 Поездка", "⭐ Сюрприз", "🎁 Подарок"
];

const colors = ["#f35b9f", "#9169e6", "#46a9e6", "#4fc5b8", "#e2a840", "#ef765a", "#dd649f", "#7d79e7", "#5398df", "#63be96", "#ec9343", "#ba6bd9"];
let options = [...defaultOptions];
let currentRotation = 0;
let isSpinning = false;
let audioContext;

const wheel = document.querySelector("#wheel");
const wheelLabels = document.querySelector("#wheel-labels");
const optionsList = document.querySelector("#options-list");
const optionForm = document.querySelector("#option-form");
const optionInput = document.querySelector("#new-option");
const spinButton = document.querySelector("#spin-button");
const status = document.querySelector("#status");
const modal = document.querySelector("#result-modal");
const resultPrize = document.querySelector("#result-prize");
const confetti = document.querySelector("#confetti");

// Рисуем фон-сектора и подписи. Подписи располагаются от центра к краям.
function renderWheel() {
  const count = options.length;
  wheelLabels.innerHTML = "";

  if (count === 0) {
    wheel.style.background = "linear-gradient(135deg, #b8aed1, #897ca6)";
    wheel.setAttribute("aria-label", "Колесо пусто — добавьте варианты");
    return;
  }

  const segment = 360 / count;
  const gradient = options.map((_, index) => {
    const start = index * segment;
    return `${colors[index % colors.length]} ${start}deg ${start + segment}deg`;
  }).join(", ");

  wheel.style.background = `conic-gradient(from ${-segment / 2}deg, ${gradient})`;
  wheel.setAttribute("aria-label", `Колесо с вариантами: ${options.join(", ")}`);

  options.forEach((option, index) => {
    const label = document.createElement("span");
    const angle = index * segment;
    label.className = "wheel-label";
    label.textContent = option;
    // Текст поворачивается к сектору и сдвигается по его радиусу.
    label.style.transform = `rotate(${angle}deg) translateX(24%) rotate(${segment / 2}deg)`;
    wheelLabels.appendChild(label);
  });
}

function renderOptionsList() {
  optionsList.innerHTML = "";

  if (options.length === 0) {
    optionsList.innerHTML = '<li class="empty-message">Список пуст. Добавьте свой приз!</li>';
    return;
  }

  options.forEach((option, index) => {
    const item = document.createElement("li");
    item.className = "option-item";
    item.innerHTML = `<span>${escapeHtml(option)}</span><button class="delete-option" type="button" aria-label="Удалить ${escapeHtml(option)}">×</button>`;
    item.querySelector("button").addEventListener("click", () => {
      options.splice(index, 1);
      updateOptions();
    });
    optionsList.appendChild(item);
  });
}

// Не даём введённому тексту превратиться в HTML-разметку.
function escapeHtml(text) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

function updateOptions() {
  renderOptionsList();
  renderWheel();
  status.textContent = options.length ? "Колесо обновлено — можно крутить!" : "Добавьте хотя бы один вариант.";
}

optionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newOption = optionInput.value.trim();
  if (!newOption) return;

  options.push(newOption);
  optionInput.value = "";
  updateOptions();
  optionInput.focus();
});

document.querySelector("#clear-options").addEventListener("click", () => {
  options = [];
  updateOptions();
});

document.querySelector("#restore-options").addEventListener("click", () => {
  options = [...defaultOptions];
  updateOptions();
});

// Web Audio API создаёт короткие звуки без внешних аудиофайлов.
function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playTone(frequency, duration, type = "sine", volume = 0.05, delay = 0) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function playSpinSound(duration) {
  const context = getAudioContext();
  const interval = window.setInterval(() => {
    if (!isSpinning) return window.clearInterval(interval);
    playTone(150 + Math.random() * 90, 0.04, "triangle", 0.025);
  }, 135);
  window.setTimeout(() => window.clearInterval(interval), duration);
}

function playWinSound() {
  playTone(523.25, 0.2, "sine", 0.08);
  playTone(659.25, 0.22, "sine", 0.08, 0.13);
  playTone(783.99, 0.42, "sine", 0.09, 0.27);
}

function spinWheel() {
  if (isSpinning || options.length === 0) {
    if (!options.length) status.textContent = "Сначала добавьте варианты в список.";
    return;
  }

  isSpinning = true;
  spinButton.disabled = true;
  status.textContent = "Колесо набирает обороты…";
  const count = options.length;
  const segment = 360 / count;
  const winnerIndex = Math.floor(Math.random() * count);
  const winner = options[winnerIndex];
  const duration = 4000 + Math.floor(Math.random() * 2001);

  // Центр сектора должен оказаться под указателем сверху (0 градусов).
  const winningAngle = 360 - winnerIndex * segment;
  const extraTurns = 6 * 360 + Math.floor(Math.random() * 3) * 360;
  const finalRotation = currentRotation + extraTurns + ((winningAngle - currentRotation) % 360 + 360) % 360;
  currentRotation = finalRotation;
  wheel.style.transitionDuration = `${duration}ms`;
  wheel.style.transform = `rotate(${finalRotation}deg)`;
  playSpinSound(duration);

  window.setTimeout(() => {
    isSpinning = false;
    spinButton.disabled = false;
    status.textContent = "Есть результат! 🎉";
    resultPrize.textContent = winner;
    modal.hidden = false;
    playWinSound();
    makeConfetti();
  }, duration);
}

function closeModal() { modal.hidden = true; }

spinButton.addEventListener("click", spinWheel);
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));

// Конфетти создаётся на момент победы и затем само удаляется.
function makeConfetti() {
  const confettiColors = ["#f4549e", "#8764e6", "#ffcc57", "#54c8bc", "#fff"];
  for (let index = 0; index < 90; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[index % confettiColors.length];
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    piece.style.setProperty("--fall-time", `${1.8 + Math.random() * 1.5}s`);
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.appendChild(piece);
    window.setTimeout(() => piece.remove(), 3500);
  }
}

function createBackgroundParticles() {
  const container = document.querySelector(".background-particles");
  const symbols = ["✦", "✧", "•", "♥"];
  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = symbols[index % symbols.length];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--size", `${10 + Math.random() * 16}px`);
    particle.style.setProperty("--duration", `${11 + Math.random() * 10}s`);
    particle.style.setProperty("--delay", `${-Math.random() * 17}s`);
    container.appendChild(particle);
  }
}

renderOptionsList();
renderWheel();
createBackgroundParticles();
