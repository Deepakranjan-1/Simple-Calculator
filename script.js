const display = document.getElementById('display');
const displaySecondary = document.getElementById('display-secondary');
const buttons = document.querySelectorAll('.btn');

let currentInput = '';
let lastResult = '';
let resetNext = false;
let lastOperation = '';

// Helper to format display (limit length, thousands separator)
function formatDisplay(val) {
  if (val.length > 18) val = val.slice(0, 18) + '...';
  return val;
}

// Add button press animation
function animateButton(btn) {
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 100);
}

// Add display update animation
function animateDisplay() {
  display.style.animation = 'none';
  setTimeout(() => {
    display.style.animation = 'displayGlow 0.3s ease';
  }, 10);
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.getAttribute('data-value');
    animateButton(btn);

    if (value === 'C') {
      currentInput = '';
      lastResult = '';
      lastOperation = '';
      resetNext = false;
      display.textContent = '0';
      displaySecondary.textContent = '';
      animateDisplay();
      return;
    }

    if (value === 'DEL') {
      if (resetNext) {
        currentInput = '';
        resetNext = false;
      } else {
        currentInput = currentInput.slice(0, -1);
      }
      display.textContent = currentInput || '0';
      animateDisplay();
      return;
    }

    if (value === '=') {
      if (!currentInput) return;
      
      try {
        // Store the operation for secondary display
        lastOperation = currentInput;
        
        // Replace unicode division/multiplication
        let toEval = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
        let result = eval(toEval); // For demo, OK, but not for real apps!
        
        // Prevent undefined or NaN
        if (isNaN(result) || result === undefined) {
          display.textContent = 'Error';
          displaySecondary.textContent = '';
        } else {
          // Round to avoid floating point issues
          result = Math.round(result * 100000000) / 100000000;
          displaySecondary.textContent = lastOperation;
          display.textContent = formatDisplay(String(result));
          lastResult = String(result);
        }
        
        resetNext = true;
        animateDisplay();
      } catch {
        display.textContent = 'Error';
        displaySecondary.textContent = '';
        resetNext = true;
        animateDisplay();
      }
      return;
    }

    if (resetNext) {
      // If starting with operator, use last result
      if (['+', '-', '*', '/', '%'].includes(value) && lastResult) {
        currentInput = lastResult;
        displaySecondary.textContent = '';
      } else {
        currentInput = '';
        displaySecondary.textContent = '';
      }
      resetNext = false;
    }

    // Only allow one decimal per number
    if (value === '.') {
      const nums = currentInput.split(/[\+\-\*\/%]/);
      const lastNum = nums[nums.length-1];
      if (lastNum.includes('.')) return;
      // Add leading zero if starting with decimal
      if (!lastNum) currentInput += '0';
    }

    // Don't allow two operators in a row
    if (['+', '-', '*', '/', '%'].includes(value)) {
      if (!currentInput || /[\+\-\*\/%]$/.test(currentInput)) return;
    }

    currentInput += value;
    display.textContent = formatDisplay(currentInput);
    animateDisplay();
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const allowed = '0123456789.+-*/%';
  if (allowed.includes(e.key)) {
    document.querySelector(`.btn[data-value="${e.key}"]`)?.click();
  }
  if (e.key === 'Enter' || e.key === '=') {
    document.querySelector('.btn.equals')?.click();
  }
  if (e.key === 'Backspace') {
    document.querySelector('.btn.operator[data-value="DEL"]')?.click();
  }
  if (e.key === 'Escape') {
    document.querySelector('.btn.operator[data-value="C"]')?.click();
  }
});