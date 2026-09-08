/* VALUE_STACK: shared between the cash flow and ROI calculators. Each page
   calls tcsValueStack.set(key, values); the panel renders the stack from
   localStorage and links to the step still missing. Numbers are the pages'
   own outputs; nothing is computed here beyond the sum. */
(function () {
  "use strict";
  var KEY = "tcs-value-stack";
  var PAGE = /roi-calculator/.test(location.pathname) ? "roi" : /cash-flow-calculator/.test(location.pathname) ? "cash" : "";
  var OTHER = { cash: { key: "roi", href: "/roi-calculator.html", label: "Add the ops gaps", name: "ROI calculator" },
                roi: { key: "cash", href: "/cash-flow-calculator.html", label: "Add the billing wait", name: "cash flow calculator" } };
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  var fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var money = function (v) { return fmt.format(Math.round(v || 0)); };

  // Loaded in the head so the page's first calculation can save; the panel
  // mounts once the DOM is in.
  var mount = null;

  function row(cls, k, s, v) {
    return '<div class="vs-row ' + cls + '"><div><span class="vs-k">' + k + '</span><span class="vs-s">' + s + '</span></div><div class="vs-v">' + v + '</div></div>';
  }
  function render() {
    mount = mount || document.getElementById("value-stack");
    if (!mount) return;
    var d = load(), cash = d.cash, roi = d.roi;
    var other = OTHER[PAGE], missing = other && !d[other.key];
    var link = other ? '<a href="' + other.href + '">Run the ' + other.name + '</a>' : "";
    var lines = [];
    var here = function (k) { return k === PAGE ? "is-here" : ""; };
    if (cash) {
      lines.push(row(here("cash"), "Cash released from the wait", "once, when the invoice goes out on day one", money(cash.release)));
      lines.push(row(here("cash"), "Factoring fees not paid", cash.factoring ? "per year, on the face that stops being factored" : "per year. Zero because you do not factor", money(cash.feeYear)));
    } else {
      lines.push(row("is-missing", "Cash released from the wait", "once, from the cash flow calculator", link));
      lines.push(row("is-missing", "Factoring fees not paid", "per year, from the cash flow calculator", link));
    }
    if (roi) {
      lines.push(row(here("roi"), "Unbilled work recovered", "per year, at 70% of the gap closed", money(roi.unbilled)));
      lines.push(row(here("roi"), "Admin waste recovered", "per year, at 70% of the gap closed", money(roi.admin)));
    } else {
      lines.push(row("is-missing", "Unbilled work recovered", "per year, from the ROI calculator", link));
      lines.push(row("is-missing", "Admin waste recovered", "per year, from the ROI calculator", link));
    }
    var total = (cash ? cash.release + cash.feeYear : 0) + (roi ? roi.unbilled + roi.admin : 0);
    var step = missing ? "Step 1 of 2" : "Step 2 of 2";
    var foot = missing
      ? '<p>One more step. Your numbers stay in this browser, so the stack carries over.</p><div class="vs-actions"><a class="vs-next" href="' + other.href + '">' + other.label + '</a></div>'
      : '<p>Both steps done. The stack is the year-one number to bring to the call.</p><div class="vs-actions"><a class="vs-next is-fit" href="/fit-call">Book a Fit Call</a><button type="button" class="vs-reset" id="vs-reset">Start over</button></div>';
    mount.innerHTML = '<div class="value-stack-card"><div class="vs-head"><h2>Your value stack</h2><span class="vs-step">' + step + '</span></div>' +
      '<div class="vs-rows">' + lines.join("") + '</div>' +
      '<div class="vs-total' + (missing ? " is-partial" : "") + '"><div><span class="vs-k">Year one, stacked</span><span class="vs-s">' + (missing ? "so far. The other calculator adds its lines." : "cash released once plus the three yearly lines") + '</span></div><div class="vs-v">' + money(total) + '</div></div>' +
      '<div class="vs-foot">' + foot + '</div></div>';
    var r = document.getElementById("vs-reset");
    if (r) r.addEventListener("click", function () { save({}); render(); });
  }
  window.tcsValueStack = {
    set: function (key, vals) { var d = load(); d[key] = vals; d[key].t = Date.now(); save(d); render(); },
    get: load
  };
  function arm() {
    render();
    if (!mount) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) { mount.classList.add("is-in"); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { mount.classList.add("is-in"); io.disconnect(); } }); }, { threshold: 0.2 });
    io.observe(mount);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arm); else arm();
})();
