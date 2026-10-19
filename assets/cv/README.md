# CV folder

Put your résumé PDF here (URL-safe filename, lowercase, no spaces), e.g.:

```
assets/cv/alayu-legesse-cv.pdf
```

Then point `js/data.js` at it:

```js
cv: "assets/cv/alayu-legesse-cv.pdf",
```

Run `npm run build`. The "Download CV" buttons in the hero and contact section appear
only when `cv` is set — until then they are removed from the page entirely.

Keep the file reasonably small (under ~1 MB). After editing it, re-run `npm run check`
and commit the PDF together with `index.html`.
