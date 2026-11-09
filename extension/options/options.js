// Options page for CyberShield Password Generator Extension

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initializeTheme();

  // Initialize website-style custom selects and steppers
  initCustomSelects();
  initSteppers();
  
  // Load saved settings
  loadSettings();
  
  // Load password history
  loadPasswordHistory();
  
  // Load favorites
  loadPasswordFavorites();
  
  // Set up event listeners
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  document.getElementById('resetButton').addEventListener('click', resetToDefaults);
  document.getElementById('clearHistory').addEventListener('click', clearHistory);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Set up author link
  const authorLink = document.getElementById('authorLink');
  if (authorLink) {
    authorLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://karthiklal.in/' });
    });
  }
});

// Custom Dropdown (Select) Logic
function initCustomSelects() {
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
      // Close other dropdowns
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

        // Update native select
        nativeSelect.value = val;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Update trigger display
        if (valueDisplay) valueDisplay.textContent = text;

        // Update selected state
        options.forEach(o => {
          o.classList.toggle('selected', o === opt);
          o.setAttribute('aria-selected', o === opt ? 'true' : 'false');
        });

        // Close dropdown
        dropdown.classList.remove('open');
        trigger.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.custom-select-dropdown.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.custom-select-trigger.open').forEach(t => {
    t.classList.remove('open');
    t.setAttribute('aria-expanded', 'false');
  });
}

function updateCustomSelectUI(wrapperId, val) {
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
}

// Stepper Number Input Logic
function initSteppers() {
  document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || 256;
      let val = parseInt(input.value) || min;

      if (btn.classList.contains('stepper-inc')) {
        val = Math.min(max, val + 1);
      } else {
        val = Math.max(min, val - 1);
      }

      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

// Theme handling
function initializeTheme() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['theme'], (result) => {
      let isDark = true; // Default to dark theme like website
      if (result && result.theme === 'light') {
        document.body.classList.remove('dark');
        isDark = false;
      } else {
        document.body.classList.add('dark');
        isDark = true;
      }
      updateThemeIcons(isDark);
    });
  } else {
    document.body.classList.add('dark');
    updateThemeIcons(true);
  }
}

function updateThemeIcons(isDark) {
  const headerIcon = document.getElementById('headerIcon');
  if (headerIcon && headerIcon.tagName === 'IMG') {
    if (isDark) {
      headerIcon.src = headerIcon.getAttribute('data-dark-icon');
    } else {
      headerIcon.src = headerIcon.getAttribute('data-light-icon');
    }
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDarkNow = document.body.classList.contains('dark');
  updateThemeIcons(isDarkNow);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ 
      theme: isDarkNow ? 'dark' : 'light' 
    });
  }
}

// Load settings from storage
function loadSettings() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    return;
  }

  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {
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
    };
    
    // Set form values
    const defaultTabSelect = document.getElementById('defaultTab');
    if (defaultTabSelect) {
      defaultTabSelect.value = settings.defaultTab;
      updateCustomSelectUI('defaultTabWrapper', settings.defaultTab);
    }

    const defaultLengthInput = document.getElementById('defaultLength');
    if (defaultLengthInput) defaultLengthInput.value = settings.defaultLength;

    const defaultPinLengthInput = document.getElementById('defaultPinLength');
    if (defaultPinLengthInput) defaultPinLengthInput.value = settings.defaultPinLength;

    if (document.getElementById('defaultIncludeLowercase')) {
      document.getElementById('defaultIncludeLowercase').checked = settings.defaultIncludeLowercase;
    }
    if (document.getElementById('defaultIncludeUppercase')) {
      document.getElementById('defaultIncludeUppercase').checked = settings.defaultIncludeUppercase;
    }
    if (document.getElementById('defaultIncludeNumbers')) {
      document.getElementById('defaultIncludeNumbers').checked = settings.defaultIncludeNumbers;
    }
    if (document.getElementById('defaultIncludeSymbols')) {
      document.getElementById('defaultIncludeSymbols').checked = settings.defaultIncludeSymbols;
    }
    if (document.getElementById('defaultExcludeAmbiguous')) {
      document.getElementById('defaultExcludeAmbiguous').checked = settings.defaultExcludeAmbiguous;
    }
    if (document.getElementById('defaultAvoidRepeating')) {
      document.getElementById('defaultAvoidRepeating').checked = settings.defaultAvoidRepeating;
    }
    if (document.getElementById('defaultPronounceable')) {
      document.getElementById('defaultPronounceable').checked = settings.defaultPronounceable;
    }
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    defaultTab: document.getElementById('defaultTab').value,
    defaultLength: parseInt(document.getElementById('defaultLength').value) || 16,
    defaultPinLength: parseInt(document.getElementById('defaultPinLength').value) || 6,
    defaultIncludeLowercase: document.getElementById('defaultIncludeLowercase').checked,
    defaultIncludeUppercase: document.getElementById('defaultIncludeUppercase').checked,
    defaultIncludeNumbers: document.getElementById('defaultIncludeNumbers').checked,
    defaultIncludeSymbols: document.getElementById('defaultIncludeSymbols').checked,
    defaultExcludeAmbiguous: document.getElementById('defaultExcludeAmbiguous').checked,
    defaultAvoidRepeating: document.getElementById('defaultAvoidRepeating').checked,
    defaultPronounceable: document.getElementById('defaultPronounceable').checked
  };
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ settings }, () => {
      showToast('Settings saved successfully');
    });
  } else {
    showToast('Settings saved');
  }
}

// Reset settings to defaults
function resetToDefaults() {
  const defaultSettings = {
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
  };
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ settings: defaultSettings }, () => {
      loadSettings();
      showToast('Settings reset to defaults');
    });
  } else {
    showToast('Settings reset to defaults');
  }
}

// Clear password history
function clearHistory() {
  if (confirm('Are you sure you want to clear your password history?')) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ passwordHistory: [] }, () => {
        loadPasswordHistory();
        showToast('Password history cleared');
      });
    }
  }
}

// Load password history
function loadPasswordHistory() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get(['passwordHistory'], (result) => {
    const history = result.passwordHistory || [];
    const tableBody = document.getElementById('historyTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (history.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: var(--muted-foreground); padding: 24px;">
          No password history found.
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }
    
    history.forEach((entry, index) => {
      const row = document.createElement('tr');
      const date = new Date(entry.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      let strengthClass = 'strength-moderate';
      if (entry.strength === 'weak') strengthClass = 'strength-weak';
      if (entry.strength === 'strong') strengthClass = 'strength-strong';
      if (entry.strength === 'very-strong') strengthClass = 'strength-very-strong';
      
      const typeMap = {
        'random': 'Random',
        'leet': 'Pattern',
        'pin': 'PIN'
      };
      
      row.innerHTML = `
        <td class="password-cell">${escapeHtml(entry.password)}</td>
        <td>${formattedDate}</td>
        <td>${typeMap[entry.type] || entry.type}</td>
        <td><span class="strength-indicator ${strengthClass}"></span>${entry.strength ? entry.strength.replace('-', ' ') : 'N/A'}</td>
        <td class="actions-cell">
          <button class="action-button copy-button" data-password="${escapeHtml(entry.password)}" title="Copy Password" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-button favorite-button" data-index="${index}" title="Add to Favorites" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="action-button delete-button" data-index="${index}" title="Remove from History" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    
    tableBody.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const password = e.currentTarget.getAttribute('data-password');
        navigator.clipboard.writeText(password).then(() => {
          showToast('Password copied to clipboard');
        });
      });
    });
    
    tableBody.querySelectorAll('.favorite-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        addToFavorites(history[index]);
      });
    });
    
    tableBody.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        removeFromHistory(index);
      });
    });
  });
}

function addToFavorites(entry) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get(['passwordFavorites'], (result) => {
    const favorites = result.passwordFavorites || [];
    const exists = favorites.some(fav => fav.password === entry.password);
    
    if (!exists) {
      favorites.unshift(entry);
      if (favorites.length > 20) favorites.pop();
      chrome.storage.local.set({ passwordFavorites: favorites }, () => {
        loadPasswordFavorites();
        showToast('Added to favorites');
      });
    } else {
      showToast('Already in favorites');
    }
  });
}

function loadPasswordFavorites() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get(['passwordFavorites'], (result) => {
    const favorites = result.passwordFavorites || [];
    const tableBody = document.getElementById('favoritesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (favorites.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: var(--muted-foreground); padding: 24px;">
          No favorites yet. Add passwords from your history.
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }
    
    favorites.forEach((entry, index) => {
      const row = document.createElement('tr');
      const date = new Date(entry.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      let strengthClass = 'strength-moderate';
      if (entry.strength === 'weak') strengthClass = 'strength-weak';
      if (entry.strength === 'strong') strengthClass = 'strength-strong';
      if (entry.strength === 'very-strong') strengthClass = 'strength-very-strong';
      
      const typeMap = {
        'random': 'Random',
        'leet': 'Pattern',
        'pin': 'PIN'
      };
      
      row.innerHTML = `
        <td class="password-cell">${escapeHtml(entry.password)}</td>
        <td>${formattedDate}</td>
        <td>${typeMap[entry.type] || entry.type}</td>
        <td><span class="strength-indicator ${strengthClass}"></span>${entry.strength ? entry.strength.replace('-', ' ') : 'N/A'}</td>
        <td class="actions-cell">
          <button class="action-button copy-button" data-password="${escapeHtml(entry.password)}" title="Copy Password" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-button delete-favorite-button" data-index="${index}" title="Remove from Favorites" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    
    tableBody.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const password = e.currentTarget.getAttribute('data-password');
        navigator.clipboard.writeText(password).then(() => {
          showToast('Password copied to clipboard');
        });
      });
    });
    
    tableBody.querySelectorAll('.delete-favorite-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        removeFromFavorites(index);
      });
    });
  });
}

function removeFromHistory(index) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get(['passwordHistory'], (result) => {
    const history = result.passwordHistory || [];
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
      chrome.storage.local.set({ passwordHistory: history }, () => {
        loadPasswordHistory();
        showToast('Removed from history');
      });
    }
  });
}

function removeFromFavorites(index) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get(['passwordFavorites'], (result) => {
    const favorites = result.passwordFavorites || [];
    if (index >= 0 && index < favorites.length) {
      favorites.splice(index, 1);
      chrome.storage.local.set({ passwordFavorites: favorites }, () => {
        loadPasswordFavorites();
        showToast('Removed from favorites');
      });
    }
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
