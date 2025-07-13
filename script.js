const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let currentInput = '';
let lastResult = '';
let resetNext = false;

// Helper to format display (limit length, thousands separator)
function formatDisplay(val) {
  if (val.length > 18) val = val.slice(0, 18) + '...';
  return val;
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.getAttribute('data-value');

    if (value === 'C') {
      currentInput = '';
      lastResult = '';
      resetNext = false;
      display.textContent = '0';
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
      return;
    }

    if (value === '=') {
      try {
        // Replace unicode division/multiplication
        let toEval = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
        let result = eval(toEval); // For demo, OK, but not for real apps!
        // Prevent undefined or NaN
        if (isNaN(result) || result === undefined) result = 'Error';
        display.textContent = formatDisplay(String(result));
        lastResult = String(result);
        resetNext = true;
      } catch {
        display.textContent = 'Error';
        resetNext = true;
      }
      return;
    }

    if (resetNext) {
      currentInput = '';
      resetNext = false;
    }

    // Only allow one decimal per number
    if (value === '.') {
      const nums = currentInput.split(/[\+\-\*\/%]/);
      const lastNum = nums[nums.length-1];
      if (lastNum.includes('.')) return;
    }

    // Don't allow two operators in a row
    if (['+', '-', '*', '/', '%'].includes(value)) {
      if (!currentInput || /[\+\-\*\/%]$/.test(currentInput)) return;
    }

    currentInput += value;
    display.textContent = formatDisplay(currentInput);
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