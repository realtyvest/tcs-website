/* Map Annotator product story. One GSAP timeline owns routes, callouts, tally,
   submit, and invoice state so the field map and sidebar cannot desync. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var section = document.querySelector("[data-ma-story]");
    var product = document.querySelector("[data-ma-product]");
    if (!section || !product) return;

    var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var timeline = null;
    var trigger = null;
    var context = null;
    var resizeTimer = null;

    function setCounter(counter, value) {
      counter.textContent = String(Math.round(value));
    }

    function cleanup() {
      if (trigger) {
        trigger.kill();
        trigger = null;
      }
      if (context) {
        context.revert();
        context = null;
      }
      timeline = null;
    }

    function settleFinal() {
      document.body.classList.add("ma-final-state");
      product.querySelectorAll("[data-target]").forEach(function (counter) {
        setCounter(counter, Number(counter.dataset.target));
      });
    }

    function buildPinnedStory() {
      cleanup();
      document.body.classList.remove("ma-final-state");

      if (
        reduceMq.matches ||
        window.innerWidth < 821 ||
        typeof window.gsap === "undefined" ||
        typeof window.ScrollTrigger === "undefined"
      ) {
        settleFinal();
        return;
      }

      window.gsap.registerPlugin(window.ScrollTrigger);

      context = window.gsap.context(function () {
        var routes = window.gsap.utils.toArray(".ma-route", product);
        var codeCallouts = window.gsap.utils.toArray(".ma-code-callout", product);
        var rows = window.gsap.utils.toArray(".ma-row", product);
        var counters = window.gsap.utils.toArray("[data-target]", product);
        var startElements = window.gsap.utils.toArray(".ma-start", product);
        var endElements = window.gsap.utils.toArray(".ma-end", product);
        var submit = product.querySelector(".ma-submit");
        var submitLabel = product.querySelector(".ma-submit-label");
        var submittedLabel = product.querySelector(".ma-submitted-label");
        var invoice = product.querySelector(".ma-invoice");
        var map = product.querySelector(".ma-map-sheet");
        var stepTimes = [1.45, 2.15, 2.85, 3.55, 4.25];

        window.gsap.set(routes, { strokeDasharray: 720, strokeDashoffset: 720 });
        window.gsap.set(codeCallouts, { autoAlpha: 0, y: 8 });
        window.gsap.set(rows, { autoAlpha: 0, x: 10 });
        window.gsap.set(startElements.concat(endElements), { autoAlpha: 0, y: 8 });
        window.gsap.set(submit, { autoAlpha: 0, y: 8, scale: 1 });
        window.gsap.set(submitLabel, { autoAlpha: 1 });
        window.gsap.set(submittedLabel, { autoAlpha: 0 });
        window.gsap.set(invoice, { autoAlpha: 0, y: 8 });
        counters.forEach(function (counter) { setCounter(counter, 0); });

        timeline = window.gsap.timeline({ defaults: { ease: "power2.out" } });
        timeline.to(map, { autoAlpha: 1, duration: 0.4 }, 0);
        timeline.to(startElements, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.08);
        timeline.to(routes, { strokeDashoffset: 0, duration: 0.75, ease: "none" }, 0.55);

        stepTimes.forEach(function (at, index) {
          var counterState = { value: 0 };
          var target = Number(counters[index].dataset.target);
          timeline.to(codeCallouts[index], { autoAlpha: 1, y: 0, duration: 0.32 }, at);
          timeline.to(rows[index], { autoAlpha: 1, x: 0, duration: 0.32 }, at);
          timeline.to(counterState, {
            value: target,
            duration: 0.5,
            ease: "none",
            onUpdate: function () { setCounter(counters[index], counterState.value); }
          }, at);
        });

        timeline.to(endElements, { autoAlpha: 1, y: 0, duration: 0.35 }, 4.92);
        timeline.to(submit, { autoAlpha: 1, y: 0, duration: 0.3 }, 5.32);
        timeline.to(submit, { scale: 0.94, duration: 0.12, ease: "power2.in" }, 5.72);
        timeline.to(submit, {
          scale: 1,
          backgroundColor: "#22C55E",
          borderColor: "#22C55E",
          duration: 0.2
        }, 5.84);
        timeline.set(submitLabel, { autoAlpha: 0 }, 5.88);
        timeline.set(submittedLabel, { autoAlpha: 1 }, 5.88);
        timeline.to(invoice, { autoAlpha: 1, y: 0, duration: 0.4 }, 6.18);
        timeline.to({}, { duration: 0.5 });

        trigger = window.ScrollTrigger.create({
          animation: timeline,
          trigger: product,
          start: "top top+=88",
          end: "+=260%",
          scrub: 0.45,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onLeave: function () { timeline.progress(1); }
        });
      }, section);

      window.ScrollTrigger.refresh();
    }

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildPinnedStory, 180);
    }

    buildPinnedStory();
    window.addEventListener("resize", onResize);
    if (reduceMq.addEventListener) reduceMq.addEventListener("change", buildPinnedStory);
    else reduceMq.addListener(buildPinnedStory);
  });
})();
