/* TCS mobile navigation.
   Full-viewport opaque overlay (homepage OTP target) for pages without their own menu. */
(function () {
  'use strict';

  var BREAKPOINT = 820;

  var CANONICAL = [
    { href: '/#how', label: 'How it works' },
    { href: '/#proof', label: 'Proof' },
    { href: '/about.html', label: 'About' },
    { href: '/blog.html', label: 'Blog' },
    { href: '/faq.html', label: 'FAQ' }
  ];

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function init() {
    if (document.getElementById('tcs-mobile-menu')) return;
    if (document.getElementById('mobile-menu')) return;

    var navs = document.getElementsByTagName('nav');
    for (var i = 0; i < navs.length; i++) {
      var nav = navs[i];
      if (nav.querySelector('.tcs-nav-toggle')) return;
      if (nav.querySelector('.hamburger, .nav-hamburger, .menu-toggle, .nav-toggle')) return;

      var ul = nav.querySelector('ul.links, ul.nav-links, ul');
      if (!ul || !ul.parentNode) continue;
      if (ul.getElementsByTagName('a').length < 2) continue;

      var host = ul.parentNode;
      nav.className += (nav.className ? ' ' : '') + 'tcs-nav-root';
      host.className += (host.className ? ' ' : '') + 'tcs-nav-host';
      ul.className += (ul.className ? ' ' : '') + 'tcs-nav-panel';
      if (!ul.id) ul.id = 'tcs-primary-nav';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tcs-nav-toggle';
      btn.id = 'tcs-nav-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'tcs-mobile-menu');
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = '<span></span><span></span><span></span>';
      host.insertBefore(btn, ul);

      var overlay = document.createElement('div');
      overlay.className = 'tcs-mobile-menu';
      overlay.id = 'tcs-mobile-menu';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Site menu');
      overlay.hidden = true;

      var top = document.createElement('div');
      top.className = 'tcs-mobile-menu-top';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'tcs-mobile-menu-close';
      closeBtn.id = 'tcs-mobile-menu-close';
      closeBtn.setAttribute('aria-label', 'Close menu');
      closeBtn.innerHTML = '&times;';
      top.appendChild(closeBtn);
      overlay.appendChild(top);

      var menuNav = document.createElement('nav');
      menuNav.className = 'tcs-mobile-menu-nav';
      menuNav.setAttribute('aria-label', 'Mobile navigation');

      for (var j = 0; j < CANONICAL.length; j++) {
        var item = CANONICAL[j];
        var a = document.createElement('a');
        a.className = 'tcs-mobile-menu-link';
        a.href = item.href;
        a.innerHTML = '<span class="n">' + pad(j + 1) + '</span><span>' + item.label + '</span>';
        menuNav.appendChild(a);
      }

      var cta = document.createElement('a');
      cta.className = 'tcs-mobile-menu-cta';
      cta.href = '/fit-call';
      cta.textContent = 'Book a Fit Call';
      menuNav.appendChild(cta);
      overlay.appendChild(menuNav);

      var legal = document.createElement('div');
      legal.className = 'tcs-mobile-menu-legal';
      legal.innerHTML =
        '<a href="/terms">Terms</a><span class="sep">·</span><a href="/privacy">Privacy</a>';
      overlay.appendChild(legal);

      document.body.appendChild(overlay);
      bind(nav, btn, overlay, closeBtn);
      return;
    }
  }

  function bind(nav, btn, overlay, closeBtn) {
    var hideTimer = null;
    function setOpen(open) {
      if (open) {
        if (nav.className.indexOf('tcs-nav-open') === -1) nav.className += ' tcs-nav-open';
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        overlay.hidden = false;
        /* MENU_MOTION_LOCK: two frames so display lands before the fade. */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { overlay.classList.add('open'); });
        });
        document.body.classList.add('tcs-menu-open');
      } else {
        nav.className = nav.className.replace(/\s*tcs-nav-open\b/g, '');
        overlay.classList.remove('open');
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
          hideTimer = null;
          if (!overlay.classList.contains('open')) overlay.hidden = true;
        }, 340);
        document.body.classList.remove('tcs-menu-open');
      }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    function isOpen() {
      return overlay.classList.contains('open') || !overlay.hidden && hideTimer === null && overlay.classList.contains('open');
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
    });

    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(false);
    });

    overlay.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el !== overlay) {
        if (el.tagName === 'A') {
          setOpen(false);
          return;
        }
        el = el.parentNode;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) setOpen(false);
    });

    var t = null;
    window.addEventListener('resize', function () {
      if (t) clearTimeout(t);
      t = setTimeout(function () {
        if (window.innerWidth > BREAKPOINT) setOpen(false);
      }, 120);
    });
  }

  /* Scrolled nav state (homepage runs its own; toggling twice is harmless). */
  function initScrolled() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 32);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function boot() {
    init();
    initScrolled();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
