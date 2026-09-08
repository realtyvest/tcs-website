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

  gsap.set(copy, { x: 220, autoAlpha: 0 });
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
  // The copy rides in with the road: same start, same length, so the words
  // arrive on the orange as it fills. Both settle together at the end.
  tl.to(bar, { scaleX: 1, duration: 0.75, ease: "power1.out" }, 0)
    .to(copy, { x: 0, autoAlpha: 1, duration: 0.75, ease: "power1.out" }, 0);
})();
