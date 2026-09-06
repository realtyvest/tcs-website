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

    if (!window.gsap || !window.ScrollTrigger) {
      console.warn("[WorkflowTransformation] GSAP/ScrollTrigger missing");
      root.classList.add("is-reduced");
      return function () {};
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    /*
     * WT_DEMO_CLEAR_STATE_LOCK
     * Cite: https://gsap.com/docs/v3/GSAP/ + https://gsap.com/scroll/
     * Discrete states — toggleActions play once (NO scrub park).
     * Target always finishes autoAlpha:1. No xPercent. pin:false.
     */
    var currentCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-current]"));
    var targetCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-target]"));
    var callouts = gsap.utils.toArray(root.querySelectorAll("[data-wt-callout]"));
    var chromeCurrent = root.querySelector("[data-wt-chrome-current]");
    var chromeTarget = root.querySelector("[data-wt-chrome-target]");
    var closing = root.querySelector("[data-wt-closing]");

    var mm = null;
    var built = false;
    var refreshTimer = null;

    function applyReduced() {
      root.classList.add("is-reduced");
      forceStateB();
    }

    function forceStateA() {
      // Current full; Target fully hidden — resting demonstrative state
      currentCards.forEach(function (el) {
        el.classList.remove("is-merging", "is-merged");
      });
      targetCards.forEach(function (el) {
        el.classList.remove("is-visible");
      });
      gsap.set(currentCards, {
        clearProps: "transform,x,y,rotation,xPercent",
        x: 0,
        y: 0,
        xPercent: 0,
        autoAlpha: 1,
        visibility: "visible",
        opacity: 1,
      });
      gsap.set(targetCards, {
        clearProps: "transform,x,y,rotation,xPercent",
        x: 0,
        y: 16,
        xPercent: 0,
        autoAlpha: 0,
        visibility: "hidden",
        opacity: 0,
      });
      gsap.set(callouts, { autoAlpha: 0, y: 8, visibility: "hidden", opacity: 0 });
      if (closing) {
        closing.classList.remove("is-settled");
        gsap.set(closing, { autoAlpha: 0, visibility: "hidden", opacity: 0 });
      }
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1, opacity: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 0.35, opacity: 0.35 });
    }

    function forceStateB() {
      // Complete Target — NEVER leave ghosted mid-fade
      currentCards.forEach(function (el) {
        el.classList.add("is-merged");
        el.classList.remove("is-merging");
      });
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(currentCards, {
        autoAlpha: 0,
        opacity: 0,
        visibility: "hidden",
        y: -12,
      });
      gsap.set(targetCards, {
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible",
        y: 0,
        x: 0,
        xPercent: 0,
      });
      gsap.set(callouts, { autoAlpha: 1, opacity: 1, y: 0, visibility: "visible" });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 0.35, opacity: 0.35 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1, opacity: 1 });
      settleClosing(gsap, closing);
      if (closing) {
        gsap.set(closing, { autoAlpha: 1, opacity: 1, visibility: "visible" });
      }
    }

    function resetCards() {
      root.classList.remove("is-reduced", "is-static-touch");
      forceStateA();
    }

    function buildDemo() {
      resetCards();

      // One-shot timeline — plays to completion (core GSAP)
      var tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power1.out" },
        onComplete: function () {
          forceStateB();
        },
        onReverseComplete: function () {
          forceStateA();
        },
      });

      tl.to(
        currentCards,
        {
          autoAlpha: 0,
          opacity: 0,
          y: -12,
          stagger: 0.05,
          duration: 0.4,
          onStart: function () {
            currentCards.forEach(function (el) {
              el.classList.add("is-merging");
            });
          },
        },
        0
      );

      tl.to(
        targetCards,
        {
          autoAlpha: 1,
          opacity: 1,
          visibility: "visible",
          y: 0,
          stagger: 0.07,
          duration: 0.45,
          onStart: function () {
            targetCards.forEach(function (el) {
              el.classList.add("is-visible");
            });
          },
        },
        0.15
      );

      if (callouts.length) {
        tl.to(
          callouts,
          {
            autoAlpha: 1,
            opacity: 1,
            y: 0,
            visibility: "visible",
            stagger: 0.08,
            duration: 0.3,
          },
          0.35
        );
      }

      if (chromeCurrent) tl.to(chromeCurrent, { autoAlpha: 0.35, opacity: 0.35, duration: 0.25 }, 0.2);
      if (chromeTarget) tl.to(chromeTarget, { autoAlpha: 1, opacity: 1, duration: 0.25 }, 0.2);

      if (closing) {
        tl.to(
          closing,
          {
            autoAlpha: 1,
            opacity: 1,
            visibility: "visible",
            duration: 0.3,
            onStart: function () {
              settleClosing(gsap, closing);
            },
          },
          0.5
        );
      }

      // Final beat guarantees full Target before timeline ends
      tl.add(function () {
        forceStateB();
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top 65%",
        end: "bottom top",
        pin: false,
        // Discrete: play once forward; reverse when scrolling back above start
        toggleActions: "play none none reverse",
        onEnter: function () {
          tl.play(0);
        },
        onLeave: function () {
          // If user scrolls past mid-play, snap to complete Target
          tl.progress(1);
          forceStateB();
        },
        onEnterBack: function () {
          // Still past start — keep or finish Target
          if (tl.progress() < 1) {
            tl.play();
          }
        },
        onLeaveBack: function () {
          tl.reverse();
        },
        onRefresh: function (self) {
          if (self.isActive || self.progress > 0) {
            // Already past start on load/hard-refresh → complete state, no ghost
            if (self.progress >= 0.01 || self.direction === 1) {
              // If scrolled into or past trigger, prefer complete Target when below start
            }
          }
          if (!self.isActive && self.scroll() < self.start) {
            forceStateA();
            tl.pause(0);
          } else if (self.scroll() >= self.start) {
            // Hard-refresh mid-section: show complete Target, never half-fade
            tl.progress(1);
            forceStateB();
          }
        },
      });

      return tl;
    }

    function mountMotion() {
      if (built) return;
      built = true;
      mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1025px) and (pointer: fine) and (hover: hover)",
          isTouch: "(max-width: 1024px), (pointer: coarse)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        function (context) {
          var cond = context.conditions;
          if (cond.reduceMotion) {
            applyReduced();
            return function () {
              root.classList.remove("is-reduced");
            };
          }
          var tl = buildDemo();
          return function () {
            ScrollTrigger.getAll().forEach(function (t) {
              if (t.trigger === root) t.kill();
            });
            if (tl) tl.kill();
            resetCards();
          };
        }
      );
      requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });
    }

    function scheduleRefresh() {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () {
        if (built) ScrollTrigger.refresh();
      }, 200);
    }

    var io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              mountMotion();
              io.disconnect();
              io = null;
              break;
            }
          }
        },
        { root: null, rootMargin: "200px 0px", threshold: 0 }
      );
      io.observe(root);
    } else if (window.requestIdleCallback) {
      window.requestIdleCallback(function () {
        mountMotion();
      }, { timeout: 1200 });
    } else {
      setTimeout(mountMotion, 400);
    }

    window.addEventListener("resize", scheduleRefresh);

    return function cleanup() {
      window.removeEventListener("resize", scheduleRefresh);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (io) io.disconnect();
      if (mm) mm.revert();
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
