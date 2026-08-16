# Physics Flashcards

A static flashcard site (plain HTML/CSS/JS, no build step) for studying physics topics.
Currently includes one subject: **Aviation Physics** (FAA-H-8083-30B, Chapter 5), 82 cards.

## How it works

- `index.html` — home screen (pick a subject) + study screen (flip-card UI) + completion screen
- `style.css` — styling, including the 3D flip animation and light/dark theme
- `data.js` — flashcard data, organized as a list of subjects, each with its own `cards` array
- `app.js` — all app logic (rendering, navigation, shuffle, localStorage progress, theme toggle)

Progress (which card you're on, and whether shuffle is on) is saved to `localStorage` per subject,
so it picks up where you left off on your next visit. The **Reset** button clears that subject's
saved progress and starts over from card 1.

## Adding more subjects

Add a new object to the `SUBJECTS` array in `data.js`:

```js
{
  id: "unique-id",
  title: "Subject Title",
  description: "Short description shown on the home screen.",
  source: "Citation or source text",
  cards: [
    { id: 1, section: "Section Name", page: "1-1", question: "...", answer: "..." }
  ]
}
```

It will automatically appear as a new card on the home screen.

## Running locally

No build step needed. Any static file server works, e.g.:

```
npx serve .
```

Then open the printed localhost URL.

## Deploying to Vercel

This is a plain static site, so no framework configuration is needed.

**Option A — Vercel CLI:**
```
npm i -g vercel
vercel
```
Follow the prompts (accept defaults — Vercel will detect it as a static site).

**Option B — Git + Vercel dashboard:**
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework Preset: "Other". Leave build command empty and output directory as root.
4. Deploy.
