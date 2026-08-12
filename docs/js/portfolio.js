// Portfolio interaction and language-switching controller
$(document).ready(function() {
  // Move language switcher to body root to prevent Skel transforms from hiding/shifting it
  $('body').append($('#langSwitcher'));

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

    // GA4 Tracking for language dropdown toggle
    if (typeof gtag === 'function') {
      gtag('event', 'language_dropdown_toggle', {
        action: $('#langDropdown').hasClass('show') ? 'open' : 'close',
        current_language: currentLang
      });
    }
  });

  $('.lang-btn').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const targetLang = $(this).data('lang');
    if (supportedLanguages.includes(targetLang) && targetLang !== currentLang) {
      // GA4 Tracking for language change
      if (typeof gtag === 'function') {
        gtag('event', 'change_language', {
          from_language: currentLang,
          to_language: targetLang,
          event_label: `Language switched to ${targetLang}`
        });
      }
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

  // --- GA4 Semantic Click & Interaction Tracking ---
  $(document).on('click', 'a, button, .impact-card, .tech-badge', function() {
    const $el = $(this);
    const href = $el.attr('href') || '';
    const id = $el.attr('id') || '';
    const text = $el.text().trim();
    const classes = $el.attr('class') || '';

    // Skip language selector clicks as they are explicitly handled
    if ($el.closest('#langSwitcher').length || $el.hasClass('lang-btn') || $el.attr('id') === 'langTrigger') {
      return;
    }

    let interactionType = 'general_click';
    let label = text || id || href || 'unknown';

    // 1. Navigation Menu Clicks
    if ($el.closest('#nav').length) {
      interactionType = 'navigation';
      label = `Nav: ${text}`;
    }
    // 2. Social / Contact Icons & Links
    else if ($el.closest('.icons').length || href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('g.dev') || href.includes('linkedin.com') || href.includes('github.com')) {
      interactionType = 'contact';
      if (href.startsWith('mailto:')) {
        label = 'Contact: Email';
      } else if (href.startsWith('tel:')) {
        label = 'Contact: Phone';
      } else if (href.includes('linkedin.com')) {
        label = 'Social: LinkedIn';
      } else if (href.includes('github.com')) {
        label = 'Social: GitHub';
      } else if (href.includes('stackoverflow.com')) {
        label = 'Social: StackOverflow';
      } else if (href.includes('g.dev')) {
        label = 'Social: GoogleDev';
      }
    }
    // 3. CV / PDF Downloads
    else if (href.toLowerCase().includes('.pdf') || classes.includes('fa-file-pdf-o')) {
      interactionType = 'download';
      label = `Download: ${href.split('/').pop()}`;
    }
    // 4. Portfolio Projects / Contributions
    else if ($el.closest('.features').length || $el.closest('#Contrib').length) {
      interactionType = 'portfolio_project';
      label = `Project: ${text || href}`;
    }
    // 5. Tech stack tags
    else if ($el.hasClass('tech-badge')) {
      interactionType = 'tech_badge';
      label = `Tech Badge: ${text}`;
    }
    // 6. Impact cards
    else if ($el.hasClass('impact-card')) {
      interactionType = 'impact_card';
      label = `Impact Card: ${$el.find('h4').text().trim()}`;
    }
    // 7. Outbound links
    else if (href.startsWith('http') && !href.includes(window.location.hostname)) {
      interactionType = 'external_link';
      label = `Outbound: ${href}`;
    }

    if (typeof gtag === 'function') {
      gtag('event', 'click_interaction', {
        interaction_type: interactionType,
        element_text: text,
        element_href: href,
        element_id: id,
        element_classes: classes,
        event_label: label
      });
    }
  });
});
