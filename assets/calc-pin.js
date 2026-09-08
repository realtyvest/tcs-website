/* CALC_PIN (Gil, 2026-09-08): on desktop the calculator holds still under the
   bar while its chart draws; scrolling drives the draw, and the page moves on
   only once the chart is complete. Pure sticky positioning inside a spacer,
   no dependencies. Phones keep normal flow (the chart draws as it rises).
   Exposes window.tcsCalcPinProgress(): 0..1 while pinned, null otherwise. */
(function () {
  "use strict";
  var section = document.querySelector(".calculator-section");
  if (!section) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DRAW_VH = 0.7; // viewport heights of scroll spent drawing the chart
  var wrap = document.createElement("div");
  wrap.className = "calc-pin";
  section.parentNode.insertBefore(wrap, section);
  wrap.appendChild(section);
  var style = document.createElement("style");
  style.textContent = "@media (min-width:1025px){.calc-pin{position:relative}.calc-pin.is-armed .calculator-section{position:sticky;top:var(--tcs-nav-h,64px)}}";
  document.head.appendChild(style);

  function navH() { var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tcs-nav-h")); return v > 0 ? v : 64; }
  function active() { return !reduce && window.innerWidth > 1024; }
  function layout() {
    if (!active()) { wrap.classList.remove("is-armed"); wrap.style.height = ""; return; }
    wrap.classList.add("is-armed");
    wrap.style.height = "";
    var h = section.offsetHeight;
    wrap.style.height = Math.round(h + window.innerHeight * DRAW_VH) + "px";
  }
  window.tcsCalcPinProgress = function () {
    if (!active() || !wrap.classList.contains("is-armed")) return null;
    var start = wrap.getBoundingClientRect().top + window.scrollY - navH();
    var p = (window.scrollY - start) / (window.innerHeight * DRAW_VH);
    return Math.max(0, Math.min(1, p));
  };
  layout();
  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 150); });
  window.addEventListener("load", layout);
})();
