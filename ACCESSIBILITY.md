# Accessibility (WCAG 2.1 AA)

The SPA targets WCAG 2.1 AA. This file records what was done and the known,
stack-imposed exceptions that remain.

## Implemented
- `lang="en"` on the document; zoom is no longer blocked (viewport allows
  user scaling).
- Per-route `document.title` (router `afterEach`).
- Landmarks: header (q-header), `<nav aria-label="Main">` around the primary
  tabs, main (q-page-container), contentinfo (q-footer); skip-to-content link.
- Logo link and images have accessible names / alt text.
- Form controls labelled; icon-only buttons have `aria-label`; decorative
  icons are `aria-hidden`.
- Status conveyed by color is reinforced with text/aria (see submissions list
  lock/cancelled/received indicators).
- Brand colors adjusted where needed to meet 4.5:1 text contrast.
- Drag-and-drop lists (status / enum reordering) have keyboard-operable
  up/down controls as an alternative.

## Verifying
`axe-core` is served at `/axe.min.js` in dev (gitignored). Inject it via the
browser console / Playwright and run `axe.run(document)` on each route. Target:
zero serious/critical violations except the documented exception below.

## Known exceptions (stack-imposed)
- **`aria-required-children` on the main navigation `q-tabs`.** Quasar renders
  `q-tabs` with `role="tablist"`; our top nav mixes route-tabs with the
  Core/Site `q-btn-dropdown` menus in the same bar, and the dropdowns are not
  `role="tab"`. Overriding the roles only trades this for `aria-allowed-attr`
  (Quasar sets `aria-selected` on the items) or `aria-required-parent`. The bar
  is wrapped in a labelled `<nav>` landmark and every item is keyboard
  reachable, so the practical impact is limited. Revisit if Quasar exposes a
  non-tablist nav primitive.
- **AG Grid Enterprise watermark / internal DOM.** The samplesheet relies on AG
  Grid's own (generally strong) ARIA; its internal nodes are not under our
  control. A licence key removes the watermark overlay.
