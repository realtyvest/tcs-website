# MAP_TO_INVOICE_PIN_HOLD_REVISE

Priority revise after Design review on tip `70cc2cc`
(`fix(m2i): pin+scrub #map-to-invoice on ALL breakpoints (MAP_TO_INVOICE_PIN_HOLD_LOCK)`).
Scope: `#map-to-invoice` island only. WT / hamburger / footer untouched.

## PASS — kept as-is
- Pin + scrub on **mobile AND desktop** (only `prefers-reduced-motion` opts out).
- `syncStep` playhead-derived step↔panel sync (reverse-safe).
- `settleFinal` → **Invoice items** only on leave (CLEAR_STATE, no ghost Closeout).
- End `"+=300%"` (~1 viewport per step; Annotated map never skipped).
- Annotated map step preserved; no jumpy unpin.

## FAIL — fixed

### 1. Mid-crossfade ghost titles → SEQUENTIAL swap (zero overlap)
**Root cause:** the crossfade faded outgoing and incoming panels *simultaneously*
(both tweens started at the same `at`, `dur 0.35`). Mid-scrub both panels sat at
partial `autoAlpha`, so two panel titles were readable at once.

**Fix (`assets/map-to-invoice.js`, `buildSequenceTimeline`):** the swap is now
sequential with **zero overlap** — the outgoing panel reaches `autoAlpha: 0` over
`FADE` (0.16), **then** the next fades in over `FADE` starting at `at + FADE`. At
most one title is ever visible. `activeStepAtTime` switches the lit step at the
swap point (`at + FADE`), still fired by `tl.call` + `onUpdate`, so step + panel
stay locked and reverse-scrub restores the prior step. `settleFinal` end kept.
(Chosen over the `CROSS ≤ 0.12` alternative — sequential guarantees no bleed.)

### 2. Mobile dead-scroll / blank navy void → heights fit the active card
**Root cause:** pinned panels are `position:absolute; inset:0`, so they fill the
container's `min-height`. The `320px` container / `220px` visual applied on **all**
breakpoints; on mobile the short card left ~90px of navy below the visual — a void
that read as dead scroll.

**Fix (`assets/map-to-invoice.css`, `.m2i.is-pinned`):** base (mobile) pinned
`stage`/`panels` `min-height` → `244px` and `visual`/`map` height → `168px`, sized
to the tallest card so no slack. Desktop (`min-width:1025 & pointer:fine`) bumps
back to `300px` / `220px` via an override placed after the base rules. The pin
**runway** is the ScrollTrigger `end "+=300%"` (pinSpacing) — independent of this
chrome height — so scroll *distance* is unchanged; only the visible box shrank to
its content.

## Guardrails honored
- No jumpy unpin reintroduced; Annotated map not skipped.
- No WT / hamburger / footer changes. Panel asset swap on HOLD.
- Cache-bust `map-to-invoice.js` + `.css` → `?v=pin2`.
- `node --check` passes on the JS.

## Cites
- GSAP Timeline — https://gsap.com/docs/v3/GSAP/Timeline
- ScrollTrigger / scroll — https://gsap.com/scroll/ · https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Skills: `gsap-timeline` + `gsap-scrolltrigger` · cheatsheet https://gsap.com/cheatsheet

Parent: `70cc2cc`.
