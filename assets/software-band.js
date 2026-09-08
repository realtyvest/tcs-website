/* SOFTWARE_BAND_LOCK: scrubbed fly-in from the right for the copy, and an
   orange band growing left to right across the gap to the final CTA. One
   timeline, one ScrollTrigger, no pin. Reduced motion: static final state. */
(function () {
  "use strict";
  var section = document.querySelector("[data-software-band]");
  if (!section) return;
  var copy = section.querySelector("[data-software-copy]");
  var bar = section.querySelector("[data-software-bar]");
  if (!copy || !bar) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.documentElement.classList.add("software-band-static");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  gsap.set(copy, { x: 120, autoAlpha: 0 });
  gsap.set(bar, { scaleX: 0 });

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 85%",
      end: "bottom 45%",
      scrub: 0.6,
      invalidateOnRefresh: true
    }
  });
  // The road fills left to right first, so the copy (navy on orange) only
  // lands once there is orange under it. Both settle together at the end.
  tl.to(bar, { scaleX: 1, duration: 0.7, ease: "none" }, 0)
    .to(copy, { x: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.45);
})();
