/**
 * Hero b-roll (Hostinger static, homepage)
 *
 * HERO_BROLL_LOCK. Own the Patch runs slow trade footage under its hero; TCS
 * does the same with a navy tint. The video is optional: this script HEAD-
 * checks /assets/video/hero.mp4 (or hero-mobile.mp4 on narrow screens) and
 * only builds the <video> when the file exists. Muted, inline, looping.
 * Skipped for prefers-reduced-motion and Save-Data. Paused while the hero is
 * off screen or the tab is hidden.
 */
(function () {
  "use strict";

  var DESKTOP = "/assets/video/hero.mp4";
  var MOBILE = "/assets/video/hero-mobile.mp4";
  var POSTER = "/assets/video/hero-poster.jpg";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function exists(url) {
    return fetch(url, { method: "HEAD", cache: "no-store" })
      .then(function (r) {
        return r.ok;
      })
      .catch(function () {
        return false;
      });
  }

  ready(function () {
    var hero = document.querySelector("[data-hero]");
    var host = hero && hero.querySelector("[data-hero-media]");
    if (!hero || !host) return;

    var mq = window.matchMedia || null;
    if (mq && mq("(prefers-reduced-motion: reduce)").matches) return;
    if (navigator.connection && navigator.connection.saveData) return;

    var narrow = mq && mq("(max-width: 820px)").matches;
    var order = narrow ? [MOBILE, DESKTOP] : [DESKTOP];

    (function pick(i) {
      if (i >= order.length) return;
      exists(order[i]).then(function (ok) {
        if (!ok) return pick(i + 1);
        mount(order[i]);
      });
    })(0);

    function mount(src) {
      var v = document.createElement("video");
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("muted", "");
      v.setAttribute("autoplay", "");
      v.setAttribute("preload", "auto");
      v.setAttribute("aria-hidden", "true");
      v.tabIndex = -1;
      exists(POSTER).then(function (ok) {
        if (ok) v.poster = POSTER;
      }); // only reached when the video itself exists
      v.src = src;
      host.appendChild(v);
      hero.classList.add("has-media");

      v.addEventListener("playing", function () {
        hero.classList.add("is-playing");
      });
      v.addEventListener("error", function () {
        hero.classList.remove("has-media", "is-playing");
        if (v.parentNode) v.parentNode.removeChild(v);
      });

      function tryPlay() {
        var p = v.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      }
      tryPlay();

      // Save battery: pause when the hero is off screen or the tab is hidden.
      if (typeof IntersectionObserver !== "undefined") {
        new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) tryPlay();
              else v.pause();
            });
          },
          { threshold: 0.05 }
        ).observe(host);
      }
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) v.pause();
        else tryPlay();
      });
    }
  });
})();
