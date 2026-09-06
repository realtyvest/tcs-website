/**
 * Map-to-invoice island (Hostinger static)
 * Design LOCK: four states only - Annotated map / Tally = marks /
 * Ready to bill / Invoice same day. No marketing body copy. No dollar signs.
 *
 * PIN_HOLD_LOCK: pin #map-to-invoice on ALL breakpoints (incl. mobile/iPhone).
 * One pin + scrub (~0.4) drives the shared gsap.timeline(); end +=300% gives
 * ~1 viewport per step so Annotated map is never skipped. One panel visible at
 * a time via the .m2i.is-pinned overlap layout (CSS). settleFinal (CLEAR_STATE)
 * settles on Invoice items only. Only prefers-reduced-motion opts out of the
 * pin+scrub: static state 4. Gil supersedes the earlier mobile pin:false here.
 *
 * PIN_HOLD_REVISE: (1) panel swap is now SEQUENTIAL (hide outgoing fully, THEN
 * show next; zero overlap) so no ghost/overlapping titles mid-scrub; (2) pinned
 * stage/panels/visual heights fit the active card (CSS) so no blank navy void
 * under the card on mobile. Kept: pin on all breakpoints, syncStep, settleFinal
 * Invoice, end +=300% scroll distance, WT untouched.
 */
(function () {
  "use strict";

  var LABELS = [
    "Annotated map",
    "Tally = marks",
    "Ready to bill",
    "Invoice same day",
  ];

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
      '<p class="m2i-chrome-route">MAP → TALLY → BILL → INVOICE</p>' +
      "</div>" +
      '<div class="m2i-layout">' +
      '<ol class="m2i-labels" data-m2i-labels aria-label="Map to invoice states">';

    LABELS.forEach(function (label, i) {
      html +=
        '<li class="m2i-label" data-m2i-label="' +
        i +
        '">' +
        '<span class="m2i-label-num">' +
        (i + 1) +
        "</span>" +
        "<span>" +
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
      /* 1 Verified quantities */
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
      /* 3 Invoice items */
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
      "</div></div></div></div>";

    root.innerHTML = html;
  }

  function setActive(labels, panels, index) {
    labels.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
      el.classList.toggle("is-done", i < index);
    });
    panels.forEach(function (el, i) {
      el.classList.toggle("is-active", i === index);
    });
  }

  function initRoot(section) {
    ensureMarkup(section);

    var m2i = section.querySelector("[data-m2i-root]");
    var labels = Array.prototype.slice.call(
      section.querySelectorAll("[data-m2i-label]")
    );
    var panels = Array.prototype.slice.call(
      section.querySelectorAll("[data-m2i-panel]")
    );
    var pinTarget = section;

    if (!m2i || !labels.length || !panels.length) return function () {};

    /*
     * settleFinal — CLEAR_STATE fix (shared by mobile clearState, desktop
     * onLeave, and the timeline onComplete). Ghost bug root cause: on mobile
     * (@media max-width:1024 / coarse) CSS forces ALL .m2i-panel to
     * opacity:1 / visibility:visible / position:static, so clearProps on the
     * panels RESTORES that stack — previous panel titles (e.g. "Closeout
     * package") reappear under Invoice. Fix: never clearProps the panels;
     * explicitly hide every panel but 3 via autoAlpha and reset y.
     * Labels may clearProps (they read fine either way).
     * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/cheatsheet
     */
    function settleFinal() {
      setActive(labels, panels, 3);
      panels.forEach(function (p, i) {
        gsap.set(p, { autoAlpha: i === 3 ? 1 : 0, y: 0 });
      });
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      setActive(labels, panels, 3);
      m2i.classList.add("is-reduced");
      return function () {};
    }

    gsap.registerPlugin(ScrollTrigger);

    var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var pinWideMq = window.matchMedia("(min-width: 1025px)");
    var coarseMq = window.matchMedia("(pointer: coarse)");

    var ctx = null;
    var st = null;

    // PIN_HOLD_LOCK: m2i pins on ALL breakpoints (incl. mobile/iPhone/coarse/
    // touch). Only prefers-reduced-motion opts out of pin+scrub. Gil supersedes
    // the earlier mobile pin:false for THIS section only.
    function canPinNow() {
      return !reduceMq.matches;
    }

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
      gsap.set(labels, { clearProps: "opacity,visibility,transform" });
      gsap.set(panels, { clearProps: "opacity,visibility,transform" });
      setActive(labels, panels, 3);
    }

    /*
     * MAP_TO_INVOICE_TIMELINE_LOCK — https://gsap.com/docs/v3/GSAP/Timeline
     *                                https://gsap.com/cheatsheet
     * One gsap.timeline(): enter staggers steps 1–4 in (autoAlpha + slight y),
     * then the SAME timeline crossfades the panels
     * Annotated map → Verified quantities → Closeout → Invoice.
     *
     * SYNC LOCK (Gil FAIL was step 4 lit while panel still Annotated map):
     * the step highlight is NOT driven by per-tween onStart (which scrub can
     * skip or fire out of order). Instead one syncStep() derives the active
     * index from the timeline's own playhead time and is fired both on every
     * update AND by tl.call() at the swap point — the SAME position as the
     * panel swap. Because both the panel autoAlpha and the label highlight
     * read the same tl.time(), they can never desync, and scrubbing in reverse
     * restores the prior step automatically.
     *
     * GHOST FIX (PIN_HOLD_REVISE): the earlier crossfade faded outgoing and
     * incoming panels SIMULTANEOUSLY (both started at `at`, dur 0.35), so
     * mid-scrub two panel titles were readable at once. Now the swap is
     * SEQUENTIAL with zero overlap: the outgoing panel reaches autoAlpha 0
     * over FADE, THEN the next fades in over FADE starting at `at + FADE`.
     * At most one title is ever visible. settleFinal end is unchanged.
     */
    var SEQ_START = 0.6; // enter (labels) finishes before the panel sequence
    var STEP_DUR = 0.5; // time between successive step swaps
    var FADE = 0.16; // per-half fade; sequential (out THEN in), zero overlap

    // Which step should be lit at timeline time t (switch when the outgoing
    // panel is fully hidden and the next begins — the sequential swap point).
    function activeStepAtTime(t) {
      for (var i = 3; i >= 1; i--) {
        var mid = SEQ_START + (i - 1) * STEP_DUR + FADE;
        if (t >= mid) return i;
      }
      return 0;
    }

    function buildSequenceTimeline() {
      setActive(labels, panels, 0);
      gsap.set(labels, { autoAlpha: 0, y: 8 });
      panels.forEach(function (panel, i) {
        gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 10 });
      });

      var lastStep = 0;
      function syncStep(force) {
        var idx = activeStepAtTime(tl.time());
        if (force === true || idx !== lastStep) {
          lastStep = idx;
          setActive(labels, panels, idx);
        }
      }

      var tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: syncStep,
      });

      // Enter: stagger the four steps in (position parameter 0 = timeline start)
      tl.to(
        labels,
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
        0
      );

      // Same timeline: swap panels in order. SEQUENTIAL (GHOST FIX) — hide the
      // outgoing panel fully (autoAlpha 0) over FADE, THEN reveal the next over
      // FADE starting at `at + FADE`, so no two titles overlap mid-scrub.
      // tl.call at the swap point re-derives the active step — reverse-safe.
      for (var i = 0; i < 3; i++) {
        (function (from) {
          var next = from + 1;
          var at = SEQ_START + from * STEP_DUR;
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
     * PIN_HOLD_LOCK — pin + scrub drives the shared timeline on ALL breakpoints
     * (desktop AND mobile/iPhone). The .m2i.is-pinned class flips the panels to
     * the overlap layout so exactly one panel is visible at a time while the
     * section is frozen; the matching slide holds until the sequence completes,
     * then the page scrolls on. end +=300% ≈ one viewport per step across the
     * four steps so Annotated map is never skipped. onLeave settleFinal leaves
     * Invoice items only (no ghost Closeout).
     * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/scroll/
     * https://gsap.com/docs/v3/Plugins/ScrollTrigger/
     */
    function applyPinned() {
      killLocal();
      m2i.classList.remove("is-reduced");
      m2i.classList.add("is-pinned");

      ctx = gsap.context(function () {
        var tl = buildSequenceTimeline();

        st = ScrollTrigger.create({
          animation: tl,
          trigger: pinTarget,
          start: "top top+=72",
          end: "+=300%", // ~1 viewport per step; Annotated map not skipped
          scrub: 0.4,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onLeave: settleFinal, // step + panel 3, no half-scrubbed panels left
        });
      }, section);
    }

    function build() {
      if (reduceMq.matches) {
        applyReduced();
        return;
      }
      // PIN_HOLD_LOCK: pin+scrub on every breakpoint. canPinNow() is true for
      // m2i except prefers-reduced-motion (already handled above).
      applyPinned();
    }

    build();

    function onChange() {
      build();
      ScrollTrigger.refresh();
    }

    if (reduceMq.addEventListener) {
      reduceMq.addEventListener("change", onChange);
      pinWideMq.addEventListener("change", onChange);
      coarseMq.addEventListener("change", onChange);
    } else if (reduceMq.addListener) {
      reduceMq.addListener(onChange);
      pinWideMq.addListener(onChange);
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
        pinWideMq.removeEventListener("change", onChange);
        coarseMq.removeEventListener("change", onChange);
      } else if (reduceMq.removeListener) {
        reduceMq.removeListener(onChange);
        pinWideMq.removeListener(onChange);
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
