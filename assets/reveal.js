/**
 * Headline marker reveal (Hostinger static)
 *
 * HEADLINE_MARKER_REVEAL_LOCK. Borrowed motion from ownthepatch.co.uk, TCS
 * tokens. Each [data-rv] heading is split into its natural lines (vanilla
 * split, no SplitText), every line gets a solid electric bar laid over it, and
 * one gsap.timeline() per heading wipes the bars off right-to-left:
 * scaleX 1 -> 0, 0.6s, power3.inOut, 0.12s stagger per line. The heading is
 * visibility:hidden (reveal.css) until the timeline starts.
 *
 *  - data-rv="load"  hero h1: plays after fonts are ready + a short beat
 *  - data-rv         section h2: ScrollTrigger once, start "top 82%"
 *
 * On completion the original markup is restored (no leftover wrappers), so a
 * later resize needs nothing. Unrevealed headings re-split on resize.
 * prefers-reduced-motion / no GSAP: headings shown as-is, no split.
 * Only plain-text headings (optionally with <br>) are split; anything with
 * other inline tags is shown without the wipe.
 *
 * Cites: gsap-core · gsap-timeline · gsap-scrolltrigger · motion-design
 * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/docs/v3/Plugins/ScrollTrigger/
 */
(function () {
  "use strict";

  var DURATION = 0.6;
  var STAGGER = 0.12;
  var LOAD_DELAY = 180;
  var BR = String.fromCharCode(1); // sentinel for <br> while tokenising

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function showAll(els) {
    els.forEach(function (el) {
      el.classList.add("rv-shown");
    });
  }

  function splittable(el) {
    return !/<(?!br\s*\/?>)/i.test(el.innerHTML.trim());
  }

  /* Split into natural lines: wrap words, group by offsetTop, rebuild. */
  function split(el) {
    if (typeof el.__rvOriginal !== "string") el.__rvOriginal = el.innerHTML;
    if (!el.getAttribute("aria-label")) {
      el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    }
    var tokens = el.__rvOriginal
      .replace(/<br\s*\/?>/gi, " " + BR + " ")
      .split(/\s+/)
      .filter(Boolean);
    el.innerHTML = tokens
      .map(function (t) {
        return t === BR ? "<br>" : '<span class="rv-w">' + t + "</span>";
      })
      .join(" ");
    var spans = Array.prototype.slice.call(el.querySelectorAll(".rv-w"));
    var lines = [];
    var cur = null;
    var top = null;
    spans.forEach(function (s) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 3) {
        cur = [];
        lines.push(cur);
        top = t;
      }
      cur.push(s.innerHTML);
    });
    // Lines shrink to their text (fit-content) so the bar covers only the
    // words; keep centred / right-aligned headings aligned via margins.
    var align = window.getComputedStyle(el).textAlign;
    var margin = align === "center" ? "margin:0 auto;" : align === "right" || align === "end" ? "margin-left:auto;" : "";
    el.innerHTML = lines
      .map(function (ws) {
        return '<span class="rv-line" aria-hidden="true"' + (margin ? ' style="' + margin + '"' : "") + ">" + ws.join(" ") + '<span class="rv-bar"></span></span>';
      })
      .join("");
    return Array.prototype.slice.call(el.querySelectorAll(".rv-bar"));
  }

  function restore(el) {
    if (typeof el.__rvOriginal === "string") el.innerHTML = el.__rvOriginal;
  }

  function init() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-rv]"));
    if (!els.length) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!gsap || !ScrollTrigger || reduce) {
      showAll(els);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    function buildTimeline(el, bars) {
      var tl = gsap.timeline({
        paused: true,
        onStart: function () {
          el.classList.add("rv-shown");
        },
        onComplete: function () {
          el.__rv.done = true;
          restore(el);
        },
      });
      gsap.set(bars, { scaleX: 1, transformOrigin: "right center" });
      bars.forEach(function (b, i) {
        tl.to(b, { scaleX: 0, duration: DURATION, ease: "power3.inOut" }, i * STAGGER);
        tl.set(b, { autoAlpha: 0 }, i * STAGGER + DURATION);
      });
      return tl;
    }

    function prepare(el) {
      if (!splittable(el)) {
        el.classList.add("rv-shown");
        el.__rv = { done: true, played: true };
        return;
      }
      var bars = split(el);
      var tl = buildTimeline(el, bars);
      if (el.__rv && el.__rv.tl) el.__rv.tl.kill();
      el.__rv = el.__rv || { played: false, done: false };
      el.__rv.tl = tl;
      el.__rv.done = false;
    }

    function play(el) {
      var r = el.__rv;
      if (!r || r.played) return;
      r.played = true;
      if (r.tl) r.tl.play();
      else el.classList.add("rv-shown");
    }

    function arm(el) {
      if (el.getAttribute("data-rv") === "load") {
        setTimeout(function () {
          play(el);
        }, LOAD_DELAY);
        return;
      }
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        once: true,
        onEnter: function () {
          play(el);
        },
      });
    }

    function start() {
      els.forEach(prepare);
      ScrollTrigger.refresh();
      els.forEach(arm);
    }

    // Split only once webfonts are in so the line breaks are final.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        els.forEach(function (el) {
          var r = el.__rv;
          if (!r || r.done) return; // restored already; nothing to redo
          if (r.played) {
            if (r.tl) r.tl.progress(1); // mid-wipe on resize: finish cleanly
            return;
          }
          prepare(el);
        });
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  ready(init);
})();
