(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Année du pied de page */
  var year = document.getElementById('annee');
  if (year) year.textContent = new Date().getFullYear();

  /* Apparition au défilement (sans animation si mouvement réduit) */
  var revealTargets = document.querySelectorAll('.reveal, .timeline');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Dock : met en évidence la section visible */
  var dockLinks = document.querySelectorAll('.dock a[data-section]');
  var sections = Array.prototype.map.call(dockLinks, function (a) {
    return document.getElementById(a.getAttribute('data-section'));
  }).filter(Boolean);

  function setActive(id) {
    dockLinks.forEach(function (a) {
      var on = a.getAttribute('data-section') === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }
  setActive('accueil');

  /* Images de projet absentes : on affiche l'emplacement [IMAGE_PROJET] */
  function handleMissing(img) {
    var main = img.closest('.project-main');
    var thumb = img.closest('.thumb');
    if (main) main.classList.add('is-empty');
    if (thumb) thumb.classList.add('is-empty');
  }
  document.querySelectorAll('img.project-img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) handleMissing(img);
    img.addEventListener('error', function () { handleMissing(img); });
  });

  /* Agrandissement des aperçus (élément <dialog> natif) */
  var box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    var boxImg = box.querySelector('img');
    var boxCap = box.querySelector('figcaption');
    var lastFocus = null;

    function openBox(src, caption, alt) {
      lastFocus = document.activeElement;
      boxImg.src = src;
      boxImg.alt = alt || caption || '';
      boxCap.textContent = caption || '';
      box.showModal();
    }

    document.querySelectorAll('.thumb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        openBox(btn.getAttribute('data-full'), btn.getAttribute('data-caption'), img ? img.alt : '');
      });
    });

    document.querySelectorAll('.project-main img').forEach(function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () { openBox(img.src, img.alt, img.alt); });
    });

    box.querySelector('.lightbox-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
  }
})();


/* Menu principal animé et accessible */
(function () {
  'use strict';
  var menu = document.getElementById('site-menu');
  var toggle = document.querySelector('.menu-toggle');
  var close = document.querySelector('.menu-close');
  var backdrop = document.querySelector('.menu-backdrop');
  if (!menu || !toggle || !close || !backdrop) return;
  var previousFocus = null;
  function openMenu() {
    previousFocus = document.activeElement;
    backdrop.hidden = false;
    document.body.classList.add('menu-open');
    requestAnimationFrame(function () { backdrop.classList.add('is-visible'); menu.classList.add('is-open'); });
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    close.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    window.setTimeout(function () { backdrop.hidden = true; }, 330);
    if (previousFocus) previousFocus.focus();
  }
  toggle.addEventListener('click', function () {
    toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  close.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu();
  });
})();
