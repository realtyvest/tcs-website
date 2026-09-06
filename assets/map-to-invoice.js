/**
 * Map-to-invoice island (Hostinger static)
 * Design LOCK: four states only - Annotated map / Tally = marks /
 * Ready to bill / Invoice same day. No marketing body copy. No dollar signs.
 *
 * MAP_TO_INVOICE_PROGRESS_BAR_STORY_LOCK (Pattern A) — replaces PIN_HOLD scrub.
 * Layout: a 4-step workflow PROGRESS BAR sits on top (the story driver); below
 * it one panel (image + one short title line) shows the ACTIVE step only.
 * One gsap.timeline() owns BOTH the bar fill/lights AND the panel swap, so they
 * can never desync. A short ScrollTrigger pin holds the island for ~1.4
 * viewports total (end "+=140%", NOT the old +=300% pin-scrub) while the bar
 * lights left->right and the panels follow the same playhead. The bar goes
 * incomplete -> active -> complete; completed steps stay lit. CLEAR_STATE on
 * leave: full bar lit + Invoice same day panel. Optional ST snap per step on
 * coarse (mobile) pointers. prefers-reduced-motion: static full bar + Invoice,
 * no pin.
 *
 * Cites: cheatsheet https://gsap.com/cheatsheet · gsap-core · gsap-timeline
 * https://gsap.com/docs/v3/GSAP/Timeline · gsap-scrolltrigger
 * https://gsap.com/docs/v3/Plugins/ScrollTrigger/
 */
(function () {
  "use strict";

  var LABELS = [
    "Annotated map",
    "Tally = marks",
    "Ready to bill",
    "Invoice same day",
  ];
  // Breadcrumb short codes (shown in the chrome route line).
  var CODES = ["MAP", "TALLY", "BILL", "INVOICE"];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function ensureMarkup(root) {
    if (root.querySelector("[data-m2i-root]")) return;

    var html =
      '<div class="m2i" data-m2i-root>' +
      '<div class="m2i-chrome">' +
      '<p class="m2i-chrome-id">JOB-4821 · FIBER DROP</p>' +
      '<p class="m2i-chrome-route">' +
      CODES.join(" → ") +
      "</p>" +
      "</div>" +
      /* ---- Progress bar (story driver) ---- */
      '<ol class="m2i-bar" data-m2i-bar aria-label="Map to invoice progress">' +
      '<span class="m2i-bar-track" aria-hidden="true"><span class="m2i-bar-fill" data-m2i-fill></span></span>';

    LABELS.forEach(function (label, i) {
      html +=
        '<li class="m2i-bar-step" data-m2i-step="' +
        i +
        '">' +
        '<span class="m2i-bar-dot" aria-hidden="true"></span>' +
        '<span class="m2i-bar-label">' +
        label +
        "</span></li>";
    });

    html +=
      "</ol>" +
      '<div class="m2i-stage" data-m2i-stage>' +
      '<div class="m2i-panels" data-m2i-panels>' +
      /* 0 Annotated map */
      '<div class="m2i-panel" data-m2i-panel="0">' +
      '<div class="m2i-panel-head">' +
      '<p class="m2i-panel-title">Annotated map</p>' +
      '<p class="m2i-panel-meta">SEG-07 · RT-A</p>' +
      "</div>" +
      '<div class="m2i-visual">' +
      '<div class="m2i-map" aria-hidden="true">' +
      '<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">' +
      '<line class="m2i-map-grid" x1="40" y1="0" x2="40" y2="220"/>' +
      '<line class="m2i-map-grid" x1="120" y1="0" x2="120" y2="220"/>' +
      '<line class="m2i-map-grid" x1="200" y1="0" x2="200" y2="220"/>' +
      '<line class="m2i-map-grid" x1="280" y1="0" x2="280" y2="220"/>' +
      '<line class="m2i-map-grid" x1="360" y1="0" x2="360" y2="220"/>' +
      '<line class="m2i-map-grid" x1="0" y1="40" x2="400" y2="40"/>' +
      '<line class="m2i-map-grid" x1="0" y1="110" x2="400" y2="110"/>' +
      '<line class="m2i-map-grid" x1="0" y1="180" x2="400" y2="180"/>' +
      '<path class="m2i-map-route" d="M36 178 C 90 170, 110 120, 160 112 S 240 96, 290 70 S 340 48, 372 42"/>' +
      '<path class="m2i-map-route" d="M70 40 L 70 150 L 210 150 L 210 190" stroke-dasharray="3 4"/>' +
      '<circle class="m2i-map-mark" cx="70" cy="40" r="4"/>' +
      '<circle class="m2i-map-mark" cx="160" cy="112" r="4"/>' +
      '<circle class="m2i-map-mark" cx="290" cy="70" r="4"/>' +
      '<circle class="m2i-map-mark" cx="210" cy="190" r="4"/>' +
      "</svg></div></div></div>" +
      /* 1 Tally = marks */
      '<div class="m2i-panel" data-m2i-panel="1">' +
      '<div class="m2i-panel-head">' +
      '<p class="m2i-panel-title">Tally = marks</p>' +
      '<p class="m2i-panel-meta">TALLY · LOCKED</p>' +
      "</div>" +
      '<div class="m2i-visual">' +
      '<ul class="m2i-tally">' +
      '<li><span class="m2i-tally-code">FO-12</span><span><span class="m2i-tally-qty">840 LF</span><span class="m2i-tally-ok">OK</span></span></li>' +
      '<li><span class="m2i-tally-code">DROP-1</span><span><span class="m2i-tally-qty">14 EA</span><span class="m2i-tally-ok">OK</span></span></li>' +
      '<li><span class="m2i-tally-code">SPLICE</span><span><span class="m2i-tally-qty">6 EA</span><span class="m2i-tally-ok">OK</span></span></li>' +
      '<li><span class="m2i-tally-code">LOCATE</span><span><span class="m2i-tally-qty">2 EA</span><span class="m2i-tally-ok">OK</span></span></li>' +
      "</ul></div></div>" +
      /* 2 Ready to bill */
      '<div class="m2i-panel" data-m2i-panel="2">' +
      '<div class="m2i-panel-head">' +
      '<p class="m2i-panel-title">Ready to bill</p>' +
      '<p class="m2i-panel-meta">PKG-19</p>' +
      "</div>" +
      '<div class="m2i-visual">' +
      '<div class="m2i-packet">' +
      '<div class="m2i-packet-row"><span>AS-BUILT.pdf</span><span class="m2i-packet-status">READY</span></div>' +
      '<div class="m2i-packet-row"><span>PHOTOS · 12</span><span class="m2i-packet-status">READY</span></div>' +
      '<div class="m2i-packet-row"><span>QTY SHEET</span><span class="m2i-packet-status">READY</span></div>' +
      '<div class="m2i-packet-row"><span>CREW LOG</span><span class="m2i-packet-status">READY</span></div>' +
      "</div></div></div>" +
      /* 3 Invoice same day */
      '<div class="m2i-panel" data-m2i-panel="3">' +
      '<div class="m2i-panel-head">' +
      '<p class="m2i-panel-title">Invoice same day</p>' +
      '<p class="m2i-panel-meta">INV-LINES</p>' +
      "</div>" +
      '<div class="m2i-visual">' +
      '<ul class="m2i-invoice">' +
      '<li><span class="m2i-invoice-code">2210 FO-12</span><span class="m2i-invoice-qty">840 LF</span><span class="m2i-invoice-flag">LINE</span></li>' +
      '<li><span class="m2i-invoice-code">2214 DROP</span><span class="m2i-invoice-qty">14 EA</span><span class="m2i-invoice-flag">LINE</span></li>' +
      '<li><span class="m2i-invoice-code">2301 SPLICE</span><span class="m2i-invoice-qty">6 EA</span><span class="m2i-invoice-flag">LINE</span></li>' +
      '<li><span class="m2i-invoice-code">2105 LOCATE</span><span class="m2i-invoice-qty">2 EA</span><span class="m2i-invoice-flag">LINE</span></li>' +
      "</ul></div></div>" +
      "</div></div></div>";

    root.innerHTML = html;
  }

  // Light the bar left->right: active = current step, complete = every step
  // before it (completed stay lit). Panels: exactly one active.
  function setActive(steps, panels, index) {
    steps.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
      el.classList.toggle("is-complete", i < index);
    });
    panels.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
  }

  function initRoot(section) {
    ensureMarkup(section);

    var m2i = section.querySelector("[data-m2i-root]");
    var steps = Array.prototype.slice.call(
      section.querySelectorAll("[data-m2i-step]")
    );
    var panels = Array.prototype.slice.call(
      section.querySelectorAll("[data-m2i-panel]")
    );
    var fill = section.querySelector("[data-m2i-fill]");
    var pinTarget = m2i; // pin the island (stage) only — short hold

    if (!m2i || !steps.length || !panels.length) return function () {};

    /*
     * settleFinal — CLEAR_STATE. On leaving the pin (scrolled past) settle on
     * the full lit bar + Invoice same day panel only. Never clearProps the
     * panels (mobile/reduced CSS would restore the whole stack and re-show
     * earlier titles). Explicitly light every step and show panel 3 alone.
     * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/cheatsheet
     */
    function settleFinal() {
      steps.forEach(function (el, i) {
        el.classList.add("is-complete");
        el.classList.toggle("is-active", i === 3);
      });
      if (fill) gsap.set(fill, { scaleX: 1 });
      panels.forEach(function (p, i) {
        gsap.set(p, { autoAlpha: i === 3 ? 1 : 0, y: 0 });
      });
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      setActive(steps, panels, 3);
      if (fill) fill.style.transform = "scaleX(1)";
      m2i.classList.add("is-reduced");
      return function () {};
    }

    gsap.registerPlugin(ScrollTrigger);

    var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var coarseMq = window.matchMedia("(pointer: coarse)");

    var ctx = null;
    var st = null;

    function killLocal() {
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
      if (st) {
        st.kill();
        st = null;
      }
      ScrollTrigger.getAll().forEach(function (t) {
        if (t.trigger === pinTarget || t.trigger === section) t.kill();
      });
    }

    function applyReduced() {
      killLocal();
      m2i.classList.remove("is-pinned");
      m2i.classList.add("is-reduced");
      gsap.set(steps, { clearProps: "opacity,visibility,transform" });
      gsap.set(panels, { clearProps: "opacity,visibility,transform" });
      settleFinal(); // static full bar + Invoice
    }

    /*
     * MAP_TO_INVOICE_PROGRESS_BAR_STORY_LOCK — one gsap.timeline() owns the bar
     * fill/lights AND the panel swap so they share a single playhead.
     * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/cheatsheet
     *
     * Time budget (STEP_DUR = 1): four equal quarters over a total duration of
     * 4 — step 0 lives in [0,1), 1 in [1,2), 2 in [2,3), 3 (INVOICE) holds
     * [3,4]. The fill tween (scaleX 0->1, duration 4) IS the longest child, so
     * it fixes the timeline length and the trailing INVOICE hold exists. Panel
     * swaps are SEQUENTIAL (hide outgoing over FADE, THEN show incoming) so at
     * most one panel title is visible mid-scrub. The lit step is derived from
     * the playhead (syncStep) on every update AND at each swap point, so bar +
     * panel can never desync and reverse-scrub restores the prior step.
     */
    var STEP_DUR = 1;
    var FADE = 0.16;
    var TOTAL = 4; // 4 equal quarters (step 3 holds the last quarter)

    function activeStepAtTime(t) {
      for (var i = 3; i >= 1; i--) {
        var mid = i * STEP_DUR + FADE; // switch just after the swap begins
        if (t >= mid) return i;
      }
      return 0;
    }

    function buildSequenceTimeline() {
      setActive(steps, panels, 0);
      gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
      panels.forEach(function (panel, i) {
        gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 10 });
      });

      var lastStep = 0;
      function syncStep(force) {
        var idx = activeStepAtTime(tl.time());
        if (force === true || idx !== lastStep) {
          lastStep = idx;
          setActive(steps, panels, idx);
        }
      }

      var tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: syncStep,
      });

      // Bar fill grows left->right across the whole timeline (ambient progress
      // under the dots). Part of the SAME timeline as the panel swap.
      tl.to(fill, { scaleX: 1, duration: TOTAL }, 0);

      // Sequential panel swaps at t = 1, 2, 3. Hide outgoing over FADE, THEN
      // reveal the next over FADE at at+FADE. tl.call re-derives the lit step
      // at the swap point (reverse-safe).
      for (var i = 0; i < 3; i++) {
        (function (from) {
          var next = from + 1;
          var at = STEP_DUR * (from + 1);
          tl.to(panels[from], { autoAlpha: 0, y: -6, duration: FADE }, at);
          tl.fromTo(
            panels[next],
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: FADE },
            at + FADE
          );
          tl.call(syncStep, null, at + FADE);
        })(i);
      }
      return tl;
    }

    /*
     * Short pin — freeze the island (bar + stage) for ~1.4 viewports total
     * (end "+=140%", NOT the old +=300% pin-scrub) while the bar lights and the
     * panels follow the same playhead. scrub ties timeline progress to scroll.
     * onLeave settleFinal -> full bar + Invoice only. Optional snap per step on
     * coarse (mobile) pointers: snap to each quarter midpoint (t = .5/1.5/2.5/
     * 3.5) so a rest lands cleanly inside one state.
     * https://gsap.com/docs/v3/Plugins/ScrollTrigger/ · https://gsap.com/scroll/
     */
    function applyPinned() {
      killLocal();
      m2i.classList.remove("is-reduced");
      m2i.classList.add("is-pinned");

      ctx = gsap.context(function () {
        var tl = buildSequenceTimeline();

        var cfg = {
          animation: tl,
          trigger: pinTarget,
          start: "top top+=72",
          end: "+=140%", // ~1.4 viewports TOTAL for the whole story
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onLeave: settleFinal,
        };

        // Optional per-step snap on mobile: quarter midpoints keep a rest
        // clearly inside one state (progress = timeline time / TOTAL).
        if (coarseMq.matches) {
          cfg.snap = {
            snapTo: [0.125, 0.375, 0.625, 0.875],
            duration: { min: 0.15, max: 0.3 },
            ease: "power1.inOut",
          };
        }

        st = ScrollTrigger.create(cfg);
      }, section);
    }

    function build() {
      if (reduceMq.matches) {
        applyReduced();
        return;
      }
      applyPinned();
    }

    build();

    function onChange() {
      build();
      ScrollTrigger.refresh();
    }

    if (reduceMq.addEventListener) {
      reduceMq.addEventListener("change", onChange);
      coarseMq.addEventListener("change", onChange);
    } else if (reduceMq.addListener) {
      reduceMq.addListener(onChange);
      coarseMq.addListener(onChange);
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        build();
        ScrollTrigger.refresh();
      }, 150);
    }
    window.addEventListener("resize", onResize);

    return function cleanup() {
      window.removeEventListener("resize", onResize);
      if (reduceMq.removeEventListener) {
        reduceMq.removeEventListener("change", onChange);
        coarseMq.removeEventListener("change", onChange);
      } else if (reduceMq.removeListener) {
        reduceMq.removeListener(onChange);
        coarseMq.removeListener(onChange);
      }
      killLocal();
    };
  }

  ready(function () {
    var roots = document.querySelectorAll("[data-map-to-invoice]");
    if (!roots.length) return;
    var cleanups = [];
    roots.forEach(function (root) {
      cleanups.push(initRoot(root));
    });
    window.__m2iCleanup = function () {
      cleanups.forEach(function (fn) {
        if (typeof fn === "function") fn();
      });
    };
  });
})();
