/**
 * Side rail + scrollspy (Hostinger static, homepage)
 *
 * SIDE_RAIL_SPY_LOCK. Borrowed from ownthepatch.co.uk: a fixed rail of
 * numbered section links with an IntersectionObserver scrollspy
 * (rootMargin -40% / -55%, so the section crossing the upper-middle band is
 * active) and a small electric marker that slides to the active row.
 * Several section ids can map to one rail item (the job-flow sections share
 * "THE JOB"). Labels use the shared character slide from tcs-nav.js when it
 * is present. No GSAP needed; the marker moves with a CSS transition.
 */
(function () {
  "use strict";

  var ITEMS = [
    { href: "#problem", label: "Problem", spy: ["problem", "philosophy"] },
    { href: "#outcomes", label: "Outcomes", spy: ["outcomes"] },
    { href: "#spine", label: "The job", spy: ["spine", "path-construction", "path-drops"] },
    { href: "#how", label: "How we work", spy: ["how"] },
    { href: "#proof", label: "Proof", spy: ["proof"] },
    { href: "#contact", label: "Fit Call", spy: ["software", "contact"] },
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n + "_";
  }

  ready(function () {
    if (!document.querySelector("[data-hero]")) return; // homepage only
    if (document.querySelector("[data-rail]")) return;

    // A div with role=navigation, not <nav>: the page's global nav {} rule
    // (sticky bar, 64px, centred items, border) would otherwise apply.
    var rail = document.createElement("div");
    rail.className = "rail";
    rail.setAttribute("role", "navigation");
    rail.setAttribute("aria-label", "Section navigation");
    rail.setAttribute("data-rail", "");

    // RAIL_LOGO_LOCK: the stacked wordmark lives at the top of the rail on
    // desktop (OTP puts its logo in the rail column); the top bar hides its
    // own logo on this page at those widths (html.has-rail, rail.css).
    var logo = document.createElement("a");
    logo.className = "rail-logo";
    logo.href = "#home";
    logo.setAttribute("aria-label", "Telecom Contractor Solutions, home");
    logo.innerHTML =
      '<svg viewBox="0 0 260 80" width="170" height="52" role="img" aria-hidden="true" focusable="false">' +
      '<line x1="18" y1="78" x2="18" y2="20" stroke="#2A8EFF" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="21" y1="66" x2="36" y2="66" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.30"/>' +
      '<line x1="21" y1="54" x2="34" y2="54" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.48"/>' +
      '<line x1="21" y1="43" x2="36" y2="43" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>' +
      '<line x1="21" y1="32" x2="33" y2="32" stroke="#2A8EFF" stroke-width="1.8" stroke-linecap="round" opacity="0.82"/>' +
      '<polygon points="10,20 18,4 26,20" fill="#F26419"/>' +
      '<text x="52" y="28" class="rail-logo-l1">TELECOM</text>' +
      '<text x="52" y="54" class="rail-logo-l2">CONTRACTOR</text>' +
      '<text x="52" y="78" class="rail-logo-l3">SOLUTIONS</text>' +
      "</svg>";
    var top = document.createElement("div");
    top.className = "rail-top";
    top.appendChild(logo);
    rail.appendChild(top);
    document.documentElement.classList.add("has-rail");

    var nav = document.createElement("div");
    nav.className = "rail-nav";
    var marker = document.createElement("span");
    marker.className = "rail-marker";
    marker.setAttribute("aria-hidden", "true");
    nav.appendChild(marker);

    var links = [];
    var byId = {};
    ITEMS.forEach(function (item, i) {
      var a = document.createElement("a");
      a.className = "rail-link";
      a.href = item.href;
      a.innerHTML =
        '<span class="rail-idx" aria-hidden="true">' + pad(i + 1) + "</span>" +
        '<span class="rail-label" data-chars>' + item.label + "</span>";
      nav.appendChild(a);
      links.push(a);
      item.spy.forEach(function (id) {
        byId[id] = a;
      });
    });
    top.appendChild(nav);

    // Bottom-left legal links (OTP rail-foot).
    var foot = document.createElement("div");
    foot.className = "rail-foot";
    // Page links first (the top bar hides its links on this page at desktop),
    // then the legal pair, OTP rail-foot order.
    foot.innerHTML =
      '<div class="rail-foot__pages">' +
      '<a href="/about.html" data-chars>About</a>' +
      '<a href="/blog.html" data-chars>Blog</a>' +
      '<a href="/faq.html" data-chars>FAQ</a>' +
      "</div>" +
      '<span class="rail-foot__rule" aria-hidden="true"></span>' +
      '<div class="rail-foot__legal">' +
      '<a href="/terms" data-chars>Terms</a>' +
      '<a href="/privacy" data-chars>Privacy</a>' +
      "</div>";
    rail.appendChild(foot);
    document.body.appendChild(rail);

    if (typeof window.tcsChars === "function") window.tcsChars(rail);

    var current = null;
    function setActive(a) {
      if (a === current) return;
      current = a;
      links.forEach(function (l) {
        l.classList.toggle("is-active", l === a);
        if (l === a) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
      rail.classList.toggle("has-active", !!a);
      if (a) {
        var y = a.offsetTop + a.offsetHeight / 2 - marker.offsetHeight / 2 - 2;
        marker.style.transform = "translateY(" + Math.round(y) + "px)";
      }
    }

    var sections = [];
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sections.push(el);
    });
    if (!sections.length || typeof IntersectionObserver === "undefined") {
      rail.classList.add("is-ready");
      return;
    }

    var visible = {};
    function resolve() {
      // First section in document order that is inside the band wins.
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) {
          setActive(byId[sections[i].id]);
          return;
        }
      }
      setActive(null);
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting;
        });
        resolve();
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      io.observe(s);
    });

    // Fade in after the hero has settled.
    setTimeout(function () {
      rail.classList.add("is-ready");
    }, 700);
  });
})();
