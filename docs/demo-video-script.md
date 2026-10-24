
## Script

### 0:00–0:15 · Hook

*Screen: Results → Compare, type "heat pump"; the raw model's icon beside the routed one.*

> "Ask any AI for an icon and you get Lucide: the same icons every AI-built app ships. Teams want their own style, for any concept. Today every correction they give ends up in a prompt that only grows."

### 0:15–0:40 · Thesis

*Screen: Home → "Rent what changes. Own what lasts." Pan across the diagram.*

> "A lesson can live in two places. Context is rented: instant and editable, but you pay for it on every call. Weights are owned: slower to train, free per call, and they can hold taste that words can't. Hone sends every correction to the right place, on Mubit."

### 0:40–1:00 · Models, contexts and what Mubit does

*Screen: sidebar Models → Hone icons / Smooth; the Mubit strip in the top bar; then the Mubit console (Requests: metadata-only next to full calls, then the Task).*

> "In Hone, a model is a Mubit adapter you own. Each model holds contexts that share its weights. This one is Smooth. Mubit records our calls and trains the adapter. Hone decides what it learns from: previews, probes and judges are recorded as metadata only, and only calls under a context the designer approved are kept. Mubit has no corrections API, so every lesson starts in context, where the model can get it right."

### 1:00–1:50 · Live correction (context, in seconds)

*Screen: Loop. Generate in Feedback → critique the chart → the lesson lands on the rail → regenerate. Keep the Context token count and sparkline in shot.*

> "This is the loop. I critique the chart: 'bars should be pills.' Hone extracts the lesson and tests it on three probes, with and without it. Two of three change, and it's cheap to state, so it goes to both: Smooth's context now, the shared weights later. I regenerate, and the bars are pills seconds after the correction."
>
> "'Round the sparkle tips' makes no difference in three phrasings, so Hone flags it for rephrasing instead of training on it."
>
> "Then I approve the lock: 'exactly the style.' That's an example icon, and it costs 357 tokens on every call. That's too expensive to rent, so it goes to the weights."

### 1:50–2:30 · Model update (weights, in hours)

*Screen: the Context rail's bar, where the Weights segment dominates, with the projected figure beside it; the Weights rail with kept calls and status; then the Mubit console (Adapters, Try models).*

> "Example icons now make up 69% of every prompt. So Hone sends 40 training calls under the approved context. All 40 are valid, and each has a Mubit request ID. That's past Mubit's threshold of 25, and Mubit trains the adapter."

Then read one ending:

- **If the adapter is ready:** "Here's the version in the console, trained at [time]. In Try models it draws held-out concepts in our style with no examples in the prompt. Smooth's context drops from 1,312 tokens to 402."
- **If it isn't** (the rail says "awaiting Mubit"): "Training started at 19:12. Once the adapter holds those lessons, Smooth's context drops from 1,312 tokens to 402: 69% less on every call." Keep the rail's "projected" label or a caption in shot.

### 2:30–2:50 · Results

*Screen: Results → Held-out, with "n = 12" visible.*

> "On 12 held-out concepts, a blind judge scores style. Opus with no context gets 3.08. Opus with every lesson gets 3.50. Sonnet with Hone's routed context gets 3.82: the highest score, on a smaller model."

### 2:50–3:00 · Close

*Screen: the sidebar's disabled "+ Context", then Home.*

> "Next: more contexts on the same weights, like sharp or pixel icons, learned once and owned. Hone: rent what changes, own what lasts."

## Before filming

- **Adapter gate:** `project.json` still lists no adapters. If no version has passed by 01:00, record the "isn't ready" ending.
- **Live numbers:** if the correction is redone live, read "2 of 3" and "357 tokens" off the screen.
- **Honesty:** claim style only in the video. Recognisability for routed Sonnet (3.09) is lower than for Opus with every lesson (3.67); show that in the deck.
- **"+ Context" is disabled:** say "next", not "now"; do not show Sharp or Pixel as working.
- **Waits:** speed up generation (about 8 s) and the effect test (about 9 s) with a "×4" label; never cut the effect test.
- **Look:** pick day or night with the top-bar switch and use it in every clip; record at 1920 × 1080.
- **Wordmark font:** `app/public/fonts/` is gitignored, so record on the machine that has the font, or the logo falls back to Figtree.
- **Names:** do not rename the model or the Smooth context; the project name is in the system prompt, so a new name starts a new Mubit task. Unverified whether the context name is too.
- **Upload:** MP4 ≤ 3:00 before the 05:00 freeze; clocks go back at 02:00. Submit a rough cut early: the latest submission counts.
