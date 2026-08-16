/* TCS v38 mobile navigation.
   Adds a hamburger toggle to the site header on pages that do not already have one.
   Bails out quietly if the page already carries its own mobile menu. */
(function () {
  'use strict';

  var BREAKPOINT = 820;

  function init() {
    var navs = document.getElementsByTagName('nav');

    for (var i = 0; i < navs.length; i++) {
      var nav = navs[i];

      // already processed, or the page ships its own mobile menu
      if (nav.querySelector('.tcs-nav-toggle')) return;
      if (nav.querySelector('.hamburger, .nav-hamburger, .menu-toggle, .nav-toggle')) return;

      var ul = nav.querySelector('ul.links, ul.nav-links, ul');
      if (!ul || !ul.parentNode) continue;
      if (ul.getElementsByTagName('a').length < 2) continue;

      var host = ul.parentNode;

      nav.className += ' tcs-nav-root';
      host.className += ' tcs-nav-host';
      ul.className += ' tcs-nav-panel';
      if (!ul.id) ul.id = 'tcs-primary-nav';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tcs-nav-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', ul.id);
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = '<span></span><span></span><span></span>';
      // before the list, so that when the row wraps the toggle stays on line one
      host.insertBefore(btn, ul);

      bind(nav, ul, btn);
      return;
    }
  }

  function bind(nav, ul, btn) {
    function setOpen(open) {
      if (open) {
        if (nav.className.indexOf('tcs-nav-open') === -1) nav.className += ' tcs-nav-open';
      } else {
        nav.className = nav.className.replace(/\s*tcs-nav-open\b/g, '');
      }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    function isOpen() {
      return nav.className.indexOf('tcs-nav-open') > -1;
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
    });

    ul.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el !== ul) {
        if (el.tagName === 'A') { setOpen(false); return; }
        el = el.parentNode;
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target)) setOpen(false);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
