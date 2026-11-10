// Let the CyberKeyGen website hide its install promotion. No privileged API is exposed.
if (location.origin === 'https://password.karthiklal.in' ||
    (location.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(location.hostname))) {
  document.documentElement.setAttribute('data-cyberkeygen-extension', 'installed');
}

// Content script for CyberKeyGen Password Generator
// Handles autofilling passwords into web forms

function setFieldValue(field, value) {
  if (!field) return;

  if (field.isContentEditable) {
    field.focus();
    field.textContent = value;
    field.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    return;
  }

  // Use native prototype setter so frameworks (React, Angular, Vue) register the state change
  const prototype = field instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  field.focus();
  if (setter) {
    setter.call(field, value);
  } else {
    field.value = value;
  }

  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function isElementVisible(el) {
  if (!el || el.disabled || el.readOnly) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  return el.offsetWidth > 0 && el.offsetHeight > 0;
}

// Function to fill the password into active element or detected password fields
function fillPasswordIntoActiveElement(password) {
  if (!password) {
    return { success: false, reason: 'empty_password' };
  }

  const activeElement = document.activeElement;
  let filledCount = 0;

  // 1. Check if the active element is directly an editable field
  if (activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.isContentEditable
  )) {
    setFieldValue(activeElement, password);
    filledCount++;

    // If this was a password input inside a form, also fill confirmation field if present
    if (activeElement.tagName === 'INPUT' && activeElement.type === 'password' && activeElement.form) {
      const siblingPasswords = Array.from(activeElement.form.querySelectorAll('input[type="password"]'))
        .filter(el => el !== activeElement && isElementVisible(el));
      
      for (const sibling of siblingPasswords) {
        setFieldValue(sibling, password);
        filledCount++;
      }
    }

    return { success: true, count: filledCount };
  }

  // 2. If no focused input, search for visible password fields on the page
  const visiblePasswordFields = Array.from(document.querySelectorAll('input[type="password"]'))
    .filter(isElementVisible);

  if (visiblePasswordFields.length > 0) {
    // Fill up to 2 password fields (e.g. password + confirm password in the same form)
    const primary = visiblePasswordFields[0];
    setFieldValue(primary, password);
    filledCount++;

    const form = primary.form;
    const related = visiblePasswordFields.filter(el => el !== primary && (!form || el.form === form));
    for (const field of related.slice(0, 1)) {
      setFieldValue(field, password);
      filledCount++;
    }

    primary.focus();
    return { success: true, count: filledCount };
  }

  // 3. Fallback: Search for inputs with password indicators in attributes
  const possibleFields = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'))
    .filter(isElementVisible)
    .filter(field => {
      const name = (field.name || '').toLowerCase();
      const id = (field.id || '').toLowerCase();
      const placeholder = (field.placeholder || '').toLowerCase();
      const autocomplete = (field.autocomplete || '').toLowerCase();
      const aria = (field.getAttribute('aria-label') || '').toLowerCase();
      return name.includes('pass') || id.includes('pass') || placeholder.includes('pass') ||
             autocomplete.includes('password') || aria.includes('pass');
    });

  if (possibleFields.length > 0) {
    const field = possibleFields[0];
    setFieldValue(field, password);
    field.focus();
    return { success: true, count: 1 };
  }

  return { success: false, reason: 'no_input_found' };
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillPassword') {
    const result = fillPasswordIntoActiveElement(message.password);
    sendResponse(result);
  }
  return true;
});
