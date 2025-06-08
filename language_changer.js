// Translation cache
let translations = {};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize with saved language or browser preference
  const defaultLang = navigator.language.split('-')[0] || 'en';
  const savedLang = localStorage.getItem('siteLanguage') || defaultLang;
  
  // Wait a brief moment to ensure all elements are loaded
  setTimeout(() => changeLanguage(savedLang), 50);
  
  // Dropdown event listeners
  document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      changeLanguage(lang);
    });
  });
});

async function changeLanguage(lang) {
  try {
    // Only load if not cached or if we need to force reload
    if (!translations[lang]) {
      const response = await fetch(`translations/${lang}.json`);
      if (!response.ok) throw new Error('Translation not found');
      translations[lang] = await response.json();
    }
    
    // Apply translations safely
    safeApplyTranslations(translations[lang]);
    
    // Update UI elements if they exist
    const languageDisplay = document.getElementById('currentLanguage');
    if (languageDisplay) {
      languageDisplay.textContent = translations[lang]['language_name'];
    }
    
    // Save preference
    localStorage.setItem('siteLanguage', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fallback to English if preferred language fails
    if (lang !== 'en') changeLanguage('en');
  }
}

function safeApplyTranslations(translation) {
  // Safely update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translation[key]) {
      try {
        element.textContent = translation[key];
        
        if (element.placeholder) {
          element.placeholder = translation[key];
        }
        
        if (element.alt) {
          element.alt = translation[key];
        }
      } catch (e) {
        console.warn(`Failed to update element for key ${key}`, e);
      }
    }
  });
  
  // Update title if needed
  if (translation['page_title']) {
    document.title = translation['page_title'];
  }
}

// Ensure language persists across page loads
window.addEventListener('beforeunload', function() {
  if (localStorage.getItem('siteLanguage')) {
    // Small delay to ensure language is saved before navigation
    setTimeout(() => {}, 10);
  }
});