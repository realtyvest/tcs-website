/* MODULE_STEPS_BALANCED: arm the story state, size the grid so every row is
   full or centred (6 = 3+3, 5 = 3+2 centred, 4 = 2+2, 3 = 3), and reveal the
   cards in order once the grid scrolls into view. No dependencies. */
(function () {
  "use strict";
  var grids = document.querySelectorAll(".how-it-works .steps");
  if (!grids.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cols(grid) {
    var v = parseInt(getComputedStyle(grid).getPropertyValue("--ms-cols"), 10);
    return v > 0 ? v : 3;
  }
  grids.forEach(function (grid) {
    var steps = grid.querySelectorAll(".step");
    var n = steps.length;
    if (n === 4) grid.style.setProperty("--ms-cols", "2");
    else if (n < 3) grid.style.setProperty("--ms-cols", String(n));
    var c = cols(grid);
    steps.forEach(function (s, i) { s.style.setProperty("--ms-col", String(i % c)); });
  });

  var all = document.querySelectorAll(".how-it-works .step");
  if (reduce || !("IntersectionObserver" in window)) {
    all.forEach(function (s) { s.classList.add("is-in"); });
    return;
  }
  document.documentElement.classList.add("module-steps-armed");

  // Each card lights on its own as it reaches the lower part of the viewport.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -22% 0px", threshold: 0.2 });
  all.forEach(function (s) { io.observe(s); });

  var timer;
  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      grids.forEach(function (grid) {
        var c = cols(grid);
        grid.querySelectorAll(".step").forEach(function (s, i) { s.style.setProperty("--ms-col", String(i % c)); });
      });
    }, 200);
  });
})();
