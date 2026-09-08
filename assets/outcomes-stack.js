/* OUTCOMES_STACK_LOCK: scrubbed stack of the outcome cards, bottom row
   first (building blocks), each card sliding up into place while an orange
   fill sweeps left to right and settles to a tint. One timeline, one
   ScrollTrigger, no pin. Reduced motion: static set state. */
(function () {
  "use strict";
  var list = document.querySelector("[data-outcomes-stack]");
  if (!list) return;
  var items = Array.prototype.slice.call(list.children);
  if (!items.length) return;

  // Wrap the text and add the fill layer once.
  items.forEach(function (li) {
    if (li.querySelector(".oc-fill")) return;
    var text = document.createElement("span");
    text.className = "oc-text";
    while (li.firstChild) text.appendChild(li.firstChild);
    var fill = document.createElement("span");
    fill.className = "oc-fill";
    fill.setAttribute("aria-hidden", "true");
    li.appendChild(fill);
    li.appendChild(text);
  });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.documentElement.classList.add("outcomes-stack-static");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  function columns() {
    var cols = window.getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length;
    return cols > 0 ? cols : 1;
  }

  var st = null;
  function build() {
    if (st) { st.kill(); st = null; }
    gsap.set(items, { clearProps: "transform,opacity,visibility" });
    items.forEach(function (li) { li.classList.remove("is-set"); });
    var fills = items.map(function (li) { return li.querySelector(".oc-fill"); });
    gsap.set(items, { y: 48, autoAlpha: 0 });
    gsap.set(fills, { scaleX: 0, opacity: 1 });

    // Rows from the grid, then bottom row first.
    var cols = columns();
    var rows = [];
    for (var i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
    rows.reverse();

    // OUTCOMES_BUILD_PIN: one row per scroll step, foundation first. The
    // section pins under the bar while the stack builds, so the top rows are
    // never already standing when the section scrolls into view. Each row
    // slides up onto the stack, the orange fill sweeps across, then settles.
    var tl = gsap.timeline({ paused: true });
    rows.forEach(function (row, r) {
      var at = 0.25 + r;
      var rowFills = row.map(function (li) { return li.querySelector(".oc-fill"); });
      tl.to(row, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power2.out", stagger: 0.1 }, at)
        .to(rowFills, { scaleX: 1, duration: 0.55, ease: "power2.out", stagger: 0.1 }, at + 0.08)
        .to(rowFills, { opacity: 0.2, duration: 0.3, ease: "none", stagger: 0.1 }, at + 0.6)
        .add(function () { row.forEach(function (li) { li.classList.add("is-set"); }); }, at + 0.85);
    });
    tl.to({}, { duration: 0.3 }); // short hold on the finished stack before release

    var section = list.closest("section") || list.parentElement;
    var barH = 72;
    var fits = section.getBoundingClientRect().height <= window.innerHeight - barH;
    var perRow = window.innerWidth <= 820 ? 42 : 55; // viewport-heights of scroll per row

    st = ScrollTrigger.create({
      trigger: section,
      start: fits ? "top " + barH + "px" : "top 75%",
      end: fits ? "+=" + Math.round(rows.length * perRow + 30) + "%" : "bottom 60%",
      pin: fits,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.6,
      animation: tl,
      invalidateOnRefresh: true,
      onLeave: function () { items.forEach(function (li) { li.classList.add("is-set"); }); }
    });
  }

  var lastCols = columns();
  build();
  var timer;
  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      // Rebuild on any real size change: the pin decision depends on height.
      lastCols = columns(); build(); ScrollTrigger.refresh();
    }, 200);
  });
})();
