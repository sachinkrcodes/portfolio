# Owner's guide

How to run, change and deploy Cloud City. What the project is, and how it performs, is in the [README](../README.md).

## Run it on your computer

You need Node.js 20.9 or newer (22 is fine). Check with `node -v`.

```bash
npm install
npm run dev        # open http://localhost:3000
```

Production build (what Vercel runs):

```bash
npm run build
npm run start
```

## Change the words

Everything you read on the site comes from one file: `src/data/content.ts`.
Edit it and the 3D labels, panels, the 2D page, the ticker, the menu, the share picture and the screen reader copy all update.
Counts such as "8 projects on GitHub" and "5 major projects with screenshots, numbers and code, and 3 minor projects" are calculated from the lists,
so they stay right by themselves.

### I want to... (the recipes)

| I want to | Do this |
| --- | --- |
| Add a major project with a full case study | Add an object to `projects` (copy the Attendly one). It appears in the Projects panel, the next / previous buttons, the 2D page, the screen reader copy, gets a share link `/#its-id` and, if there is room, its own building in the 3D city (see "More than three projects"). |
| Add a minor project | Add an object to `miniProjects` (copy Tic-Tac-Toe). One card: what it is, 2 to 4 facts, stack, links. |
| Show a project as "in progress" | Set `status: "building"`, `when: "Started Nov 2026"`, `progress` (one line: what works today) and `next` (one line: what is left). It then shows an "In progress" chip and appears in **Cloud Lab** under "In progress" by itself. |
| Mark a project as finished | Change `status` to `"done"` (the chip then says "Completed"), change `when` to `"Built Dec 2026"` and delete `progress` and `next`. It leaves the "In progress" list in Cloud Lab by itself, and when nothing is in progress that list is hidden. |
| Add or change screenshots | Put 3 JPG files (about 1200 px wide, under 100 KB each) in `public/projects/<project id>/` and list them in `shots` with a one line caption each (what the picture shows). The build stops if a file is missing. |
| Change the words on the 3D Cloud Lab island | `building.tags` (the five floating words). In the panel, "In progress" comes from the projects marked in progress, "Where my apps run" from `runsOn` on each project, "Cloud and DevOps work" from `cloudWork`, and "Learning now" from `learning`. |
| Rename Cloud Lab (for example back to "Currently Building") | In `islands.building` change `title` and `short`. The menu, the label, the 2D page and the screen reader copy follow. |
| Add or change a skill | `skillTracks` has two tracks: Software Engineering and Cloud Engineering. A skill is `{ name, level, where }`. Use `level: "used"` only when the skill is in code on your GitHub, and put the project names in `where` (the page shows them under the skill). Use `"learning"` for the rest. Move a skill from learning to used on the day you ship something with it. The counts ("11 used, 1 learning") are calculated. |
| Say where a project runs | Set `runsOn` on the project, for example `"Vercel (site and API) and Neon (PostgreSQL)"`. It shows in Cloud Lab under "Where my apps run", next to the Live demo button. |
| Change the first words of the page | `profile.headline` (the big line), `profile.role` (the line under it) and `profile.stack` (the tech line). |
| Finish a SigmaX project | Delete its name from `sigmax.programProjects`, then add it to `miniProjects` (minor) or `projects` (major). Do the second step only when there is code to show. |
| Add a live link to a project | Set its `liveUrl` (and optionally `liveLabel`). The button appears first. **Open the link in a private window first** (see "Before you share the link"). |
| Add a job or change a title | `jobs` (newest first) and `profile.role` / `profile.headline`. |
| Add a certificate | `certifications`. |
| Update the resume PDF | Replace `public/Sachin_Kumar_Resume.pdf` (same file name). Nothing else changes. |
| Change my GitHub or LinkedIn name | Change `profile.github` and `profile.linkedin`, and the `repo` link of every project (find and replace the old name in `content.ts`). The resume PDF has the same two links printed on it, so rebuild or replace it too. |
| Change the About text | `about.intro` (two lines), `about.groups` (the bullet points, in groups) and `about.facts` (four tiles). Keep it to facts you can prove. |
| Change the ticker at the bottom | `milestones`. |
| Change the colours | `src/lib/palette.ts`, see below. |
| Change what a link preview says | `site.title` and `site.description` in `content.ts`. The picture is made from your name, role, headline and stack. |

### After SigmaX: major projects only, a new About

When the course is done and you only want to show major projects, the whole change is in `src/data/content.ts`
(the same steps are in the comment at the top of that file). About 15 minutes:

1. **`projects`**: add each major project as a full case study (copy an existing one). The 3D Projects island builds itself
   from this list and has room for **six buildings**. A seventh project still shows in the panel, the 2D page and the screen reader copy.
2. **`miniProjects`**: set it to `[]`. An empty list hides every "Minor projects" part by itself (the 3D panel, the 2D page and the screen reader copy). Or keep the ones you like.
3. **`about`**: replace the whole object: `title`, `intro`, `groups` (bullet points) and `facts` (four tiles).
4. **`sigmax`**: set `status` to `"Completed"` and `programProjects` to `[]` (the program project list then disappears).
5. **`milestones`, `learning`, `skillTracks`, `cloudWork`, `profile.summary`, `site.description`**: update the words that mention what you are learning.
   `profile.role` and `profile.headline` change if your title does.
6. **`public/Sachin_Kumar_Resume.pdf`**: replace it with the new resume (same file name).

Then run `npm run build` once. The build checks `content.ts` and stops with a plain message if something is wrong
(see "Safety net"), so a slip can never go live. Push to GitHub and Vercel redeploys.

### More than three projects (the 3D buildings)

Each project in `projects` gets a building on the Projects island. Three (Blood Bank Finder, Sentiment Analysis,
Suzuki-Kasami) have buildings modelled on the projects and keep their spots. Every other project gets one of three
generic styles in turn, or the one you name with the optional `building` field (Sovereign AI Workbench is `"tiers"`, Attendly is `"dish"`):

| `building` | Looks like |
| --- | --- |
| `"pipeline"` | a build, test and ship line with a packet running through gates (good for CI/CD and data projects) |
| `"dish"` | a satellite dish that sweeps around, with radar pulses (good for networks and cloud services) |
| `"tiers"` | a stack of layers that turn slowly, with an orb on top (good for architectures) |

The island has six spots. If you add a seventh project the build prints a warning: the project still works everywhere
except as a building. The camera angles, labels and hit areas for new buildings are set up automatically.

### Details of the data

- `projects`: each one has `kind`, `stats`, `problem`, `built`, `tech`, `highlights`, `repo`, optional `liveUrl`, `liveLabel`, `liveNote`,
  `building`, `shots` and extra `links`, the progress fields `status`, `when`, `progress`, `next`, and `runsOn` (where it is hosted). The numbers in `stats` come from the READMEs and were
  counted from the code. If you change the code, recount.
- `miniProjects`: `id`, `name`, `kind`, `summary`, `points`, `stack`, `repo`, optional `liveUrl`, `liveLabel`, `runsOn` and the same progress fields.
- `research`: the paper. When you have results, change `outcome` and `status`.
- `about`: `intro`, `groups` (bullet points), `facts` (four tiles), `spoken`. The "projects on GitHub" tile is counted from the project lists.
  The "252 tests and checks" tile is 144 (Sovereign AI Workbench) + 73 (Attendly) + 35 (Sentiment app): change it when those numbers change.
- `jobs`: each role has a one line `summary`, the `highlights` bullets and the `skills` chips.
  Delete any line that is not true: recruiters ask about every line.
- `sigmax`: shown in Cloud Lab and in the certifications as "In progress". Its program projects are listed with their due date (May 2027)
  and are never shown as started or finished. Move a project out of the list only when its code exists.
- `milestones` (the bottom ticker), `learning`, `building`, `skillsHead`, `skillsIntro`, `skillTracks`, `moreSkills`, `cloudWork`, `certifications`, `education`.

**Live links.** Attendly, Blood Bank Finder, Suzuki-Kasami Simulator and Birthday Surprise have a `liveUrl`, copied from their READMEs.
Sovereign AI Workbench (runs on a laptop) and the Sentiment app have none: the card says so with `liveNote` or simply shows the source link.
Open each live link in a private window before you share the site. A project with a `liveUrl` shows a "Live demo" button first.

**The two Blood Bank repos.** The site points at `blood-bank-finder-live` (the live React and Supabase version). The first version,
a Spring Boot, MySQL and Docker app, is mentioned in the case study but its repository is not linked, because it is not on your GitHub list now.

**Safety net:** every build runs `src/data/validate.ts` over `content.ts`. A duplicate project id, a link that is not
https, a GitHub link that is not a GitHub link, or a screenshot file that does not exist stops the build with a plain message (so it can never go live).
A project marked in progress without a `progress`, `next` or `when` line prints a warning.
Long dashes and leftover TODOs are printed as warnings in the build log.

## Contact form

The form (Contact in the menu, or `/#contact`) posts to `/api/contact`, a small server route in
`src/app/api/contact/route.ts`. It checks the request again on the server (the browser checks can be bypassed),
ignores bots that fill a hidden field, limits each visitor to 5 messages per 10 minutes, and then sends the message to your
inbox through a mail service. The service is chosen by environment variables, so no key is ever in the code or in the browser.

If the form is not set up, or the service is down, the visitor sees a clear message and an email link with their text
already filled in, so nothing is lost.

**Set it up with Resend (recommended, free plan):**

1. Sign up at resend.com with the email address that should receive the messages (for example your Gmail).
2. In Resend, open API Keys, create a key with sending access and copy it.
3. In Vercel, open your project, Settings, Environment Variables, and add `RESEND_API_KEY` with that key
   (and `NEXT_PUBLIC_SITE_URL` if you have not yet). Redeploy.
4. Open your site, go to Contact, send yourself a test message. Check the inbox and the spam folder.

Without a verified domain Resend sends from `onboarding@resend.dev` and only delivers to the email you signed up with, which is
exactly what you need here. If you later verify your own domain in Resend, set `CONTACT_FROM` (for example
`Portfolio <hello@yourdomain.com>`) and optionally `CONTACT_TO_EMAIL`.

**Or with Formspree:** create a form at formspree.io, copy the id from its address (`https://formspree.io/f/<id>`) and set
`FORMSPREE_ID`. If messages do not arrive, check the form's spam protection settings in Formspree.

For local testing copy `.env.example` to `.env.local` and fill it in. `.env*.local` is ignored by git.

| Variable | What |
| --- | --- |
| `RESEND_API_KEY` | Resend key (server only) |
| `CONTACT_TO_EMAIL` | Where messages go. Default: the email in `content.ts` |
| `CONTACT_FROM` | Sender, after you verify a domain. Default: `Portfolio <onboarding@resend.dev>` |
| `FORMSPREE_ID` | Use Formspree instead of Resend |
| `NEXT_PUBLIC_SITE_URL` | Your site address. Used for link previews, the sitemap and search data (see below) |

## Search and link previews (SEO)

All of this is generated from `content.ts` and the site address, so it never goes out of date and there is no image to edit.

| What | Where | Notes |
| --- | --- | --- |
| Title, description, canonical address, Open Graph and Twitter tags | `src/app/layout.tsx` | words come from `site.title` and `site.description` |
| Share picture (1200 x 630) | `src/app/opengraph-image.tsx`, `twitter-image.tsx` | name, role, headline, stack and the four islands, drawn from `content.ts`. Fonts for it are in `src/app/_og/` |
| Logo, favicon, phone home screen icon, web app manifest | `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, `public/icon-192.png`, `public/icon-512.png`, `public/logo.png`, `manifest.ts` | the same 3D cloud logo everywhere. To change it, replace these picture files (same names and sizes: 192, 180, 512, 128 px). The artwork of the 512 px file sits inside its middle 80%, so a phone can cut it into a circle |
| Search data (JSON-LD: a Person and the WebSite) | `src/components/SemanticMirror.tsx` | tells Google who you are and where you studied |
| `robots.txt` and `sitemap.xml` | `robots.ts`, `sitemap.ts` | one page, because the whole portfolio is the home page |
| 404 and error pages | `not-found.tsx`, `error.tsx`, `global-error.tsx` | in the same style, with a way back |
| Security headers | `next.config.ts` | no framing from other sites, no sniffing, no camera / microphone / location |

**Set `NEXT_PUBLIC_SITE_URL`** to your final address (for example `https://sachinkumar.dev`) in Vercel, Settings, Environment Variables.
Without it the site uses the address Vercel gives the project, which also works, but your own domain should be set as soon as you have one,
because the canonical address, the sitemap and the preview picture all use it.

**The resume PDF is not listed in search results** (a `noindex` header in `next.config.ts`). People can still download it from your site.
The reason: the PDF has your phone number and email, and search engines would otherwise copy them into their results.
Delete that block in `next.config.ts` if you want the PDF to be searchable.

After your first real deploy:

1. Paste your address into the LinkedIn Post Inspector (linkedin.com/post-inspector) and the Facebook Sharing Debugger
   (developers.facebook.com/tools/debug). Both show the preview and let you refresh it. For WhatsApp, send the link to yourself.
2. Add the site to Google Search Console (search.google.com/search-console) and submit `https://your-address/sitemap.xml`.
   Google lists a new site in days to weeks. Nothing here can speed that up, and nobody can promise a ranking.

## Sound (optional, off by default)

A quiet ambient sound and small cues, made live with the browser's Web Audio (no audio files to download).

- **Off by default.** It starts only when a visitor presses a sound button, because browsers block sound that starts by itself
  and a recruiter opening your site at work should never be surprised by noise.
- Where the button is: a speaker icon in the top bar (screens 768 px wide and up) and **Sound: on / off** in the menu (phones too), in both the 3D city and the 2D page.
- The choice is remembered on that device (`localStorage`, key `cc-sound`). If it was on, it starts again at the visitor's first click or key press.
- It pauses when the tab is in the background, and fades in and out, so it never clicks or cuts off.
- Cues: a soft tick when the pointer is over an island or building, a tap on buttons, and a rising / falling chime when a panel opens or closes.
- Loudness was measured offline with the exact audio chain the site uses: the ambient bed is about -28 dBFS (background level, far below music),
  every cue peaks between -24 and -16 dBFS, and a limiter sits at the end so nothing can ever be loud. To change it, edit `BED_LEVEL` and the peak
  numbers in `playCue` in `src/lib/sound.ts`.
- To remove sound completely: delete `<SoundBridge />` in `Root.tsx`, the `SoundToggle` lines in `Overlay.tsx` and `LiteSite.tsx`, and the two "Sound" menu actions.

## Menu and smooth scrolling

- The **Menu** button (top right, in both the 3D city and the 2D page) opens a glass sheet with Home, About, Projects, Skills,
  Experience, Cloud Lab and Contact, plus Resume, GitHub, LinkedIn, email, sound and the 2D / 3D switch. The current place is marked.
  Esc closes it, Tab stays inside it, and focus goes back to the button. In the city it flies the camera; on the 2D page it scrolls.
- On screens narrower than 768 px the top bar shows only Resume and Menu, and everything else is in the menu, so nothing is ever cut off.
  In the 3D city the Skills button joins the top bar from 1024 px; below that it is only in the menu.
- Wheel scrolling is smoothed with Lenis: on the 2D page, and inside the glass panel in the city. Touch screens keep their
  own native scrolling (Lenis is not even started there), and visitors who ask their system for less motion get no smoothing at all.
  Keys that scroll by themselves (Home, End, Page Down, Space, arrows) and the scrollbar win even in the second after a wheel scroll,
  when the smooth glide is still running (`src/lib/useSmoothScroll.ts`).

## Smoothness and automatic quality

The 3D city measures its own frame rate once a second and walks a ladder of six quality steps (full effects at full resolution, down to
minimal effects at 55% resolution): down when the picture is not smooth, up again when there is plenty of room. The logic is in
`src/components/scene/quality.ts` (plain TypeScript, unit tested), wired in `SceneCanvas.tsx`.

Rules that keep it calm: the second after a change and any second with a resize or a tab switch is ignored; a step that was tried and did not hold
is not tried again; and if three steps down give no real gain (a 30 Hz screen, a slow processor), it goes back to where it started
and stops lowering quality for a long while, because quality was not the problem.

Other things that keep it smooth: the custom cursor and the labels only do work when something moved; pointer events are handled once per frame;
the hover test runs every third frame and only while exploring; the page loads three.js only when 3D is used; quality tiers also switch off the glass blur.

Phones and low-power devices get the 2D page automatically. Tablets and laptops get the 3D city.

### Phone scrolling

The 2D page was laggy on phones. Measured causes: about 21 blurred glass elements that the phone had to redraw on every frame of a scroll,
a film-grain layer the size of the screen, Lenis listening to touch events (which can hold up the browser's own scrolling),
and a scroll tracker that re-rendered the whole page whenever the current section changed. What was done:

- On touch screens the glass is a flat fill with the same shapes and colours, and the grain layer is off. This is the last block in `src/app/globals.css`.
- Lenis is not started on touch screens (`src/lib/useSmoothScroll.ts`). Links to a section glide with the browser's own smooth scrolling.
- The page content is memoised, so a change of the current section re-renders only the top bar (`src/components/lite/LiteSite.tsx`).
- The ticker has 4 copies of its text instead of 6, and the sky behind the 2D page uses the large viewport height, so it does not resize when the address bar hides.
- A phone always gets the 2D page, also held sideways and in "Desktop site" mode. The rule looks at the size of the screen as well as the window (`phone` in `src/lib/capability.ts`).

Measured on an emulated phone (headless Chromium, 412 x 915 px at 2x, CPU slowed 4 times, 30 touch swipes down the whole page):

| | Before | After |
| --- | --- | --- |
| Average frame time | 21.5 ms | 16.7 ms |
| Frames slower than 33 ms | 470 of 1,750 (27%) | 5 of 2,165 (0.2%) |
| Blurred elements | 21 | 0 |
| Browser work during the test | 8.5 s | 3.1 s |

16.7 ms is a perfect 60 fps frame. This is an emulated phone, not a real one: see "What was tested, and what was not".

## Phones, tablets and laptops

Checked at 360, 390, 412 and 640 px wide (phones), 700, 768 and 1024 px (tablets), and 1280, 1366, 1440 and 1920 px (laptops and desktops),
in landscape on a phone (844 x 390 and 667 x 375) and in a short laptop window (1280 x 600), for both the 2D page and the 3D city:
no sideways scrolling, nothing cut off or overlapping, no console errors.

- On touch screens every button and link is at least 44 px tall (Apple and Google both ask for it). A mouse keeps the compact sizes.
  The rule is at the end of `src/app/globals.css`.
- Form fields use 16 px text or larger, so iPhones do not zoom into the page when you tap one.
- The page does not use `viewport-fit=cover`, so the browser keeps everything out of the notch and the home bar by itself.
- The hero uses `svh` units and scales its headline down in landscape and on short screens.
- The slide-out menu scrolls inside itself if a screen is too short, and on a phone held sideways it switches to two columns
  (the pages on the left, the links on the right) so nothing is cut off.
- A phone gets the 2D page, also held sideways and in "Desktop site" mode. The 3D city is still one tap away (the "3D" switch in the menu) and remembered after that.
- The bottom ticker has a Pause button (it also pauses under the mouse, and stands still for people who asked for reduced motion).
- In the 3D hero on a narrow screen, an island label that would end up behind the title or behind the top bar or ticker steps aside until the
  visitor starts exploring (`LabelProjector.tsx`). On a wide laptop screen nothing moves.

## Accessibility

- Every page and panel was scanned with axe-core (WCAG 2.2 A and AA plus best practice): no violations on the 2D page (desktop and phone,
  top, whole page and menu open) and on the 3D overlays (hero, menu, Projects, a case study, Contact).
- Text contrast was **measured on the real picture**, not guessed: every piece of text is photographed over its real background
  (gradients, glass, the 3D scene) and compared with the 4.5 to 1 limit (3 to 1 for large text). About 1,600 pieces of text in the
  tested states pass. The two-colour palette is why this stays easy: light text on a very dark blue.
- Everything works with the keyboard (Tab, Enter, Esc, arrow keys in the city). The menu traps focus while it is open and gives it back to the
  Menu button when it closes, and Esc closes the menu and the panels. Hidden parts (a closed panel, the intro while a panel is open) are removed from the tab order.
- The 3D city has a plain HTML copy of everything for screen readers (`SemanticMirror.tsx`), and the 2D page is the same content with normal headings and landmarks.
- Moving text can be paused (ticker), and `prefers-reduced-motion` and `prefers-reduced-transparency` are respected.
- If you change colours in `src/lib/palette.ts`, run the check again (the two scripts are described in "What was tested"): light text on a mid-tone background can fail.

## Change the colours (two only)

The whole site uses two colours, cyan and blue, and nothing else except black and white.
They are set in one place: `src/lib/palette.ts` (`CYAN` and `BLUE`).
The page, the glass, the glows and the 3D scene (sky, clouds, rock, lights) are all made from those two, so changing
the two values re-colours everything at once. Every other shade in the site is a mix of the two.

## Look: liquid glass, sans-serif only

- Buttons, the top bar, labels, the ticker, the menu and the case study panel are glass: a soft blur of what is behind, a bright
  edge that goes from cyan (top left) to blue (bottom right), and a highlight that follows the pointer.
  It is plain CSS (`.glass`, `.glass-panel`, `.glass-accent` in `src/app/globals.css`), so it costs almost nothing.
- Visitors who ask their system for less transparency, and the lowest quality tier, get the same shapes with a solid fill.
- Fonts: Bricolage Grotesque (headings) and Instrument Sans (everything else). No mono and no serif anywhere.

## Share links

Every case study has its own address, and it updates as you open one:

| Link | Opens |
| --- | --- |
| `/#sovereign-ai-workbench` | Sovereign AI Workbench case study |
| `/#attendly` | Attendly case study |
| `/#blood-bank-finder` | Blood Bank Finder case study |
| `/#sentiment-analysis-app` | Sentiment Analysis Web App case study |
| `/#suzuki-kasami-simulator` | Suzuki-Kasami Simulator case study |
| `/#birthday-surprise`, `/#cloud-city-portfolio`, `/#tic-tac-toe` | The Projects panel (2D page: that project's card) |
| `/#research` | The research page |
| `/#about` | The About panel (the whole city in view) |
| `/#contact` | The Contact panel with the form |
| `/#projects`, `/#experience`, `/#building` | That island |

Any new project you add gets the same kind of link from its `id`.
In the 3D city the camera flies there after the intro. On the 2D page the same links scroll to that section.

## URL switches (for testing and demos)

| Add to the address | Does |
| --- | --- |
| `?mode=lite` | Force the fast 2D version |
| `?mode=3d` | Force the 3D city (also remembered by the 2D / 3D toggle) |
| `?perf=2` or `?perf=high` | Full effects. **Pins the quality: the automatic control is off** |
| `?perf=1` / `?perf=0` | Lighter effects (no grain and MSAA / no bloom and no glass blur either). Also pinned |
| `?debug` | Exposes `window.__city` in the console (camera rig, store, renderer, sound engine) |

Without a `?perf` switch the automatic quality control is on. Phones (also sideways and in "Desktop site" mode), browsers without WebGL2
and low-power devices get the 2D version automatically, so nobody is ever blocked from reading the resume.

## Deploy on Vercel

1. Push this folder to a GitHub repository (the `.gitignore` already skips `node_modules`, `.next` and `.env*.local`).
2. On vercel.com choose **Add New, Project**, import the repository. Framework preset is detected as Next.js. Click Deploy.
3. After the first deploy open Project Settings, Environment Variables and add `NEXT_PUBLIC_SITE_URL` = your site address
   (for example `https://sachinkumar.vercel.app`) and `RESEND_API_KEY` (see "Contact form"). Redeploy.

### Before you share the link (10 minutes)

1. Open your site in a **private window**. Open every "Live demo" / "Play it" button. If any page shows a Vercel sign-in
   instead of the project, open that project in Vercel, Settings, Deployment Protection, and turn off Vercel Authentication
   (or set it so production is public). A recruiter must never meet a sign-in wall.
   Attendly's live demo needs its own settings in its own Vercel project: the Neon database, `AUTH_SECRET`, `ADMIN_EMAILS`, and either
   `SMTP_USER` and `SMTP_PASS` (real email codes) or `SHOW_OTP=true` (demo mode, the code shows on screen), because sign-up asks for an email code.
   Open `/api/health` on it: it must show `{"ok":true}`. Then sign up once yourself, so you know a visitor can get in.
2. Send yourself a message through the Contact form and check it arrives (also look in spam).
3. Download the resume from the site and check it is the version you want.
4. Open the site on your own phone, once on mobile data. Tap Menu, tap a project, tap the sound button, send a message.
5. Paste your address into the LinkedIn Post Inspector and check the preview (see "Search and link previews").
6. Tap your LinkedIn and GitHub buttons on the site and check they open your profiles (`sachinkrcodes`). The old `codeswithsachin` LinkedIn
   address stops working after a rename, so also change it everywhere else you posted it: job portals, email signature, the resume you uploaded elsewhere
   (use the new PDF from this folder, `public/Sachin_Kumar_Resume.pdf`).

## What was tested, and what was not

Tested automatically (Chromium, including emulated phones and tablets, with software rendering because the test machine has no graphics card):
type-check, production build, the content safety net, the 3D and 2D click-through flows (menu, panels, case studies, deep links, keyboard, contact form),
the share images and every search file over HTTP, the sound engine (switch, memory, background tab, loudness measured offline), the quality control
(unit tests and inside the real page), the layout checks at the sizes listed above, an axe-core accessibility scan, a measured text-contrast scan,
and a check that every GitHub and LinkedIn link on every surface (page, menu, search data, resume PDF) uses your current name.

After the Skills, Cloud Lab and phone scrolling update, the 2D page was checked again at 1440, 390 and 320 px (no sideways scroll, no broken images, no console errors),
the 3D city at 1440, 1024, 768, 360 and 320 px, and phones sideways and in "Desktop site" mode (both get the 2D page).
The phone scroll numbers above come from an emulated phone with the CPU slowed 4 times, with raw touch swipes and frame times read from `requestAnimationFrame`.

**Not tested** (nobody had these here): real iPhones and Android phones, Safari and Firefox, the real frame rate on a graphics card,
screen reader software (NVDA, VoiceOver), and your live Vercel links. Do the "Before you share the link" list on your own devices.

## How it is built

```
src/
  app/
    layout.tsx, page.tsx, globals.css   page shell and metadata, styles (glass, tokens, menu, form fields, touch sizes)
    opengraph-image.tsx, twitter-image.tsx, manifest.ts, robots.ts, sitemap.ts
    icon.png, apple-icon.png, favicon.ico   the logo as tab icon and phone icon
    not-found.tsx, error.tsx, global-error.tsx
    _og/                                fonts and shapes for the share picture
    api/contact/route.ts                the contact form's server side
  data/
    content.ts                          ALL content
    validate.ts                         build-time checks for content.ts
  store/useStore.ts       small global state: mode (loading, hero, explore, focus), hover, focus, quality tier and resolution
  lib/
    site.ts               the public address of the site
    palette.ts            the two colours, and every shade made from them
    capability.ts         3D or 2D decision (phones always get 2D), starting quality
    lite-mode.ts          the switch from the 2D page to the 3D city (goTo3D)
    actions.ts            go home, open About / Contact / an island, switch 2D / 3D
    contact.ts            form rules, used by the browser and by the server
    sound.ts              the sound engine (Web Audio): ambient bed, cues, limiter
    useSmoothScroll.ts    Lenis for the 2D page and for the glass panel (not started on touch screens)
  components/
    Root.tsx              picks 3D or 2D, mounts the layers
    Experience3D.tsx      the whole 3D layer (scene, labels, top bar, panel, cursor), loaded only when 3D is used
    DeepLink.tsx          keeps the address bar and the camera in step (share links)
    SemanticMirror.tsx    plain HTML copy of the content for screen readers and search engines, plus the search data
    SoundBridge.tsx       connects sound cues to hover, panels and buttons
    scene/                everything 3D
      shaders.ts          all GLSL (sky, clouds, platforms, data lines, hologram, particles)
      materials.ts        shared uniforms, canvas textures, materials
      geometry.ts         rock, drop, wedge helpers
      constants.ts        island positions, project building slots
      islands/            one file per island (+ ProjectBuildings.tsx for the generic project buildings)
      DataLines.tsx       arcs and packets between islands
      CameraRig.tsx       camera pose, damping, hero drift, view shift
      rig.ts              the camera "goal" and "current" pose plus scripted moves (GSAP)
      Interaction.tsx     pointer, wheel, pinch, keyboard, hover raycast
      picking.ts          which island or building is under the pointer
      Effects.tsx         bloom, tone mapping, vignette, custom film grain
      quality.ts          the automatic quality control (pure logic, unit tested)
      SceneCanvas.tsx     the canvas, the ready signal, the quality control wiring
    ui/
      CaseStudy.tsx       the case study layout, shared by the 3D panel and the 2D page
      Shots.tsx           the screenshots of a project (large picture, caption, small pictures to switch)
      Building.tsx        the Cloud Lab panel: where my apps run, cloud and DevOps work, learning now, SigmaX (and projects in progress, when there are any)
      Skills.tsx          the two skill tracks, shared by the 3D panel and the 2D page
      MiniProjects.tsx    cards for the minor projects
      Profile.tsx         About, work history timeline, education, certifications
      Contact.tsx         the contact block (intro, form, other routes)
      ContactForm.tsx     the form itself (validation, sending, fallbacks)
      SlideMenu.tsx       the slide-out menu
      FocusPanel.tsx      the glass panel (case studies, About, Contact, Experience, prev / next, keyboard)
      SoundToggle.tsx     the speaker button
      Overlay.tsx, Labels.tsx, Ticker.tsx, Cursor.tsx, Loader.tsx
    lite/LiteSite.tsx     the 2D version
```

Performance choices: instanced meshes for repeated shapes, one draw call per material group, canvas generated
textures (no image downloads), fog and sky computed in shaders, DOM labels positioned from the render loop without React
re-renders, quality tiers with automatic quality control, and the whole 3D bundle loads only when 3D is used.

## Notes

- Rendering uses WebGL2 with hand-written GLSL. WebGPU was left out on purpose: Three's WebGPU renderer cannot run raw GLSL,
  so it would mean rewriting every shader in TSL for no visible gain at this scene size. It can be revisited later.
- The glass is CSS blur and highlights, not real refraction. Refraction needs an SVG displacement filter that only
  Chromium supports and that is expensive on every frame, so it was left out on purpose.
- Fonts are served from the package (no external requests). They are easy to swap in `src/app/layout.tsx` and `globals.css`.
- Respects `prefers-reduced-motion` (no drift, no parallax, no marquee, no staggered reveal, no smooth scrolling, instant loader)
  and `prefers-reduced-transparency` (solid glass).
- Case study numbers (endpoints, routes, entities, lines of code and so on) were counted from the repositories.
  If you change the code, update the `stats` in `content.ts`.
- The browser console may show two notices from the 3D library ("THREE.Clock is deprecated" and, on machines without a graphics card,
  "KHR_parallel_shader_compile not supported"). They come from the libraries, not from this code, and are harmless.
- The contact route keeps its rate limit in the server's memory. On serverless hosting that is per instance, which is fine
  for a portfolio. If you ever need it stricter, put the counter in a shared store (Upstash, or Vercel's firewall rules).
- If `npm run dev` shows a "hydration" warning in the browser, it is almost always an extension (ad blocker, dark mode,
  translator) adding tags to the page before it loads. The page sets its colours on the `<html>` element, so extensions
  can no longer break it. Try a private window to confirm. A production build never shows that overlay.
- The resume PDF in `public/` is version v10 (Nov 17 2026). It says "Software Engineer and Cloud Engineer (Entry-Level)", the same as the site.
