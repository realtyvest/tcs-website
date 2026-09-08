/**
 * Construction + Drops path islands (Hostinger static) — shared Pattern A.
 *
 * CONSTRUCTION_DROPS_LAYOUT_LOCK / PLACEMENT_LOCK. Two Pattern A stacks on the
 * homepage after #spine: #path-construction then #path-drops. Pattern A is the
 * MAP_TO_INVOICE_PROGRESS_BAR_STORY_LOCK motion (tip 30d04d9) extracted here
 * into ONE shared, config-driven module used by BOTH sections:
 *
 *  - a 4-step workflow PROGRESS BAR sits on top (the story driver); below it one
 *    panel (visual + one short title line + a helper line) shows the ACTIVE step
 *    only.
 *  - ONE gsap.timeline() per island owns BOTH the bar fill/lights AND the panel
 *    swap, so they share a single playhead and can never desync.
 *  - a short ScrollTrigger pin holds the framed section (.section-inner: topic +
 *    breadcrumb + bar + active card + CTA) for ~1.4 viewports (end "+=140%")
 *    while the bar lights left->right and the panels follow the same playhead.
 *    Pin start clears the measured sticky-nav height so the H2 stays readable.
 *  - completed steps stay lit; CLEAR_STATE on leave (settleFinal): full bar lit
 *    + last-step panel only.
 *  - SEQUENTIAL pins: sections init in document order (Construction before
 *    Drops), each pins with pinSpacing so Construction fully unpins before Drops
 *    arms.
 *  - optional per-step snap on coarse (mobile) pointers; prefers-reduced-motion:
 *    static full bar + last panel, no pin.
 *
 * No dollar signs. No Closeout step title. No em dashes in copy. Fit Call only.
 *
 * Cites: cheatsheet https://gsap.com/cheatsheet · gsap-core · gsap-timeline
 * https://gsap.com/docs/v3/GSAP/Timeline · gsap-scrolltrigger
 * https://gsap.com/docs/v3/Plugins/ScrollTrigger/ · https://gsap.com/scroll/
 */
(function () {
  "use strict";

  // Breadcrumb short codes (both paths): MAP -> SUBMIT -> TALLY -> INVOICE.
  var CODES = ["MAP", "SUBMIT", "TALLY", "INVOICE"];

  // ---- Shared placeholder panel visuals (Placeholders OK for panel art) ----
  function visualMap() {
    return (
      '<div class="pth-visual"><div class="pth-map" aria-hidden="true">' +
      '<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">' +
      '<line class="pth-map-grid" x1="40" y1="0" x2="40" y2="220"/>' +
      '<line class="pth-map-grid" x1="120" y1="0" x2="120" y2="220"/>' +
      '<line class="pth-map-grid" x1="200" y1="0" x2="200" y2="220"/>' +
      '<line class="pth-map-grid" x1="280" y1="0" x2="280" y2="220"/>' +
      '<line class="pth-map-grid" x1="360" y1="0" x2="360" y2="220"/>' +
      '<line class="pth-map-grid" x1="0" y1="40" x2="400" y2="40"/>' +
      '<line class="pth-map-grid" x1="0" y1="110" x2="400" y2="110"/>' +
      '<line class="pth-map-grid" x1="0" y1="180" x2="400" y2="180"/>' +
      '<path class="pth-map-route" d="M36 178 C 90 170, 110 120, 160 112 S 240 96, 290 70 S 340 48, 372 42"/>' +
      '<path class="pth-map-route" d="M70 40 L 70 150 L 210 150 L 210 190" stroke-dasharray="3 4"/>' +
      '<circle class="pth-map-mark" cx="70" cy="40" r="4"/>' +
      '<circle class="pth-map-mark" cx="160" cy="112" r="4"/>' +
      '<circle class="pth-map-mark" cx="290" cy="70" r="4"/>' +
      '<circle class="pth-map-mark" cx="210" cy="190" r="4"/>' +
      "</svg></div></div>"
    );
  }

  function visualSubmit() {
    return (
      '<div class="pth-visual"><div class="pth-submit">' +
      '<div class="pth-submit-row"><span>FIELD APP</span><span class="pth-submit-status">SYNCED</span></div>' +
      '<div class="pth-submit-row"><span>PHOTOS · 12</span><span class="pth-submit-status">ATTACHED</span></div>' +
      '<div class="pth-submit-row"><span>GPS · LOCKED</span><span class="pth-submit-status">OK</span></div>' +
      '<div class="pth-submit-cta">SUBMIT ONCE</div>' +
      "</div></div>"
    );
  }

  function visualTally() {
    return (
      '<div class="pth-visual"><ul class="pth-tally">' +
      '<li><span class="pth-tally-code">FO-12</span><span><span class="pth-tally-qty">840 LF</span><span class="pth-tally-ok">OK</span></span></li>' +
      '<li><span class="pth-tally-code">DROP-1</span><span><span class="pth-tally-qty">14 EA</span><span class="pth-tally-ok">OK</span></span></li>' +
      '<li><span class="pth-tally-code">SPLICE</span><span><span class="pth-tally-qty">6 EA</span><span class="pth-tally-ok">OK</span></span></li>' +
      '<li><span class="pth-tally-code">LOCATE</span><span><span class="pth-tally-qty">2 EA</span><span class="pth-tally-ok">OK</span></span></li>' +
      "</ul></div>"
    );
  }

  function visualInvoice() {
    return (
      '<div class="pth-visual"><ul class="pth-invoice">' +
      '<li><span class="pth-invoice-code">2210 FO-12</span><span class="pth-invoice-qty">840 LF</span><span class="pth-invoice-flag">LINE</span></li>' +
      '<li><span class="pth-invoice-code">2214 DROP</span><span class="pth-invoice-qty">14 EA</span><span class="pth-invoice-flag">LINE</span></li>' +
      '<li><span class="pth-invoice-code">2301 SPLICE</span><span class="pth-invoice-qty">6 EA</span><span class="pth-invoice-flag">LINE</span></li>' +
      '<li><span class="pth-invoice-code">2105 LOCATE</span><span class="pth-invoice-qty">2 EA</span><span class="pth-invoice-flag">LINE</span></li>' +
      "</ul></div>"
    );
  }

  var VISUALS = [visualMap, visualSubmit, visualTally, visualInvoice];

  // ---- Section configs (locked strings from CONSTRUCTION-DROPS-PATH-STRINGS) ----
  var CONFIGS = {
    construction: {
      chromeId: "PROJECT-2207 · FIBER BUILD",
      metas: ["SEG-07 · RT-A", "FIELD", "PROJECT ROLLUP", "PROGRESSIVE"],
      steps: [
        { label: "Mark the map", helper: "Codes and quantities as the job progresses" },
        { label: "Submit", helper: "Each submittal from the field" },
        { label: "Tally = marks", helper: "Production rolls up to the project" },
        { label: "Invoice", helper: "Progressive billing from that tally" },
      ],
    },
    drops: {
      chromeId: "JOB-4821 · FIBER DROP",
      metas: ["SEG-07 · RT-A", "FIELD", "TALLY · LOCKED", "INV-LINES"],
      steps: [
        { label: "Mark the map", helper: "Codes and quantities on the address" },
        { label: "Submit", helper: "Once, from the field" },
        { label: "Tally = marks", helper: "What left the drop is what gets tallied" },
        // Step 4 title shows the helper "Ready to bill. Invoice the same day."
        // — helper only, NOT a 5th bar step.
        { label: "Invoice same day", helper: "Ready to bill. Invoice the same day." },
      ],
    },
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function ensureMarkup(section, cfg) {
    if (section.querySelector("[data-pth-root]")) return;
    // Inject the island (bar + stage) into the inner mount only, so the locked
    // h2 / sub / CTA in the HTML are preserved.
    var mount = section.querySelector("[data-path-island]") || section;

    var html =
      '<div class="pth" data-pth-root>' +
      '<div class="pth-chrome">' +
      '<p class="pth-chrome-id">' +
      cfg.chromeId +
      "</p>" +
      "</div>" +
      /* ---- Progress bar (story driver) ---- */
      '<ol class="pth-bar" data-pth-bar aria-label="Path progress">' +
      '<span class="pth-bar-track" aria-hidden="true"><span class="pth-bar-fill" data-pth-fill></span></span>';

    cfg.steps.forEach(function (step, i) {
      html +=
        '<li class="pth-bar-step" data-pth-step="' +
        i +
        '">' +
        /* PATH_BAR_CODES (Gil, 2026-09-08): the route codes are the node
           labels, centred above the line; the duplicate route line and the
           small labels under the dots are gone. */
        '<span class="pth-bar-label">' +
        CODES[i] +
        "</span>" +
        '<span class="pth-bar-dot" aria-hidden="true"></span>' +
        "</li>";
    });

    html += "</ol>" + '<div class="pth-stage" data-pth-stage>' +
      '<div class="pth-panels" data-pth-panels>';

    cfg.steps.forEach(function (step, i) {
      html +=
        '<div class="pth-panel" data-pth-panel="' +
        i +
        '">' +
        '<div class="pth-panel-head">' +
        '<p class="pth-panel-title">' +
        step.label +
        "</p>" +
        '<p class="pth-panel-meta">' +
        cfg.metas[i] +
        "</p>" +
        "</div>" +
        VISUALS[i]() +
        '<p class="pth-panel-helper">' +
        step.helper +
        "</p>" +
        "</div>";
    });

    html += "</div></div></div>";

    mount.innerHTML = html;
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

  /*
   * Measure the REAL sticky nav height so the pin start clears it on every
   * device. A hardcoded 72px sat too low under the iPhone header, dropping the
   * H2/breadcrumb behind the nav. Prefer the live rendered height of the
   * sticky/fixed <nav>; fall back to the --nav-h CSS var, then 64. Pin start is
   * navHeight + 8 (small breathing gap under the nav).
   */
  function getStickyNavHeight() {
    var nav = document.querySelector("nav");
    if (nav) {
      var pos = window.getComputedStyle(nav).position;
      if (pos === "sticky" || pos === "fixed") {
        var h = Math.round(nav.getBoundingClientRect().height);
        if (h > 0) return h;
      }
    }
    var root = window.getComputedStyle(document.documentElement);
    var v = parseInt(root.getPropertyValue("--nav-h"), 10);
    if (!isNaN(v) && v > 0) return v;
    return 64;
  }

  function initPath(section, cfg) {
    ensureMarkup(section, cfg);

    var pth = section.querySelector("[data-pth-root]");
    var steps = Array.prototype.slice.call(
      section.querySelectorAll("[data-pth-step]")
    );
    var panels = Array.prototype.slice.call(
      section.querySelectorAll("[data-pth-panel]")
    );
    var fill = section.querySelector("[data-pth-fill]");
    // PATH_SCROLL_HOLD_REVISE — pin the .section-inner (H2 + sub + breadcrumb +
    // progress bar + active card + Fit Call CTA) so the whole framed view holds
    // while scrubbing. Pinning the island alone let the H2/sub scroll off (and
    // under the sticky nav). Fall back to the island only if inner is missing.
    var pinTarget = section.querySelector(".section-inner") || pth;
    var LAST = steps.length - 1; // 3

    if (!pth || !steps.length || !panels.length) return function () {};

    /*
     * settleFinal — CLEAR_STATE. On leaving the pin (scrolled past) settle on
     * the full lit bar + last-step panel only. Never clearProps the panels
     * (mobile/reduced CSS would restore the whole stack and re-show earlier
     * titles). Explicitly light every step and show the last panel alone.
     * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/cheatsheet
     */
    function settleFinal() {
      steps.forEach(function (el, i) {
        el.classList.add("is-complete");
        el.classList.toggle("is-active", i === LAST);
      });
      if (fill) gsap.set(fill, { scaleX: 1 });
      panels.forEach(function (p, i) {
        // Last panel at rest (no leftover x/y); the rest parked off-right, hidden.
        gsap.set(p, {
          autoAlpha: i === LAST ? 1 : 0,
          xPercent: i === LAST ? 0 : 28,
          y: 0,
        });
      });
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      setActive(steps, panels, LAST);
      if (fill) fill.style.transform = "scaleX(1)";
      pth.classList.add("is-reduced");
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
      pth.classList.remove("is-pinned");
      pth.classList.add("is-reduced");
      gsap.set(steps, { clearProps: "opacity,visibility,transform" });
      gsap.set(panels, { clearProps: "opacity,visibility,transform" });
      settleFinal(); // static full bar + last panel
    }

    /*
     * Pattern A — one gsap.timeline() owns the bar fill/lights AND the panel
     * swap so they share a single playhead.
     * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/cheatsheet
     *
     * Time budget (STEP_DUR = 1): four equal quarters over a total duration of
     * 4 — step 0 lives in [0,1), 1 in [1,2), 2 in [2,3), 3 (INVOICE) holds
     * [3,4]. The fill tween (scaleX 0->1, duration 4) IS the longest child, so
     * it fixes the timeline length and the trailing INVOICE hold exists. Panel
     * swaps are SEQUENTIAL fly-ins (outgoing slides off-left + fades over SWAP,
     * THEN incoming flies in from off-right + fades over SWAP) so at most one
     * panel title is visible mid-scrub. Incoming: xPercent 28->0 power2.out;
     * outgoing: xPercent ->-18 power2.in. The lit step is derived from the
     * playhead (syncStep) on every update AND at each swap point, so bar +
     * panel can never desync and reverse-scrub restores the prior step.
     */
    var STEP_DUR = 1;
    var SWAP = 0.3; // per half (out, then in) — a hair longer than the old fade
    var TOTAL = 4; // 4 equal quarters (last step holds the last quarter)

    function activeStepAtTime(t) {
      for (var i = LAST; i >= 1; i--) {
        var mid = i * STEP_DUR + SWAP; // switch just after the incoming fly-in begins
        if (t >= mid) return i;
      }
      return 0;
    }

    function buildSequenceTimeline() {
      setActive(steps, panels, 0);
      gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
      panels.forEach(function (panel, i) {
        // First panel at rest; every inactive panel parked off-right, hidden.
        gsap.set(panel, {
          xPercent: i === 0 ? 0 : 28,
          autoAlpha: i === 0 ? 1 : 0,
          y: 0,
        });
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

      // Sequential fly-in swaps at t = 1, 2, 3. Outgoing slides off-left and
      // fades over SWAP (power2.in), THEN the incoming panel flies in from
      // off-right and fades over SWAP (power2.out) at at+SWAP. tl.call
      // re-derives the lit step at the swap point (reverse-safe).
      for (var i = 0; i < LAST; i++) {
        (function (from) {
          var next = from + 1;
          var at = STEP_DUR * (from + 1);
          tl.to(
            panels[from],
            { xPercent: -18, autoAlpha: 0, duration: SWAP, ease: "power2.in" },
            at
          );
          tl.fromTo(
            panels[next],
            { xPercent: 28, autoAlpha: 0 },
            { xPercent: 0, autoAlpha: 1, duration: SWAP, ease: "power2.out" },
            at + SWAP
          );
          tl.call(syncStep, null, at + SWAP);
        })(i);
      }
      return tl;
    }

    /*
     * Short pin — freeze the framed section (topic + breadcrumb + bar + active
     * card + CTA) for ~1.4 viewports total (end "+=140%") while the bar lights
     * and the panels follow the same playhead. scrub ties timeline progress to
     * scroll. Pin start = measured sticky-nav height + 8 so the H2/breadcrumb
     * never sit under the nav (72px was too low on iPhone). onLeave settleFinal
     * -> full bar + last panel only. Sequential pins: sections init in document
     * order with pinSpacing, so Construction fully unpins before Drops arms.
     * Optional snap per step on coarse (mobile) pointers: snap to each quarter
     * midpoint (t = .5/1.5/2.5/3.5) so a rest lands cleanly inside one state.
     * https://gsap.com/docs/v3/Plugins/ScrollTrigger/ · https://gsap.com/scroll/
     */
    function applyPinned() {
      killLocal();
      pth.classList.remove("is-reduced");
      pth.classList.add("is-pinned");

      ctx = gsap.context(function () {
        var tl = buildSequenceTimeline();

        var navH = getStickyNavHeight();

        var cfg2 = {
          animation: tl,
          trigger: pinTarget,
          start: "top top+=" + (navH + 8),
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
        // PATH_SNAP_NEAREST_FIX: directional + inertia snapping (the 3.12
        // default) let a thumb flick snap straight to the far end, skipping the
        // fly-ins. Snap to the NEAREST state only, with no inertia projection.
        if (coarseMq.matches) {
          cfg2.snap = {
            snapTo: [0.125, 0.375, 0.625, 0.875],
            duration: { min: 0.15, max: 0.3 },
            ease: "power1.inOut",
            directional: false,
            inertia: false,
            delay: 0.1,
          };
        }

        st = ScrollTrigger.create(cfg2);
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
    var lastW = window.innerWidth;
    function onResize() {
      // Width changes only; the mobile address bar fires height-only resizes.
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
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
    // querySelectorAll returns document order, so Construction inits before
    // Drops -> pins are created top-to-bottom (sequential).
    var roots = document.querySelectorAll("[data-path]");
    if (!roots.length) return;
    var cleanups = [];
    roots.forEach(function (root) {
      var cfg = CONFIGS[root.getAttribute("data-path-key")];
      if (!cfg) return;
      cleanups.push(initPath(root, cfg));
    });
    // One refresh after both islands build so pin spacing is computed with both
    // present (ScrollTrigger recalcs in creation/page order).
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    window.__pathsCleanup = function () {
      cleanups.forEach(function (fn) {
        if (typeof fn === "function") fn();
      });
    };
  });
})();
