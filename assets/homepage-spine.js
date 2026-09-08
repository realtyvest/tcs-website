/* HOMEPAGE SPINE: light enter stagger plus a scroll-following marker.
   No ScrollTrigger, no pin, no scrub. IntersectionObserver adds .in once.
   SPINE_MARKER_LOCK: the orange node starts on step 1 and moves to the step
   whose node has most recently crossed the reading line (45% down the
   viewport); the line behind fills to it (CSS var, transform only).
   No-JS users see the full list with step 1 marked. */
(function () {
  var list = document.querySelector('#spine .spine-list');
  if (!list) return;
  var steps = Array.prototype.slice.call(list.querySelectorAll('.spine-step'));
  var nums = steps.map(function (s) { return s.querySelector('.spine-num') || s; });

  // Enable the hidden pre-enter state now that JS is running.
  list.classList.add('spine-anim');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    list.classList.add('in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    io.observe(list);
  }

  var active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    steps.forEach(function (s, k) {
      s.classList.toggle('is-active', k === i);
      s.classList.toggle('is-done', k < i);
    });
    var lb = list.getBoundingClientRect();
    var nb = nums[i].getBoundingClientRect();
    var span = lb.height - 16; // matches the 8px inset of the line
    var y = (nb.top + nb.height / 2) - (lb.top + 8);
    list.style.setProperty('--spine-progress', String(Math.max(0, Math.min(1, y / span))));
  }

  var ticking = false;
  function update() {
    ticking = false;
    var line = window.innerHeight * 0.45;
    var i = 0;
    for (var k = 0; k < nums.length; k++) {
      var r = nums[k].getBoundingClientRect();
      if (r.top + r.height / 2 <= line) i = k;
    }
    setActive(i);
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  setActive(0);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
