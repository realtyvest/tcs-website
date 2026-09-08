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
  var count = 0;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      // Check off in list order with a short beat between neighbours that
      // arrive together, so the sequence reads as progress.
      var idx = items.indexOf(e.target);
      setTimeout(function () {
        // Progress semantics: reaching step N means every earlier step is
        // done too, so a fast scroll never leaves an earlier step unchecked.
        for (var i = 0; i <= idx; i++) {
          if (!items[i].classList.contains("is-done")) { items[i].classList.add("is-done"); count++; io.unobserve(items[i]); }
        }
        if (count >= items.length) setTimeout(complete, 350);
      }, (idx % 2) * 160);
    });
  }, { rootMargin: "0px 0px -28% 0px", threshold: 0.5 });
  items.forEach(function (li) { io.observe(li); });
})();
