/**
 * WorkflowTransformation island (Hostinger static)
 * Mirrors components/WorkflowTransformation.tsx
 *
 * WT_STORY_MORPH_LOCK (desktop >= 821px, motion allowed):
 * The nine Current handoffs sit as a scattered 3x3 field on the left; the four
 * Target stages wait as dim slots on the right. ONE gsap.timeline() owns the
 * whole story and a short ScrollTrigger pin (end "+=220%", scrub 0.6) drives it:
 *
 *   0.0-1.4  tangle wires draw between the nine cards (the handoff mess)
 *   1.4-2.9  Intake + Copy to spreadsheet fly + shrink into Intake Jobs
 *            SPREADSHEET HANDOFF REMOVED
 *   2.9-4.0  Distribute to field -> Route Crews
 *   4.0-6.6  WhatsApp/admin/as-builts/re-entry -> Annotated Map
 *            DUPLICATE RE-ENTRY REMOVED, then MANUAL TALLY REMOVED
 *   6.6-8.1  Final approval + Invoice -> Invoice + Closeout Docs Sent
 *   8.0-8.9  Target column glides to centre; STEPS counter reads 4
 *   8.7-9.2  "9 handoffs -> 4 connected steps" settles; hold to 10
 *
 * Each handoff card folds into its stage (flies to the stage centre, shrinks to
 * 0.58, fades as it lands). Because the DOM never changes and everything is one
 * scrubbed timeline, reverse scroll replays backwards. No Flip needed.
 * Every rebuild (resize / media change) reverts the gsap.context first so the
 * geometry is measured from the rest pose.
 *
 * Mobile (< 821px, WT_STORY_MOBILE): the SAME story on a compact layout. The
 * nine handoffs sit as a tight 3x3 field, the four stages as a 2x2 tile grid
 * beneath it, merge wires drop top-to-bottom, and the REMOVED lines stamp onto
 * the emptied field at the end. Snap to beat boundaries on coarse pointers.
 * The once-enter dual-stack fire path remains only as the no-ScrollTrigger
 * fallback. prefers-reduced-motion: static CLEAR_STATE (desktop condensed,
 * mobile dual stack).
 *
 * Cites: gsap-core · gsap-timeline · gsap-scrolltrigger
 * https://gsap.com/docs/v3/GSAP/Timeline · https://gsap.com/docs/v3/Plugins/ScrollTrigger/
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

  // Story beats on a 10-unit timeline. callouts: [calloutIndex, atFractionOfBeat]
  var GROUPS = [
    { target: 0, sources: [0, 1], at: 1.4, len: 1.5, callouts: [[0, 0.85]] },
    { target: 1, sources: [2], at: 2.9, len: 1.1, callouts: [] },
    { target: 2, sources: [3, 4, 5, 6], at: 4.0, len: 2.6, callouts: [[1, 0.6], [2, 0.95]] },
    { target: 3, sources: [7, 8], at: 6.6, len: 1.5, callouts: [] },
  ];
  var TANGLE_END = 1.4;
  var SLIDE_AT = 8.0;
  var CLOSING_AT = 8.7;
  var TOTAL = 10;

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
      '<span class="wt-chrome-count" data-wt-count aria-hidden="true">STEPS <b data-wt-count-n>9</b></span>' +
      "</p>" +
      '<p class="wt-tagline">Capture the work once. Move the job forward.</p>' +
      "</header>" +
      '<div class="wt-stage" data-wt-stage>' +
      '<div class="wt-lists" data-wt-lists>' +
      '<svg class="wt-wires" data-wt-wires aria-hidden="true" focusable="false"></svg>' +
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
      '<div class="wt-col wt-col--target" data-wt-target-col>' +
      '<p class="wt-list-label">Target</p>' +
      '<ol class="wt-list wt-list--target" aria-label="Target four steps">';

    TARGET.forEach(function (label, i) {
      html +=
        '<li class="wt-card wt-card--target" data-wt-target="' +
        i +
        '">' +
        '<span class="wt-card-glow" data-wt-glow aria-hidden="true"></span>' +
        '<span class="wt-card-num">' +
        (i + 1) +
        "</span>" +
        '<span class="wt-card-label">' +
        label +
        "</span></li>";
    });

    html +=
      "</ol>" +
      '<div class="wt-callouts" aria-live="polite">' +
      '<p class="wt-callout" data-wt-callout="0">SPREADSHEET HANDOFF REMOVED</p>' +
      '<p class="wt-callout" data-wt-callout="1">DUPLICATE RE-ENTRY REMOVED</p>' +
      '<p class="wt-callout" data-wt-callout="2">MANUAL TALLY REMOVED</p>' +
      "</div>" +
      '<p class="wt-closing" data-wt-closing>9 handoffs → 4 connected steps</p>' +
      "</div>" + // .wt-col--target
      "</div>" + // .wt-lists
      "</div>" + // .wt-stage
      "</div>"; // .wt-inner

    root.innerHTML = html;
    root.classList.add("wt");
    if (!root.getAttribute("aria-label")) {
      root.setAttribute(
        "aria-label",
        "Workflow transformation from 9 current steps to 4 target steps"
      );
    }
  }

  /* Flight vector: the handoff card folds INTO its stage. It travels to the
     stage centre and shrinks to FOLD_SCALE (centre origin), fading as it lands,
     so its label never balloons over the stage title. Rect math only. */
  var FOLD_SCALE = 0.58;
  function fitVars(el, target) {
    var a = el.getBoundingClientRect();
    var b = target.getBoundingClientRect();
    return {
      x: b.left + b.width / 2 - (a.left + a.width / 2),
      y: b.top + b.height / 2 - (a.top + a.height / 2),
      scaleX: FOLD_SCALE,
      scaleY: FOLD_SCALE,
    };
  }

  /** Force settled closing contrast; inline !important + class must stick past scrub. */
  function settleClosing(gsap, el) {
    if (!el) return;
    el.classList.add("is-settled");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("visibility", "visible", "important");
    gsap.set(el, { autoAlpha: 1, visibility: "visible", opacity: 1, overwrite: "auto" });
  }

  /** Drop settle lock so scrub can drive closing again on reverse scroll. */
  function unlockClosing(el) {
    if (!el) return;
    el.classList.remove("is-settled");
    el.style.removeProperty("opacity");
    el.style.removeProperty("visibility");
  }

  function isDesktop() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(min-width: 821px)").matches
    );
  }

  /* Sticky/fixed nav height so the pinned card never sits under the nav
     (same rule as paths.js: measured nav, then --nav-h, then 64). */
  function getStickyNavHeight() {
    var cands = document.querySelectorAll("nav, header, .tcs-nav-host, [data-nav]");
    for (var i = 0; i < cands.length; i++) {
      var cs = window.getComputedStyle(cands[i]);
      if (cs.position === "sticky" || cs.position === "fixed") {
        var h = cands[i].getBoundingClientRect().height;
        if (h > 0) return h;
      }
    }
    var v = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10);
    return isNaN(v) ? 64 : v;
  }

  function svgEl(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function initRoot(root) {
    ensureMarkup(root);

    if (!window.gsap) {
      console.warn("[WorkflowTransformation] GSAP missing");
      root.classList.add("is-dual-stack", "is-reduced");
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

    var currentCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-current]"));
    var targetCards = gsap.utils.toArray(root.querySelectorAll("[data-wt-target]"));
    var glows = gsap.utils.toArray(root.querySelectorAll("[data-wt-glow]"));
    var callouts = gsap.utils.toArray(root.querySelectorAll("[data-wt-callout]"));
    var chromeCurrent = root.querySelector("[data-wt-chrome-current]");
    var chromeTarget = root.querySelector("[data-wt-chrome-target]");
    var countEl = root.querySelector("[data-wt-count]");
    var countNum = root.querySelector("[data-wt-count-n]");
    var listLabels = gsap.utils.toArray(root.querySelectorAll(".wt-list-label"));
    var currentLabel = root.querySelector(".wt-col--current .wt-list-label");
    var closing = root.querySelector("[data-wt-closing]");
    var lists = root.querySelector("[data-wt-lists]");
    var wires = root.querySelector("[data-wt-wires]");
    var tCol = root.querySelector("[data-wt-target-col]");

    var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var deskMq = window.matchMedia("(min-width: 821px)");
    var coarseMq = window.matchMedia("(pointer: coarse)");

    var mode = null; // "story" | "mobile" | "reduced"
    var storyCtx = null;
    var storySt = null;
    var motionIo = null;
    var played = false;
    var scrolled = false;
    var inView = false;
    var fallbackId = null;

    function setCount(n, lit) {
      if (countNum) countNum.textContent = String(n);
      if (countEl) countEl.classList.toggle("is-lit", !!lit);
    }

    /* ------------------------------------------------------------------ */
    /* Shared static states                                                  */
    /* ------------------------------------------------------------------ */

    // Mobile solid dual stack (fire path CLEAR_STATE).
    function applyDualStack() {
      root.classList.add("is-dual-stack", "is-motion-done");
      root.classList.remove("is-reduced", "is-static-touch", "is-story", "is-condensed");
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(currentCards.concat(targetCards), {
        clearProps: "transform,x,y,scale,scaleX,scaleY,rotation,xPercent,--wt-tilt",
        autoAlpha: 1,
        visibility: "visible",
      });
      gsap.set(glows, { autoAlpha: 0 });
      gsap.set(callouts, { autoAlpha: 1, y: 0, visibility: "visible" });
      gsap.set(listLabels, { autoAlpha: 1, y: 0 });
      if (tCol) gsap.set(tCol, { clearProps: "transform,x" });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1 });
      setCount(4, true);
      settleClosing(gsap, closing);
    }

    // Desktop reduced-motion CLEAR_STATE: Current collapsed, Target centred,
    // REMOVED cluster under Target (CSS .is-condensed does the layout).
    function applyCondensedStatic() {
      root.classList.add("is-dual-stack", "is-motion-done", "is-condensed");
      root.classList.remove("is-reduced", "is-static-touch", "is-story");
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(targetCards, {
        clearProps: "transform,x,y,scale,scaleX,scaleY,rotation,xPercent",
        autoAlpha: 1,
        visibility: "visible",
      });
      gsap.set(glows, { autoAlpha: 1 });
      gsap.set(callouts, { autoAlpha: 1, y: 0, visibility: "visible" });
      gsap.set(listLabels, { autoAlpha: 1, y: 0 });
      if (tCol) gsap.set(tCol, { clearProps: "transform,x" });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1 });
      gsap.set(currentCards, {
        clearProps: "opacity,autoAlpha,visibility,transform,x,y,scale,scaleX,scaleY,rotation,xPercent,--wt-tilt",
      });
      setCount(4, true);
      settleClosing(gsap, closing);
    }

    /* ------------------------------------------------------------------ */
    /* Desktop story: pinned, scrubbed 9 -> 4 morph                          */
    /* ------------------------------------------------------------------ */

    function killStory() {
      if (storySt) {
        storySt.kill();
        storySt = null;
      }
      if (storyCtx) {
        storyCtx.revert();
        storyCtx = null;
      }
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach(function (t) {
          if (t.trigger === root) t.kill();
        });
      }
      if (wires) wires.innerHTML = "";
    }

    // Measure rest-pose geometry relative to the lists box: tangle wires
    // (card i -> card i+1), merge wires (card -> its stage), flight vectors,
    // and the centre-slide for the Target column.
    function measure() {
      var lb = lists.getBoundingClientRect();
      var w = Math.max(1, Math.round(lb.width));
      var h = Math.max(1, Math.round(lb.height));
      wires.setAttribute("viewBox", "0 0 " + w + " " + h);
      wires.setAttribute("width", w);
      wires.setAttribute("height", h);
      wires.innerHTML = "";

      function rel(el) {
        var r = el.getBoundingClientRect();
        return {
          left: r.left - lb.left,
          top: r.top - lb.top,
          right: r.right - lb.left,
          bottom: r.bottom - lb.top,
          cx: r.left - lb.left + r.width / 2,
          cy: r.top - lb.top + r.height / 2,
        };
      }

      var cRects = currentCards.map(rel);
      var tRects = targetCards.map(rel);

      function addPath(d, cls) {
        var p = svgEl("path");
        p.setAttribute("d", d);
        p.setAttribute("class", "wt-wire " + cls);
        wires.appendChild(p);
        var len = 0;
        try {
          len = p.getTotalLength();
        } catch (e) {}
        if (len > 0) {
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
        }
        return p;
      }

      var tangle = [];
      for (var i = 0; i < cRects.length - 1; i++) {
        var a = cRects[i];
        var b = cRects[i + 1];
        var dy = b.cy - a.cy;
        tangle.push(
          addPath(
            "M" + a.cx.toFixed(1) + " " + a.cy.toFixed(1) +
              " C " + a.cx.toFixed(1) + " " + (a.cy + dy * 0.6).toFixed(1) +
              ", " + b.cx.toFixed(1) + " " + (b.cy - dy * 0.6).toFixed(1) +
              ", " + b.cx.toFixed(1) + " " + b.cy.toFixed(1),
            "wt-wire--tangle"
          )
        );
      }

      var merge = [];
      var fits = [];
      GROUPS.forEach(function (g) {
        var t = tRects[g.target];
        g.sources.forEach(function (s) {
          var c = cRects[s];
          var d;
          if (isDesktop()) {
            var x1 = c.right, y1 = c.cy, x2 = t.left, y2 = t.cy;
            var mx = (x1 + x2) / 2;
            d = "M" + x1.toFixed(1) + " " + y1.toFixed(1) +
              " C " + mx.toFixed(1) + " " + y1.toFixed(1) +
              ", " + mx.toFixed(1) + " " + y2.toFixed(1) +
              ", " + x2.toFixed(1) + " " + y2.toFixed(1);
          } else {
            var ax = c.cx, ay = c.bottom, bx = t.cx, by = t.top;
            var my = (ay + by) / 2;
            d = "M" + ax.toFixed(1) + " " + ay.toFixed(1) +
              " C " + ax.toFixed(1) + " " + my.toFixed(1) +
              ", " + bx.toFixed(1) + " " + my.toFixed(1) +
              ", " + bx.toFixed(1) + " " + by.toFixed(1);
          }
          merge[s] = addPath(d, "wt-wire--merge");
          fits[s] = fitVars(currentCards[s], targetCards[g.target]);
        });
      });

      var compact = !isDesktop();
      var slideX = 0;
      if (tCol && !compact) {
        var tc = rel(tCol);
        slideX = lb.width / 2 - (tc.left + (tc.right - tc.left) / 2);
      }

      return { tangle: tangle, merge: merge, fits: fits, slideX: slideX, compact: compact };
    }

    function buildStoryTimeline(geo) {
      var tl = gsap.timeline({ defaults: { ease: "none" } });
      var counter = { n: 9 };

      // Beat 0: the tangle draws in between the nine cards.
      tl.to(geo.tangle, { strokeDashoffset: 0, duration: 0.8, stagger: 0.075 }, 0);

      // Counter 9 -> 4 across the merges.
      tl.to(
        counter,
        {
          n: 4,
          duration: GROUPS[3].at + GROUPS[3].len - GROUPS[0].at,
          snap: { n: 1 },
          onUpdate: function () {
            setCount(counter.n, counter.n <= 4);
          },
        },
        GROUPS[0].at
      );

      GROUPS.forEach(function (g) {
        var at = g.at;
        var len = g.len;
        var t = targetCards[g.target];

        g.sources.forEach(function (s, k) {
          var off = k * len * 0.12;
          var c = currentCards[s];
          var fit = geo.fits[s];
          var wire = geo.merge[s];

          // The merge wire draws first, then the card flies along it and
          // shrinks exactly into its stage.
          tl.to(wire, { strokeDashoffset: 0, duration: len * 0.45 }, at + off);
          tl.to(
            c,
            {
              x: fit.x,
              y: fit.y,
              scaleX: fit.scaleX,
              scaleY: fit.scaleY,
              "--wt-tilt": "0deg",
              duration: len * 0.55,
              ease: "power2.inOut",
            },
            at + off + len * 0.25
          );
          // Dissolve while still in flight so the label never sits over the
          // stage title (flight runs 0.25 -> 0.80 of the beat).
          tl.to(c, { autoAlpha: 0, duration: len * 0.22 }, at + off + len * 0.44);
          tl.to(wire, { autoAlpha: 0, duration: len * 0.2 }, at + off + len * 0.5);
          // Tangle wire leaving card s dies as the card departs.
          if (geo.tangle[s]) {
            tl.to(geo.tangle[s], { autoAlpha: 0, duration: len * 0.25 }, at + off + len * 0.25);
          }
        });

        // The stage lights as its handoffs arrive, with a small arrival pulse.
        tl.to(t, { autoAlpha: 1, duration: len * 0.4 }, at + len * 0.4);
        tl.to(glows[g.target], { autoAlpha: 1, duration: len * 0.3 }, at + len * 0.5);
        tl.to(t, { scale: 1.03, duration: len * 0.12, ease: "power1.out" }, at + len * 0.62);
        tl.to(t, { scale: 1, duration: len * 0.18, ease: "power1.in" }, at + len * 0.74);

        if (!geo.compact) {
          g.callouts.forEach(function (pair) {
            tl.to(callouts[pair[0]], { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, at + len * pair[1]);
          });
        }
      });

      // Compact (mobile) layout: the REMOVED lines overlay the Current field, so
      // they stamp in only once the field has emptied.
      if (geo.compact) {
        callouts.forEach(function (el, i) {
          tl.to(el, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, SLIDE_AT + i * 0.18);
        });
      }

      // Beat 5: Current is gone. Dim its chrome and glide Target to centre.
      if (currentLabel) tl.to(currentLabel, { autoAlpha: 0, duration: 0.4 }, SLIDE_AT);
      if (chromeCurrent) tl.to(chromeCurrent, { autoAlpha: 0.35, duration: 0.4 }, SLIDE_AT);
      if (tCol && !geo.compact) tl.to(tCol, { x: geo.slideX, duration: 0.9, ease: "power2.inOut" }, SLIDE_AT);

      if (closing) tl.to(closing, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, CLOSING_AT);

      // Hold so the final state reads before the pin releases.
      tl.to({}, { duration: Math.max(0.1, TOTAL - tl.duration()) });
      return tl;
    }

    function buildStory() {
      killStory();
      root.classList.add("is-story", "is-dual-stack", "is-motion-done");
      root.classList.remove("is-condensed", "is-reduced", "is-static-touch");
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      if (closing) {
        closing.classList.remove("is-settled");
        closing.style.removeProperty("opacity");
        closing.style.removeProperty("visibility");
      }
      setCount(9, false);

      storyCtx = gsap.context(function () {
        // Rest pose. Everything measured from here; ctx.revert() restores it.
        gsap.set(currentCards, {
          clearProps: "transform,x,y,scale,scaleX,scaleY,rotation,xPercent,opacity,visibility,--wt-tilt",
        });
        gsap.set(currentCards, { autoAlpha: 1 });
        gsap.set(targetCards, { clearProps: "transform,scale", autoAlpha: 0.42 });
        gsap.set(glows, { autoAlpha: 0 });
        gsap.set(callouts, { autoAlpha: 0, y: 8 });
        gsap.set(listLabels, { autoAlpha: 1, y: 0 });
        if (closing) gsap.set(closing, { autoAlpha: 0, y: 6 });
        // Compact layout: never transform the Target column. A transform would
        // make it the containing block for the absolutely positioned REMOVED
        // overlay (which must position against .wt-lists).
        if (tCol) {
          if (isDesktop()) gsap.set(tCol, { x: 0 });
          else gsap.set(tCol, { clearProps: "transform,x" });
        }
        if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1 });
        if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1 });

        var geo = measure();
        var tl = buildStoryTimeline(geo);
        var navH = getStickyNavHeight();

        var stCfg = {
          animation: tl,
          trigger: root,
          start: "top top+=" + (navH + 8),
          end: "+=220%",
          scrub: 0.6,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          // Story mode locks the closing line with the CSS class only. The
          // old settleClosing() used gsap.set(overwrite:"auto"), which killed
          // the closing tween inside this scrubbed timeline, so after a leave
          // the line stayed visible even at progress 0.
          onLeave: function () {
            if (closing) closing.classList.add("is-settled");
            setCount(4, true);
          },
          onEnterBack: function () {
            if (closing) closing.classList.remove("is-settled");
          },
          // A jump from below the pin to above it (anchor link, fast flick)
          // can skip onEnterBack; release here too.
          onLeaveBack: function () {
            if (closing) closing.classList.remove("is-settled");
            setCount(9, false);
          },
        };
        // Coarse pointers: snap to beat boundaries so a rest lands cleanly
        // between groups instead of mid-flight (paths.js does the same).
        if (coarseMq.matches) {
          stCfg.snap = {
            snapTo: [0, TANGLE_END / TOTAL, 0.29, 0.4, 0.66, 0.81, 1],
            duration: { min: 0.15, max: 0.4 },
            delay: 0.1,
            ease: "power1.inOut",
            directional: false,
            inertia: false,
          };
        }
        storySt = ScrollTrigger.create(stCfg);
      }, root);
    }

    /* ------------------------------------------------------------------ */
    /* Mobile fire path (unchanged): scroll-armed once-enter, then dual stack */
    /* ------------------------------------------------------------------ */

    function prepEnterPose() {
      root.classList.add("is-dual-stack");
      root.classList.remove("is-motion-done", "is-condensed", "is-story");
      targetCards.forEach(function (el) {
        el.classList.add("is-visible");
      });
      gsap.set(currentCards, { autoAlpha: 0, y: 40, x: 0, xPercent: 0, visibility: "hidden" });
      gsap.set(targetCards, { autoAlpha: 0, y: 40, x: 0, xPercent: 0, visibility: "hidden" });
      gsap.set(glows, { autoAlpha: 0 });
      gsap.set(listLabels, { autoAlpha: 0, y: 10 });
      gsap.set(callouts, { autoAlpha: 0, y: 8, visibility: "hidden" });
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 0.35 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 0.35 });
      if (closing) gsap.set(closing, { autoAlpha: 0, visibility: "hidden" });
      setCount(9, false);
    }

    function playVisibleEntrance() {
      if (played) return;
      played = true;

      gsap.to(listLabels, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" });
      gsap.to(currentCards, { autoAlpha: 1, visibility: "visible", y: 0, stagger: 0.08, duration: 0.55, ease: "power2.out" });
      gsap.to(targetCards, {
        autoAlpha: 1,
        visibility: "visible",
        y: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.15,
        onComplete: applyDualStack,
      });
      if (chromeCurrent) gsap.to(chromeCurrent, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
      if (chromeTarget) gsap.to(chromeTarget, { autoAlpha: 1, duration: 0.4, delay: 0.1, ease: "power2.out" });
      gsap.to(callouts, { autoAlpha: 1, y: 0, visibility: "visible", stagger: 0.08, duration: 0.4, delay: 0.35, ease: "power2.out" });
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

    function removeArmListeners() {
      window.removeEventListener("scroll", onUserScroll);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    }

    function disarm() {
      removeArmListeners();
      if (fallbackId) {
        clearTimeout(fallbackId);
        fallbackId = null;
      }
      if (motionIo) {
        motionIo.disconnect();
        motionIo = null;
      }
    }

    function doPlay() {
      if (played) return;
      disarm();
      playVisibleEntrance();
    }

    function tryPlay() {
      if (!played && scrolled && inView) doPlay();
    }

    function onUserScroll() {
      scrolled = true;
      tryPlay();
    }

    function armEntrance() {
      disarm();
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

      // Anti-blank guarantee: play anyway if no scroll arrives shortly after load.
      fallbackId = setTimeout(function () {
        if (!played) doPlay();
      }, 2600);
    }

    /* ------------------------------------------------------------------ */
    /* Routing                                                               */
    /* ------------------------------------------------------------------ */

    function route() {
      // WT_STORY_MOBILE: the story runs on every width now (Pattern A precedent:
      // paths.js pins on all breakpoints). The once-enter fire path is only the
      // no-ScrollTrigger fallback.
      var next = reduceMq.matches ? "reduced" : ScrollTrigger ? "story" : "mobile";
      if (next === mode) {
        if (mode === "story") buildStory(); // resize: re-measure geometry
        return;
      }
      // Leaving a mode: tear down what it owned.
      if (mode === "story") killStory();
      if (mode === "mobile") disarm();
      mode = next;

      if (mode === "reduced") {
        killStory();
        disarm();
        if (isDesktop()) applyCondensedStatic();
        else applyDualStack();
      } else if (mode === "story") {
        buildStory();
      } else {
        killStory();
        if (played) applyDualStack();
        else {
          prepEnterPose();
          armEntrance();
        }
      }
    }

    route();

    function onChange() {
      route();
      if (ScrollTrigger) ScrollTrigger.refresh();
    }
    if (reduceMq.addEventListener) {
      reduceMq.addEventListener("change", onChange);
      deskMq.addEventListener("change", onChange);
    } else if (reduceMq.addListener) {
      reduceMq.addListener(onChange);
      deskMq.addListener(onChange);
    }

    var resizeTimer;
    var lastW = window.innerWidth;
    function onResize() {
      // Mobile address-bar show/hide only changes height; a rebuild there
      // re-creates the pin mid-scroll and breaks refresh order. Width only.
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onChange, 150);
    }
    window.addEventListener("resize", onResize);

    // Hero enter (CSS translate) and web fonts shift the pin start slightly;
    // refresh once both have settled.
    if (ScrollTrigger) {
      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 900);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          ScrollTrigger.refresh();
        });
      }
    }

    return function cleanup() {
      window.removeEventListener("resize", onResize);
      disarm();
      killStory();
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
