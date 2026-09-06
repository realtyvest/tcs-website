/* HOMEPAGE SPINE — light enter stagger only.
   No ScrollTrigger, no pin, no scrub. IntersectionObserver adds .in once.
   No-JS users see the full list (hidden state is gated behind .spine-anim,
   which is only added here). */
(function () {
  var list = document.querySelector('#spine .spine-list');
  if (!list) return;

  // Enable the hidden pre-enter state now that JS is running.
  list.classList.add('spine-anim');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    list.classList.add('in');
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  io.observe(list);
})();
