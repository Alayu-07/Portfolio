# What I need from you

Everything below lives in **`js/data.js`** (one file, plain JavaScript). Empty string /
empty array = the element is **hidden** — nothing is invented and nothing renders broken.
When you change anything:

```bash
npm run build    # regenerates index.html, robots.txt, sitemap.xml
npm run check    # sanity check — expect 0 failures
```

Rough totals: items 1–4 ≈ 10 minutes, item 5 ≈ 30–60 minutes, the rest optional.

---

## 1. Your production URL — 1 minute, biggest unlock

```js
siteUrl: "https://alayulegesse.dev", // no trailing slash
```

While this is empty the build deliberately **omits** the canonical URL, `og:image`, and
`sitemap.xml` rather than emitting a wrong one. One line makes sharing cards, search
results, and the sitemap correct.

## 2. Your CV (PDF)

```bash
# drop the file here:
assets/cv/alayu-legesse-cv.pdf
```

```js
cv: "assets/cv/alayu-legesse-cv.pdf",
```

This is what renders the two "Download CV" buttons (hero + contact). Until then they are
not in the DOM. Keep the filename URL-safe (lowercase, hyphens, no spaces).

## 3. Social profiles

```js
social: {
  github: "https://github.com/Alayu-07/", // ✅ set
  linkedin: "https://www.linkedin.com/in/yourusername", // still needed
  telegram: "https://t.me/yourusername", // still needed
},
```

Rendered in the hero, drawer, contact section and footer. Only the ones you fill appear.

## 4. Contact form delivery (optional — mailto works meanwhile)

1. Create a free endpoint at **formspree.io** (or **web3forms.com**) with this address.
2. Paste it in:

```js
contact: {
  formEndpoint: "https://formspree.io/f/xxxxxxxx",
  formProvider: "formspree", // or "web3forms"
},
```

While empty, submitting the form validates inline and then opens the visitor's email app
(documented fallback, no error shown). No private keys are committed — Web3Forms access
keys are public by design.

## 5. Projects — the single biggest credibility gap

For each of the three projects (`js/data.js → projects`):

| Field       | What to send                                            | Renders as                                      |
| ----------- | ------------------------------------------------------- | ----------------------------------------------- |
| `stack`     | Technologies you actually used (`["React","Node",...]`) | Stack chips in the case study                   |
| `live`      | Deployed URL (Vercel/Netlify/GitHub Pages)              | "Live" button; empty = "Case study in progress" |
| `repo`      | GitHub repository URL                                   | "Repository" button                             |
| `image`     | Screenshot, **16:10**, ~1600×1000, WebP                 | Case-study figure                               |
| `learnings` | One honest sentence — what did it teach you?            | "What I learned" block                          |
| `role`      | Confirm/correct "Designer & developer"                  | Case-study meta line                            |

Screenshot pipeline: put files in `assets/img/projects/`, then reference them as
`image: "assets/img/projects/evangadi.webp"` (no compression step needed for WebP at
that size — keep each under ~200 KB).

## 6. Two dates to confirm (from your CV)

```js
// experience[0] — currently shown as the current role with no start date
period: "Present", // ← add the real start, e.g. "2021" or "2021 – Present"

// experience[1] — source CV says "May 2020 – 2026"
period: "2020 – 2026", // ← confirm or correct the end month/year
```

## 7. Optional — recommendations

```js
recommendations: [
  { quote: "…what they actually said…", name: "Full Name", role: "Title, Zamu MDF PLC" },
],
```

1–2 real quotes. The section renders nothing (and the heading is absent) until filled —
never put a fabricated testimonial here.

## 8. Optional — skills, headline, photos

- **"Currently learning"** skill group: `skills` in `js/data.js` (group + items array).
- **Headline wording**: `headline` / `subhead` — change only to something factually true.
- **New photos**: replace `assets/img/profile.jpg` (5:6 portrait) and
  `assets/img/about.jpg` (4:5), then run `npm run images` — it regenerates AVIF/WebP/JPEG
  at every width, the favicons, and the Open Graph image. Previous files are preserved in
  `assets/original/`.
- **Text edits** (about, experience summaries, services, principles): all in
  `js/data.js`; sections whose whole array is emptied disappear cleanly.

## 9. After any change

```bash
npm run build && npm run check && npm run verify
```

`check` fails on contrast, TODO regressions, or stale output; `verify` regenerates
screenshots, axe results and the layout assertions into `docs/`.
