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
 * COPY_SCRUB_RISE_LOCK (Own the Patch gap 3), same module:
 *  - data-rv-lines        paragraph split into lines; each line scrubs from
 *                         40% opacity + 14px up to full as the section scrolls
 *                         (trigger = closest section, top 78% -> center 52%,
 *                         scrub 0.5, stagger 0.4, ease none). Reverses on the
 *                         way back up. data-rv-lines="soft" starts from 0
 *                         (top 55% -> center 42%).
 *  - data-rv-rise         block rises 34px + fades once on enter (top 85%,
 *                         0.7s power3.out)
 *  - data-rv-rise-group   direct children rise with a 0.08s stagger
 *
 * PROOF_ODOMETER_LOCK (Own the Patch gap 5):
 *  - data-odometer        a figure like "40%" or "4x": every digit becomes a
 *                         0-9 roller that spins to its value (1.1s power3.out,
 *                         0.12s stagger per digit) once on enter; non-digit
 *                         characters stay static. The original text is kept as
 *                         the aria-label. Reduced motion shows the final value.
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

  /* Split into natural lines: wrap words, group by offsetTop, rebuild.
     withBars=false builds plain .rv-line--scrub lines (no marker bar). */
  function split(el, withBars) {
    if (withBars === undefined) withBars = true;
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
    var cls = withBars ? "rv-line" : "rv-line rv-line--scrub";
    el.innerHTML = lines
      .map(function (ws) {
        return '<span class="' + cls + '" aria-hidden="true"' + (margin ? ' style="' + margin + '"' : "") + ">" + ws.join(" ") + (withBars ? '<span class="rv-bar"></span>' : "") + "</span>";
      })
      .join("");
    return Array.prototype.slice.call(el.querySelectorAll(withBars ? ".rv-bar" : ".rv-line"));
  }

  function restore(el) {
    if (typeof el.__rvOriginal === "string") el.innerHTML = el.__rvOriginal;
  }

  function init() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-rv]"));
    var lineEls = Array.prototype.slice.call(document.querySelectorAll("[data-rv-lines]"));
    var riseEls = Array.prototype.slice.call(document.querySelectorAll("[data-rv-rise]"));
    var groupEls = Array.prototype.slice.call(document.querySelectorAll("[data-rv-rise-group]"));
    var odoEls = Array.prototype.slice.call(document.querySelectorAll("[data-odometer]"));
    if (!els.length && !lineEls.length && !riseEls.length && !groupEls.length && !odoEls.length) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!gsap || !ScrollTrigger || reduce) {
      showAll(els);
      showAll(riseEls);
      groupEls.forEach(function (g) {
        showAll(Array.prototype.slice.call(g.children));
      });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* ST_REFRESH_ORDER_LOCK: ScrollTrigger refreshes triggers in creation
       order, and the workflow / path pins rebuild on resize, which moves them
       to the end of the queue. Everything below them then measures without
       their pin spacers (found 2,378px off on iOS). Sort by DOM order on every
       refresh so pins above always land first. Also ignore the mobile
       address-bar resize, which is what fires those rebuilds on a phone. */
    function domOrder(a, b) {
      var ta = a.trigger, tb = b.trigger;
      if (!ta || !tb || ta === tb) return 0;
      return ta.compareDocumentPosition(tb) & 4 ? -1 : 1;
    }
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.addEventListener("refreshInit", function () {
      ScrollTrigger.sort(domOrder);
    });
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });

    /* ---- Scrubbed copy lines ---- */
    function prepareLines(el) {
      if (el.__rvl && el.__rvl.tween) {
        if (el.__rvl.tween.scrollTrigger) el.__rvl.tween.scrollTrigger.kill();
        el.__rvl.tween.kill();
      }
      var soft = el.getAttribute("data-rv-lines") === "soft";
      var lines = splittable(el) ? split(el, false) : [el];
      var section = el.closest("section") || el;
      var tween = gsap.fromTo(
        lines,
        { autoAlpha: soft ? 0 : 0.4, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: section,
            start: soft ? "top 55%" : "top 78%",
            end: soft ? "center 42%" : "center 52%",
            scrub: 0.5,
          },
        }
      );
      el.__rvl = { tween: tween };
    }

    /* ---- Odometer figures ---- */
    function prepareOdometer(el) {
      if (el.getAttribute("data-odometer-done")) return;
      var text = el.textContent.trim();
      el.setAttribute("aria-label", text);
      el.textContent = "";
      var rollers = [];
      var targets = [];
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (/[0-9]/.test(ch)) {
          var slot = document.createElement("span");
          slot.className = "odo-slot";
          slot.setAttribute("aria-hidden", "true");
          var roll = document.createElement("span");
          roll.className = "odo-roll";
          for (var d = 0; d <= 9; d++) {
            var n = document.createElement("span");
            n.textContent = String(d);
            roll.appendChild(n);
          }
          slot.appendChild(roll);
          el.appendChild(slot);
          rollers.push(roll);
          targets.push(parseInt(ch, 10));
        } else {
          var st = document.createElement("span");
          st.className = "odo-static";
          st.setAttribute("aria-hidden", "true");
          st.textContent = ch;
          el.appendChild(st);
        }
      }
      el.setAttribute("data-odometer-done", "1");
      if (!rollers.length) return;
      gsap.set(rollers, { yPercent: 0 });
      var tl = gsap.timeline({ paused: true });
      rollers.forEach(function (r, i) {
        tl.to(r, { yPercent: -targets[i] * 10, duration: 1.1, ease: "power3.out" }, i * 0.12);
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () {
          tl.play();
        },
      });
    }

    /* ---- Rise once on enter ---- */
    function riseOnce(targets, trigger, stagger) {
      gsap.set(targets, { autoAlpha: 0, y: 34 });
      targets.forEach(function (t) {
        t.classList.add("rv-shown"); // inline autoAlpha now owns visibility
      });
      var tw = gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: stagger || 0,
        overwrite: "auto",
        scrollTrigger: { trigger: trigger, start: "top 85%", once: true },
      });
      onScreen(trigger, function () {
        if (tw.progress() === 0 && !tw.isActive()) tw.play();
      });
    }

    function prepareRises() {
      riseEls.forEach(function (el) {
        riseOnce([el], el, 0);
      });
      groupEls.forEach(function (g) {
        riseOnce(Array.prototype.slice.call(g.children), g, 0.08);
      });
    }

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
      // Fallback: if ScrollTrigger positions ever drift on a phone, the
      // heading still reveals the moment it is actually on screen.
      onScreen(el, function () {
        play(el);
      });
    }

    function onScreen(el, fn) {
      if (typeof IntersectionObserver === "undefined") return;
      var io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              io.disconnect();
              fn();
              return;
            }
          }
        },
        { threshold: 0.15 }
      );
      io.observe(el);
    }

    function start() {
      els.forEach(prepare);
      lineEls.forEach(prepareLines);
      prepareRises();
      odoEls.forEach(prepareOdometer);
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
    var lastW = window.innerWidth;
    window.addEventListener("resize", function () {
      if (window.innerWidth === lastW) return; // height-only (mobile toolbar): ignore
      lastW = window.innerWidth;
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
        lineEls.forEach(prepareLines); // scrub lines re-split on every resize
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  ready(init);
})();
