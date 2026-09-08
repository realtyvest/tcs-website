/* HOW_STEPS_ACHIEVE: check the six steps off as they scroll into view. */
(function () {
  "use strict";
  var section = document.getElementById("how");
  var list = section && section.querySelector(".steps");
  if (!list) return;
  var items = Array.prototype.slice.call(list.children);
  if (!items.length) return;

  items.forEach(function (li) {
    if (li.querySelector(".hw-check")) return;
    var check = document.createElement("span");
    check.className = "hw-check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 8.5 6.5 12 13 4.5"/></svg>';
    li.appendChild(check);
  });
  var done = document.createElement("p");
  done.className = "hw-done";
  done.innerHTML = '<span>Six steps, in that order. No package menu.</span><span class="hw-done-bar" aria-hidden="true"></span>';
  list.insertAdjacentElement("afterend", done);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function complete() { section.classList.add("is-complete"); }
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (li) { li.classList.add("is-done"); });
    complete();
    return;
  }
  // Steps are always checked in order, one after another, with a short beat
  // between them. Reaching step N queues every earlier unchecked step first,
  // so the sequence never runs backwards (HOW_STEPS_ORDER, Gil 2026-09-08).
  var nextIndex = 0, reached = -1, ticking = false;
  function tick() {
    if (nextIndex > reached) { ticking = false; return; }
    ticking = true;
    var li = items[nextIndex];
    li.classList.add("is-done");
    io.unobserve(li);
    nextIndex++;
    if (nextIndex === items.length) { setTimeout(complete, 350); ticking = false; return; }
    setTimeout(tick, 140);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var idx = items.indexOf(e.target);
      if (idx > reached) reached = idx;
    });
    if (!ticking) tick();
  }, { rootMargin: "0px 0px -28% 0px", threshold: 0.5 });
  items.forEach(function (li) { io.observe(li); });
})();
