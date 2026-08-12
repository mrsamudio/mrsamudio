// Portfolio interaction and language-switching controller
$(document).ready(function() {
  const supportedLanguages = ['es', 'en', 'de', 'pt', 'fr'];
  const defaultLang = 'en';

  // Determine initial language
  let currentLang = localStorage.getItem('portfolio_lang');

  if (!currentLang) {
    // Detect from browser language
    const browserLang = (navigator.language || navigator.userLanguage || '').substring(0, 2).toLowerCase();
    currentLang = supportedLanguages.includes(browserLang) ? browserLang : defaultLang;
  }

  // Define transition property for smooth opacity change
  $('#main').css('transition', 'opacity 0.2s ease-in-out');

  // Set initial language
  setLanguage(currentLang, true);

  // Switcher Click Event Handlers
  $('#langTrigger').on('click', function(e) {
    e.stopPropagation();
    $('#langDropdown').toggleClass('show');
    $(this).toggleClass('active');
  });

  $('.lang-btn').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const targetLang = $(this).data('lang');
    if (supportedLanguages.includes(targetLang) && targetLang !== currentLang) {
      setLanguage(targetLang);
    }
    $('#langDropdown').removeClass('show');
    $('#langTrigger').removeClass('active');
  });

  // Close dropdown when clicking outside
  $(document).on('click', function() {
    $('#langDropdown').removeClass('show');
    $('#langTrigger').removeClass('active');
  });

  // Translation Function
  function setLanguage(lang, isInitial = false) {
    const dict = window.portfolioTranslations[lang] || window.portfolioTranslations[defaultLang];
    currentLang = lang;
    localStorage.setItem('portfolio_lang', lang);
    document.documentElement.lang = lang;

    // Apply smooth transition (skip on page load)
    if (!isInitial) {
      $('#main').css('opacity', '0.1');
      setTimeout(applyTranslations, 200);
    } else {
      applyTranslations();
    }

    function applyTranslations() {
      // 1. Text elements
      $('[data-i18n]').each(function() {
        const key = $(this).attr('data-i18n');
        if (dict[key] !== undefined) {
          $(this).text(dict[key]);
        }
      });

      // 2. HTML elements
      $('[data-i18n-html]').each(function() {
        const key = $(this).attr('data-i18n-html');
        if (dict[key] !== undefined) {
          $(this).html(dict[key]);
        }
      });

      // 3. Document Title
      if (dict.meta_title) {
        document.title = dict.meta_title;
      }

      // 4. Update language switcher UI labels & flags
      $('#activeLangText').text(lang.toUpperCase());
      $('.lang-btn').removeClass('active');
      $(`.lang-btn[data-lang="${lang}"]`).addClass('active');

      // Update the main trigger flag emoji or custom styling if required
      const flagMap = { es: '🇪🇸', en: '🇬🇧', de: '🇩🇪', pt: '🇵🇹', fr: '🇫🇷' };
      $('#activeLangFlag').text(flagMap[lang] || '🌐');

      // Fade back in
      if (!isInitial) {
        $('#main').css('opacity', '1');
      }
    }
  }
});
