/* HUB_LINKS: lay out the hub grid, draw the wires into the hub, and send
   packets along them once the section is in view. */
(function () {
  "use strict";
  var grid = document.querySelector(".solutions-grid");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".solution-card"));
  var hub = cards.filter(function (c) { return /job-tracking/.test(c.getAttribute("href") || ""); })[0];
  if (!hub || cards.length < 2) return;
  var spokes = cards.filter(function (c) { return c !== hub; });
  hub.classList.add("is-hub");
  var slots = ["left", "right", "bottom"];
  spokes.forEach(function (c, i) { c.setAttribute("data-spoke", slots[i] || "bottom"); });
  grid.classList.add("hub-grid");

  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "hub-wires");
  svg.setAttribute("aria-hidden", "true");
  grid.insertBefore(svg, grid.firstChild);
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rel(el) {
    var g = grid.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { l: r.left - g.left, t: r.top - g.top, r: r.right - g.left, b: r.bottom - g.top, w: r.width, h: r.height };
  }
  function build() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var g = grid.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + Math.round(g.width) + " " + Math.round(g.height));
    var h = rel(hub), mobile = window.innerWidth <= 820;
    var defs = document.createElementNS(NS, "defs");
    svg.appendChild(defs);
    spokes.forEach(function (c, i) {
      var s = rel(c), d;
      if (mobile) {
        var x = 12; // spine left of the cards, leaving from the hub's left edge
        d = "M " + Math.round(h.l) + " " + Math.round(h.b - 28) + " H " + x + " V " + Math.round(s.t + s.h / 2) + " H " + Math.round(s.l);
      } else {
        var side = c.getAttribute("data-spoke");
        if (side === "left") d = "M " + Math.round(s.r) + " " + Math.round(s.t + s.h / 2) + " H " + Math.round(h.l);
        else if (side === "right") d = "M " + Math.round(s.l) + " " + Math.round(s.t + s.h / 2) + " H " + Math.round(h.r);
        else d = "M " + Math.round(s.l + s.w / 2) + " " + Math.round(s.t) + " V " + Math.round(h.b);
      }
      var p = document.createElementNS(NS, "path");
      p.setAttribute("class", "wire"); p.setAttribute("id", "hubwire" + i); p.setAttribute("d", d);
      svg.appendChild(p);
      var len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = grid.classList.contains("is-linked") ? 0 : len;
      // arrow tip at the hub end
      var end = p.getPointAtLength(len);
      var tip = document.createElementNS(NS, "circle");
      tip.setAttribute("class", "tip"); tip.setAttribute("r", "4"); tip.setAttribute("cx", end.x); tip.setAttribute("cy", end.y);
      svg.appendChild(tip);
      if (!reduce) {
        var dot = document.createElementNS(NS, "circle");
        dot.setAttribute("class", "packet"); dot.setAttribute("r", "4");
        var am = document.createElementNS(NS, "animateMotion");
        am.setAttribute("dur", (2.2 + i * 0.3) + "s"); am.setAttribute("repeatCount", "indefinite"); am.setAttribute("begin", "indefinite");
        var mp = document.createElementNS(NS, "mpath");
        mp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#hubwire" + i);
        mp.setAttribute("href", "#hubwire" + i);
        am.appendChild(mp); dot.appendChild(am); svg.appendChild(dot);
      }
    });
    if (grid.classList.contains("is-linked")) startPackets();
  }
  function startPackets() {
    Array.prototype.forEach.call(svg.querySelectorAll("animateMotion"), function (am) { try { am.beginElement(); } catch (e) {} });
  }
  function link() {
    grid.classList.add("is-linked");
    Array.prototype.forEach.call(svg.querySelectorAll("path.wire"), function (p) { p.style.strokeDashoffset = 0; });
    setTimeout(startPackets, reduce ? 0 : 900);
  }
  build();
  if (reduce || !("IntersectionObserver" in window)) { link(); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); link(); } }); }, { rootMargin: "0px 0px -22% 0px", threshold: 0.25 });
    io.observe(grid);
  }
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(build, 150); });
  window.addEventListener("load", build);
})();
