/* HOW_STEPS_ACHIEVE: check the six steps off as they scroll into view. */
(function () {
  "use strict";
  var section = document.getElementById("how");
  var list = section && section.querySelector(".steps");
  if (!list) return;
  var items = Array.prototype.slice.call(list.children);
  if (!items.length) return;

  items.forEach(function (li) {
    if (li.querySelector(".hw-check")) return;
    var check = document.createElement("span");
    check.className = "hw-check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 8.5 6.5 12 13 4.5"/></svg>';
    li.appendChild(check);
  });
  var done = document.createElement("p");
  done.className = "hw-done";
  done.innerHTML = '<span>Six steps, in that order. No package menu.</span><span class="hw-done-bar" aria-hidden="true"></span>';
  list.insertAdjacentElement("afterend", done);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function complete() { section.classList.add("is-complete"); }
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (li) { li.classList.add("is-done"); });
    complete();
    return;
  }

  /* HOW_STEPS_PIN (Gil, 2026-09-08): on desktop the section holds still
     under the bar and the scroll checks the steps off one per step, in
     order, then the page moves on. Phones and tall viewports fall back to
     the ordered queue below. Same sticky-in-a-spacer pattern as the module
     step grids and the calculators. */
  var PER_STEP_VH = 0.2;
  var wrap = document.createElement("div");
  wrap.className = "how-pin";
  section.parentNode.insertBefore(wrap, section);
  wrap.appendChild(section);
  var style = document.createElement("style");
  style.textContent = ".how-pin{position:relative}.how-pin.is-armed>#how{position:sticky;top:var(--tcs-nav-h,64px)}";
  document.head.appendChild(style);
  var pinned = false, checked = 0;
  function navH() { var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tcs-nav-h")); return v > 0 ? v : 64; }
  function layout() {
    wrap.classList.remove("is-armed"); wrap.style.height = ""; pinned = false;
    if (window.innerWidth > 1024) {
      var h = section.offsetHeight;
      if (h <= window.innerHeight - navH() - 8) {
        wrap.classList.add("is-armed");
        wrap.style.height = Math.round(h + window.innerHeight * PER_STEP_VH * items.length) + "px";
        pinned = true;
      }
    }
    if (window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
    update();
  }
  function update() {
    if (!pinned) return;
    var start = wrap.getBoundingClientRect().top + window.scrollY - navH();
    var span = window.innerHeight * PER_STEP_VH * items.length;
    var prog = Math.max(0, Math.min(1, (window.scrollY - start) / span));
    var lit = prog >= 1 ? items.length : Math.floor(prog * items.length + 0.0001);
    // checks only accumulate in order; scrolling back up does not uncheck
    if (lit > checked) {
      for (var i = checked; i < lit; i++) items[i].classList.add("is-done");
      checked = lit;
      if (checked === items.length) setTimeout(complete, 500);
    }
  }
  var raf = null;
  window.addEventListener("scroll", function () { if (raf) return; raf = requestAnimationFrame(function () { raf = null; update(); }); }, { passive: true });
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 150); });
  window.addEventListener("load", layout);
  layout();

  // Phones and tall viewports: checked off in order as they arrive, one
  // after another with a short beat.
  var nextIndex = 0, reached = -1, ticking = false;
  function tick() {
    if (nextIndex > reached) { ticking = false; return; }
    ticking = true;
    var li = items[nextIndex];
    if (!li.classList.contains("is-done")) li.classList.add("is-done");
    io.unobserve(li);
    nextIndex++;
    if (nextIndex === items.length) { setTimeout(complete, 350); ticking = false; return; }
    setTimeout(tick, 140);
  }
  var io = new IntersectionObserver(function (entries) {
    if (pinned) return; // the scroll drives the checks
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var idx = items.indexOf(e.target);
      if (idx > reached) reached = idx;
    });
    if (!ticking) tick();
  }, { rootMargin: "0px 0px -28% 0px", threshold: 0.5 });
  items.forEach(function (li) { io.observe(li); });
})();
