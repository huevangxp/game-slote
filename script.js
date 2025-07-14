const symbols = ["🍒", "🍋", "🔔", "7️⃣", "🍀", "💎"];
// import audio from './audio.js'; // Uncomment if you have audio functionality
const audio = new Audio('main-track.mp3'); // Uncomment if you have audio functionality
let balance = 1000;
const bet = 100;
const winReward = 500;

const reelCount = 3;
const visibleSymbols = 3; // 3 rows visible
const symbolHeight = 80; // px

const reels = [];

// play audio when page loads
window.onload = () => {
  audio.loop = true; // Loop the audio
  audio.play().catch(err => {
    console.error("Audio playback failed:", err);
    document.getElementById("result").textContent = "🔊 Audio playback failed. Please enable sound.";
  });
}

function createReelSymbols(reelEl) {
  const container = reelEl.querySelector('.symbols');
  container.style.top = '0px';
  container.innerHTML = '';

  // Create 6 symbols (double list for looping)
  const fullSymbols = [...symbols, ...symbols];
  fullSymbols.forEach(sym => {
    const div = document.createElement('div');
    div.classList.add('symbol');
    div.textContent = sym;
    container.appendChild(div);
  });
}

function updateBalanceDisplay() {
  document.getElementById("balance").textContent = `💰 Balance: ${balance} coins`;
}

function clearWinHighlights() {
  reels.forEach(reel => {
    const symbolDivs = reel.container.querySelectorAll('.symbol');
    symbolDivs.forEach(div => div.classList.remove('win'));
  });
}

function highlightWinningSymbols(finalPositions) {
  // Highlight the middle row symbol on each reel (index = finalPos + 1)
  reels.forEach((reel, i) => {
    const symbolDivs = reel.container.querySelectorAll('.symbol');
    // The symbols are doubled list (12 symbols), highlight the one at finalPositions[i] + 1
    // Because container is scrolled up, visible symbols start from finalPositions[i]
    let highlightIndex = (finalPositions[i] + 1) % symbols.length;
    // Since we doubled symbols array, and all symbols appended in order,
    // highlight both corresponding symbols (in the first and second half) for safety
    symbolDivs[highlightIndex].classList.add('win');
    symbolDivs[highlightIndex + symbols.length].classList.add('win');
  });
}

function spin() {
  if (balance < bet) {
    document.getElementById("result").textContent = "❌ Not enough money!";
    return;
  }

  clearWinHighlights();

  balance -= bet;
  updateBalanceDisplay();
  document.getElementById("result").textContent = "🎲 Spinning...";

  // Choose random stop position per reel (symbol index 0-5)
  const finalPositions = [];
  for(let i = 0; i < reelCount; i++) {
    finalPositions.push(Math.floor(Math.random() * symbols.length));
  }

  // Animate reels sliding one by one with delay
  const spinDuration = 2000; // ms
  const delayBetweenReels = 700;

  reels.forEach((reel, i) => {
    reel.container.style.transition = 'none';
    reel.container.style.top = '0px';

    // Start animation with delay
    setTimeout(() => {
      reel.container.style.transition = `top ${spinDuration}ms cubic-bezier(0.33,1,0.68,1)`;

      // Slide 3 loops + final position:
      // (symbols.length * 3 + finalPos) * symbolHeight px upward (negative top)
      const loops = 3;
      const topValue = -((symbols.length * loops + finalPositions[i]) * symbolHeight);
      reel.container.style.top = topValue + 'px';
    }, i * delayBetweenReels);
  });

  // After all reels stopped:
  setTimeout(() => {
    // Calculate visible symbols on each reel (middle 3 symbols visible)
    // The visible symbols start from finalPositions[i], visibleSymbols are consecutive symbols:
    // We check the middle row symbol index = finalPositions[i] + 1 mod symbols.length
    // For win, check if middle row symbols match on all reels

    // Get middle row symbols:
    const middleRowSymbols = finalPositions.map(pos => {
      return symbols[(pos + 1) % symbols.length];
    });

    // Check if all match:
    const firstSymbol = middleRowSymbols[0];
    const isWin = middleRowSymbols.every(sym => sym === firstSymbol);

    if (isWin) {
      balance += winReward;
      updateBalanceDisplay();
      document.getElementById("result").textContent = `🎉 WIN! Middle line matched ${firstSymbol}. You win ${winReward} coins!`;
      highlightWinningSymbols(finalPositions);
    } else {
      document.getElementById("result").textContent = "😢 You lose. Try again!";
    }
  }, spinDuration + (reelCount - 1) * delayBetweenReels + 100);
}

// Initialize reels:
window.onload = () => {
  for(let i = 0; i < reelCount; i++) {
    const reelEl = document.getElementById(`reel${i}`);
    createReelSymbols(reelEl);
    reels.push({ container: reelEl.querySelector('.symbols') });
  }
  updateBalanceDisplay();

  document.getElementById('spinBtn').onclick = spin;
};
