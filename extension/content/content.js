// Let the CyberKeyGen website hide its install promotion. No privileged API is exposed.
if (location.origin === 'https://password.karthiklal.in' ||
    (location.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(location.hostname))) {
  document.documentElement.setAttribute('data-cyberkeygen-extension', 'installed');
}

// Content script for CyberShield Password Generator
// This script handles filling passwords into form fields

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillPassword') {
    fillPasswordIntoActiveElement(message.password);
    sendResponse({ success: true });
  }
  return true;
});

// Function to fill the password into the currently focused element
function fillPasswordIntoActiveElement(password) {
  // Get the active element
  const activeElement = document.activeElement;
  
  // Check if the active element is an input field
  if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.isContentEditable
    )) {
    
    // Check if it's a password field, text field, or other input
    if (activeElement.tagName === 'INPUT' && 
        (activeElement.type === 'password' || activeElement.type === 'text' || 
         activeElement.type === 'email' || activeElement.type === '')) {
      // Set the value
      activeElement.value = password;
      
      // Dispatch input event to trigger any listeners on the page
      const inputEvent = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(inputEvent);
      
      // Dispatch change event
      const changeEvent = new Event('change', { bubbles: true });
      activeElement.dispatchEvent(changeEvent);
    } 
    // Handle content editable elements
    else if (activeElement.isContentEditable) {
      // Insert the password as text
      activeElement.textContent = password;
      
      // Dispatch input event
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true
      });
      activeElement.dispatchEvent(inputEvent);
    }
    // Handle textareas
    else if (activeElement.tagName === 'TEXTAREA') {
      activeElement.value = password;
      
      // Dispatch events
      const inputEvent = new Event('input', { bubbles: true });
      activeElement.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true });
      activeElement.dispatchEvent(changeEvent);
    }
  } 
  // If no active element is focused, find password fields on the page
  else {
    // Find password fields first
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    if (passwordFields.length > 0) {
      // Fill the first password field
      const field = passwordFields[0];
      field.value = password;
      
      // Dispatch events
      const inputEvent = new Event('input', { bubbles: true });
      field.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true });
      field.dispatchEvent(changeEvent);
      
      // Focus the field
      field.focus();
    } else {
      // If no password field, look for any text input that might be a password field
      const possiblePasswordFields = Array.from(document.querySelectorAll('input[type="text"]'))
        .filter(field => {
          const name = field.name.toLowerCase();
          const id = field.id.toLowerCase();
          const placeholder = field.placeholder.toLowerCase();
          
          return name.includes('pass') || id.includes('pass') || placeholder.includes('pass');
        });
      
      if (possiblePasswordFields.length > 0) {
        const field = possiblePasswordFields[0];
        field.value = password;
        
        // Dispatch events
        const inputEvent = new Event('input', { bubbles: true });
        field.dispatchEvent(inputEvent);
        
        const changeEvent = new Event('change', { bubbles: true });
        field.dispatchEvent(changeEvent);
        
        // Focus the field
        field.focus();
      }
    }
  }
}
