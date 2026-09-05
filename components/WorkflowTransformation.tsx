/**
 * WorkflowTransformation — source of truth for the 9→4 scroll consolidation.
 * Live Hostinger ship: assets/workflow-transformation.js (+ .css) mirrors this.
 *
 * Mapping (Current → Target):
 * - Intake + Copy to spreadsheet → Intake Jobs
 * - Distribute to field → Route Crews
 * - WhatsApp/paper + Admin sorting + Hand-drawn as-builts + Office re-entry
 *   → Annotated Map Creates As-Builts and Tallies Codes + Quantities
 * - Final approval + Invoice/closeout → Invoice + Closeout Docs Sent
 *
 * Progress:
 * 0–15%   show all 9 current
 * 15–30%  Intake+spreadsheet converge; SPREADSHEET HANDOFF REMOVED
 * 30–45%  Distribute → Route Crews
 * 45–70%  WhatsApp/admin/as-builts/re-entry → Annotated Map;
 *         DUPLICATE RE-ENTRY REMOVED then MANUAL TALLY REMOVED
 * 70–85%  Approval+invoice → final target
 * 85–100% four target steps settle
 */
import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, Flip);

export const CURRENT_STEPS = [
  "Intake",
  "Copy to spreadsheet",
  "Distribute to field",
  "WhatsApp / codes / quantities / photos / paper job logs",
  "Admin sorts job log, closeout docs, and rekeys information",
  "As-builts created from field, often hand-drawn",
  "Office re-enters digitally for clean copy matching invoice",
  "Final approval",
  "Invoice sent with closeout documents",
] as const;

export const TARGET_STEPS = [
  "Intake Jobs",
  "Route Crews",
  "Annotated Map Creates As-Builts and Tallies Codes + Quantities",
  "Invoice + Closeout Docs Sent",
] as const;

/** Groups of current indices that fold into each target index */
export const CONSOLIDATION_MAP: ReadonlyArray<{
  target: number;
  sources: ReadonlyArray<number>;
  callout: number;
  start: number;
  end: number;
}> = [
  { target: 0, sources: [0, 1], callout: 0, start: 0.15, end: 0.3 },
  { target: 1, sources: [2], callout: -1, start: 0.3, end: 0.45 },
  { target: 2, sources: [3, 4, 5, 6], callout: 1, start: 0.45, end: 0.7 },
  { target: 3, sources: [7, 8], callout: -1, start: 0.7, end: 0.85 },
];

function fitVars(el: HTMLElement, target: HTMLElement) {
  try {
    const vars = Flip.fit(el, target, {
      getVars: true,
      scale: true,
    }) as { x?: number; y?: number; scale?: number };
    return {
      x: vars.x || 0,
      y: vars.y || 0,
      scale: typeof vars.scale === "number" ? vars.scale : 0.85,
    };
  } catch {
    const a = el.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    return {
      x: b.left + b.width / 2 - (a.left + a.width / 2),
      y: b.top + b.height / 2 - (a.top + a.height / 2),
      scale: 0.82,
    };
  }
}

/** Force settled closing contrast; .is-settled clears CSS opacity fights. */
function settleClosing(el: HTMLElement | null) {
  if (!el) return;
  el.classList.add("is-settled");
  el.style.opacity = "1";
  el.style.visibility = "visible";
  gsap.set(el, { autoAlpha: 1, visibility: "visible", opacity: 1 });
}

/** Drop settle lock so scrub can drive closing again on reverse scroll. */
function unlockClosing(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("is-settled");
}

type Props = {
  className?: string;
};

export function WorkflowTransformation({ className }: Props) {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const currentCards = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-wt-current]")
    );
    const targetCards = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-wt-target]")
    );
    const callouts = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-wt-callout]")
    );
    const chromeCurrent = root.querySelector<HTMLElement>("[data-wt-chrome-current]");
    const chromeTarget = root.querySelector<HTMLElement>("[data-wt-chrome-target]");
    const closing = root.querySelector<HTMLElement>("[data-wt-closing]");

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMq = window.matchMedia("(min-width: 821px)");

    let ctx: gsap.Context | null = null;
    let st: ScrollTrigger | null = null;

    const applyReduced = () => {
      root.classList.add("is-reduced");
      gsap.set(currentCards, { clearProps: "all", autoAlpha: 0 });
      gsap.set(targetCards, { clearProps: "transform", autoAlpha: 1 });
      targetCards.forEach((el) => el.classList.add("is-visible"));
      gsap.set(callouts, { autoAlpha: 1, y: 0, visibility: "visible" });
      settleClosing(closing);
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 0.4 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 1 });
    };

    const build = () => {
      ctx?.revert();
      ctx = null;
      st?.kill();
      st = null;

      root.classList.remove("is-reduced");
      currentCards.forEach((el) => {
        el.classList.remove("is-merging", "is-merged");
        gsap.set(el, { clearProps: "transform,opacity,visibility" });
      });
      targetCards.forEach((el) => {
        el.classList.remove("is-visible");
        gsap.set(el, { clearProps: "transform,opacity,visibility" });
      });
      if (closing) {
        closing.classList.remove("is-settled");
        closing.style.removeProperty("opacity");
        closing.style.removeProperty("visibility");
      }

      if (reduceMq.matches) {
        applyReduced();
        return;
      }

      gsap.set(currentCards, {
        x: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        transformOrigin: "50% 50%",
      });
      gsap.set(targetCards, {
        autoAlpha: 1,
        visibility: "visible",
        x: 0,
        y: 0,
        scale: 1,
      });
      void root.offsetHeight;

      const desktop = desktopMq.matches;

      // Desktop only: Flip-fit absolute merges. Mobile (max-width 820): fade/hide
      // current groups in place and reveal the sticky target stack — no overlapping
      // absolute transforms across the long stacked list.
      const fits = desktop
        ? CONSOLIDATION_MAP.map((g) => {
            const target = targetCards[g.target];
            return g.sources.map((si) => fitVars(currentCards[si], target));
          })
        : null;

      gsap.set(targetCards, { autoAlpha: 0, visibility: "hidden", scale: 0.94 });
      gsap.set(callouts, { autoAlpha: 0, y: 6, visibility: "hidden" });
      if (closing) {
        closing.classList.remove("is-settled");
        closing.style.removeProperty("opacity");
        closing.style.removeProperty("visibility");
        gsap.set(closing, { autoAlpha: 0, visibility: "hidden", opacity: 0 });
      }
      if (chromeCurrent) gsap.set(chromeCurrent, { autoAlpha: 1 });
      if (chromeTarget) gsap.set(chromeTarget, { autoAlpha: 0.35 });

      const forceSettledClosing = () => settleClosing(closing);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.to({}, { duration: 0.15 });

        CONSOLIDATION_MAP.forEach((g, gi) => {
          const dur = g.end - g.start;
          const target = targetCards[g.target];
          const srcEls = g.sources.map((si) => currentCards[si]);

          if (desktop && fits) {
            srcEls.forEach((el, j) => {
              const d = fits[gi][j];
              tl.to(
                el,
                {
                  x: d.x,
                  y: d.y,
                  scale: Math.max(0.7, Math.min(d.scale || 0.85, 0.95)),
                  duration: dur * 0.85,
                  onStart: () => el.classList.add("is-merging"),
                },
                g.start
              );
              tl.to(
                el,
                {
                  autoAlpha: 0,
                  duration: dur * 0.35,
                  onComplete: () => el.classList.add("is-merged"),
                },
                g.start + dur * 0.55
              );
            });
          } else {
            // Mobile: fade current cards out of the group (no Flip absolute merge)
            srcEls.forEach((el) => {
              tl.to(
                el,
                {
                  autoAlpha: 0,
                  duration: dur * 0.75,
                  onStart: () => el.classList.add("is-merging"),
                  onComplete: () => el.classList.add("is-merged"),
                },
                g.start
              );
            });
          }

          tl.fromTo(
            target,
            { autoAlpha: 0, visibility: "hidden", scale: 0.94 },
            {
              autoAlpha: 1,
              visibility: "visible",
              scale: 1,
              duration: dur * 0.45,
              onStart: () => target.classList.add("is-visible"),
            },
            g.start + dur * 0.35
          );

          if (g.callout >= 0 && callouts[g.callout]) {
            tl.to(
              callouts[g.callout],
              { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 },
              g.start + dur * 0.4
            );
          }

          if (gi === 2 && callouts[2]) {
            tl.to(
              callouts[2],
              { autoAlpha: 1, y: 0, visibility: "visible", duration: 0.08 },
              0.6
            );
          }
        });

        tl.to(
          targetCards,
          {
            scale: 1,
            autoAlpha: 1,
            visibility: "visible",
            duration: 0.1,
            stagger: 0.02,
          },
          0.85
        );
        if (chromeCurrent) tl.to(chromeCurrent, { autoAlpha: 0.35, duration: 0.1 }, 0.85);
        if (chromeTarget) tl.to(chromeTarget, { autoAlpha: 1, duration: 0.1 }, 0.85);
        if (closing) {
          tl.to(
            closing,
            {
              autoAlpha: 1,
              visibility: "visible",
              opacity: 1,
              duration: 0.12,
              onComplete: forceSettledClosing,
            },
            0.88
          );
        }

        st = ScrollTrigger.create({
          animation: tl,
          trigger: root,
          start: desktop ? "top top+=72" : "top 75%",
          end: desktop ? "+=240%" : "bottom 20%",
          scrub: desktop ? 0.65 : 0.45,
          pin: desktop,
          anticipatePin: desktop ? 1 : 0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress >= 0.88) forceSettledClosing();
            else unlockClosing(closing);
          },
          onLeave: forceSettledClosing,
        });
      }, root);
    };

    build();

    const onChange = () => {
      build();
      ScrollTrigger.refresh();
    };
    const onResize = () => {
      build();
      ScrollTrigger.refresh();
    };

    reduceMq.addEventListener("change", onChange);
    desktopMq.addEventListener("change", onChange);
    window.addEventListener("resize", onResize);

    return () => {
      reduceMq.removeEventListener("change", onChange);
      desktopMq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
      st?.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === root) t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={["wt", className].filter(Boolean).join(" ")}
      id="workflow-transformation"
      aria-label="Workflow transformation from 9 current steps to 4 target steps"
      data-workflow-transformation
    >
      <div className="wt-inner">
        <header className="wt-chrome">
          <p className="wt-chrome-row">
            <span data-wt-chrome-current>CURRENT · 9 STEPS</span>
            <span className="wt-chrome-arrow" aria-hidden="true">
              →
            </span>
            <span data-wt-chrome-target>TARGET · 4 STEPS</span>
          </p>
          <p className="wt-tagline">Capture the work once. Move the job forward.</p>
        </header>

        <div className="wt-stage" data-wt-stage>
          <div className="wt-lists">
            <div className="wt-col wt-col--current">
              <p className="wt-list-label">Current</p>
              <ol className="wt-list wt-list--current" aria-label="Current nine steps">
                {CURRENT_STEPS.map((label, i) => (
                  <li
                    key={label}
                    className="wt-card wt-card--current"
                    data-wt-current={i}
                  >
                    <span className="wt-card-num">{i + 1}</span>
                    <span className="wt-card-label">{label}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="wt-col wt-col--target">
              <p className="wt-list-label">Target</p>
              <ol className="wt-list wt-list--target" aria-label="Target four steps">
                {TARGET_STEPS.map((label, i) => (
                  <li
                    key={label}
                    className="wt-card wt-card--target"
                    data-wt-target={i}
                  >
                    <span className="wt-card-num">{i + 1}</span>
                    <span className="wt-card-label">{label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="wt-callouts" aria-live="polite">
            <p className="wt-callout" data-wt-callout="0">
              SPREADSHEET HANDOFF REMOVED
            </p>
            <p className="wt-callout" data-wt-callout="1">
              DUPLICATE RE-ENTRY REMOVED
            </p>
            <p className="wt-callout" data-wt-callout="2">
              MANUAL TALLY REMOVED
            </p>
          </div>
        </div>

        <p className="wt-closing" data-wt-closing>
          9 handoffs → 4 connected steps
        </p>
      </div>
    </section>
  );
}

export default WorkflowTransformation;
