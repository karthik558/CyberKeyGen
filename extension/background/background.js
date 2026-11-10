// Background script for CyberKeyGen Password Generator Extension

// Set up context menu items when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  // Add context menu item for password fields
  chrome.contextMenus.create({
    id: 'generatePassword',
    title: 'Generate Password',
    contexts: ['editable'],
  });
  
  // Add context menu submenu for PIN
  chrome.contextMenus.create({
    id: 'generatePin',
    title: 'Generate PIN',
    contexts: ['editable'],
  });
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      passwordHistory: [],
      passwordFavorites: [],
      settings: {
        defaultTab: 'random',
        defaultLength: 16,
        defaultPinLength: 6,
        defaultIncludeLowercase: true,
        defaultIncludeUppercase: true,
        defaultIncludeNumbers: true,
        defaultIncludeSymbols: true,
        defaultExcludeAmbiguous: false,
        defaultAvoidRepeating: false,
        defaultPronounceable: false
      }
    });
    
    // Open the options page on first install
    chrome.runtime.openOptionsPage();
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generatePassword') {
    // Get default settings
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {
        defaultLength: 16,
        defaultIncludeLowercase: true,
        defaultIncludeUppercase: true,
        defaultIncludeNumbers: true,
        defaultIncludeSymbols: true,
        defaultExcludeAmbiguous: false,
        defaultAvoidRepeating: false,
        defaultPronounceable: false
      };
      
      // Generate password
      const password = generateRandomPassword(settings);
      
      // Fill the password in the active tab
      chrome.tabs.sendMessage(tab.id, { 
        action: 'fillPassword', 
        password: password 
      });
      
      // Save to history
      savePasswordToHistory(password, 'random');
    });
  }
  
  if (info.menuItemId === 'generatePin') {
    // Get default settings
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {
        defaultPinLength: 6
      };
      
      // Generate PIN
      const pin = generatePin(settings.defaultPinLength, false);
      
      // Fill the PIN in the active tab
      chrome.tabs.sendMessage(tab.id, { 
        action: 'fillPassword', 
        password: pin 
      });
      
      // Save to history
      savePasswordToHistory(pin, 'pin');
    });
  }
});

// Listen for commands (keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'generate_password') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      
      const tab = tabs[0];
      
      // Get default settings
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {
          defaultLength: 16,
          defaultIncludeLowercase: true,
          defaultIncludeUppercase: true,
          defaultIncludeNumbers: true,
          defaultIncludeSymbols: true,
          defaultExcludeAmbiguous: false,
          defaultAvoidRepeating: false,
          defaultPronounceable: false
        };
        
        // Generate password
        const password = generateRandomPassword(settings);
        
        // Fill the password in the active tab
        chrome.tabs.sendMessage(tab.id, { 
          action: 'fillPassword', 
          password: password 
        });
        
        // Save to history
        savePasswordToHistory(password, 'random');
      });
    });
  }
});

// Cryptographically secure randomness helpers
function getSecureRandomInt(max) {
  if (max <= 0) return 0;
  if (max === 1) return 0;
  const uint32Max = 0x100000000;
  const limit = uint32Max - (uint32Max % max);
  const buffer = new Uint32Array(1);
  let rand;
  do {
    crypto.getRandomValues(buffer);
    rand = buffer[0];
  } while (rand >= limit);
  return rand % max;
}

function getSecureRandomFloat() {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 0x100000000;
}

function getSecureRandomItem(items) {
  return items[getSecureRandomInt(items.length)];
}

function secureShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/~",
  ambiguous: "0OIl1|[]{}(),.;:'\"/\\`~",
};

// Random password generation using cryptographic randomness
function generateRandomPassword(options) {
  const { 
    defaultLength: length = 16, 
    defaultIncludeLowercase: includeLowercase = true, 
    defaultIncludeUppercase: includeUppercase = true, 
    defaultIncludeNumbers: includeNumbers = true, 
    defaultIncludeSymbols: includeSymbols = true, 
    defaultExcludeAmbiguous: excludeAmbiguous = false,
    defaultAvoidRepeating: avoidRepeating = false,
    defaultPronounceable: usePronounceable = false
  } = options;
  
  if (usePronounceable) {
    return generatePronounceablePassword(length, includeUppercase, includeNumbers, includeSymbols);
  }
  
  let lowerPool = includeLowercase ? CHARSETS.lowercase : "";
  let upperPool = includeUppercase ? CHARSETS.uppercase : "";
  let numberPool = includeNumbers ? CHARSETS.numbers : "";
  let symbolPool = includeSymbols ? CHARSETS.symbols : "";

  if (excludeAmbiguous) {
    const ambigSet = new Set(CHARSETS.ambiguous);
    lowerPool = lowerPool.split("").filter(c => !ambigSet.has(c)).join("");
    upperPool = upperPool.split("").filter(c => !ambigSet.has(c)).join("");
    numberPool = numberPool.split("").filter(c => !ambigSet.has(c)).join("");
    symbolPool = symbolPool.split("").filter(c => !ambigSet.has(c)).join("");
  }

  const selectedPools = [];
  if (lowerPool) selectedPools.push(lowerPool);
  if (upperPool) selectedPools.push(upperPool);
  if (numberPool) selectedPools.push(numberPool);
  if (symbolPool) selectedPools.push(symbolPool);

  if (selectedPools.length === 0) {
    lowerPool = CHARSETS.lowercase;
    selectedPools.push(lowerPool);
  }

  const fullPool = selectedPools.join("");
  const targetLength = Math.max(8, Math.min(128, length));
  const effectiveLength = avoidRepeating ? Math.min(targetLength, fullPool.length) : targetLength;
  const resultChars = [];
  const usedChars = new Set();

  for (const pool of selectedPools) {
    if (resultChars.length < effectiveLength) {
      let picked;
      let attempts = 0;
      do {
        picked = getSecureRandomItem(pool);
        attempts++;
      } while (avoidRepeating && usedChars.has(picked) && attempts < 50);

      resultChars.push(picked);
      if (avoidRepeating) usedChars.add(picked);
    }
  }

  while (resultChars.length < effectiveLength) {
    let picked;
    let attempts = 0;
    do {
      picked = getSecureRandomItem(fullPool);
      attempts++;
    } while (avoidRepeating && usedChars.has(picked) && attempts < 50);

    resultChars.push(picked);
    if (avoidRepeating) usedChars.add(picked);
  }

  secureShuffle(resultChars);
  return resultChars.join("");
}

// Generate PIN using cryptographic randomness
function generatePin(length, avoidRepeating = false) {
  const digits = CHARSETS.numbers;
  const targetLength = Math.max(4, Math.min(12, length));

  if (avoidRepeating) {
    if (targetLength <= 10) {
      const digitArr = digits.split("");
      secureShuffle(digitArr);
      return digitArr.slice(0, targetLength).join("");
    }
    const result = [];
    let lastDigit = "";
    for (let i = 0; i < targetLength; i++) {
      let nextDigit;
      do {
        nextDigit = getSecureRandomItem(digits);
      } while (nextDigit === lastDigit);
      result.push(nextDigit);
      lastDigit = nextDigit;
    }
    return result.join("");
  }

  const result = [];
  for (let i = 0; i < targetLength; i++) {
    result.push(getSecureRandomItem(digits));
  }
  return result.join("");
}

// Pronounceable password generation using cryptographic randomness
function generatePronounceablePassword(length, includeUppercase = true, includeNumbers = true, includeSymbols = true) {
  const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'];
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const consonantPairs = ['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sh', 'sk', 'sl', 'sp', 'st', 'th', 'tr'];

  const targetLength = Math.max(8, Math.min(128, length));
  let pwd = '';
  while (pwd.length < targetLength) {
    const usePair = getSecureRandomFloat() < 0.25;
    const cons = usePair ? getSecureRandomItem(consonantPairs) : getSecureRandomItem(consonants);
    const vow = getSecureRandomItem(vowels);
    pwd += cons + vow;
  }

  let chars = pwd.slice(0, targetLength).split("");

  if (includeUppercase && chars.length > 0) {
    const pos = getSecureRandomInt(chars.length);
    chars[pos] = chars[pos].toUpperCase();
  }
  
  if (includeNumbers && chars.length > 1) {
    const pos = getSecureRandomInt(chars.length);
    chars[pos] = getSecureRandomItem(CHARSETS.numbers);
  }
  
  if (includeSymbols && chars.length > 2) {
    const pos = getSecureRandomInt(chars.length);
    chars[pos] = getSecureRandomItem(CHARSETS.symbols);
  }
  
  return chars.join("");
}

// Calculate password strength
function calculatePasswordStrength(password) {
  if (!password) return { score: 0, text: 'None' };
  
  let score = 0;
  const length = password.length;
  
  // Length score
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  
  // Character variety score
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Adjust final score
  score = Math.min(Math.floor(score / 2), 4);
  
  const strengthText = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][score];
  return { score, text: strengthText };
}

// Save password to history in storage
function savePasswordToHistory(pwd, type) {
  chrome.storage.local.get(['passwordHistory'], (result) => {
    const history = result.passwordHistory || [];
    
    // Add new password to history
    const newEntry = {
      password: pwd,
      timestamp: new Date().toISOString(),
      strength: calculatePasswordStrength(pwd).text.toLowerCase().replace(' ', '-'),
      type: type
    };
    
    // Limit to 20 entries
    if (history.length >= 20) {
      history.pop();
    }
    
    history.unshift(newEntry);
    
    // Save back to storage
    chrome.storage.local.set({ passwordHistory: history });
  });
}
