/* Design Phase 2 motion LOCK
   - #how .steps li: once-on-enter stagger fade/rise (1→6)
   - #contact.final-cta: once-on-enter soft rise + fade
   - prefers-reduced-motion: skip staggers/rises; end states via CSS
   - transform + opacity only; no scrub/pin/Flip; WT untouched */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var mobile = window.matchMedia('(max-width: 820px)').matches;

    var steps = gsap.utils.toArray('#how .steps li');
    if (steps.length) {
      gsap.set(steps, { opacity: 0, y: mobile ? 10 : 14 });
      gsap.to(steps, {
        opacity: 1,
        y: 0,
        duration: mobile ? 0.42 : 0.48,
        stagger: mobile ? 0.06 : 0.07,
        ease: 'power2.out',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: '#how .steps',
          start: 'top 78%',
          once: true
        }
      });
    }

    var cta = document.querySelector('#contact.final-cta');
    if (cta) {
      /* Soft rise + fade on the section; keep hit area live (no pointer-events / visibility tricks). */
      gsap.set(cta, { opacity: 0, y: mobile ? 12 : 16 });
      gsap.to(cta, {
        opacity: 1,
        y: 0,
        duration: mobile ? 0.48 : 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: cta,
          start: 'top 88%',
          once: true
        }
      });
    }
  });
})();
