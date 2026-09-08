/* TCS_STORY: scroll storytelling for inner pages. See tcs-story.css.
   Skips the homepage (it has its own choreography) and anything that already
   animates itself (workflow card, path islands, module steps, dashboards). */
(function () {
  "use strict";
  if (document.querySelector("[data-hero]")) return; // homepage owns its motion
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SKIP = ".calculator-results, .calculator-inputs, .live-strip, .wt, .pth, .path-section, .paths-intro, nav, footer, header, .hero, .blog-hero, .roi-hero, .tcs-mobile-menu, .how-it-works .steps, .outcomes-list, .video-slot, .compare, .kpi-row, form, .cta-form, .spine, .rail";
  function skipped(el) { return !!el.closest(SKIP); }

  /* Headings: rail. */
  var heads = Array.prototype.slice.call(document.querySelectorAll("main h2, article h2, .container h2, .section h2, .prose-section h2, .faq h2"));
  heads = heads.filter(function (h) { return !skipped(h) && !h.classList.contains("st-rail"); });
  heads.forEach(function (h) {
    h.classList.add("st-rail");
    if (getComputedStyle(h).textAlign === "center") h.classList.add("st-center");
  });

  /* Cards and copy: rise. Cards are grouped so siblings stagger. */
  var CARD = ".feature-card, .faq-item, .post-card, .headline-card, .card, .diff-item, .solution-card, .cta-section, .cta-box, .author-bio, .highlight-box, .callout, .subscribe-box, .internal-links, .assumptions, .states li, .steps-list li, .comparison-table tbody tr, .related-post, .bead-subscribe-inner > *, .checklist-section, .resource-card";
  var COPY = "main p, main li, main blockquote, main h3, main h4, main img, main table, main pre, main dl, article p, article li, article blockquote, article h3";
  var cards = Array.prototype.slice.call(document.querySelectorAll(CARD)).filter(function (e) { return !skipped(e); });
  cards.forEach(function (c) {
    c.classList.add("st-rise", "st-card");
    var i = 0, sib = c.previousElementSibling;
    while (sib && sib.classList.contains("st-card") && i < 5) { i++; sib = sib.previousElementSibling; }
    c.style.setProperty("--st-i", String(i));
  });
  var copy = Array.prototype.slice.call(document.querySelectorAll(COPY)).filter(function (e) {
    return !skipped(e) && !e.closest(".st-card") && !e.classList.contains("st-rise") && !e.closest(CARD);
  });
  copy.forEach(function (e) { e.classList.add("st-rise"); e.style.setProperty("--st-i", "0"); });

  /* Reading progress on long reads. */
  var article = document.querySelector("article, .article-container, .post-body, .prose-section");
  var progress = null;
  if (article) {
    progress = document.createElement("div");
    progress.className = "tcs-story-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    document.body.appendChild(progress);
  }
  function updateProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var p = total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;
    progress.firstChild.style.transform = "scaleX(" + p + ")";
  }

  var all = heads.concat(cards, copy);
  function showAll() { all.forEach(function (e) { e.classList.add("st-in"); }); }
  if (reduce || !("IntersectionObserver" in window)) { showAll(); updateProgress(); window.addEventListener("scroll", updateProgress, { passive: true }); return; }

  /* STORY_SCRUB (Gil, 2026-09-08): copy and cards rise with the scroll,
     not on a trigger. Each element's progress runs from 96% of the viewport
     down to 68%; the value drives opacity and translate directly, so it
     reads as smooth and reversible until it completes. Headings keep their
     rail wipe, which draws once the heading clears the same line. */
  var armed = false, pending = [];
  function paint(e, p) {
    if (!e.classList.contains("st-rise")) { if (p >= 1) e.classList.add("st-in"); return; }
    var q = 1 - Math.pow(1 - p, 2);
    e.style.opacity = String(q);
    e.style.transform = "translateY(" + ((1 - q) * 22).toFixed(1) + "px)";
  }
  function scrub() {
    if (!pending.length) return;
    var vh = window.innerHeight, keep = [];
    pending.forEach(function (e) {
      var top = e.getBoundingClientRect().top;
      var p = Math.max(0, Math.min(1, (vh * 0.96 - top) / (vh * 0.28)));
      paint(e, p);
      if (p >= 1) { e.classList.add("st-in"); e.style.opacity = ""; e.style.transform = ""; }
      else keep.push(e);
    });
    pending = keep;
  }
  function arm() {
    if (armed) return;
    armed = true;
    var vh = window.innerHeight;
    all.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top > vh * 0.92) { e.classList.add("st-scrub"); pending.push(e); } else e.classList.add("st-in");
    });
    document.documentElement.classList.add("tcs-story-armed");
    scrub();
  }
  var raf = null;
  window.addEventListener("scroll", function () {
    arm(); updateProgress();
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = null; scrub(); });
  }, { passive: true });
  window.addEventListener("resize", function () { if (armed) scrub(); });
  if (window.scrollY > 24) arm();
  updateProgress();
})();
