/* EXPLAINER_CLIPS: play each clip only while it is on screen, muted and
   looping. Reduced motion and Save-Data
   users see the poster only. */
(function () {
  "use strict";
  var clips = Array.prototype.slice.call(document.querySelectorAll(".xc video"));
  if (!clips.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var save = navigator.connection && navigator.connection.saveData;
  clips.forEach(function (v) { v.muted = true; v.defaultMuted = true; v.setAttribute("playsinline", ""); v.loop = true; });
  if (reduce || save) { clips.forEach(function (v) { v.removeAttribute("autoplay"); v.preload = "none"; }); return; }
  function tryPlay(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.35) { if (v.preload === "none") v.preload = "auto"; tryPlay(v); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: [0, 0.35, 0.6] });
    clips.forEach(function (v) { io.observe(v); });
  } else {
    clips.forEach(tryPlay);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) clips.forEach(function (v) { if (!v.paused) v.pause(); });
  });
})();
