# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

`growlocally.github.io` — David Cho's portfolio site, served by GitHub Pages directly from the default branch. **No build step, no bundler, no package manager.** Edit `.html` / `.css` / `.js` / `.jsx` files in place; pushing to `main` deploys.

## Running locally

Any static file server works. Examples:

```
python3 -m http.server 8000     # then open http://localhost:8000
npx serve .
```

The JSX pages (see below) require being served over HTTP — opening them via `file://` will break the `fetch(./.design-canvas.state.json)` sidecar load and the CDN script integrity checks.

There is no lint, test, or typecheck command. There is no CI.

## Architecture

### Page model

Every page is a self-contained HTML file at the repo root. Two header/footer/nav patterns exist:

1. **Portfolio pages** (`index.html`, `work.html`, `about.html`, `resume.html`, `contact.html`, all `*Case Study*.html`, `case-study.html`) share `styles.css` + `assets/site.js` and use the warm-editorial design system defined as CSS custom properties on `:root` in `styles.css`.
2. **Design exploration pages** (`color-exploration.html`, `font-exploration.html`) bypass `styles.css` entirely and mount a React + Babel runtime canvas (`design-canvas.jsx`) instead. They are previews, not portfolio chrome.

Case study HTML files often contain spaces in their filenames (e.g. `SurveyMonkey CMS Modernization.html`). Preserve those filenames — they are linked from `work.html` and the index. Any new link to a case study must URL-encode the space (`%20`).

### `styles.css` is the design system

A single file (~1600 lines) holds the entire design system: tokens (color, type scale, spacing, motion) on `:root`, layout primitives (`.shell`, `.section`, `.section-head`), nav, buttons, cards, hero, work-list, case-study chrome, etc. Tokens of note:

- Palette tokens: `--bg`, `--bg-2`, `--surface`, `--ink`, `--ink-2`, `--muted`, `--line`, `--accent` (`#C8451E` clay vermilion), `--accent-soft`, `--accent-ink`.
- Type tokens: `--font-display` (Source Serif 4), `--font-sans` (Space Grotesk), `--font-mono` (IBM Plex Mono); `--step-0` … `--step-7` scale.
- `--shell` = 1240px, `--gutter` clamp-based.

When adding visuals, reach for existing tokens before introducing new colors or sizes. Italic display type colored with `--accent` is the site's voice (see `.section-head__title em`, `.hero__headline em`).

Page-specific styles live in a `<style>` block inside that page's `<head>` (e.g. `.work-list` and `.wcard*` are in `work.html`). Only promote styles to `styles.css` when they're used on more than one page.

### `assets/site.js` shared behaviors

Loaded by every portfolio page as `<script src="assets/site.js">`. Implements four cross-cutting behaviors that pages opt into by adding classes/data attributes:

- **Sticky nav shadow** — toggles `.nav.is-stuck` once `scrollY > 4`.
- **Mobile menu** — `.nav__menu-btn` toggles `.nav.is-open`; links inside `.nav__panel` close it on click.
- **Reveal on scroll** — `IntersectionObserver` adds `.is-in` to any element with class `reveal` (threshold 0.12, -40px bottom rootMargin). Add `reveal` to opt in.
- **Filter chips** — any element with `data-filter-group` and `data-filter-target="<selector>"` wires its `.chip[data-filter="…"]` children to hide/show items matching `data-tags` (space-separated) inside the target. `data-filter="all"` is the reset.
- **Year stamp** — `[data-year]` is set to the current four-digit year.

> ⚠️ There are **two identical copies** of `site.js`: `/site.js` and `/assets/site.js`. All HTML references `assets/site.js`. If you edit one, update the other to keep them in sync (or treat `/site.js` as dead and delete it intentionally).

### React-via-CDN pages

`tweaks-panel.jsx` and `design-canvas.jsx` are NOT bundled. They are loaded as `<script type="text/babel" src="…">` after React 18 UMD, ReactDOM UMD, and `@babel/standalone` are pulled from `unpkg.com`. Babel compiles them in the browser at load time.

**`tweaks-panel.jsx`** is the runtime tweaks shell used by `index.html`. It:

- Exposes `useTweaks`, `TweaksPanel`, `TweakSection`, `TweakSlider`, `TweakToggle`, `TweakRadio`, `TweakColor` as globals (no module system).
- Speaks a host protocol via `window.parent.postMessage` — emits `__edit_mode_available`, listens for `__activate_edit_mode` / `__deactivate_edit_mode`, emits `__edit_mode_set_keys` / `__edit_mode_dismissed`. The panel only renders while edit mode is active.
- Persists tweak defaults inline in the host HTML between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` markers. The host rewrites that block; never hand-edit those markers' delimiters.

In `index.html`, the tweaks block lets a host swap **palette** (Warm / Slate / Night), **type voice** (Balanced / Serif-led / Sans-led), and **accent** by overwriting CSS custom properties on `document.documentElement`. New tweaks plug in by extending `applyTweaks()` and adding controls inside `<TweaksPanel>`.

**`design-canvas.jsx`** is a Figma-ish pan/zoom canvas with reorderable artboards used by the exploration pages. It exposes `DesignCanvas`, `DCSection`, `DCArtboard`, `DCPostIt` globally. State (artboard order, renamed labels, hidden artboards) persists to a `.design-canvas.state.json` sidecar next to the HTML — reads via `fetch()`, writes via the host bridge `window.omelette.writeFile()`. Without that bridge, edits don't persist but the canvas still renders.

When editing either JSX file, remember:

- JSX runs through `@babel/standalone` in the browser, so syntax must be Babel-compatible but you can't rely on TS or modern build-only features.
- Don't introduce ES module `import` statements — the script is loaded as a classic script with `type="text/babel"`.
- All cross-file sharing happens via globals (`React`, `ReactDOM`, and the component names defined in these files).
- Classes are prefixed (`dc-*`, `twk-*`) so they don't collide with `styles.css`. Keep the prefix when adding new ones.

### Work filter tag vocabulary

`work.html` uses these `data-tags` values: `systems`, `growth`, `cms`, `design-systems`, `leadership`, `interaction`, `research`, `analytics`. The chip bar counts at the top of the page are hard-coded — update them when you add/remove case study cards.

## Editing conventions

- **Don't add a package.json, bundler, or framework.** This site's value proposition is staying buildless. If you need a new dependency, prefer a `<script>` tag from a CDN with SRI, matching the React/Babel pattern.
- **Mirror `site.js` edits between `/site.js` and `/assets/site.js`** until that duplication is resolved.
- **Match the existing design vocabulary** when adding sections: use `.shell` for the content container, `.section` (or `.section--flush`) for vertical rhythm, `.section-head` with `.section-head__index` + `.section-head__title` (italicized `<em>` for accent), and `reveal` on anything that should animate in.
- **Active nav state** — the current page's link in `<nav class="nav__links">` gets `is-active`. Update it when copying nav markup to a new page.
