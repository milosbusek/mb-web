/* Basic consent mode: no Google request until analytics is explicitly accepted. */
(function () {
  'use strict';
  const ID = 'G-11TC9JGK9T';
  const KEY = 'mb-analytics-consent-v1';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  let choice = null;
  let loaded = false;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && ['granted', 'denied'].includes(saved.value) &&
        saved.at <= Date.now() && Date.now() - saved.at < MAX_AGE) choice = saved.value;
  } catch (_) { /* Storage unavailable: require a choice for this page. */ }
  window['ga-disable-' + ID] = choice !== 'granted';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  function start() {
    window['ga-disable-' + ID] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    window.gtag('config', ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 15552000,
      page_location: location.origin + location.pathname,
      page_referrer: document.referrer.split('?')[0].split('#')[0]
    });
    window.gtag('event', 'page_view', {
      page_location: location.origin + location.pathname,
      page_title: document.title,
      page_referrer: document.referrer.split('?')[0].split('#')[0]
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }
  function clearCookies() {
    const domains = ['', location.hostname, '.' + location.hostname, 'milosbusek.cz', '.milosbusek.cz'];
    document.cookie.split(';').forEach(function (entry) {
      const name = entry.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/;' + (domain ? ' domain=' + domain + ';' : '') + ' SameSite=Lax; Secure';
      });
    });
  }
  function init() {
    const panel = document.createElement('section');
    panel.id = 'mb-consent';
    panel.setAttribute('aria-labelledby', 'mb-consent-title');
    panel.innerHTML = '<h2 id="mb-consent-title">Měření návštěvnosti</h2>' +
      '<p>S vaším souhlasem používáme Google Analytics, abychom zjistili, které stránky vám pomáhají. Bez souhlasu se analytika nenačte. Web i poptávkový formulář fungují při obou volbách.</p>' +
      '<details><summary>Podrobnosti o měření</summary><p>Správcem webu je Miloš Bušek, Luční 659, 345 06 Kdyně, <a href="mailto:milosbusek@gmail.com">milosbusek@gmail.com</a>. Po povolení se společnosti Google předávají údaje o navštívené stránce, zařízení a interakci s webem. Google při spojení zpracovává také IP adresu; GA4 ji neukládá. Analytické cookies _ga a _ga_* rozlišují návštěvy a mohou být uloženy až 6 měsíců. Reklamní personalizaci zde nepovolujeme.</p><p>Vaši volbu si pamatujeme v tomto prohlížeči 180 dní. Souhlas můžete kdykoli změnit nebo odvolat tlačítkem „Nastavení cookies“ v patičce. Odmítnutí nebo odvolání zastaví další měření na tomto webu. <a href="https://policies.google.com/technologies/partner-sites?hl=cs" target="_blank" rel="noopener noreferrer">Jak Google používá údaje z webů</a>.</p></details>' +
      '<div class="mb-consent-actions"><button type="button" data-choice="denied">Odmítnout</button><button type="button" data-choice="granted">Povolit analytiku</button></div>';
    panel.hidden = choice !== null;
    document.body.appendChild(panel);
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'mb-cookie-settings';
    settings.textContent = 'Nastavení cookies';
    settings.setAttribute('aria-controls', 'mb-consent');
    const footer = document.querySelector('footer') || document.body;
    footer.appendChild(settings);
    let returnFocus = null;
    settings.addEventListener('click', function () {
      returnFocus = settings;
      panel.hidden = false;
      panel.querySelector('button').focus();
    });
    panel.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-choice]');
      if (!button) return;
      const previous = choice;
      choice = button.dataset.choice;
      try { localStorage.setItem(KEY, JSON.stringify({value: choice, at: Date.now()})); } catch (_) {}
      panel.hidden = true;
      if (choice === 'granted') start();
      else {
        window['ga-disable-' + ID] = true;
        clearCookies();
        // Unload the Google library as well, including any enhanced measurement listeners.
        if (previous === 'granted' || loaded) { location.reload(); return; }
      }
      if (returnFocus) returnFocus.focus();
    });
    // A decision in a second tab applies to this tab as well.
    window.addEventListener('storage', function (event) {
      if (event.key === KEY) {
        window['ga-disable-' + ID] = true;
        location.reload();
      }
    });
    if (choice === 'granted') start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
