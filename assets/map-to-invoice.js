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
      gsap.set(panels, { clearProps: "opacity,visibility,transform" });
      setActive(labels, panels, 3);
    }

    function applyTouchScrub() {
      killLocal();
      m2i.classList.remove("is-reduced");

      ctx = gsap.context(function () {
        setActive(labels, panels, 0);

        panels.forEach(function (panel, i) {
          gsap.set(panel, {
            opacity: i === 0 ? 1 : 0,
            visibility: i === 0 ? "visible" : "hidden",
            y: i === 0 ? 0 : 10,
          });
        });

        var tl = gsap.timeline({
          defaults: { ease: "none" },
        });

        for (var i = 0; i < 3; i++) {
          (function (from) {
            var next = from + 1;
            tl.to(
              panels[from],
              {
                opacity: 0,
                y: -8,
                visibility: "hidden",
                duration: 0.2,
              },
              from + 0.8
            );
            tl.fromTo(
              panels[next],
              { opacity: 0, y: 10, visibility: "hidden" },
              {
                opacity: 1,
                y: 0,
                visibility: "visible",
                duration: 0.2,
                onStart: function () {
                  setActive(labels, panels, next);
                },
              },
              from + 0.8
            );
          })(i);
        }

        var natural = tl.duration();
        if (natural > 0) tl.timeScale(natural / 1.4);
        tl.pause(0);
        st = ScrollTrigger.create({
          animation: tl,
          trigger: section,
          start: "top 75%",
          end: "bottom 20%",
          scrub: false,
          pin: false,
          pinSpacing: false,
          toggleActions: "play reverse play reverse",
          invalidateOnRefresh: true,
          onLeave: function () {
            setActive(labels, panels, 3);
          },
        });
      }, section);
    }

    function applyPinned() {
      killLocal();
      m2i.classList.remove("is-reduced");

      ctx = gsap.context(function () {
        setActive(labels, panels, 0);

        panels.forEach(function (panel, i) {
          gsap.set(panel, {
            opacity: i === 0 ? 1 : 0,
            visibility: i === 0 ? "visible" : "hidden",
            y: i === 0 ? 0 : 10,
          });
        });

        var tl = gsap.timeline({
          defaults: { ease: "none" },
        });

        /* Four equal steps across the scrub range */
        for (var i = 0; i < 3; i++) {
          (function (from) {
            var next = from + 1;
            tl.to(
              panels[from],
              {
                opacity: 0,
                y: -8,
                visibility: "hidden",
                duration: 0.2,
              },
              from + 0.8
            );
            tl.fromTo(
              panels[next],
              { opacity: 0, y: 10, visibility: "hidden" },
              {
                opacity: 1,
                y: 0,
                visibility: "visible",
                duration: 0.2,
                onStart: function () {
                  setActive(labels, panels, next);
                },
              },
              from + 0.8
            );
          })(i);
        }

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
          onUpdate: function (self) {
            var step = Math.min(3, Math.floor(self.progress * 4));
            if (self.progress >= 0.99) step = 3;
            setActive(labels, panels, step);
          },
          onLeave: function () {
            setActive(labels, panels, 3);
          },
        });
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
      applyTouchScrub();
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
