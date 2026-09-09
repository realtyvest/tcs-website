/* EXPLAINER_CLIPS: play each clip only while it is on screen, muted and
   looping; the feature cut gets a sound toggle. Reduced motion and Save-Data
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
  // Sound toggle on the feature cut only.
  Array.prototype.forEach.call(document.querySelectorAll(".xc-feature"), function (fig) {
    var v = fig.querySelector("video"); if (!v) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "xc-sound"; b.setAttribute("aria-pressed", "false"); b.textContent = "Sound on";
    b.addEventListener("click", function () {
      var on = v.muted;
      v.muted = !on; b.setAttribute("aria-pressed", on ? "true" : "false"); b.textContent = on ? "Sound off" : "Sound on";
      if (on) { v.currentTime = 0; tryPlay(v); }
    });
    (fig.querySelector(".xc-media") || fig).appendChild(b);
  });
})();
