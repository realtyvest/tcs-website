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

  // Desktop-only story: Current collapses, Target combines to centre, REMOVED
  // cluster settles under Target. Mobile (< 821px) keeps the dual-stack fire path.
  function isDesktop() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(min-width: 821px)").matches
    );
  }

  function initRoot(root) {
    ensureMarkup(root);

    if (!window.gsap) {
      console.warn("[WorkflowTransformation] GSAP missing");
      root.classList.add("is-dual-stack", "is-reduced");
      // Desktop static CLEAR_STATE: CSS collapses Current, centres Target + cluster.
      if (isDesktop()) root.classList.add("is-condensed");
      root.querySelectorAll("[data-wt-target], [data-wt-current]").forEach(function (el) {
        el.classList.add("is-visible");
        el.style.opacity = "1";
        el.style.visibility = "visible";
      });
      return function () {};
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /*
     * WT_VISIBLE_MOTION_REVISE + https://gsap.com/cheatsheet
     * Dual solid after enter. Visible once-enter: gsap.from autoAlpha+y stagger.
     * Mobile: NO ScrollTrigger scrub/pin. Never leave Target hidden after.
     */
    var currentCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-current]"));
    var targetCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-target]"));
    var callouts = gsap.utils.toArray(root.querySelectorAll("[data-wt-callout]"));
    var chromeCurrent = root.querySelector("[data-wt-chrome-current]");
    var chromeTarget = root.querySelector("[data-wt-chrome-target]");
    var listLabels = gsap.utils.toArray(root.querySelectorAll(".wt-list-label"));
    var closing = root.querySelector("[data-wt-closing]");

    var mm = null;
    var motionIo = null;
    var played = false;
    var scrolled = false;
    var inView = false;
    var fallbackId = null;

    function applyDualStack() {
      root.classList.add("is-dual-stack");
      root.classList.add("is-motion-done");
      root.classList.remove("is-reduced", "is-static-touch");
      currentCards.forEach(function (el) {
        el.classList.remove("is-merging", "is-merged");
      });
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(currentCards, {
        clearProps: "transform,x,y,rotation,xPercent",
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible",
        y: 0,
        x: 0,
        xPercent: 0,
      });
      gsap.set(targetCards, {
        clearProps: "transform,x,y,rotation,xPercent",
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible",
        y: 0,
        x: 0,
        xPercent: 0,
      });
      gsap.set(callouts, { autoAlpha: 1, opacity: 1, y: 0, visibility: "visible" });
      gsap.set(listLabels, { autoAlpha: 1, opacity: 1, y: 0 });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1, opacity: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1, opacity: 1 });
      settleClosing(gsap, closing);
      if (closing) gsap.set(closing, { autoAlpha: 1, opacity: 1, visibility: "visible" });
    }

    // Desktop CLEAR_STATE (static): Current collapsed, Target primary, REMOVED
    // cluster centred under Target. Current inline props cleared so a resize back
    // to mobile restores the dual-stack (CSS display:none only hides it >= 821px).
    function applyCondensedStatic() {
      root.classList.add("is-dual-stack", "is-motion-done", "is-condensed");
      root.classList.remove("is-reduced", "is-static-touch");
      currentCards.forEach(function (el) {
        el.classList.remove("is-merging", "is-merged");
      });
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(targetCards, {
        clearProps: "transform,x,y,rotation,xPercent",
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible",
      });
      gsap.set(callouts, { autoAlpha: 1, opacity: 1, y: 0, visibility: "visible" });
      gsap.set(listLabels, { autoAlpha: 1, opacity: 1, y: 0 });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1, opacity: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1, opacity: 1 });
      gsap.set(currentCards, {
        clearProps: "opacity,autoAlpha,visibility,transform,x,y,scale,rotation,xPercent",
      });
      settleClosing(gsap, closing);
    }

    // Land the condensed resting state; clear Current inline props (resize-safe —
    // CSS display:none hides Current on desktop, so no flash under is-condensed).
    function finalizeCondensed() {
      gsap.set(currentCards, {
        clearProps: "opacity,autoAlpha,visibility,transform,x,y,scale,rotation,xPercent",
      });
      settleClosing(gsap, closing);
    }

    // Second beat of the desktop story: Current has faded out — collapse its
    // column, glide Target to centre (mini-FLIP, same fade/slide language), and
    // fade/slide the REMOVED cluster in beneath Target as the cards leave.
    function settleCondensed() {
      var tCol = root.querySelector(".wt-col--target");
      var first = tCol ? tCol.getBoundingClientRect() : null;

      root.classList.add("is-dual-stack", "is-motion-done", "is-condensed");
      root.classList.remove("is-reduced", "is-static-touch");
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(targetCards, { autoAlpha: 1, opacity: 1, visibility: "visible", y: 0 });
      gsap.set(listLabels, { autoAlpha: 1, y: 0 });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1 });

      if (tCol && first) {
        var dx = first.left - tCol.getBoundingClientRect().left;
        if (Math.abs(dx) > 0.5) {
          gsap.fromTo(
            tCol,
            { x: dx },
            { x: 0, duration: 0.5, ease: "power2.out", clearProps: "x" }
          );
        }
      }

      gsap.fromTo(
        callouts,
        { autoAlpha: 0, y: 8, visibility: "hidden" },
        {
          autoAlpha: 1,
          y: 0,
          visibility: "visible",
          stagger: 0.08,
          duration: 0.4,
          ease: "power2.out",
        }
      );

      if (closing) {
        gsap.fromTo(
          closing,
          { autoAlpha: 0, y: 6, visibility: "hidden" },
          {
            autoAlpha: 1,
            y: 0,
            visibility: "visible",
            duration: 0.4,
            delay: 0.1,
            ease: "power2.out",
            onStart: function () {
              settleClosing(gsap, closing);
            },
            onComplete: finalizeCondensed,
          }
        );
      } else {
        finalizeCondensed();
      }
    }

    // First beat: the 9 Current cards disappear/combine (fade out), then collapse.
    function condenseDesktop() {
      gsap.to(currentCards, {
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: settleCondensed,
      });
    }

    function prepEnterPose() {
      // Pre-enter: cards ready to animate in (layout reserved via dual-stack classes)
      root.classList.add("is-dual-stack");
      // Show the full Current 9 for the enter — drop any prior condensed collapse.
      root.classList.remove("is-motion-done", "is-condensed");
      currentCards.forEach(function (el) {
        el.classList.remove("is-merged", "is-merging");
      });
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(currentCards, { autoAlpha: 0, opacity: 0, y: 40, x: 0, xPercent: 0, visibility: "hidden" });
      gsap.set(targetCards, { autoAlpha: 0, opacity: 0, y: 40, x: 0, xPercent: 0, visibility: "hidden" });
      gsap.set(listLabels, { autoAlpha: 0, y: 10 });
      gsap.set(callouts, { autoAlpha: 0, y: 8, visibility: "hidden" });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 0.35 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 0.35 });
      if (closing) gsap.set(closing, { autoAlpha: 0, visibility: "hidden" });
    }

    function killRootTriggers() {
      if (!ScrollTrigger) return;
      ScrollTrigger.getAll().forEach(function (t) {
        if (t.trigger === root) t.kill();
      });
    }

    function playVisibleEntrance() {
      if (played) return;
      played = true;

      var desk = isDesktop();

      // Cheatsheet: gsap.to / stagger / power2.out — obvious enter
      gsap.to(listLabels, {
        autoAlpha: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.to(currentCards, {
        autoAlpha: 1,
        opacity: 1,
        visibility: "visible",
        y: 0,
        stagger: 0.08,
        duration: 0.55,
        ease: "power2.out",
      });

      gsap.to(
        targetCards,
        {
          autoAlpha: 1,
          opacity: 1,
          visibility: "visible",
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.15,
          onComplete: function () {
            // Desktop: Current leaves, Target combines to centre, REMOVED cluster
            // settles under Target. Mobile: solid dual-stack (fire path unchanged).
            if (desk) condenseDesktop();
            else applyDualStack();
          },
        }
      );

      if (chromeCurrent) gsap.to(chromeCurrent, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
      if (chromeTarget) gsap.to(chromeTarget, { autoAlpha: 1, duration: 0.4, delay: 0.1, ease: "power2.out" });

      // Mobile only: REMOVED cluster fades in during the enter. On desktop it is
      // held back and fades/slides in during the condense (settleCondensed), so it
      // arrives as the Current cards disappear.
      if (!desk) {
        gsap.to(callouts, {
          autoAlpha: 1,
          y: 0,
          visibility: "visible",
          stagger: 0.08,
          duration: 0.4,
          delay: 0.35,
          ease: "power2.out",
        });

        if (closing) {
          gsap.to(closing, {
            autoAlpha: 1,
            visibility: "visible",
            duration: 0.4,
            delay: 0.45,
            ease: "power2.out",
            onStart: function () {
              settleClosing(gsap, closing);
            },
          });
        }
      }
    }

    function removeArmListeners() {
      window.removeEventListener("scroll", onUserScroll);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    }

    function doPlay() {
      if (played) return;
      removeArmListeners();
      if (fallbackId) {
        clearTimeout(fallbackId);
        fallbackId = null;
      }
      if (motionIo) {
        motionIo.disconnect();
        motionIo = null;
      }
      playVisibleEntrance();
    }

    function tryPlay() {
      // Gate: both conditions must hold — the user has scrolled AND WT is in view.
      if (!played && scrolled && inView) doPlay();
    }

    function onUserScroll() {
      scrolled = true;
      tryPlay();
    }

    /*
     * Scroll-arm (WT_DUAL_JUMPY revise): WT lives in the hero and is already
     * intersecting on load, so a plain once-enter finished before Gil ever
     * looked. Gate the entrance on a real user scroll so the motion is obvious.
     * No pin/scrub on any breakpoint — IntersectionObserver only. Cheatsheet:
     * https://gsap.com/cheatsheet  (gsap.to / stagger / power2.out)
     */
    function armEntrance() {
      killRootTriggers();
      scrolled = false;
      inView = false;

      window.addEventListener("scroll", onUserScroll, { passive: true });
      window.addEventListener("wheel", onUserScroll, { passive: true });
      window.addEventListener("touchmove", onUserScroll, { passive: true });
      window.addEventListener("keydown", onUserScroll);

      if (typeof IntersectionObserver !== "undefined") {
        motionIo = new IntersectionObserver(
          function (entries) {
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isIntersecting) {
                inView = true;
                tryPlay();
                break;
              }
            }
          },
          { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
        );
        motionIo.observe(root);
      } else {
        inView = true;
      }

      // Anti-blank guarantee: Target never stays hidden long-term. If no scroll
      // arrives shortly after load, play anyway so nothing is left blank.
      fallbackId = setTimeout(function () {
        if (!played) doPlay();
      }, 2600);
    }

    function mountMotion() {
      mm = gsap.matchMedia();
      mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, function () {
        // Reduced motion: solid dual-stack immediately, no entrance.
        removeArmListeners();
        if (fallbackId) {
          clearTimeout(fallbackId);
          fallbackId = null;
        }
        if (motionIo) {
          motionIo.disconnect();
          motionIo = null;
        }
        // Desktop: static condensed CLEAR_STATE. Mobile: solid dual-stack.
        if (isDesktop()) applyCondensedStatic();
        else applyDualStack();
        return function () {
          root.classList.remove("is-reduced");
          if (!played) {
            prepEnterPose();
            armEntrance();
          }
        };
      });

      // Non-reduced users: arm the scroll-gated entrance (mobile & desktop alike).
      if (
        typeof window.matchMedia !== "function" ||
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        armEntrance();
      }
    }

    // Classes on for CSS dual-stack; pose for enter animation
    prepEnterPose();
    mountMotion();

    return function cleanup() {
      removeArmListeners();
      if (fallbackId) clearTimeout(fallbackId);
      if (motionIo) motionIo.disconnect();
      if (mm) mm.revert();
      killRootTriggers();
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
