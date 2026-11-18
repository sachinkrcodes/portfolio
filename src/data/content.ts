/**
 * ALL SITE CONTENT LIVES HERE.
 * Edit this one file and every part of the site (3D scene labels, panels, the 2D page, SEO text) updates.
 * Sources: Sachin's resume (v10) and the READMEs, code and tests of his GitHub repos. The numbers are the ones printed
 * in those READMEs or counted from the code. Nothing here is invented.
 *
 * QUICK RECIPES (more in docs/GUIDE.md, "Change the words"):
 *   new major project            -> add an object to `projects` (it works everywhere, no other file needs a change)
 *   new minor project            -> add an object to `miniProjects`
 *   project is still being built -> set `status: "building"`, `when: "Started Nov 2026"`, and fill `progress` and `next`.
 *                                   It then shows under "In progress" in the Cloud Lab by itself.
 *   project is finished          -> change `status` to "done", change `when` to "Built ...", delete `progress` and `next`
 *   project runs online          -> add `liveUrl` and `runsOn` (one line, for example "Vercel and Neon").
 *                                   It then shows under "Where my apps run" in the Cloud Lab.
 *   a skill                      -> add a row to `skillTracks` ("used" or "learning", and the project that proves it)
 *   screenshots                  -> put the pictures in public/projects/<project id>/ and list them in `shots`
 *   a SigmaX project is built    -> delete its name from `sigmax.programProjects`, add it to `miniProjects` or `projects`
 *   new job or new title         -> `jobs` (newest first) and `profile.role`
 *   new certificate              -> `certifications`
 *   new resume PDF               -> replace public/Sachin_Kumar_Resume.pdf (same file name)
 * Counts on the site (projects on GitHub, project counts) are calculated from these lists, so they update by themselves.
 *
 * AFTER SIGMAX: add the major projects to `projects`, rewrite `about`, set `sigmax.status` to "Completed" and
 * `sigmax.programProjects` to [], then update `learning`, `skillTracks` and the resume PDF. About 15 minutes.
 * The build checks this file for mistakes, so a slip stops the build with a plain message instead of going live.
 */

export type IslandId = "projects" | "research" | "experience" | "building";

export const profile = {
  name: "Sachin Kumar",
  role: "Software Engineer and Cloud Engineer",
  level: "Entry-Level",
  // The hero shows all of these. The share picture shows the first four.
  stack: ["Java", "Python", "React", "Node.js", "PostgreSQL", "Docker"],
  headline: "I build full stack apps and deploy them to the cloud.",
  summary:
    "MCA (Cloud Computing) student. I build full stack and AI apps with Java, Python, React, Node.js and PostgreSQL, test them, and deploy them with Docker, GitHub Actions and Vercel. 2+ years in ERP (SAP HANA, Focus 9) and IT support.",
  email: "sachinkrcodes@gmail.com",
  linkedin: "https://www.linkedin.com/in/sachinkrcodes",
  github: "https://github.com/sachinkrcodes",
  location: { city: "Vadodara", region: "Gujarat", country: "India", timeZone: "Asia/Kolkata" },
  resumeUrl: "/Sachin_Kumar_Resume.pdf",
  openTo: "Open to entry-level roles",
} as const;

/** Text for the bottom ticker. Keep these true; they are shown to recruiters. */
export const milestones = [
  "Sovereign AI Workbench: Python, FastAPI, React, local AI model, 144 tests",
  "Attendly: Node.js and PostgreSQL, 76 API endpoints, 73 end-to-end checks",
  "Blood Bank Finder: React, Supabase and a live map",
  "Suzuki-Kasami Simulator: Java and web, 2 algorithms compared",
  "SigmaX in progress: DSA in Java, MERN, AI integration, DevOps",
  "Learning AWS and Kubernetes",
  "MCA Cloud Computing at Parul University",
  profile.openTo,
];

/** One block of the case study panel. Written only from what is in the repos and on the resume. */
export interface CaseStudy {
  /** one line: what sort of project this is */
  kind: string;
  /** big numbers at the top (keep to 4) */
  stats: { value: string; label: string }[];
  /** the problem, in plain words */
  problem: string;
  /** what was built */
  built: string[];
  /** tech, grouped */
  tech: { group: string; items: string[] }[];
  /** proof points: tests, checks, how it ships, honest limits */
  highlights: string[];
}

export interface LinkItem {
  label: string;
  href: string;
}

/** What every project, big or small, can link to. */
export interface Linkable {
  repo: string;
  /** A public URL here adds a "Live demo" button (shown first). Only add one that you have opened in a private window. */
  liveUrl?: string;
  /** Text of that button when "Live demo" is not accurate (for example "Live demo (sample data)"). */
  liveLabel?: string;
  /** One short line shown above the links when there is no live demo (for example "Not deployed. It runs on my laptop."). */
  liveNote?: string;
  /** Any extra links (for example the backend folder). */
  links?: LinkItem[];
  /** One short line: where it runs online (for example "Vercel and Neon"). It shows under "Where my apps run" in the Cloud Lab. */
  runsOn?: string;
}

/** Where a project stands. Projects with status "building" also appear under "In progress" in the Cloud Lab. */
export interface Progress {
  /** "done" (default, shows a "Completed" chip) or "building" (shows an "In progress" chip and a place in the Cloud Lab) */
  status?: "done" | "building";
  /** "Started Nov 2026" for a project in progress, "Built Sep 2026" for a finished one */
  when?: string;
  /** one line, for projects in progress: what already works */
  progress?: string;
  /** one line, for projects in progress: what is left */
  next?: string;
}

/** One screenshot. `src` is a file under public/ (the build stops if it is missing). The caption says what the picture shows. */
export interface Shot {
  src: string;
  caption: string;
}

export interface Project extends CaseStudy, Linkable, Progress {
  id: string;
  name: string;
  /** short list for chips and search text */
  stack: string[];
  summary: string;
  /** 3 screenshots of the project running (public/projects/<id>/...) */
  shots?: Shot[];
  /**
   * The look of this project's building on the 3D Projects island. Optional: new projects get one of the three
   * styles in turn. Blood Bank Finder, Sentiment Analysis and Suzuki-Kasami keep their own buildings.
   *   "pipeline" = a build, test and ship line   "dish" = a satellite dish with radar pulses   "tiers" = a stack of layers with an orb
   */
  building?: "pipeline" | "dish" | "tiers";
}

/**
 * Major projects, best first. This order is used by the 3D island, the previous and next buttons and the 2D page.
 * The 3D island has room for 6 buildings.
 */
export const projects: Project[] = [
  {
    id: "sovereign-ai-workbench",
    name: "Sovereign AI Workbench",
    kind: "AI document Q&A that runs on your own computer",
    status: "done",
    when: "Built Nov 2026",
    stack: ["Python", "FastAPI", "React", "Ollama", "RAG"],
    summary:
      "Upload PDF, Word or text files, ask a question, and get an answer with the file name and page numbers. The language model runs on the laptop through Ollama, so no document text goes to an online AI service.",
    stats: [
      { value: "144", label: "automated tests" },
      { value: "30", label: "API endpoints" },
      { value: "20 of 20", label: "test questions: right file and page first" },
      { value: "3", label: "agents with their own tools" },
    ],
    problem:
      "Some teams cannot send confidential files to an online AI service, but they still need answers from those files. This app answers from files that stay on the computer, shows the exact source page, and keeps a log of who did what.",
    built: [
      "A FastAPI backend with 30 API endpoints and a React 18 and Vite web app. Files are uploaded, split into passages and indexed.",
      "Hybrid search: BM25 keyword ranking and vector similarity joined with reciprocal rank fusion. Keyword search still works when Ollama is off.",
      "Llama 3.2 3B and the nomic-embed-text model run on the laptop through Ollama. Every answer shows file names and page numbers. Citations that point to passages the app did not retrieve are removed, and a caution note shows when the model cites no source.",
      "3 agents, each with its own tool list and step limit: Librarian (lists the documents), Researcher (searches and answers with citations) and Analyst (reads whole documents, compares them and does calculations).",
      "3 roles (viewer, analyst, admin), a first-run screen that creates the admin account, and an audit log where each row holds the hash of the previous row. A verify endpoint reports the first edited or deleted row.",
      "A Load sample documents button that uploads and indexes 3 fictional PDFs, so the app can be tried in a minute.",
    ],
    tech: [
      { group: "Backend", items: ["Python", "FastAPI", "SQLAlchemy", "SQLite (Postgres also works)", "NumPy"] },
      { group: "AI", items: ["Ollama", "Llama 3.2 3B", "nomic-embed-text", "RAG", "BM25", "Vector search", "Reciprocal rank fusion"] },
      { group: "Front end", items: ["React 18", "Vite"] },
      { group: "Testing and delivery", items: ["pytest", "GitHub Actions", "Docker", "Docker Compose"] },
    ],
    highlights: [
      "144 pytest tests, all passing in 11.97 s (Windows 11, Python 3.13). GitHub Actions runs them, the web build and the Docker image builds on every push.",
      "Retrieval check on 20 sample questions about 2 fictional documents (5 passages): the right file and page ranked first for 20 of 20.",
      "Answer check with Llama 3.2 3B on the same questions: 20 of 20 correct with at least one citation, and 2 of 2 out-of-scope questions refused. Median 8.9 s per answer (slowest 10.9 s) on one laptop.",
      "Limits are listed in the README: scanned PDFs are rejected (no OCR), it is not deployed, the 20-question check is small, and the Researcher agent returned a raw tool call once during testing.",
    ],
    repo: "https://github.com/sachinkrcodes/sovereign-ai-workbench",
    liveNote: "Not deployed. It runs on my laptop; the README has the run steps.",
    building: "tiers",
    shots: [
      { src: "/projects/sovereign-ai-workbench/ask-page.jpg", caption: "Ask page with example questions for the sample documents." },
      { src: "/projects/sovereign-ai-workbench/admin-audit-log.jpg", caption: "Admin page with usage numbers and the audit log check." },
      { src: "/projects/sovereign-ai-workbench/agents.jpg", caption: "Agents page after a Researcher run where the model returned a raw tool call instead of an answer." },
    ],
  },
  {
    id: "attendly",
    name: "Attendly",
    kind: "College attendance app: Node.js, PostgreSQL, installable web app",
    status: "done",
    when: "Built Oct to Nov 2026",
    stack: ["Node.js", "PostgreSQL", "JavaScript", "REST API", "PWA", "Vercel"],
    summary:
      "Attendance for colleges in one installable web app: teachers take attendance, students check in with a live 6-digit code, and admins manage colleges. A Node.js API on Vercel and PostgreSQL on Neon.",
    stats: [
      { value: "76", label: "API endpoints" },
      { value: "19", label: "database tables" },
      { value: "73", label: "end-to-end API checks" },
      { value: "4", label: "roles" },
    ],
    problem:
      "Teachers need a fast way to take attendance, students need to see where they stand, and a college needs approved teachers and old records that nobody can quietly change. Attendly does this from one app that installs on a phone.",
    built: [
      "Teacher and student portals: classes with a join code, attendance marked Present, Late, Absent or Leave, and a planner that tells a student how many classes they can still miss.",
      "A live check-in code: the teacher shows a 6-digit code, students type it on their phone, and it expires after 5 to 30 minutes.",
      "Leave requests, gate pass, class notices, timetable, exams with marks and a help desk, all on one home screen.",
      "4 roles: student, teacher, HOD and platform admin. Teachers need approval, students join only their own college, and old attendance is locked until the HOD allows edits.",
      "A Node.js API of 76 endpoints on Vercel serverless functions, with 19 tables on PostgreSQL (Neon). The browser app is plain HTML, CSS and JavaScript and installs on a phone as a PWA.",
    ],
    tech: [
      { group: "Backend", items: ["Node.js", "REST API", "Vercel serverless functions"] },
      { group: "Data", items: ["PostgreSQL", "Neon"] },
      { group: "Security", items: ["E-mail OTP", "scrypt password hashing", "Account lock", "Signed sessions", "Security headers"] },
      { group: "Front end", items: ["HTML", "CSS", "JavaScript", "PWA"] },
    ],
    highlights: [
      "73 end-to-end API checks pass.",
      "620 screens checked at widths from 320 to 1280 px.",
      "Accounts are secured with e-mail OTP, scrypt password hashing, an account lock after 5 wrong passwords, signed sessions and strict security headers.",
      "Limits are listed in the README: no SMS OTP (SMS needs a paid provider), no fees or transport pass, no load test, and the front end is one big JavaScript file of about 1,300 lines.",
    ],
    repo: "https://github.com/sachinkrcodes/Attendance-system",
    liveUrl: "https://attendly-attende.vercel.app",
    runsOn: "Vercel (site and API) and Neon (PostgreSQL)",
    building: "dish",
    shots: [
      { src: "/projects/attendly/student-home.jpg", caption: "Student home with attendance ring and join box." },
      { src: "/projects/attendly/check-in.jpg", caption: "Check-in screen where a student types the 6-digit code." },
      { src: "/projects/attendly/teacher-home.jpg", caption: "Teacher home with attendance ring and trend." },
    ],
  },
  {
    // Keeps the id "blood-bank-finder" (old share links and the 3D building follow it). The repo is the live version.
    id: "blood-bank-finder",
    name: "Blood Bank Finder",
    kind: "Live map web app: React, TypeScript, Supabase",
    status: "done",
    when: "Built Nov 2026",
    stack: ["React", "TypeScript", "Vite", "Supabase", "PostgreSQL", "Leaflet", "Vercel"],
    summary:
      "Find blood banks and hospitals on a live map, check blood stock, and post urgent blood requests that matching donors can answer. React and TypeScript on Supabase (PostgreSQL), live on Vercel. The first version was Spring Boot, MySQL and Docker.",
    stats: [
      { value: "11", label: "tables locked with Row Level Security" },
      { value: "15 min", label: "map data cache per area" },
      { value: "90 days", label: "donor wait before helping again" },
      { value: "2", label: "Vercel serverless functions" },
    ],
    problem:
      "When someone needs blood urgently, calling around is slow. A person should see nearby blood banks and hospitals on a map, see which blood groups are in stock, and send a request that reaches matching donors, without their phone number going to everyone.",
    built: [
      "A live map of hospitals and blood banks from OpenStreetMap, loaded through a Vercel function that caches each area for 15 minutes.",
      "Partner accounts: a blood bank registers, an admin verifies it, then it publishes stock per blood group with the time of the last update.",
      "Data locked with Row Level Security on 11 tables. The requester's phone is shown only to a logged-in, compatible donor who waited 90 days since the last donation and agrees to help.",
      "A shortage forecast (units in stock divided by average units requested per day over 30 days) and an assistant that uses Anthropic or Gemini, or a built-in rule engine when no key is set.",
    ],
    tech: [
      { group: "Front end", items: ["React 18", "TypeScript", "Vite", "Leaflet", "OpenStreetMap"] },
      { group: "Backend and data", items: ["Supabase", "PostgreSQL", "Supabase Auth", "Row Level Security", "SQL functions"] },
      { group: "Serverless", items: ["Vercel serverless functions", "Anthropic and Gemini assistant (optional)"] },
      { group: "First version", items: ["Java 21", "Spring Boot", "MySQL", "Docker"] },
    ],
    highlights: [
      "Vercel cannot run the first Spring Boot version, so its logic moved into database functions on Supabase.",
      "No secret key reaches the browser: the hospital data and the assistant go through Vercel functions.",
      "Limits are listed in the README: no real blood bank has joined yet, stock is updated by hand and the page refreshes every 30 seconds, and there is no legal or security review yet.",
    ],
    repo: "https://github.com/sachinkrcodes/blood-bank-finder-live",
    liveUrl: "https://blood-bank-live.vercel.app",
    runsOn: "Vercel (site and 2 functions) and Supabase (PostgreSQL, Auth)",
    shots: [
      { src: "/projects/blood-bank-finder/live-map.jpg", caption: "Live map with a partner blood bank selected." },
      { src: "/projects/blood-bank-finder/find-results.jpg", caption: "Find blood result with stock per group." },
      { src: "/projects/blood-bank-finder/request-form.jpg", caption: "Post a blood request form." },
    ],
  },
  {
    id: "suzuki-kasami-simulator",
    name: "Suzuki-Kasami Simulator",
    kind: "Distributed computing simulator: Java Swing and web",
    status: "done",
    when: "Built Sep to Nov 2026",
    stack: ["Java", "Swing", "JavaScript", "Suzuki-Kasami", "Ricart-Agrawala"],
    summary:
      "Simulator of distributed mutual exclusion in two versions: a Java Swing desktop app (Suzuki-Kasami) and a web version that runs Suzuki-Kasami and Ricart-Agrawala, with fault injection and a Compare page.",
    stats: [
      { value: "2 to 10", label: "processes" },
      { value: "2", label: "algorithms compared" },
      { value: "640", label: "random test runs (400 Java, 240 JavaScript)" },
      { value: "9.78 vs 18", label: "messages per entry at N = 10" },
    ],
    problem:
      "In a distributed system there is no shared memory and no global clock, yet several processes must never use a shared resource at the same time. Suzuki-Kasami solves this with a single token: only the process holding it may enter the critical section. I built simulators where you can step through the algorithm, break it on purpose and watch what happens.",
    built: [
      "A Java Swing desktop app that animates processes, messages and the token on one virtual clock. The algorithm sits in one Simulation class and the windows only draw it.",
      "A plain JavaScript web version that runs in any browser, phone included, with both algorithms for 2 to 10 processes: play, pause, step, step back, and panels for the token, request numbers, queue, timeline and a safety monitor.",
      "Fault injection: lose any message (by click, at random, or the next one) and crash or restart a process. The page shows a lost token or a blocked process.",
      "A Compare page: both algorithms, same settings, 30 seeds for each N from 2 to 10. At N = 10 under light load Ricart-Agrawala sends 18 messages per entry and Suzuki-Kasami 9.78.",
    ],
    tech: [
      { group: "Languages", items: ["Java 17", "Swing (custom painting)", "JavaScript", "HTML", "CSS", "Canvas"] },
      { group: "Simulation", items: ["Discrete-event engine", "One virtual clock", "Seeded random generator", "Fault injection"] },
      { group: "Algorithms", items: ["Suzuki-Kasami", "Ricart-Agrawala"] },
      { group: "Delivery", items: ["GitHub Actions CI", "Vercel"] },
    ],
    highlights: [
      "Self tests: 400 random runs in Java (about 1.2 million events) and 240 in JavaScript (168,000 events). The Java test checks after every event that exactly one token exists and at most one process is in the critical section.",
      "A seeded random generator means any run can be repeated exactly.",
      "No external libraries in the Java app: the windows and charts are drawn by hand.",
      "Limits are listed in the README: it is a simulation on one computer with a virtual clock, and it has no recovery (no timeouts, no token regeneration), so it shows the failure and stops there.",
    ],
    repo: "https://github.com/sachinkrcodes/suzuki-kasami-simulator",
    liveUrl: "https://suzuki-kasami-simulator.vercel.app",
    runsOn: "Vercel (web version)",
    shots: [
      { src: "/projects/suzuki-kasami-simulator/simulate.jpg", caption: "Suzuki-Kasami with six processes, the token travelling." },
      { src: "/projects/suzuki-kasami-simulator/token-lost.jpg", caption: "Token lost after its holder crashed." },
      { src: "/projects/suzuki-kasami-simulator/compare.jpg", caption: "Compare page with two line charts." },
    ],
  },
  {
    id: "sentiment-analysis-app",
    name: "Sentiment Analysis Web App",
    kind: "Plain Java web app: Lexicon and Naive Bayes",
    status: "done",
    when: "Built Sep 2026",
    stack: ["Java", "Naive Bayes", "REST API", "JavaScript"],
    summary:
      "Scores any text as positive, neutral or negative with two engines you can switch between, a word-score lexicon and a Naive Bayes model trained inside the app, and shows the results on a live dashboard. Plain Java 17, no libraries.",
    stats: [
      { value: "6", label: "pages" },
      { value: "439", label: "labelled training examples" },
      { value: "5-fold", label: "cross-validation in Model Lab" },
      { value: "35", label: "self-tests" },
    ],
    problem:
      "Reading hundreds of comments or reviews one by one to find out whether people are happy or upset does not scale. This app scores text as positive, neutral or negative, and lets you compare two different methods on the same data to see which one is more accurate.",
    built: [
      "Two analyzers you can switch between while the app runs: Lexicon (word scores, negation, boosters, CAPS, \"!\" and \"but\") and Naive Bayes trained from a labelled CSV.",
      "6 pages: Analyze (highlighted words and a live feed simulator), Batch or CSV, Dashboard, History, Lexicon editor and Model Lab.",
      "Model Lab: upload a text,label CSV to retrain, then compare both engines with accuracy, precision, recall, F1 and a confusion matrix. It removes repeated rows, keeps every class in the test split and shows a majority-class baseline and 5-fold cross-validation.",
      "An editable lexicon (change a word score and the next analysis uses it), a light and dark interface, and a read-only mode (READ_ONLY=true) for public demos.",
      "All in plain Java with no libraries: own HTTP server, own JSON and CSV code, charts drawn on canvas. History and edits are saved as CSV files.",
    ],
    tech: [
      { group: "Backend", items: ["Java 17", "Built-in HTTP server", "REST and JSON"] },
      { group: "Analysis", items: ["Lexicon rules", "Naive Bayes", "Laplace smoothing", "5-fold cross-validation"] },
      { group: "Data", items: ["CSV files for lexicon, training set, feed and history"] },
      { group: "Front end", items: ["HTML", "CSS", "JavaScript", "Canvas charts"] },
      { group: "Delivery", items: ["Dockerfile", "GitHub Actions CI"] },
    ],
    highlights: [
      "35 built-in self-tests.",
      "Everything is saved as CSV files, so history and lexicon edits survive a restart.",
      "A Dockerfile and a GitHub Actions workflow are in the repo.",
      "Limit, stated in the README: Naive Bayes scores 100% on its own test split because the bundled training set reuses a small set of sentence patterns. That number does not predict accuracy on real posts.",
    ],
    repo: "https://github.com/sachinkrcodes/sentiment-analysis-app",
    shots: [
      { src: "/projects/sentiment-analysis-app/analyze.jpg", caption: "Analyze page with a negated text." },
      { src: "/projects/sentiment-analysis-app/dashboard.jpg", caption: "Dashboard with trend chart and top words." },
      { src: "/projects/sentiment-analysis-app/model-lab.jpg", caption: "Model Lab with the training dataset." },
    ],
  },
];

/** The links shown for a project (case study or mini project). The live demo comes first, because it is what people click. */
export function projectLinks(p: Linkable): LinkItem[] {
  const links: LinkItem[] = [];
  if (p.liveUrl) links.push({ label: p.liveLabel ?? "Live demo", href: p.liveUrl });
  links.push({ label: "Source on GitHub", href: p.repo });
  if (p.links) links.push(...p.links);
  links.push({ label: "README and run steps", href: `${p.repo}#readme` });
  return links;
}

/**
 * Minor projects: a card each (what it is, 3 or 4 facts from the README, links), without a full case study.
 * They show under the major projects in the Projects panel and on the 2D page. To grow one into a major project,
 * move it to `projects` and fill in problem, built, tech and highlights.
 * Work that does not exist yet (the SigmaX projects) is NOT listed here: it stays in `sigmax.programProjects` until there is code to show.
 */
export interface MiniProject extends Linkable, Progress {
  id: string;
  name: string;
  /** one line: what sort of project this is */
  kind: string;
  summary: string;
  /** 1 to 5 short facts */
  points: string[];
  /** short list for chips */
  stack: string[];
}

export const miniProjects: MiniProject[] = [
  {
    id: "birthday-surprise",
    name: "Birthday Surprise",
    kind: "Website that makes a private birthday page for each person",
    status: "done",
    when: "Built Nov 2026",
    summary:
      "A website that makes a private birthday page for each person: 14 animated chapters, photos, music and wishes, with an admin panel to create and edit every page. React and TypeScript on Supabase, live on Vercel.",
    points: [
      "14 animated chapters (opening, letters, gallery, games, cake, wishes, poems and more) and 15 look packs that change colours and floating decorations.",
      "Admin panel: one page per person, photo and music upload, a library of ready English lines, and a share panel with a QR code.",
      "Each page sits behind a hard-to-guess link with an optional PIN, an opening date and an expiry date.",
      "Admin secured with Supabase login, an authenticator-app two-step code, forgot password and Row Level Security.",
    ],
    stack: ["React", "TypeScript", "Vite", "Framer Motion", "Supabase", "Vercel"],
    repo: "https://github.com/sachinkrcodes/birthday-surprise",
    liveUrl: "https://happiiee-bday.vercel.app",
    runsOn: "Vercel (site) and Supabase (PostgreSQL, Auth, Storage)",
  },
  {
    id: "cloud-city-portfolio",
    name: "The Cloud City portfolio",
    kind: "This website: a 3D portfolio",
    status: "done",
    when: "Built Nov 2026",
    summary:
      "The site you are looking at. A 3D city of floating islands, one island for each section, with a fast 2D version for phones and slow computers. All its text comes from one file.",
    points: [
      "Next.js, React, TypeScript and Three.js (React Three Fiber), with a plain 2D version for phones, low-power devices and browsers without WebGL.",
      "Every word on the site is in one file (src/data/content.ts). The build stops with a plain message if something in it is wrong, so a broken change never goes live.",
      "A contact form that sends e-mail through Resend, and a link-preview picture made at build time from the same file.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Three.js", "Tailwind CSS", "Vercel"],
    repo: "https://github.com/sachinkrcodes/portfolio",
    runsOn: "Vercel",
  },
  {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe with a Minimax AI",
    kind: "The same game as a web page and as a Java Swing app",
    status: "done",
    summary:
      "The same game twice: as a web page and as a Java Swing desktop app. The AI tries every possible game with Minimax and Alpha-Beta pruning, so on the hardest level the best you can do is a draw.",
    points: [
      "The web version has 3 levels: Easy (random moves), Medium (random half of the time) and Unbeatable. The Java version has only Unbeatable.",
      "Play against the computer or a friend, with a score board saved in the browser, a preview of your move on hover and a green line on the winning cells.",
      "Works on phones and desktop.",
      "SharedCounter.java is a small thread-safety demo: two threads update one counter through a synchronized method.",
    ],
    stack: ["Java Swing", "HTML", "CSS", "JavaScript", "Minimax", "Alpha-Beta pruning"],
    repo: "https://github.com/sachinkrcodes/Tic-tac-toe",
  },
];

/** Every project, big or small, that is still being built. It feeds "In progress" in the Cloud Lab (island 04). Empty when everything is finished. */
export interface InProgressItem extends Progress, Linkable {
  id: string;
  name: string;
  kind: "project" | "mini";
  stack: string[];
}
export const inProgress: InProgressItem[] = [
  ...projects.map((p) => ({ ...p, kind: "project" as const })),
  ...miniProjects.map((m) => ({ ...m, kind: "mini" as const })),
].filter((p) => p.status === "building");

/** Every project that runs online (it has `runsOn`). It feeds "Where my apps run" in the Cloud Lab. */
export interface Deployment {
  id: string;
  name: string;
  runsOn: string;
  liveUrl?: string;
}
export const deployments: Deployment[] = [...projects, ...miniProjects]
  .filter((p) => !!p.runsOn)
  .map((p) => ({ id: p.id, name: p.name, runsOn: p.runsOn as string, liveUrl: p.liveUrl }));

/** "A, B and C" */
export function joinList(list: string[]): string {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/**
 * The About page: facts a recruiter can scan in a minute. Every line is on the resume or in a README.
 * It is defined after the project lists because the "projects on GitHub" tile is counted from them.
 */
export const about = {
  kicker: "About",
  title: "Software Engineer and Cloud Engineer, at a glance.",
  intro:
    "Entry-level. MCA (Cloud Computing) student with 2+ years in ERP and IT support. I build full stack and AI projects, test them, deploy them on Vercel, Neon and Supabase, and put the numbers and the limits in the README.",
  groups: [
    {
      title: "What I build",
      items: [
        "Full stack web apps: React front ends with Node.js, FastAPI or Spring Boot back ends on PostgreSQL, MySQL or SQLite.",
        "AI apps: document question answering with RAG and hybrid search (BM25 and vectors) on a local model (Llama 3.2 through Ollama), and text sentiment analysis with Naive Bayes.",
        "REST APIs with login, roles and security: Spring Security, scrypt hashing, e-mail OTP, account lock, Row Level Security.",
        "Distributed computing: simulators of Suzuki-Kasami and Ricart-Agrawala with fault injection.",
      ],
    },
    {
      title: "Numbers from my projects",
      items: [
        "144 pytest tests in Sovereign AI Workbench, 73 end-to-end API checks in Attendly, 35 self-tests in the Sentiment app, 640 random test runs in the Suzuki-Kasami simulator.",
        "Sovereign AI Workbench: the right file and page ranked first for 20 of 20 test questions, 20 of 20 answers correct with a citation, 2 of 2 out-of-scope questions refused, 8.9 s median per answer.",
        "Attendly: 76 API endpoints, 19 tables, 4 roles, 620 screens checked from 320 to 1280 px.",
        "Blood Bank Finder: Row Level Security on 11 tables, map data cached for 15 minutes per area.",
        "Suzuki-Kasami at N = 10: 9.78 messages per entry against 18 for Ricart-Agrawala.",
      ],
    },
    {
      title: "Cloud and DevOps",
      items: [
        "Docker and Docker Compose, Git and GitHub, GitHub Actions (tests, web build and Docker image builds on every push), Maven.",
        "Deployed on Vercel (serverless functions), Neon (PostgreSQL) and Supabase.",
        "MCA in Cloud Computing at Parul University.",
      ],
    },
    {
      title: "Background",
      items: [
        "2+ years in ERP and IT support at 2 manufacturing companies in Vapi: SAP HANA at Sarla Performance Fibers (Jun 2025 to Jun 2026) and Focus 9 at Hi-Tech Inks (Mar 2023 to May 2024).",
        "IT support contact for 15 to 20 colleagues at Sarla. Best Employee of the Month at Hi-Tech Inks.",
        "Leader of a 4-member research team on first-year cloud ERP cost estimation for manufacturing SMEs (in progress).",
        "BCA at Patliputra University (2022 to 2025).",
      ],
    },
    {
      title: "Right now",
      items: [
        "Open to entry-level Software Engineer and Cloud Engineer roles.",
        "SigmaX at Apna College since Aug 2026: DSA in Java, MERN, AI integration and DevOps. The program projects are due May 2027.",
        "Learning AWS, Kubernetes, CI/CD, MongoDB and Express. See the Cloud Lab.",
      ],
    },
  ],
  facts: [
    { value: "2+", label: "years in ERP and IT support" },
    // counted from the lists above, so it updates when you add a project
    { value: String(projects.length + miniProjects.length), label: "projects on GitHub" },
    // 144 pytest tests + 73 end-to-end API checks + 35 self-tests (see the project stats above)
    { value: "252", label: "tests and checks in 3 projects" },
    { value: "4", label: "members in the research team I lead" },
  ],
  /** from the original CV (not on the resume) */
  spoken: "Hindi (native), English (professional), Gujarati (basic)",
};

export const research = {
  title: "A Data-Driven Predictive Model for First-Year Cloud ERP Cost Estimation in Manufacturing SMEs",
  kind: "Group research paper",
  status: "In progress",
  role: "Team leader of a 4-member research team",
  brief:
    "Manufacturing SMEs often struggle to estimate the real first-year cost of cloud ERP adoption because pricing, implementation, support, storage and integration costs are scattered across vendor sources and case studies. This research aims to build a predictive cost optimization framework using a constructed public dataset to estimate and analyze cloud ERP adoption cost for manufacturing SMEs. The study will help decision-makers understand cost drivers and choose more cost-effective deployment options.",
  oneLine: "Leading a 4-member team building a predictive cost optimization framework on a constructed public dataset to show cost drivers.",
  stats: [
    { value: "4", label: "team members" },
    { value: "5", label: "cost areas in scope" },
  ],
  problem:
    "Manufacturing SMEs often struggle to estimate the real first-year cost of cloud ERP adoption, because pricing, implementation, support, storage and integration costs are scattered across vendor sources and case studies.",
  approach: [
    "Build a predictive cost optimization framework that estimates and analyzes cloud ERP adoption cost for manufacturing SMEs.",
    "Work from a constructed public dataset.",
    "Show which cost drivers matter, so decision-makers can choose more cost-effective deployment options.",
  ],
  scope: ["Pricing", "Implementation", "Support", "Storage", "Integration"],
  outcome: "The study is still in progress, so there are no results to show yet.",
};

export interface Job {
  id: string;
  title: string;
  company: string;
  place: string;
  start: string;
  end: string;
  /** one line under the title: what the role was about */
  summary: string;
  /** what I did, most important first */
  highlights: string[];
  /** tools and skills used in the role (shown as chips) */
  skills: string[];
}

/**
 * Newest first. The bullets are the duties from the resume and the original CV, written out one
 * duty per bullet. The numbers (15 to 20 colleagues, 9 to 10 and 8 to 9 records a day, 13 reports a week)
 * are Sachin's own. If a line is not true for you, delete it: recruiters ask about every line.
 */
export const jobs: Job[] = [
  {
    id: "sarla",
    title: "Senior Officer",
    company: "Sarla Performance Fibers Limited",
    place: "Vapi, Gujarat",
    start: "Jun 2025",
    end: "Jun 2026",
    summary: "ERP operations and IT support at a manufacturing plant, working in SAP HANA every day.",
    highlights: [
      "Served as the IT support contact for 15 to 20 colleagues, troubleshooting SAP HANA, data and PC problems.",
      "Operated SAP HANA ERP for daily business transactions, entering and updating about 9 to 10 inventory records a day for plant operations.",
      "Generated up to 13 ERP reports weekly and analyzed stock and operations data to support management reporting.",
      "Worked with system data across departments to keep records accurate and consistent.",
      "Coordinated with cross-functional teams to align system workflows with business requirements.",
    ],
    skills: ["SAP HANA", "ERP reporting", "IT support", "Troubleshooting", "Data handling"],
  },
  {
    id: "hitech",
    title: "Junior Officer",
    company: "Hi-Tech Inks",
    place: "Vapi, Gujarat",
    start: "Mar 2023",
    end: "May 2024",
    summary: "Inventory and stock data for a manufacturing company, handled in Focus 9 ERP.",
    highlights: [
      "Managed company data in Focus 9 ERP at a manufacturing company.",
      "Maintained 8 to 9 stock records daily, keeping inventory data and records up to date.",
      "Verified entries for accuracy so stock records stayed reliable.",
      "Produced stock reports from the ERP data.",
      "Earned the Best Employee of the Month award for performance.",
    ],
    skills: ["Focus 9 ERP", "Inventory records", "Stock reports", "Data handling"],
  },
];

export const education = [
  {
    school: "Parul University",
    place: "Vadodara, Gujarat",
    degree: "Master of Computer Applications (MCA), Cloud Computing",
    when: "Expected 2028",
  },
  {
    school: "Patliputra University",
    place: "Patna, Bihar",
    degree: "Bachelor of Computer Applications (BCA)",
    when: "2022 - 2025",
    note: "Percentage: 72%",
  },
];

/** "used" = it is in a project on my GitHub. "learning" = I am studying it now (SigmaX and my MCA). */
export type SkillLevel = "used" | "learning";

export interface SkillItem {
  name: string;
  level: SkillLevel;
  /** the projects that prove it. Only write what is true: recruiters ask about every line. Leave it out when there is nothing to point at. */
  where?: string;
}

export interface SkillTrack {
  title: string;
  items: SkillItem[];
}

export const skillsHead = { kicker: "Skills", title: "Skills for both roles." };

export const skillsIntro = "Used means it is in a project on my GitHub. Learning means I am studying it now, at SigmaX and in my MCA.";

/** The Skills page: two columns, one for each job title. Every row says Used or Learning. */
export const skillTracks: SkillTrack[] = [
  {
    title: "Software Engineering",
    items: [
      { name: "Java", level: "used", where: "Suzuki-Kasami Simulator, Sentiment Analysis App, Tic-Tac-Toe" },
      { name: "Python", level: "used", where: "Sovereign AI Workbench" },
      { name: "JavaScript and TypeScript", level: "used", where: "Attendly, Blood Bank Finder, Birthday Surprise" },
      { name: "React, Vite, PWA", level: "used", where: "Blood Bank Finder, Birthday Surprise, Sovereign AI Workbench, Attendly (PWA)" },
      { name: "Node.js", level: "used", where: "Attendly" },
      { name: "Spring Boot, Spring Security, JPA", level: "used", where: "first version of Blood Bank Finder" },
      { name: "REST APIs", level: "used", where: "Attendly (76 endpoints), Sovereign AI Workbench (30 endpoints)" },
      { name: "SQL: PostgreSQL, MySQL, SQLite", level: "used", where: "Attendly, Blood Bank Finder, Sovereign AI Workbench" },
      { name: "Data Structures and Algorithms", level: "used", where: "Minimax in Tic-Tac-Toe, 2 algorithms in the Suzuki-Kasami Simulator" },
      { name: "Testing: pytest, JUnit, Postman", level: "used", where: "144 pytest tests in Sovereign AI Workbench, 73 API checks in Attendly" },
      { name: "Git and GitHub", level: "used", where: "every project" },
      { name: "MongoDB and Express", level: "learning", where: "SigmaX (MERN)" },
    ],
  },
  {
    title: "Cloud Engineering",
    items: [
      { name: "Docker and Docker Compose", level: "used", where: "Sovereign AI Workbench, Sentiment Analysis App, first version of Blood Bank Finder" },
      { name: "GitHub Actions (CI)", level: "used", where: "tests, web build and Docker image builds on every push in Sovereign AI Workbench" },
      { name: "Vercel and serverless functions", level: "used", where: "Attendly, Blood Bank Finder, Suzuki-Kasami Simulator, Birthday Surprise, this site" },
      { name: "Cloud PostgreSQL: Neon, Supabase", level: "used", where: "Attendly (Neon), Blood Bank Finder and Birthday Surprise (Supabase)" },
      { name: "AWS: EC2, S3, IAM, VPC", level: "learning", where: "SigmaX and MCA Cloud Computing" },
      { name: "Kubernetes", level: "learning", where: "SigmaX (DevOps)" },
      { name: "CI/CD pipelines to AWS", level: "learning", where: "next step after GitHub Actions" },
    ],
  },
];

/** Smaller groups under the two columns: keywords recruiters search for. */
export const moreSkills = [
  { group: "AI", items: ["RAG", "Hybrid search", "BM25", "Vector search", "Ollama", "Llama 3.2", "Naive Bayes", "Sentiment analysis"] },
  { group: "Core concepts", items: ["OOP", "Collections", "Streams", "DBMS", "Distributed Computing", "Cloud-Native Architecture"] },
  { group: "ERP and support", items: ["SAP HANA", "Focus 9 ERP", "Troubleshooting", "Technical Support", "Data Handling", "Excel"] },
];

/** Shown in the Cloud Lab under "Learning now". */
export const learning = ["AWS", "Kubernetes", "CI/CD", "MongoDB", "Express", "DSA in Java"];

/** Shown in the Cloud Lab under "Cloud and DevOps work": what is already done, in facts. Only write what is in a repo. */
export const cloudWork = [
  "Docker and Docker Compose: Sovereign AI Workbench (backend and web app), the Sentiment Analysis App (Dockerfile) and the first version of Blood Bank Finder (Spring Boot and MySQL).",
  "GitHub Actions: on every push to Sovereign AI Workbench it runs 144 tests, builds the web app and builds the Docker images. The Suzuki-Kasami Simulator and the Sentiment Analysis App have CI too.",
  "Serverless: one Vercel function serves all 76 Attendly API routes. Blood Bank Finder uses 2 functions, one for map data (cached 15 minutes per area) and one for the assistant.",
  "Managed databases: PostgreSQL on Neon (Attendly) and on Supabase with Row Level Security on 11 tables (Blood Bank Finder).",
];

/** The 3D Cloud Lab island (the half-built tower with a crane) floats the first five of these above it. */
export const building = { tags: ["Docker", "GitHub Actions", "Vercel", "AWS", "Kubernetes"] };

export const sigmax = {
  title: "SigmaX: AI Powered 10X Software Engineer",
  issuer: "Apna College",
  when: "Aug 2026 to May 2027",
  /** "In progress" now. When the program is over, change it to "Completed". */
  status: "In progress" as "In progress" | "Completed",
  covers: "DSA in Java, MERN, AI integration and DevOps",
  projectsDue: "May 2027",
  // Program projects are DUE May 2027. They are not finished and not started here. Never show them as completed.
  // When one is really built: delete its name here and add it to `miniProjects` (small) or `projects` (major).
  // When the list is empty the "Program projects" part is hidden by itself.
  programProjects: ["Zerodha Clone on AWS", "Zoom Clone", "GitHub Clone", "LinkedIn Clone", "Airbnb Clone", "3 AI full stack projects"] as string[],
};

export const certifications = [
  { name: "100 Days of Code: The Complete Python Pro Bootcamp (58.5 hours)", issuer: "Udemy", when: "Feb 2024" },
  { name: "Smart India Hackathon 2026, Institute-Level Internal Hackathon (Participation)", issuer: "Parul University", when: "2026" },
  { name: "Introduction to Social Media", issuer: "Simplilearn SkillUP", when: "Sep 2026" },
  { name: "AI Tools Workshop (1-Day)", issuer: "be10X", when: "Nov 2023" },
  { name: "Microsoft Office using AI Tools Workshop (1-Day)", issuer: "be10X", when: "Feb 2024" },
  { name: "Gujarat Gyan Guru Quiz 3.0 (Participation)", issuer: "Education Department, Government of Gujarat", when: "Sep 2026" },
];

export interface IslandMeta {
  id: IslandId;
  index: string;
  title: string;
  short: string;
  blurb: string;
}

export const islands: Record<IslandId, IslandMeta> = {
  projects: {
    id: "projects",
    index: "01",
    title: "Projects",
    short: "Projects",
    // counted from the lists, so adding a project updates this sentence
    blurb: `${projects.length} major project${projects.length === 1 ? "" : "s"} with screenshots, numbers and code${
      miniProjects.length ? `, and ${miniProjects.length} minor project${miniProjects.length === 1 ? "" : "s"}` : ""
    }.`,
  },
  research: {
    id: "research",
    index: "02",
    title: "Research",
    short: "Research",
    blurb: "Cloud ERP cost estimation for manufacturing SMEs. Team of 4, in progress.",
  },
  experience: {
    id: "experience",
    index: "03",
    title: "Experience",
    short: "Experience",
    blurb: "2+ years in ERP and IT support at Sarla Performance Fibers and Hi-Tech Inks.",
  },
  building: {
    id: "building",
    index: "04",
    title: "Cloud Lab",
    short: "Cloud Lab",
    // made from the projects with status "building" (if any) and from `learning`
    blurb: `${inProgress.length ? `In progress: ${joinList(inProgress.map((p) => p.name))}. ` : ""}Where my apps run, and what I am learning now: ${joinList(learning.slice(0, 3))}.`,
  },
};

export const islandOrder: IslandId[] = ["projects", "research", "experience", "building"];

export const site = {
  title: "Sachin Kumar | Software Engineer and Cloud Engineer",
  description:
    "Entry-level Software Engineer and Cloud Engineer in Vadodara, India. Java, Python, React, Node.js, PostgreSQL, Docker. Full stack and AI projects deployed to the cloud, with tests and screenshots.",
};
