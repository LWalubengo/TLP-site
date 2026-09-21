# The Legacy Project — Website Source

A single-page marketing site for The Legacy Project (Mukite Digital Consulting). No build step, no framework, no dependencies to install — plain HTML/CSS/JS.

## File structure

```
legacy-project-website/
├── index.html          Page markup
├── css/styles.css       All styling (custom properties for the brand palette at the top)
├── js/main.js           Scroll-reveal animations, mobile nav toggle, FAQ accordion, process timeline, contact form submit
├── assets/               Photos + brand marks (see below)
└── README.md
```

## Running it locally

No server or install required — just open `index.html` in a browser. For live-reload during development, any static server works, e.g.:

```
npx serve .
```

## Deployment

Static hosting only — drag the whole `legacy-project-website` folder (or connect the repo) to Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any standard web host. Publish/output directory is the project root (`.`); there is no build command.

## Contact form

The form (`#legacyForm` in `index.html`) currently posts to:

```
https://formsubmit.co/mukitedigital@gmail.com
```

via FormSubmit.co — a free, no-signup form backend. **First submission to a new destination email requires one manual confirmation click** from that inbox before subsequent submissions deliver automatically.

To point it at a different backend (e.g. your own API, Formspree, Netlify Forms), change the `action` attribute on the `<form>` tag and adjust the `fetch()` call in `js/main.js` (search for `form.addEventListener('submit'`) if the new backend needs a different request shape.

## Brand tokens (css/styles.css, top of file)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#2A1615` | Primary background |
| `--ink-deep` | `#190D0C` | Darkest sections (hero overlay, statement sections) |
| `--ink-2` / `--ink-3` | `#35201E` / `#412822` | Card/panel fills |
| `--gold` | `#D4A24C` | Primary accent |
| `--gold-bright` | `#F0B429` | Hover state |
| `--cream` | `#EFE5D9` | Headline text |
| `--muted` | `#BBA98C` | Body/secondary text |

Fonts are loaded from Google Fonts in the `<head>`: **Fraunces** (serif, headings) and **Work Sans** (sans, body).

## Notes / known placeholders

- The "Unveiling" section has a bracketed placeholder note reserving space for real event photography once the client runs a first Unveiling — no image is there yet by design.
- There's no CMS or data layer — all copy (packages, FAQ, pricing) is hardcoded in `index.html`. If this needs to become frequently-editable by non-technical staff, consider wiring it to a headless CMS or moving copy into a JSON file fetched on load.
- No analytics are installed.
- Images are already reasonably compressed but not responsive (`srcset`) — worth adding if page-weight becomes a concern.
