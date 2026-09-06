/**
 * Map-to-invoice island (Hostinger static)
 * Design LOCK: four states only - Annotated map / Verified quantities /
 * Closeout package / Invoice items. No marketing body copy. No dollar signs.
 *
 * Desktop (fine pointer · no touch · >=1025): one pin, scrub ~0.25, end +=120%,
 * fastScrollEnd. Kill pin if coarse OR maxTouchPoints>0 OR width <=1024.
 * Mobile/coarse/touch/<=1024: stacked panels, no pin.
 * Reduced motion: static stack, Invoice items active, no scrub/pin.
 */
(function () {
  "use strict";

  var LABELS = [
    "Annotated map",
    "Verified quantities",
    "Closeout package",
    "Invoice items",
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
      '<p class="m2i-chrome-route">MAP → QTY → CLOSEOUT → INVOICE</p>' +
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
      '<p class="m2i-panel-title">Verified quantities</p>' +
      '<p class="m2i-panel-meta">TALLY · LOCKED</p>' +
      "</div>" +
      '<div class="m2i-visual">' +
      '<ul class="m2i-tally">' +
      '<li><span class="m2i-tally-code">FO-12</span><span><span class="m2i-tally-qty">840 LF</span><span class="m2i-tally-ok">OK</span></span></li>' +
      '<li><span class="m2i-tally-code">DROP-1</span><span><span class="m2i-tally-qty">14 EA</span><span class="m2i-tally-ok">OK</span></span></li>' +
      '<li><span class="m2i-tally-code">SPLICE</span><span><span class="m2i-tally-qty">6 EA</span><span class="m2i-tally-ok">OK</span></span></li>' +
      '<li><span class="m2i-tally-code">LOCATE</span><span><span class="m2i-tally-qty">2 EA</span><span class="m2i-tally-ok">OK</span></span></li>' +
      "</ul></div></div>" +
      /* 2 Closeout package */
      '<div class="m2i-panel" data-m2i-panel="2">' +
      '<div class="m2i-panel-head">' +
      '<p class="m2i-panel-title">Closeout package</p>' +
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
      '<p class="m2i-panel-title">Invoice items</p>' +
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

    function canPinNow() {
      return pinWideMq.matches && !coarseMq.matches && !(navigator.maxTouchPoints > 0) && !reduceMq.matches;
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
     * update AND by tl.call() at each crossfade midpoint — the SAME position as
     * the panel crossfade. Because both the panel autoAlpha and the label
     * highlight read the same tl.time(), they can never desync, and scrubbing
     * in reverse restores the prior step automatically.
     */
    var SEQ_START = 0.6; // enter (labels) finishes before the panel sequence
    var STEP_DUR = 0.5; // time between successive crossfade starts
    var CROSS = 0.35; // crossfade duration

    // Which step should be lit at timeline time t (switch at crossfade midpoint)
    function activeStepAtTime(t) {
      for (var i = 3; i >= 1; i--) {
        var mid = SEQ_START + (i - 1) * STEP_DUR + CROSS / 2;
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

      // Same timeline: crossfade panels in order. tl.call at each crossfade
      // midpoint re-derives the active step from the playhead — reverse-safe.
      for (var i = 0; i < 3; i++) {
        (function (from) {
          var next = from + 1;
          var at = SEQ_START + from * STEP_DUR;
          tl.to(panels[from], { autoAlpha: 0, y: -8, duration: CROSS }, at);
          tl.fromTo(
            panels[next],
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: CROSS },
            at
          );
          tl.call(syncStep, null, at + CROSS / 2);
        })(i);
      }
      return tl;
    }

    /* Desktop (fine pointer, wide): short pin + scrub drives the same timeline. */
    function applyPinned() {
      killLocal();
      m2i.classList.remove("is-reduced");

      ctx = gsap.context(function () {
        var tl = buildSequenceTimeline();

        st = ScrollTrigger.create({
          animation: tl,
          trigger: pinTarget,
          start: "top top+=72",
          end: "+=120%",
          scrub: 0.25,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onLeave: function () {
            // Force complete sync: step + panel 3, no half-scrubbed panels left.
            setActive(labels, panels, 3);
            panels.forEach(function (p, i) {
              gsap.set(p, { autoAlpha: i === 3 ? 1 : 0, y: 0 });
            });
          },
        });
      }, section);
    }

    /*
     * Mobile / touch: pin false. Play the SAME shared sequence timeline ONCE on
     * enter — but only after a real user scroll (scroll-arm, same as WT), so Gil
     * actually sees it fire instead of it finishing off-screen. On complete OR
     * leave, CLEAR_STATE forces step + panel 3 and restores the readable stacked
     * layout so nothing is ever left hidden.
     * https://gsap.com/docs/v3/GSAP/Timeline
     */
    function applyOncePlayMobile() {
      killLocal();
      m2i.classList.remove("is-reduced");

      ctx = gsap.context(function () {
        var tl = buildSequenceTimeline();
        tl.pause(0);

        var played = false;
        var scrolled = false;
        var inView = false;
        var fallbackId = null;
        var io = null;

        function clearState() {
          // CLEAR_STATE: settle on step + panel 3, restore stacked visibility.
          setActive(labels, panels, 3);
          gsap.set(labels, { clearProps: "opacity,visibility,transform" });
          gsap.set(panels, { clearProps: "opacity,visibility,transform" });
        }

        function removeArm() {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("wheel", onScroll);
          window.removeEventListener("touchmove", onScroll);
          window.removeEventListener("keydown", onScroll);
        }

        function play() {
          if (played) return;
          played = true;
          removeArm();
          if (fallbackId) {
            clearTimeout(fallbackId);
            fallbackId = null;
          }
          if (io) {
            io.disconnect();
            io = null;
          }
          tl.eventCallback("onComplete", clearState);
          tl.play(0);
        }

        function tryPlay() {
          if (!played && scrolled && inView) play();
        }

        function onScroll() {
          scrolled = true;
          tryPlay();
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("wheel", onScroll, { passive: true });
        window.addEventListener("touchmove", onScroll, { passive: true });
        window.addEventListener("keydown", onScroll);

        if (typeof IntersectionObserver !== "undefined") {
          io = new IntersectionObserver(
            function (entries) {
              for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                  inView = true;
                  tryPlay();
                  break;
                }
              }
            },
            { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
          );
          io.observe(section);
        } else {
          inView = true;
        }

        // Anti-blank: if no scroll arrives shortly after the section is
        // reachable, do NOT skip the sequence when it is on screen — play the
        // shared timeline so Gil sees it fire. Only fall back to a clean state 3
        // stack if the section was never entered (never in view).
        fallbackId = setTimeout(function () {
          if (played) return;
          if (inView) {
            play();
          } else {
            played = true;
            removeArm();
            if (io) {
              io.disconnect();
              io = null;
            }
            clearState();
          }
        }, 2600);

        return function () {
          removeArm();
          if (fallbackId) clearTimeout(fallbackId);
          if (io) io.disconnect();
        };
      }, section);
    }

    function build() {
      if (reduceMq.matches) {
        applyReduced();
        return;
      }
      if (canPinNow()) {
        applyPinned();
        return;
      }
      applyOncePlayMobile();
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
