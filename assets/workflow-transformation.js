/**
 * WorkflowTransformation island (Hostinger static)
 * Mirrors components/WorkflowTransformation.tsx
 *
 * Mapping (Current → Target):
 * - Intake + Copy to spreadsheet → Intake Jobs
 * - Distribute to field → Route Crews
 * - WhatsApp/paper + Admin sorting + Hand-drawn as-builts + Office re-entry
 *   → Annotated Map Creates As-Builts and Tallies Codes + Quantities
 * - Final approval + Invoice/closeout → Invoice + Closeout Docs Sent
 *
 * Progress:
 * 0–15%   show all 9 current
 * 15–30%  Intake+spreadsheet converge; SPREADSHEET HANDOFF REMOVED
 * 30–45%  Distribute → Route Crews
 * 45–70%  WhatsApp/admin/as-builts/re-entry → Annotated Map;
 *         DUPLICATE RE-ENTRY REMOVED then MANUAL TALLY REMOVED
 * 70–85%  Approval+invoice → final target
 * 85–100% four target steps settle
 */
(function () {
  "use strict";

  var CURRENT = [
    "Intake",
    "Copy to spreadsheet",
    "Distribute to field",
    "WhatsApp / codes / quantities / photos / paper job logs",
    "Admin sorts job log, closeout docs, and rekeys information",
    "As-builts created from field, often hand-drawn",
    "Office re-enters digitally for clean copy matching invoice",
    "Final approval",
    "Invoice sent with closeout documents",
  ];

  var TARGET = [
    "Intake Jobs",
    "Route Crews",
    "Annotated Map Creates As-Builts and Tallies Codes + Quantities",
    "Invoice + Closeout Docs Sent",
  ];

  var GROUPS = [
    { target: 0, sources: [0, 1], callout: 0, start: 0.15, end: 0.3 },
    { target: 1, sources: [2], callout: -1, start: 0.3, end: 0.45 },
    { target: 2, sources: [3, 4, 5, 6], callout: 1, start: 0.45, end: 0.7 },
    { target: 3, sources: [7, 8], callout: -1, start: 0.7, end: 0.85 },
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function ensureMarkup(root) {
    if (root.querySelector("[data-wt-stage]")) return;

    var html =
      '<div class="wt-inner">' +
      '<header class="wt-chrome">' +
      '<p class="wt-chrome-row">' +
      '<span data-wt-chrome-current>CURRENT · 9 STEPS</span>' +
      '<span class="wt-chrome-arrow" aria-hidden="true">→</span>' +
      '<span data-wt-chrome-target>TARGET · 4 STEPS</span>' +
      "</p>" +
      '<p class="wt-tagline">Capture the work once. Move the job forward.</p>' +
      "</header>" +
      '<div class="wt-stage" data-wt-stage>' +
      '<div class="wt-lists">' +
      '<div class="wt-col wt-col--current">' +
      '<p class="wt-list-label">Current</p>' +
      '<ol class="wt-list wt-list--current" aria-label="Current nine steps">';

    CURRENT.forEach(function (label, i) {
      html +=
        '<li class="wt-card wt-card--current" data-wt-current="' +
        i +
        '">' +
        '<span class="wt-card-num">' +
        (i + 1) +
        "</span>" +
        '<span class="wt-card-label">' +
        label +
        "</span></li>";
    });

    html +=
      "</ol></div>" +
      '<div class="wt-col wt-col--target">' +
      '<p class="wt-list-label">Target</p>' +
      '<ol class="wt-list wt-list--target" aria-label="Target four steps">';

    TARGET.forEach(function (label, i) {
      html +=
        '<li class="wt-card wt-card--target" data-wt-target="' +
        i +
        '">' +
        '<span class="wt-card-num">' +
        (i + 1) +
        "</span>" +
        '<span class="wt-card-label">' +
        label +
        "</span></li>";
    });

    html +=
      "</ol></div></div>" +
      '<div class="wt-callouts" aria-live="polite">' +
      '<p class="wt-callout" data-wt-callout="0">SPREADSHEET HANDOFF REMOVED</p>' +
      '<p class="wt-callout" data-wt-callout="1">DUPLICATE RE-ENTRY REMOVED</p>' +
      '<p class="wt-callout" data-wt-callout="2">MANUAL TALLY REMOVED</p>' +
      "</div></div>" +
      '<p class="wt-closing" data-wt-closing>9 handoffs → 4 connected steps</p>' +
      "</div>";

    root.innerHTML = html;
    root.classList.add("wt");
    if (!root.getAttribute("aria-label")) {
      root.setAttribute(
        "aria-label",
        "Workflow transformation from 9 current steps to 4 target steps"
      );
    }
  }

  function fitVars(Flip, el, target) {
    try {
      var vars = Flip.fit(el, target, {
        getVars: true,
        scale: true,
        absolute: false,
      });
      if (vars && typeof vars === "object") {
        return {
          x: vars.x || 0,
          y: vars.y || 0,
          scale: typeof vars.scale === "number" ? vars.scale : 0.85,
        };
      }
    } catch (e) {}
    var a = el.getBoundingClientRect();
    var b = target.getBoundingClientRect();
    return {
      x: b.left + b.width / 2 - (a.left + a.width / 2),
      y: b.top + b.height / 2 - (a.top + a.height / 2),
      scale: 0.82,
    };
  }

  /** Force settled closing contrast; inline !important + class must stick past scrub. */
  function settleClosing(gsap, el) {
    if (!el) return;
    el.classList.add("is-settled");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("visibility", "visible", "important");
    gsap.set(el, {
      autoAlpha: 1,
      visibility: "visible",
      opacity: 1,
      overwrite: "auto",
    });
  }

  /** Drop settle lock so scrub can drive closing again on reverse scroll. */
  function unlockClosing(el) {
    if (!el) return;
    el.classList.remove("is-settled");
    el.style.removeProperty("opacity");
    el.style.removeProperty("visibility");
  }

  function initRoot(root) {
    ensureMarkup(root);

    if (!window.gsap || !window.ScrollTrigger || !window.Flip) {
      console.warn("[WorkflowTransformation] GSAP/ScrollTrigger/Flip missing");
      root.classList.add("is-reduced");
      return function () {};
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var Flip = window.Flip;
    gsap.registerPlugin(ScrollTrigger, Flip);

    var currentCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-current]"));
    var targetCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-target]"));
    var callouts = gsap.utils.toArray(root.querySelectorAll("[data-wt-callout]"));
    var chromeCurrent = root.querySelector("[data-wt-chrome-current]");
    var chromeTarget = root.querySelector("[data-wt-chrome-target]");
    var closing = root.querySelector("[data-wt-closing]");
    var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var desktopMq = window.matchMedia("(min-width: 821px)");
    // Pin only large fine-pointer desktops. Coarse (touch) or ≤1024: natural scroll.
    var pinWideMq = window.matchMedia("(min-width: 1025px)");
    var coarseMq = window.matchMedia("(pointer: coarse)");

    var ctx = null;
    var st = null;

    function applyReduced() {
      root.classList.add("is-reduced");
      gsap.set(currentCards, { clearProps: "all", autoAlpha: 0 });
      gsap.set(targetCards, { clearProps: "transform", autoAlpha: 1 });
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(callouts, { autoAlpha: 1, y: 0, visibility: "visible" });
      settleClosing(gsap, closing);
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 0.4 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1 });
    }

    function build() {
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
      if (st) {
        st.kill();
        st = null;
      }

      root.classList.remove("is-reduced", "is-static-touch");
      currentCards.forEach(function (el) {
        el.classList.remove("is-merging", "is-merged");
        gsap.set(el, { clearProps: "transform,opacity,visibility" });
      });
      targetCards.forEach(function (el) {
        el.classList.remove("is-visible");
        gsap.set(el, { clearProps: "transform,opacity,visibility" });
      });
      if (closing) {
        closing.classList.remove("is-settled");
        closing.style.removeProperty("opacity");
        closing.style.removeProperty("visibility");
      }

      if (reduceMq.matches) {
        applyReduced();
        return;
      }

      // Reveal targets briefly so Flip.fit can measure real geometry (desktop)
      gsap.set(currentCards, { x: 0, y: 0, scale: 1, autoAlpha: 1, transformOrigin: "50% 50%" });
      gsap.set(targetCards, {
        autoAlpha: 1,
        visibility: "visible",
        x: 0,
        y: 0,
        scale: 1,
      });
      void root.offsetHeight;

      // desktopMq / pinWide kept for resize rebuild; fly-off LOCK uses one path (no pin).
      // WT_CARDS_FLY_OFF_LEFT_LOCK: one story — Current flies off LEFT, Target arrives.
      // pin:false always (mobile bar). Scrub ~0.35 over section. No Flip. No blank gaps.
      gsap.set(targetCards, { autoAlpha: 0, visibility: "hidden", y: 24, scale: 1 });
      gsap.set(callouts, { autoAlpha: 0, y: 6, visibility: "hidden" });
      if (closing) {
        closing.classList.remove("is-settled");
        closing.style.removeProperty("opacity");
        closing.style.removeProperty("visibility");
        gsap.set(closing, { autoAlpha: 0, visibility: "hidden", opacity: 0 });
      }
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 0.35 });

      var closingLocked = false;
      function forceSettledClosing() {
        closingLocked = true;
        settleClosing(gsap, closing);
      }
      function tryUnlockClosing(progress) {
        if (progress >= 0.55) return;
        closingLocked = false;
        unlockClosing(closing);
      }

      ctx = gsap.context(function () {
        var tl = gsap.timeline({ defaults: { ease: "none" } });

        // Hold Current visible briefly
        tl.to({}, { duration: 0.12 });

        // Current 9: stagger fly-off LEFT, then collapse (is-merged → display:none)
        currentCards.forEach(function (el, i) {
          var t0 = 0.12 + i * 0.055;
          var rot = i % 2 === 0 ? -6 : -4;
          tl.to(
            el,
            {
              x: "-110vw",
              autoAlpha: 0,
              rotate: rot,
              duration: 0.11,
              onStart: function () {
                el.classList.add("is-merging");
              },
              onComplete: function () {
                el.classList.add("is-merged");
              },
            },
            t0
          );
        });

        // Target 4: fade/slide up as Current peels (~progress 0.15+)
        targetCards.forEach(function (el, i) {
          tl.fromTo(
            el,
            { autoAlpha: 0, visibility: "hidden", y: 24 },
            {
              autoAlpha: 1,
              visibility: "visible",
              y: 0,
              duration: 0.1,
              onStart: function () {
                el.classList.add("is-visible");
                if (i === 3) forceSettledClosing();
              },
            },
            0.2 + i * 0.08
          );
        });

        // Callouts + chrome + closing near end
        if (callouts[0]) {
          tl.to(callouts[0], { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 }, 0.35);
        }
        if (callouts[1]) {
          tl.to(callouts[1], { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 }, 0.5);
        }
        if (callouts[2]) {
          tl.to(callouts[2], { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 }, 0.65);
        }

        tl.to(targetCards, { scale: 1, autoAlpha: 1, visibility: "visible", duration: 0.08, stagger: 0.02 }, 0.85);
        if (chromeCurrent) {
          tl.to(chromeCurrent, { autoAlpha: 0.35, duration: 0.1 }, 0.85);
        }
        if (chromeTarget) {
          tl.to(chromeTarget, { autoAlpha: 1, duration: 0.1 }, 0.85);
        }
        if (closing) {
          tl.to(
            closing,
            {
              autoAlpha: 1,
              visibility: "visible",
              opacity: 1,
              duration: 0.1,
              onStart: forceSettledClosing,
              onComplete: forceSettledClosing,
            },
            0.88
          );
        }

        // pin:false always; scrub over section only; reverse via scrub
        st = ScrollTrigger.create({
          animation: tl,
          trigger: root,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 0.35,
          pin: false,
          pinSpacing: false,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (self.progress >= 0.88) {
              forceSettledClosing();
            } else if (self.progress < 0.55) {
              tryUnlockClosing(self.progress);
            } else if (closingLocked) {
              forceSettledClosing();
            }
          },
          onLeave: function () {
            forceSettledClosing();
          },
          onEnterBack: function (self) {
            if (self.progress < 0.55) tryUnlockClosing(self.progress);
          },
        });
      }, root);
    }

    build();

    function onChange() {
      build();
      ScrollTrigger.refresh();
    }

    if (reduceMq.addEventListener) {
      reduceMq.addEventListener("change", onChange);
      desktopMq.addEventListener("change", onChange);
      pinWideMq.addEventListener("change", onChange);
      coarseMq.addEventListener("change", onChange);
    } else if (reduceMq.addListener) {
      reduceMq.addListener(onChange);
      desktopMq.addListener(onChange);
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
        desktopMq.removeEventListener("change", onChange);
        pinWideMq.removeEventListener("change", onChange);
        coarseMq.removeEventListener("change", onChange);
      } else if (reduceMq.removeListener) {
        reduceMq.removeListener(onChange);
        desktopMq.removeListener(onChange);
        pinWideMq.removeListener(onChange);
        coarseMq.removeListener(onChange);
      }
      if (ctx) ctx.revert();
      if (st) st.kill();
      ScrollTrigger.getAll().forEach(function (t) {
        if (t.trigger === root) t.kill();
      });
    };
  }

  ready(function () {
    var roots = document.querySelectorAll("[data-workflow-transformation]");
    if (!roots.length) return;
    var cleanups = [];
    roots.forEach(function (root) {
      cleanups.push(initRoot(root));
    });
    window.__wtCleanup = function () {
      cleanups.forEach(function (fn) {
        if (typeof fn === "function") fn();
      });
    };
  });
})();
