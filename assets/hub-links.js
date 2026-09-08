/* HUB_LINKS: lay out the hub grid, pin it on desktop, and let the scroll
   draw each wire and light each module in turn; packets follow. */
(function () {
  "use strict";
  var grid = document.querySelector(".solutions-grid");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".solution-card"));
  var hub = cards.filter(function (c) { return /job-tracking/.test(c.getAttribute("href") || ""); })[0];
  if (!hub || cards.length < 2) return;
  var spokes = cards.filter(function (c) { return c !== hub; });
  hub.classList.add("is-hub");
  var slots = spokes.length >= 4 ? ["left", "right", "bottom-left", "bottom-right"] : ["left", "right", "bottom"];
  spokes.forEach(function (c, i) { c.setAttribute("data-spoke", slots[i] || "bottom"); });
  grid.classList.add("hub-grid"); grid.id = grid.id || "tcs-hub";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "hub-wires"); svg.setAttribute("aria-hidden", "true");
  grid.insertBefore(svg, grid.firstChild);
  var wires = [];

  function rel(el) {
    var g = grid.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { l: r.left - g.left, t: r.top - g.top, r: r.right - g.left, b: r.bottom - g.top, w: r.width, h: r.height };
  }
  function build() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    wires = [];
    var g = grid.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + Math.round(g.width) + " " + Math.round(g.height));
    var h = rel(hub), mobile = window.innerWidth <= 820;
    spokes.forEach(function (c, i) {
      var s = rel(c), d, side = c.getAttribute("data-spoke");
      var R = Math.round;
      if (mobile) {
        d = "M " + R(h.l) + " " + R(h.b - 28) + " H 12 V " + R(s.t + s.h / 2) + " H " + R(s.l);
      } else if (side === "left") {
        d = "M " + R(s.r) + " " + R(s.t + s.h / 2) + " H " + R(h.l);
      } else if (side === "right") {
        d = "M " + R(s.l) + " " + R(s.t + s.h / 2) + " H " + R(h.r);
      } else if (side === "bottom") {
        d = "M " + R(s.l + s.w / 2) + " " + R(s.t) + " V " + R(h.b);
      } else {
        // bottom corners: up from the card, across the gap, up into the hub's underside
        var midY = R((s.t + h.b) / 2), sx = R(s.l + s.w / 2);
        var hx = side === "bottom-left" ? R(h.l + h.w * 0.3) : R(h.l + h.w * 0.7);
        d = "M " + sx + " " + R(s.t) + " V " + midY + " H " + hx + " V " + R(h.b);
      }
      var p = document.createElementNS(NS, "path");
      p.setAttribute("class", "wire"); p.setAttribute("id", "hubwire" + i); p.setAttribute("d", d);
      svg.appendChild(p);
      var len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      var end = p.getPointAtLength(len);
      var tip = document.createElementNS(NS, "circle");
      tip.setAttribute("class", "tip"); tip.setAttribute("r", "4"); tip.setAttribute("cx", end.x); tip.setAttribute("cy", end.y);
      svg.appendChild(tip);
      var dot = null;
      if (!reduce) {
        dot = document.createElementNS(NS, "circle");
        dot.setAttribute("class", "packet"); dot.setAttribute("r", "4");
        var am = document.createElementNS(NS, "animateMotion");
        am.setAttribute("dur", (2.2 + i * 0.3) + "s"); am.setAttribute("repeatCount", "indefinite"); am.setAttribute("begin", "indefinite");
        var mp = document.createElementNS(NS, "mpath");
        mp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#hubwire" + i); mp.setAttribute("href", "#hubwire" + i);
        am.appendChild(mp); dot.appendChild(am); svg.appendChild(dot);
      }
      wires.push({ path: p, len: len, tip: tip, card: c, dot: dot });
    });
    apply(lastProgress);
  }

  /* Progress 0..1 lights the hub, then draws each wire and lights its module. */
  var lastProgress = 0, packetsOn = false;
  function apply(prog) {
    lastProgress = prog;
    var n = wires.length;
    wires.forEach(function (w, i) {
      var seg = Math.max(0, Math.min(1, (prog * n - i)));
      w.path.style.strokeDashoffset = w.len * (1 - seg);
      var lit = seg >= 0.999;
      w.card.classList.toggle("is-lit", lit);
      w.tip.classList.toggle("is-lit", lit);
    });
    var done = prog >= 0.999;
    grid.classList.toggle("is-linked", done);
    if (done && !packetsOn) { packetsOn = true; Array.prototype.forEach.call(svg.querySelectorAll("animateMotion"), function (am) { try { am.beginElement(); } catch (e) {} }); }
  }

  /* Pin on desktop; scrub without pin if too tall; phones reveal by view. */
  var wrap = document.createElement("div");
  wrap.className = "hub-pin";
  grid.parentNode.insertBefore(wrap, grid); wrap.appendChild(grid);
  var mode = "io", PER_VH = 0.28;
  function navH() { var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tcs-nav-h")); return v > 0 ? v : 64; }
  function layout() {
    wrap.classList.remove("is-armed"); wrap.style.height = "";
    if (reduce) { mode = "static"; grid.classList.remove("is-story"); build(); apply(1); return; }
    grid.classList.add("is-story");
    if (window.innerWidth > 1024) {
      var h = grid.offsetHeight;
      if (h <= window.innerHeight - navH() - 24) { wrap.classList.add("is-armed"); wrap.style.height = Math.round(h + 16 + window.innerHeight * PER_VH * spokes.length) + "px"; mode = "pin"; }
      else mode = "scrub";
    } else mode = "scrub";
    build(); update();
  }
  function update() {
    if (mode === "static") return;
    var vh = window.innerHeight, prog;
    if (mode === "pin") {
      var start = wrap.getBoundingClientRect().top + window.scrollY - navH() - 16;
      prog = (window.scrollY - start) / (vh * PER_VH * spokes.length);
    } else {
      var r = grid.getBoundingClientRect();
      prog = (vh * 0.85 - r.top) / (Math.min(r.height, vh * 0.8));
    }
    apply(Math.max(0, Math.min(1, prog)));
  }
  var raf = null;
  window.addEventListener("scroll", function () { if (raf) return; raf = requestAnimationFrame(function () { raf = null; update(); }); }, { passive: true });
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 150); });
  window.addEventListener("load", layout);
  layout();
})();
