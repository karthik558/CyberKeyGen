// Password generation utilities for CyberKeyGen Extension

const convertToLeetSpeak = (text) => {
  if (!text) return "";
  
  const leetMap = {
    a: "@", b: "8", c: "(", d: "D", e: "3", f: "F", g: "6", h: "H",
    i: "1", j: "J", k: "K", l: "L", m: "M", n: "N", o: "0", p: "P",
    q: "Q", r: "R", s: "5", t: "7", u: "U", v: "V", w: "W", x: "X",
    y: "Y", z: "Z"
  };

  return text
    .split("")
    .map(char => {
      const shouldConvert = Math.random() < 0.7;
      if (!shouldConvert) return char;
      
      const lowerChar = char.toLowerCase();
      return leetMap[lowerChar] || char;
    })
    .join("");
};

// Pronounceable password generation
const generatePronounceablePassword = (length, includeUppercase = true, includeNumbers = true, includeSymbols = true) => {
  const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'];
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '='];

  const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];
  
  let password = '';
  while (password.length < length) {
    if (password.length + 2 <= length) {
      password += getRandomItem(consonants) + getRandomItem(vowels);
    } else {
      password += getRandomItem([...consonants, ...vowels]);
    }
  }

  if (includeUppercase) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + password[pos].toUpperCase() + password.substring(pos + 1);
  }
  
  if (includeNumbers) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + getRandomItem(numbers) + password.substring(pos + 1);
  }
  
  if (includeSymbols) {
    const pos = Math.floor(Math.random() * password.length);
    password = password.substring(0, pos) + getRandomItem(symbols) + password.substring(pos + 1);
  }
  
  return password;
};

// Random password generation
const generateRandomPassword = (options) => {
  const { 
    length, 
    includeLowercase, 
    includeUppercase, 
    includeNumbers, 
    includeSymbols, 
    excludeAmbiguous,
    avoidRepeating,
    usePronounceable
  } = options;
  
  if (usePronounceable) {
    return generatePronounceablePassword(length, includeUppercase, includeNumbers, includeSymbols);
  }
  
  let charset = '';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_-+=[]{}|:;"\'<>,.?/~`';
  
  if (excludeAmbiguous) {
    charset = charset
      .replace(/[0OIl1]/g, '')
      .replace(/[{}[\]|;:'",.\/~`]/g, '');
  }
  
  if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyz';
  
  let password = '';
  const usedChars = new Set();
  
  for (let i = 0; i < length; i++) {
    let char;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      const randomIndex = Math.floor(Math.random() * charset.length);
      char = charset[randomIndex];
      attempts++;
      
      if (!avoidRepeating || !usedChars.has(char) || attempts >= maxAttempts) {
        break;
      }
    } while (avoidRepeating && usedChars.has(char));
    
    password += char;
    usedChars.add(char);
  }
  
  return password;
};

// Generate PIN
const generatePin = (length, avoidRepeating) => {
  const digits = '0123456789';
  let pin = '';
  const usedDigits = new Set();
  
  for (let i = 0; i < length; i++) {
    let digit;
    let attempts = 0;
    const maxAttempts = 20;
    
    do {
      const randomIndex = Math.floor(Math.random() * digits.length);
      digit = digits[randomIndex];
      attempts++;
      
      if (!avoidRepeating || !usedDigits.has(digit) || attempts >= maxAttempts) {
        break;
      }
    } while (avoidRepeating && usedDigits.has(digit));
    
    pin += digit;
    usedDigits.add(digit);
  }
  
  return pin;
};

// Calculate password strength
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, text: 'None' };
  
  const length = password.length;
  let typesCount = 0;
  
  if (/[a-z]/.test(password)) typesCount++;
  if (/[A-Z]/.test(password)) typesCount++;
  if (/[0-9]/.test(password)) typesCount++;
  if (/[^a-zA-Z0-9]/.test(password)) typesCount++;
  
  let strength = "weak";
  if (length < 8) {
    strength = "weak";
  } else if (length < 12) {
    strength = typesCount >= 3 ? "moderate" : "weak";
  } else if (length < 16) {
    strength = typesCount >= 3 ? "strong" : "moderate";
  } else {
    strength = typesCount >= 3 ? "very-strong" : "strong";
  }
  
  let score;
  switch (strength) {
    case "weak": score = 1; break;
    case "moderate": score = 2; break;
    case "strong": score = 3; break;
    case "very-strong": score = 4; break;
    default: score = 0;
  }
  
  const strengthMap = {
    "weak": "Weak",
    "moderate": "Moderate", 
    "strong": "Strong", 
    "very-strong": "Very Strong"
  };
  
  return { score, text: strengthMap[strength] };
};

// Update the visual progress of range input sliders
const updateRangeProgress = (slider) => {
  if (!slider) return;
  const min = parseInt(slider.min) || 0;
  const max = parseInt(slider.max) || 100;
  const value = parseInt(slider.value) || 0;
  const percentage = ((value - min) / (max - min)) * 100;
  slider.style.setProperty('--range-progress', `${percentage}%`);
};

// DOM manipulation and UI functions
document.addEventListener('DOMContentLoaded', () => {
  // Theme management: Default to dark mode (matches website)
  const applyTheme = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['theme'], (result) => {
      if (result && result.theme === 'light') {
        applyTheme(false);
      } else {
        applyTheme(true);
      }
    });
  } else {
    applyTheme(true);
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDarkNow = document.body.classList.contains('dark');
      applyTheme(!isDarkNow);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ theme: !isDarkNow ? 'dark' : 'light' });
      }
    });
  }

  // Tab switching
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.tabIndex = -1;
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.tabIndex = 0;
      
      const tabId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.classList.add('active');
      }

      // Auto generate on tab switch if empty
      if (tabId === 'pin' && pinOutput && !pinOutput.value && generatePinBtn) {
        generatePinBtn.click();
      }
    });
  });

  // Match the web app's keyboard-accessible segmented tabs.
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });
  });

  // Strength Indicator
  const updateStrengthIndicator = (password) => {
    const { score, text } = calculatePasswordStrength(password);
    const strengthValue = document.querySelector('.strength-value');
    const strengthBar = document.querySelector('.strength-bar');

    if (!strengthValue || !strengthBar) return;

    let strengthClass = 'weak';
    if (score === 0 || score === 1) {
      strengthClass = 'weak';
    } else if (score === 2) {
      strengthClass = 'moderate';
    } else if (score === 3) {
      strengthClass = 'strong';
    } else {
      strengthClass = 'very-strong';
    }

    strengthValue.textContent = text;
    strengthBar.className = 'strength-bar ' + strengthClass;
    const meter = strengthBar.parentElement;
    meter.setAttribute('aria-valuenow', ({ weak: 25, moderate: 50, strong: 75, 'very-strong': 100 })[strengthClass]);
    meter.setAttribute('aria-valuetext', text);
  };

  // Password visibility toggle
  const toggleVisibility = document.getElementById('toggleVisibility');
  const passwordOutput = document.getElementById('passwordOutput');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeOffIcon = document.getElementById('eyeOffIcon');
  
  if (toggleVisibility && passwordOutput && eyeIcon && eyeOffIcon) {
    toggleVisibility.addEventListener('click', () => {
      if (passwordOutput.type === 'password') {
        passwordOutput.type = 'text';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      } else {
        passwordOutput.type = 'password';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      }
    });
  }

  // Website-style custom dropdown (Radix/Shadcn UI listbox)
  const initCustomSelects = () => {
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
      const trigger = wrapper.querySelector('.custom-select-trigger');
      const dropdown = wrapper.querySelector('.custom-select-dropdown');
      const nativeSelect = wrapper.querySelector('select');
      const valueDisplay = wrapper.querySelector('.custom-select-value');
      const options = wrapper.querySelectorAll('.custom-select-option');

      if (!trigger || !dropdown || !nativeSelect) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
          dropdown.classList.add('open');
          trigger.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.getAttribute('data-value');
          const text = opt.querySelector('span')?.textContent || opt.textContent.trim();

          nativeSelect.value = val;
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

          if (valueDisplay) valueDisplay.textContent = text;

          options.forEach(o => {
            o.classList.toggle('selected', o === opt);
            o.setAttribute('aria-selected', o === opt ? 'true' : 'false');
          });

          dropdown.classList.remove('open');
          trigger.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
      });
    });

    document.addEventListener('click', closeAllDropdowns);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });
  };

  const closeAllDropdowns = () => {
    document.querySelectorAll('.custom-select-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.custom-select-trigger.open').forEach(t => {
      t.classList.remove('open');
      t.setAttribute('aria-expanded', 'false');
    });
  };

  const updateCustomSelectUI = (wrapperId, val) => {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const opt = wrapper.querySelector(`.custom-select-option[data-value="${val}"]`);
    const valueDisplay = wrapper.querySelector('.custom-select-value');
    const options = wrapper.querySelectorAll('.custom-select-option');

    if (opt) {
      const text = opt.querySelector('span')?.textContent || opt.textContent.trim();
      if (valueDisplay) valueDisplay.textContent = text;
      options.forEach(o => {
        o.classList.toggle('selected', o === opt);
        o.setAttribute('aria-selected', o === opt ? 'true' : 'false');
      });
    }
  };

  initCustomSelects();

  // Preset Selection handling
  const presetSelect = document.getElementById('presetSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const val = presetSelect.value;
      const lowercase = document.getElementById('includeLowercase');
      const uppercase = document.getElementById('includeUppercase');
      const numbers = document.getElementById('includeNumbers');
      const symbols = document.getElementById('includeSymbols');
      const pronounceable = document.getElementById('pronounceable');
      const ambiguous = document.getElementById('excludeAmbiguous');
      const repeating = document.getElementById('avoidRepeating');

      if (val === 'all') {
        if (lowercase) lowercase.checked = true;
        if (uppercase) uppercase.checked = true;
        if (numbers) numbers.checked = true;
        if (symbols) symbols.checked = true;
        if (pronounceable) pronounceable.checked = false;
        if (ambiguous) ambiguous.checked = false;
        if (repeating) repeating.checked = false;
      } else if (val === 'alphanumeric') {
        if (lowercase) lowercase.checked = true;
        if (uppercase) uppercase.checked = true;
        if (numbers) numbers.checked = true;
        if (symbols) symbols.checked = false;
        if (pronounceable) pronounceable.checked = false;
      } else if (val === 'letters') {
        if (lowercase) lowercase.checked = true;
        if (uppercase) uppercase.checked = true;
        if (numbers) numbers.checked = false;
        if (symbols) symbols.checked = false;
        if (pronounceable) pronounceable.checked = false;
      } else if (val === 'numbers') {
        if (lowercase) lowercase.checked = false;
        if (uppercase) uppercase.checked = false;
        if (numbers) numbers.checked = true;
        if (symbols) symbols.checked = false;
        if (pronounceable) pronounceable.checked = false;
      } else if (val === 'pronounceable') {
        if (pronounceable) pronounceable.checked = true;
        if (lowercase) lowercase.checked = true;
        if (uppercase) uppercase.checked = true;
        if (numbers) numbers.checked = true;
        if (symbols) symbols.checked = true;
      }
      updateCustomSelectUI('presetSelectWrapper', val);
      generateNewPassword();
    });
  }

  // Password length slider and direct number input
  const passwordLength = document.getElementById('passwordLength');
  const lengthValue = document.getElementById('lengthValue');
  const lengthInput = document.getElementById('lengthInput');
  const passwordHint = document.getElementById('passwordHint');

  const updateQuickLengths = (len) => {
    document.querySelectorAll('.quick-len-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.len) === len);
    });
  };

  if (passwordLength) {
    updateRangeProgress(passwordLength);
    passwordLength.addEventListener('input', () => {
      const len = parseInt(passwordLength.value);
      if (lengthValue) lengthValue.textContent = len;
      if (lengthInput) lengthInput.value = len;
      updateRangeProgress(passwordLength);
      updateQuickLengths(len);
      generateNewPassword();
    });
  }

  if (lengthInput && passwordLength) {
    const handleLengthInputChange = () => {
      let len = parseInt(lengthInput.value);
      if (isNaN(len)) return;
      len = Math.max(8, Math.min(128, len));
      lengthInput.value = len;
      passwordLength.value = len;
      if (lengthValue) lengthValue.textContent = len;
      updateRangeProgress(passwordLength);
      updateQuickLengths(len);
      generateNewPassword();
    };

    lengthInput.addEventListener('input', () => {
      let len = parseInt(lengthInput.value);
      if (!isNaN(len) && len >= 8 && len <= 128) {
        passwordLength.value = len;
        if (lengthValue) lengthValue.textContent = len;
        updateRangeProgress(passwordLength);
        updateQuickLengths(len);
        generateNewPassword();
      }
    });

    lengthInput.addEventListener('change', handleLengthInputChange);
    lengthInput.addEventListener('blur', handleLengthInputChange);
  }

  document.querySelectorAll('.quick-len-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const len = parseInt(btn.dataset.len);
      if (passwordLength) {
        passwordLength.value = len;
        if (lengthValue) lengthValue.textContent = len;
        if (lengthInput) lengthInput.value = len;
        updateRangeProgress(passwordLength);
        updateQuickLengths(len);
        generateNewPassword();
      }
    });
  });

  // Password generation
  const generatePasswordBtn = document.getElementById('generatePassword');
  const generateNewPassword = () => {
    if (!passwordLength) return "";
    const options = {
      length: parseInt(passwordLength.value),
      includeLowercase: document.getElementById('includeLowercase')?.checked ?? true,
      includeUppercase: document.getElementById('includeUppercase')?.checked ?? true,
      includeNumbers: document.getElementById('includeNumbers')?.checked ?? true,
      includeSymbols: document.getElementById('includeSymbols')?.checked ?? true,
      excludeAmbiguous: document.getElementById('excludeAmbiguous')?.checked ?? false,
      avoidRepeating: document.getElementById('avoidRepeating')?.checked ?? false,
      usePronounceable: document.getElementById('pronounceable')?.checked ?? false
    };
    
    const newPassword = generateRandomPassword(options);
    if (passwordOutput) {
      passwordOutput.value = newPassword;
    }
    updateStrengthIndicator(newPassword);
    
    if (passwordHint) {
      passwordHint.textContent = `${newPassword.length} characters · Generated in your browser`;
    }
    
    return newPassword;
  };

  if (generatePasswordBtn) {
    generatePasswordBtn.addEventListener('click', () => {
      const newPassword = generateNewPassword();
      savePasswordToHistory(newPassword, 'random');
    });
  }

  // Live update on switch changes
  const optionCheckboxes = [
    'includeLowercase', 'includeUppercase', 'includeNumbers',
    'includeSymbols', 'excludeAmbiguous', 'avoidRepeating', 'pronounceable'
  ];
  optionCheckboxes.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        const lowercase = document.getElementById('includeLowercase');
        const uppercase = document.getElementById('includeUppercase');
        const numbers = document.getElementById('includeNumbers');
        const symbols = document.getElementById('includeSymbols');
        if (lowercase && uppercase && numbers && symbols) {
          if (!lowercase.checked && !uppercase.checked && !numbers.checked && !symbols.checked) {
            el.checked = true;
            return;
          }
        }
        // Mark preset as Custom when checkboxes are manually adjusted
        if (presetSelect) {
          presetSelect.value = 'custom';
          updateCustomSelectUI('presetSelectWrapper', 'custom');
        }
        generateNewPassword();
      });
    }
  });

  // PIN controls and direct number input
  const pinLength = document.getElementById('pinLength');
  const pinLengthValue = document.getElementById('pinLengthValue');
  const pinLengthInput = document.getElementById('pinLengthInput');
  const pinOutput = document.getElementById('pinOutput');
  const pinHint = document.getElementById('pinHint');
  const generatePinBtn = document.getElementById('generatePin');

  const updateQuickPinLengths = (len) => {
    document.querySelectorAll('.quick-pin-len-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.len) === len);
    });
  };

  if (pinLength) {
    updateRangeProgress(pinLength);
    pinLength.addEventListener('input', () => {
      const len = parseInt(pinLength.value);
      if (pinLengthValue) pinLengthValue.textContent = len;
      if (pinLengthInput) pinLengthInput.value = len;
      updateRangeProgress(pinLength);
      updateQuickPinLengths(len);
      if (generatePinBtn) generatePinBtn.click();
    });
  }

  if (pinLengthInput && pinLength) {
    const handlePinLengthChange = () => {
      let len = parseInt(pinLengthInput.value);
      if (isNaN(len)) return;
      len = Math.max(4, Math.min(12, len));
      pinLengthInput.value = len;
      pinLength.value = len;
      if (pinLengthValue) pinLengthValue.textContent = len;
      updateRangeProgress(pinLength);
      updateQuickPinLengths(len);
      if (generatePinBtn) generatePinBtn.click();
    };

    pinLengthInput.addEventListener('input', () => {
      let len = parseInt(pinLengthInput.value);
      if (!isNaN(len) && len >= 4 && len <= 12) {
        pinLength.value = len;
        if (pinLengthValue) pinLengthValue.textContent = len;
        updateRangeProgress(pinLength);
        updateQuickPinLengths(len);
        if (generatePinBtn) generatePinBtn.click();
      }
    });

    pinLengthInput.addEventListener('change', handlePinLengthChange);
    pinLengthInput.addEventListener('blur', handlePinLengthChange);
  }

  document.querySelectorAll('.quick-pin-len-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const len = parseInt(btn.dataset.len);
      if (pinLength) {
        pinLength.value = len;
        if (pinLengthValue) pinLengthValue.textContent = len;
        if (pinLengthInput) pinLengthInput.value = len;
        updateRangeProgress(pinLength);
        updateQuickPinLengths(len);
        if (generatePinBtn) generatePinBtn.click();
      }
    });
  });

  if (generatePinBtn) {
    generatePinBtn.addEventListener('click', () => {
      const length = parseInt(pinLength?.value || '6');
      const avoidRepeatingPin = document.getElementById('avoidRepeatingPin')?.checked ?? false;
      
      const newPin = generatePin(length, avoidRepeatingPin);
      if (pinOutput) pinOutput.value = newPin;
      if (pinHint) pinHint.textContent = `${newPin.length} digits · Generated in your browser`;
      
      savePasswordToHistory(newPin, 'pin');
    });
  }

  const avoidRepeatingPin = document.getElementById('avoidRepeatingPin');
  if (avoidRepeatingPin) {
    avoidRepeatingPin.addEventListener('change', () => {
      if (generatePinBtn) generatePinBtn.click();
    });
  }

  // Leet (Pattern / From text) controls
  const baseText = document.getElementById('baseText');
  const leetOutput = document.getElementById('leetOutput');
  const generateLeetBtn = document.getElementById('generateLeet');

  if (generateLeetBtn && baseText && leetOutput) {
    generateLeetBtn.addEventListener('click', () => {
      if (!baseText.value) return;
      const leetText = convertToLeetSpeak(baseText.value);
      leetOutput.value = leetText;
      savePasswordToHistory(leetText, 'leet');
    });

    baseText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        generateLeetBtn.click();
      }
    });

    baseText.addEventListener('input', () => {
      if (baseText.value.trim()) {
        const leetText = convertToLeetSpeak(baseText.value);
        leetOutput.value = leetText;
      } else {
        leetOutput.value = '';
      }
    });
  }

  // Copy buttons with visual feedback
  const showCopySuccess = (btn) => {
    let copySuccess = document.getElementById('copySuccess');
    if (!copySuccess) {
      copySuccess = document.createElement('div');
      copySuccess.id = 'copySuccess';
      document.body.appendChild(copySuccess);
    }
    copySuccess.textContent = 'Copied to clipboard!';
    copySuccess.classList.add('show');

    if (btn) {
      const textSpan = btn.querySelector('.btn-text') || btn.querySelector('span');
      if (textSpan) {
        const origText = textSpan.textContent;
        textSpan.textContent = 'Copied!';
        setTimeout(() => { textSpan.textContent = origText; }, 1500);
      }
    }
    
    setTimeout(() => {
      copySuccess.classList.remove('show');
    }, 2000);
  };

  const copyPasswordBtn = document.getElementById('copyPassword');
  if (copyPasswordBtn) {
    copyPasswordBtn.addEventListener('click', () => {
      if (!passwordOutput || !passwordOutput.value) return;
      navigator.clipboard.writeText(passwordOutput.value).then(() => {
        showCopySuccess(copyPasswordBtn);
      });
    });
  }

  const copyLeetBtn = document.getElementById('copyLeet');
  if (copyLeetBtn) {
    copyLeetBtn.addEventListener('click', () => {
      if (!leetOutput || !leetOutput.value) return;
      navigator.clipboard.writeText(leetOutput.value).then(() => {
        showCopySuccess(copyLeetBtn);
      });
    });
  }

  const copyPinBtn = document.getElementById('copyPin');
  if (copyPinBtn) {
    copyPinBtn.addEventListener('click', () => {
      if (!pinOutput || !pinOutput.value) return;
      navigator.clipboard.writeText(pinOutput.value).then(() => {
        showCopySuccess(copyPinBtn);
      });
    });
  }

  // Fill password in active webpage
  const fillPasswordBtn = document.getElementById('fillPassword');
  if (fillPasswordBtn) {
    fillPasswordBtn.addEventListener('click', () => {
      if (!passwordOutput || !passwordOutput.value) return;
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'fillPassword', 
              password: passwordOutput.value 
            });
            window.close();
          }
        });
      }
    });
  }

  const fillLeetBtn = document.getElementById('fillLeet');
  if (fillLeetBtn) {
    fillLeetBtn.addEventListener('click', () => {
      if (!leetOutput || !leetOutput.value) return;
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'fillPassword', 
              password: leetOutput.value 
            });
            window.close();
          }
        });
      }
    });
  }

  const fillPinBtn = document.getElementById('fillPin');
  if (fillPinBtn) {
    fillPinBtn.addEventListener('click', () => {
      if (!pinOutput || !pinOutput.value) return;
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'fillPassword', 
              password: pinOutput.value 
            });
            window.close();
          }
        });
      }
    });
  }

  // Open Options Page
  const openOptionsBtn = document.getElementById('openOptions');
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open('../options/options.html', '_blank');
      }
    });
  }

  // External Links
  const webLink = document.getElementById('webLink');
  if (webLink) {
    webLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: 'https://password.karthiklal.in/' });
      } else {
        window.open('https://password.karthiklal.in/', '_blank');
      }
    });
  }

  const authorLink = document.getElementById('authorLink');
  if (authorLink) {
    authorLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: 'https://karthiklal.in/' });
      } else {
        window.open('https://karthiklal.in/', '_blank');
      }
    });
  }

  // History storage
  function savePasswordToHistory(pwd, type) {
    if (!pwd) return;
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get(['passwordHistory'], (result) => {
      const history = (result && result.passwordHistory) || [];
      const newEntry = {
        password: pwd,
        timestamp: new Date().toISOString(),
        strength: calculatePasswordStrength(pwd).text.toLowerCase().replace(' ', '-'),
        type: type
      };
      
      if (history.length >= 20) {
        history.pop();
      }
      history.unshift(newEntry);
      chrome.storage.local.set({ passwordHistory: history });
    });
  }

  // Initial password generation immediately
  generateNewPassword();

  // Load saved options defaults if present
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['settings'], (result) => {
      if (result && result.settings) {
        const settings = result.settings;
        if (settings.defaultTab) {
          const tabButton = document.querySelector(`.tab-button[data-tab="${settings.defaultTab}"]`);
          if (tabButton) tabButton.click();
        }
        if (settings.defaultLength && passwordLength) {
          passwordLength.value = settings.defaultLength;
          if (lengthValue) lengthValue.textContent = settings.defaultLength;
          if (lengthInput) lengthInput.value = settings.defaultLength;
          updateRangeProgress(passwordLength);
          updateQuickLengths(settings.defaultLength);
        }
        if (settings.defaultPinLength && pinLength) {
          pinLength.value = settings.defaultPinLength;
          if (pinLengthValue) pinLengthValue.textContent = settings.defaultPinLength;
          if (pinLengthInput) pinLengthInput.value = settings.defaultPinLength;
          updateRangeProgress(pinLength);
          updateQuickPinLengths(settings.defaultPinLength);
        }
        if (settings.hasOwnProperty('defaultIncludeLowercase')) {
          const el = document.getElementById('includeLowercase');
          if (el) el.checked = settings.defaultIncludeLowercase;
        }
        if (settings.hasOwnProperty('defaultIncludeUppercase')) {
          const el = document.getElementById('includeUppercase');
          if (el) el.checked = settings.defaultIncludeUppercase;
        }
        if (settings.hasOwnProperty('defaultIncludeNumbers')) {
          const el = document.getElementById('includeNumbers');
          if (el) el.checked = settings.defaultIncludeNumbers;
        }
        if (settings.hasOwnProperty('defaultIncludeSymbols')) {
          const el = document.getElementById('includeSymbols');
          if (el) el.checked = settings.defaultIncludeSymbols;
        }
        if (settings.hasOwnProperty('defaultExcludeAmbiguous')) {
          const el = document.getElementById('excludeAmbiguous');
          if (el) el.checked = settings.defaultExcludeAmbiguous;
        }
        if (settings.hasOwnProperty('defaultAvoidRepeating')) {
          const el = document.getElementById('avoidRepeating');
          if (el) el.checked = settings.defaultAvoidRepeating;
          const elPin = document.getElementById('avoidRepeatingPin');
          if (elPin) elPin.checked = settings.defaultAvoidRepeating;
        }
        if (settings.hasOwnProperty('defaultPronounceable')) {
          const el = document.getElementById('pronounceable');
          if (el) el.checked = settings.defaultPronounceable;
        }
        generateNewPassword();
      }
    });
  }
});
