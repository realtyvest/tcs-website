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

      root.classList.remove("is-reduced");
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

      var desktop = desktopMq.matches;

      // Desktop only: Flip-fit absolute merges. Mobile (max-width 820): fade/hide
      // current groups in place and reveal the target stack below — no overlapping
      // absolute transforms across the long stacked list.
      var fits = null;
      if (desktop) {
        fits = GROUPS.map(function (g) {
          var target = targetCards[g.target];
          return g.sources.map(function (si) {
            return fitVars(Flip, currentCards[si], target);
          });
        });
      }

      gsap.set(targetCards, { autoAlpha: 0, visibility: "hidden", scale: 0.94 });
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

        // 0–15%: hold all 9 current
        tl.to({}, { duration: 0.15 });

        GROUPS.forEach(function (g, gi) {
          var dur = g.end - g.start;
          var target = targetCards[g.target];
          var srcEls = g.sources.map(function (si) {
            return currentCards[si];
          });
          var nSrc = srcEls.length;

          if (desktop && fits) {
            // Flip one source at a time; fade Current out fast so mid-merge is not a held pile
            srcEls.forEach(function (el, j) {
              var d = fits[gi][j];
              var slice = nSrc > 1 ? dur / nSrc : dur;
              var t0 = g.start + (nSrc > 1 ? j * slice * 0.9 : 0);
              var moveDur = Math.min(slice * 0.65, dur * 0.38);
              var light = nSrc > 2;
              tl.to(
                el,
                {
                  x: light ? d.x * 0.4 : d.x,
                  y: light ? d.y * 0.4 : d.y,
                  scale: Math.max(0.72, Math.min(d.scale || 0.85, light ? 0.92 : 0.95)),
                  duration: moveDur,
                  onStart: function () {
                    el.classList.add("is-merging");
                  },
                },
                t0
              );
              tl.to(
                el,
                {
                  autoAlpha: 0,
                  duration: Math.max(0.04, Math.min(0.08, slice * 0.3)),
                  onComplete: function () {
                    el.classList.add("is-merged");
                  },
                },
                t0 + moveDur * 0.2
              );
            });
          } else {
            // Mobile: fade current cards out of the group (no Flip absolute merge)
            srcEls.forEach(function (el) {
              tl.to(
                el,
                {
                  autoAlpha: 0,
                  duration: dur * 0.75,
                  onStart: function () {
                    el.classList.add("is-merging");
                  },
                  onComplete: function () {
                    el.classList.add("is-merged");
                  },
                },
                g.start
              );
            });
          }

          tl.fromTo(
            target,
            { autoAlpha: 0, visibility: "hidden", scale: 0.94 },
            {
              autoAlpha: 1,
              visibility: "visible",
              scale: 1,
              duration: dur * 0.45,
              onStart: function () {
                target.classList.add("is-visible");
                // Last target visible => force closing settle (hard keep)
                if (g.target === 3) forceSettledClosing();
              },
            },
            g.start + dur * 0.35
          );

          if (g.callout >= 0 && callouts[g.callout]) {
            tl.to(
              callouts[g.callout],
              { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 },
              g.start + dur * 0.4
            );
          }

          if (gi === 2 && callouts[2]) {
            tl.to(
              callouts[2],
              { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 },
              0.6
            );
          }
        });

        // 85–100%: four targets settle
        tl.to(
          targetCards,
          {
            scale: 1,
            autoAlpha: 1,
            visibility: "visible",
            duration: 0.1,
            stagger: 0.02,
          },
          0.85
        );
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

        st = ScrollTrigger.create({
          animation: tl,
          trigger: root,
          start: desktop ? "top top+=72" : "top 75%",
          end: desktop ? "+=220%" : "bottom 15%",
          scrub: desktop ? 0.28 : 0.4,
          pin: desktop,
          anticipatePin: desktop ? 1 : 0,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var last = targetCards[3];
            var lastVisible = !!(last && last.classList.contains("is-visible"));
            if (self.progress >= 0.88 || (lastVisible && self.progress >= 0.82)) {
              forceSettledClosing();
            } else if (self.progress < 0.55) {
              tryUnlockClosing(self.progress);
            } else if (closingLocked) {
              // Keep full-white closing through mid band after settle/leave
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
    } else if (reduceMq.addListener) {
      reduceMq.addListener(onChange);
      desktopMq.addListener(onChange);
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
      } else if (reduceMq.removeListener) {
        reduceMq.removeListener(onChange);
        desktopMq.removeListener(onChange);
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
