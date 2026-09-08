/* MODULE_STEPS_BALANCED: arm the story state, size the grid so every row is
   full or centred (6 = 3+3, 5 = 3+2 centred, 4 = 2+2, 3 = 3), and reveal the
   cards in order once the grid scrolls into view. No dependencies. */
(function () {
  "use strict";
  var grids = document.querySelectorAll(".how-it-works .steps");
  if (!grids.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cols(grid) {
    var v = parseInt(getComputedStyle(grid).getPropertyValue("--ms-cols"), 10);
    return v > 0 ? v : 3;
  }
  grids.forEach(function (grid) {
    var steps = grid.querySelectorAll(".step");
    var n = steps.length;
    if (n === 4) grid.style.setProperty("--ms-cols", "2");
    else if (n < 3) grid.style.setProperty("--ms-cols", String(n));
    var c = cols(grid);
    steps.forEach(function (s, i) { s.style.setProperty("--ms-col", String(i % c)); });
  });

  var all = document.querySelectorAll(".how-it-works .step");
  if (reduce || !("IntersectionObserver" in window)) {
    all.forEach(function (s) { s.classList.add("is-in"); });
    return;
  }
  document.documentElement.classList.add("module-steps-armed");

  /* STEPS_PIN (Gil, 2026-09-08): on desktop the section holds still under
     the bar and the scroll lights the steps one at a time, in order, then
     the page moves on. Pure sticky inside a spacer, no dependencies. Falls
     back to the per-card reveal when the section is taller than the
     viewport or on phones. */
  var PER_STEP_VH = 0.22;
  function navH() { var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tcs-nav-h")); return v > 0 ? v : 64; }
  var pins = [];
  grids.forEach(function (grid) {
    var steps = Array.prototype.slice.call(grid.querySelectorAll(".step"));
    if (!steps.length) return;
    // Pin the grid itself: the heading and intro scroll away above it, so
    // the grid fits under the bar on a laptop and holds still while it lights.
    var wrap = document.createElement("div");
    wrap.className = "steps-pin";
    grid.parentNode.insertBefore(wrap, grid);
    wrap.appendChild(grid);
    pins.push({ wrap: wrap, section: grid, steps: steps, active: false, scrub: false });
  });
  var style = document.createElement("style");
  style.textContent = ".steps-pin{position:relative}.steps-pin.is-armed>*{position:sticky;top:calc(var(--tcs-nav-h,64px) + 16px)}";
  document.head.appendChild(style);

  function layout() {
    pins.forEach(function (p) {
      var desktop = window.innerWidth > 1024;
      p.wrap.classList.remove("is-armed"); p.section.classList.remove("is-pinned"); p.wrap.style.height = "";
      p.active = false; p.scrub = false;
      if (!desktop) return;
      var h = p.section.offsetHeight;
      if (h <= window.innerHeight - navH() - 8) {
        p.wrap.classList.add("is-armed");
        p.section.classList.add("is-pinned");
        p.wrap.style.height = Math.round(h + 16 + window.innerHeight * PER_STEP_VH * p.steps.length) + "px";
        p.active = true;
      } else {
        p.scrub = true; // too tall to pin: still light in order with the scroll
      }
    });
    update();
  }
  function progressOf(p) {
    if (p.active) {
      var start = p.wrap.getBoundingClientRect().top + window.scrollY - navH() - 16;
      var span = window.innerHeight * PER_STEP_VH * p.steps.length;
      return (window.scrollY - start) / span;
    }
    var r = p.section.getBoundingClientRect(), vh = window.innerHeight;
    return (vh * 0.85 - r.top) / (vh * 0.55); // grid top from 85% down to 30% of the viewport
  }
  function update() {
    pins.forEach(function (p) {
      if (!p.active && !p.scrub) return;
      var prog = Math.max(0, Math.min(1, progressOf(p)));
      var lit = Math.floor(prog * p.steps.length + 0.0001);
      if (prog >= 1) lit = p.steps.length;
      p.steps.forEach(function (s, i) { s.classList.toggle("is-in", i < lit); });
    });
  }
  var raf = null;
  window.addEventListener("scroll", function () { if (raf) return; raf = requestAnimationFrame(function () { raf = null; update(); }); }, { passive: true });
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 150); });
  window.addEventListener("load", layout);
  layout();

  // Phones and tall sections: each card lights on its own as it arrives.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var pin = pins.filter(function (p) { return p.section.contains(e.target); })[0];
      if (pin && (pin.active || pin.scrub)) return; // the scroll drives these
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -22% 0px", threshold: 0.2 });
  all.forEach(function (s) { io.observe(s); });
})();
