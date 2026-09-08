/* MODULE_STEPS_BALANCED: arm the story state, size the grid so every row is
   full or centred (6 = 3+3, 5 = 3+2 centred, 4 = 2+2, 3 = 3), and reveal the
   cards in order once the grid scrolls into view. No dependencies. */
(function () {
  "use strict";
  var grids = document.querySelectorAll(".how-it-works .steps");
  if (!grids.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  grids.forEach(function (grid) {
    var steps = grid.querySelectorAll(".step");
    var n = steps.length;
    if (n === 4) grid.style.setProperty("--ms-cols", "2");
    else if (n < 3) grid.style.setProperty("--ms-cols", String(n));
    steps.forEach(function (s, i) { s.style.setProperty("--ms-i", String(i)); });
  });

  if (reduce || !("IntersectionObserver" in window)) {
    grids.forEach(function (g) { g.classList.add("is-in"); });
    return;
  }
  document.documentElement.classList.add("module-steps-armed");

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -18% 0px", threshold: 0.15 });
  grids.forEach(function (g) { io.observe(g); });
})();
