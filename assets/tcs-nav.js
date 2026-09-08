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

  /* CHAR_SLIDE_LOCK: split a link label into characters with the
     text-shadow double so hover slides the copy up (Own the Patch hover).
     Exposed as window.tcsChars(root) so other modules can reuse it. */
  function wrapChars(el) {
    if (el.getAttribute('data-chars-done')) return;
    var text = el.textContent;
    el.textContent = '';
    el.className += (el.className ? ' ' : '') + 'tcs-chars';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.textContent = text.charAt(i);
      span.style.transitionDelay = (i * 0.012) + 's';
      if (text.charAt(i) === ' ') span.style.whiteSpace = 'pre';
      el.appendChild(span);
    }
    el.setAttribute('data-chars-done', '1');
  }

  function tcsChars(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-chars]');
    for (var i = 0; i < nodes.length; i++) wrapChars(nodes[i]);
  }
  window.tcsChars = tcsChars;

  /* Links styled as buttons (class hints or a painted background) must not
     get the character slide: the shadow copy shows inside their padding. */
  function isButtonLike(el) {
    if (/\b(btn|button|cta)\b|-cta|-btn/i.test(el.className)) return true;
    var bg = window.getComputedStyle(el).backgroundColor;
    return !!bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)';
  }

  function initChars() {
    // Desktop nav text links (not the CTA button) and mobile menu labels.
    var sel = '.nav-links a:not(.nav-cta), .mobile-menu-link > span:last-child, .tcs-mobile-menu-link > span:last-child';
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.children.length) continue; // only plain-text labels
      if (isButtonLike(n)) continue;    // filled CTAs keep their label intact
      n.setAttribute('data-chars', '');
    }
    tcsChars(document);
  }

  /* WORDMARK_EVERYWHERE_LOCK: the stacked wordmark (same as the homepage
     rail) replaces the PNG in every page's top bar. Inline SVG text renders
     in Barlow Condensed. Exposed as window.tcsWordmarkSVG for rail.js. */
  var WORDMARK = '<svg class="tcs-wordmark" viewBox="0 0 260 80" role="img" aria-label="Telecom Contractor Solutions" focusable="false"><line x1="18" y1="78" x2="18" y2="20" stroke="#2A8EFF" stroke-width="4" stroke-linecap="round"/><line x1="21" y1="66" x2="36" y2="66" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.30"/><line x1="21" y1="54" x2="34" y2="54" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.48"/><line x1="21" y1="43" x2="36" y2="43" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/><line x1="21" y1="32" x2="33" y2="32" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.82"/><polygon points="10,20 18,4 26,20" fill="#F26419"/><text x="52" y="28" class="tcs-wm-l1">TELECOM</text><text x="52" y="54" class="tcs-wm-l2">CONTRACTOR</text><text x="52" y="78" class="tcs-wm-l3">SOLUTIONS</text></svg>';
  window.tcsWordmarkSVG = WORDMARK;

  function initLogo() {
    var link = document.querySelector('nav .nav-logo, nav a.logo, nav .logo');
    if (!link || link.querySelector('.tcs-wordmark')) return;
    link.innerHTML = WORDMARK;
    link.className += (link.className ? ' ' : '') + 'tcs-wordmark-link';
    if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', 'Telecom Contractor Solutions, home');
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

  /* BUTTON_SWEEP_LOCK: a fill layer sweeps in from the edge the cursor
     entered and leaves toward the edge it exited (Own the Patch directional
     hover, TCS tokens). Pointer devices only; CSS handles the motion. */
  function nearestEdge(e, r) {
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    var d = [x, r.width - x, y, r.height - y];
    var i = d.indexOf(Math.min.apply(null, d));
    return ['left', 'right', 'top', 'bottom'][i];
  }

  function initSweep() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var sel = '.btn, .nav-cta, .mobile-menu-cta, .tcs-mobile-menu-cta, .sticky-fit-call';
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        if (el.getAttribute('data-sweep-done')) return;
        el.setAttribute('data-sweep-done', '1');
        el.className += ' tcs-sweep';
        // overflow:hidden does nothing on an inline box, so the fill would
        // show beside the button. Promote inline links to inline-flex.
        if (window.getComputedStyle(el).display === 'inline') {
          el.style.display = 'inline-flex';
          el.style.alignItems = 'center';
        }
        var fill = document.createElement('span');
        fill.className = 'tcs-sweep-fill';
        fill.setAttribute('aria-hidden', 'true');
        el.insertBefore(fill, el.firstChild);
        el.addEventListener('mouseenter', function (e) {
          el.setAttribute('data-dir', nearestEdge(e, el.getBoundingClientRect()));
        });
        el.addEventListener('mouseleave', function (e) {
          el.setAttribute('data-dir', nearestEdge(e, el.getBoundingClientRect()));
        });
      })(nodes[i]);
    }
  }

  /* NAV_LINKS_CANONICAL_LOCK: inner pages carried links to homepage anchors
     that no longer exist (#services, #process, #about). Rebuild the desktop
     list to the same set the homepage uses; keep the page's own CTA. */
  function initDesktopLinks() {
    if (document.querySelector('[data-hero]')) return; // homepage owns its nav
    var ul = document.querySelector('nav ul.nav-links');
    if (!ul) return;
    var cta = ul.querySelector('a.nav-cta, a[class*="cta"]');
    var ctaLi = cta ? cta.closest('li') : null;
    var html = '';
    for (var i = 0; i < CANONICAL.length; i++) {
      html += '<li><a href="' + CANONICAL[i].href + '">' + CANONICAL[i].label + '</a></li>';
    }
    ul.innerHTML = html;
    if (ctaLi) ul.appendChild(ctaLi);
    else if (cta) { var li = document.createElement('li'); li.appendChild(cta); ul.appendChild(li); }
  }

  function boot() {
    initLogo();
    initDesktopLinks();
    init();
    initScrolled();
    initChars();
    initSweep();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
