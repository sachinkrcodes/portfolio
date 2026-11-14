/**
 * ALL SITE CONTENT LIVES HERE.
 * Edit this one file and every part of the site (3D scene labels, panels, the 2D page, SEO text) updates.
 * Sources: Sachin's resume v7C and the code and READMEs of his GitHub repos (the case study numbers are counted
 * from the code). Nothing here is invented: numbers, dates and issuers come from those.
 *
 * QUICK RECIPES (more in docs/GUIDE.md, "Change the words"):
 *   new full case study        -> add an object to `projects` (it works everywhere, no other file needs a change)
 *   small / mini project       -> add an object to `miniProjects`
 *   a SigmaX project is done   -> delete its name from `sigmax.plannedProjects`, add it to `miniProjects` or `projects`
 *   new job or new title       -> `jobs` (newest first) and `profile.role`
 *   new certificate            -> `certifications`
 *   new resume PDF             -> replace public/Sachin_Kumar_Resume.pdf (same file name)
 * Counts on the site (projects on GitHub, case study count) are calculated from these lists, so they update by themselves.
 *
 * AFTER SIGMAX (major projects only, a new About): the whole change is in this file, about 15 minutes.
 *   1. `projects`      add each major project as a full case study (copy one). The 3D Projects island builds itself
 *                      from this list and has room for 6 buildings; any further project still shows everywhere else.
 *   2. `miniProjects`  set it to [] (an empty list hides the "More projects" parts by itself) or keep the ones you like.
 *   3. `about`         replace the whole object: `title`, `story` (3 short paragraphs) and `facts` (4 tiles).
 *   4. `sigmax`        set `status` to "Completed", and `plannedProjects` to [] (the planned list then disappears).
 *   5. `milestones`, `learning`, `skills`, `profile.summary`, `site.description`   update the words that mention
 *                      what you are learning. `profile.role` / `profile.headline` change if your title does.
 *   6. public/Sachin_Kumar_Resume.pdf   replace with the new resume (same file name).
 * The build checks this file for mistakes, so a slip stops the build with a plain message instead of going live.
 */

export type IslandId = "projects" | "research" | "experience" | "building";

export const profile = {
  name: "Sachin Kumar",
  role: "Software Engineer and Cloud Engineer",
  level: "Entry-Level",
  stack: ["Java", "Spring Boot", "Docker"],
  headline: "I build secure, cloud-ready Java backends.",
  summary:
    "MCA (Cloud Computing) student with 2+ years in ERP (SAP HANA, Focus 9) and IT support. Builds Java backend projects with Spring Boot, MySQL, Spring Security and Docker.",
  email: "sachinkrcodes@gmail.com",
  linkedin: "https://www.linkedin.com/in/sachinkrcodes",
  github: "https://github.com/sachinkrcodes",
  location: { city: "Vadodara", region: "Gujarat", country: "India", timeZone: "Asia/Kolkata" },
  resumeUrl: "/Sachin_Kumar_Resume.pdf",
  openTo: "Open to entry-level roles",
} as const;

/** Text for the bottom ticker. Keep these true; they are shown to recruiters. */
export const milestones = [
  // The Railway config is in the repo, but a public Railway URL is not, so this says only what can be checked.
  "Blood Bank Finder: Spring Boot, Spring Security and Docker",
  "Attendly: Node.js app with email-verified login, admin and a database",
  "Tic-Tac-Toe with an unbeatable Minimax AI",
  "MCA Cloud Computing at Parul University",
  "Learning AWS and Kubernetes",
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
  /** proof points: tests, checks, how it ships */
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
  /** Any extra links (for example the backend folder). */
  links?: LinkItem[];
}

export interface Project extends CaseStudy, Linkable {
  id: string;
  name: string;
  /** short list for chips and search text */
  stack: string[];
  summary: string;
  /**
   * The look of this project's building on the 3D Projects island. Optional: new projects get one of the three
   * styles in turn. The first three projects (Blood Bank Finder, Sentiment Analysis, Suzuki-Kasami) keep their own buildings.
   *   "pipeline" = a build, test and ship line   "dish" = a satellite dish with radar pulses   "tiers" = a stack of layers with an orb
   */
  building?: "pipeline" | "dish" | "tiers";
}

export const projects: Project[] = [
  {
    id: "blood-bank-finder",
    name: "Blood Bank Finder",
    kind: "Spring Boot web app and REST API",
    stack: ["Java 21", "Spring Boot", "MySQL", "Docker"],
    summary: "Spring Boot app that matches blood donors with requests, secured with Spring Security, with a REST API and a web app for donors and admins.",
    stats: [
      { value: "10", label: "REST endpoints" },
      { value: "23", label: "web routes" },
      { value: "7", label: "JPA entities" },
      { value: "8", label: "blood groups matched" },
    ],
    problem:
      "When someone needs blood urgently, the match has to be right the first time: the right blood group, the right city, and a donor who is allowed to give again. Donor details are personal data and the admin tools control stock, so the system also has to be strict about who can see and do what.",
    built: [
      "A Spring Boot backend with two front doors: a REST API with Swagger docs, and a server-rendered Thymeleaf web app for donors and admins.",
      "Donor registration and search by blood group and city. Anyone who gave blood less than 90 days ago is filtered out automatically.",
      "Emergency blood requests that find eligible donors using blood group compatibility across all 8 groups.",
      "Blood bank stock management and an admin dashboard to view and close open requests. It also shows plain threshold warnings (low stock, units about to expire, open requests with no eligible donor). They are rules, not an AI model, so every warning can be explained.",
      "Two login paths on purpose: form login with BCrypt passwords and donor and admin roles for the browser, and a secret token header for the raw admin REST endpoints.",
      "CAPTCHA, and per-IP rate limiting on the sign-up and request endpoints (5 POSTs per 10 minutes).",
      "A hospital and blood bank map (Leaflet and OpenStreetMap) with markers that refresh on a timer and a locate-me button, a blood camps page, and English and Hindi text (75 message keys each).",
    ],
    tech: [
      { group: "Language and framework", items: ["Java 21", "Spring Boot 3", "Spring MVC"] },
      { group: "Data", items: ["Spring Data JPA", "Hibernate", "MySQL"] },
      { group: "Security", items: ["Spring Security", "BCrypt", "CAPTCHA", "Rate limiting"] },
      { group: "Front end", items: ["Thymeleaf", "Leaflet", "JavaScript", "HTML and CSS"] },
      { group: "Testing and docs", items: ["JUnit", "Mockito", "Swagger UI", "Postman collection"] },
      { group: "Delivery", items: ["Docker (multi-stage)", "Spring Boot Actuator", "Railway config"] },
    ],
    highlights: [
      "4 automated tests: JUnit and Mockito tests for the 90-day rule (recent donor excluded, donor past the gap included, first-time donor included) and a Spring context test that fails if the security wiring breaks.",
      "The donation gap is one setting (90 days by default), so changing the rule does not mean changing code.",
      "Multi-stage Docker build, and a Railway config that health-checks the app through Spring Boot Actuator.",
      "A Postman collection is included for trying the REST API.",
    ],
    repo: "https://github.com/sachinkrcodes/blood-bank-finder",
    // No live link on purpose: since the Nov 9 commit "Restore full Spring Boot app at repo root" the repo is only the Java app,
    // which needs MySQL and a Java host (the Railway steps are in its README), so the old Vercel demo is gone.
    // When it runs somewhere public, open it in a private window first, then add two lines here:
    //   liveUrl: "https://your-link",
    //   liveLabel: "Live app",
  },
  {
    id: "sentiment-analysis-app",
    name: "Sentiment Analysis Web App",
    kind: "Plain Java web app, Social Media Analytics course",
    stack: ["Java", "REST API", "Naive Bayes"],
    summary: "Plain Java backend that scores text sentiment for single inputs, batches and CSV files.",
    stats: [
      { value: "16", label: "REST endpoints" },
      { value: "463", label: "labelled training rows" },
      { value: "2", label: "analysers to compare" },
      { value: "4", label: "metrics reported" },
    ],
    problem:
      "Reading hundreds of comments or reviews one by one to find out whether people are happy or upset does not scale. This app scores text as positive, neutral or negative, and lets you compare two different methods on the same data to see which one is more accurate.",
    built: [
      "A Java backend with no framework: the JDK's built-in HTTP server exposes 16 REST endpoints for single text, batches, CSV upload, history, the lexicon and model evaluation.",
      "Two analysers you can switch between: a rule-based lexicon scorer that handles negation, boosters, capital letters and exclamation marks, and a Naive Bayes classifier that trains inside the app.",
      "Training on a labelled CSV of 463 rows. You can upload your own text and label CSV to retrain.",
      "A browser dashboard to analyse one text or a whole batch, see totals, a score trend, the sentiment split and top words, search the history and edit the lexicon while the server runs.",
      "A Model Lab page that tests both analysers on held-out data and shows accuracy, precision, recall, F1 and a confusion matrix.",
    ],
    tech: [
      { group: "Backend", items: ["Java (JDK 17+)", "JDK HTTP server", "REST and JSON"] },
      { group: "Analysis", items: ["Lexicon rules", "Naive Bayes", "Laplace smoothing"] },
      { group: "Data", items: ["CSV files for history, lexicon and training data"] },
      { group: "Front end", items: ["HTML", "JavaScript", "Canvas charts"] },
    ],
    highlights: [
      "Everything is saved as plain CSV files, so history and lexicon edits survive a restart.",
      "A built-in self test checks the lexicon rules, the JSON and CSV round trip, and the Naive Bayes accuracy on held-out data.",
      "No frameworks: the JSON and CSV helpers and the charts are written by hand.",
      "The logic sits in one service class, apart from the HTTP layer, so it can be reused under Spring Boot later.",
    ],
    repo: "https://github.com/sachinkrcodes/sentiment-analysis-app",
  },
  {
    id: "suzuki-kasami-simulator",
    name: "Suzuki-Kasami Algorithm Simulator",
    kind: "Java Swing desktop app, Distributed Computing course",
    stack: ["Java Swing"],
    summary: "Swing simulator of the Suzuki-Kasami token algorithm for distributed mutual exclusion.",
    stats: [
      { value: "2 to 10", label: "processes" },
      { value: "400", label: "randomized test runs" },
      { value: "1.2M", label: "events checked, about" },
      { value: "2", label: "channel modes" },
    ],
    problem:
      "In a distributed system there is no shared memory and no global clock, yet several processes must never use a shared resource at the same time. Suzuki-Kasami solves this with a single token: only the process holding it may enter the critical section. I built a simulator where you can step through the algorithm and watch the token move.",
    built: [
      "A Java Swing desktop app that animates processes, messages and the token on one virtual clock.",
      "The algorithm sits in one Simulation class (request, release, deliver) and the interface only draws it.",
      "Play, pause, step forward and step back, with speed from 0.25x to 4x.",
      "Setup for 2 to 10 processes, FIFO or non-FIFO channels, network delay range, random seed and workload. Ready-made scenarios, and save and load for your own.",
      "Live panels for each process's request numbers, the token and its queue, an event log, a timeline, message counts, waiting times and a safety monitor.",
    ],
    tech: [
      { group: "Language and interface", items: ["Java (JDK 17+)", "Swing"] },
      { group: "Simulation", items: ["Discrete-event engine", "Virtual clock", "Seeded random generator"] },
      { group: "Algorithm", items: ["Suzuki-Kasami token-based mutual exclusion"] },
      { group: "Files", items: ["Saved scenario files"] },
    ],
    highlights: [
      "A self test runs 400 random simulations (2 to 10 processes, FIFO and non-FIFO channels, about 1.2 million events) and checks after every event that exactly one token exists and at most one process is in the critical section.",
      "The same test checks that step back restores the exact earlier state and that every request is served.",
      "A seeded random generator means any run can be repeated exactly.",
    ],
    repo: "https://github.com/sachinkrcodes/suzuki-kasami-simulator",
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
 * Smaller projects: a card each (what it is, 2 to 4 facts counted from the code, links), without a full case study.
 * They show under the case studies in the Projects panel and on the 2D page. To grow one into a full case study,
 * move it to `projects` and fill in problem, built, tech and highlights.
 * Work that does not exist yet (the SigmaX projects) is NOT listed here: it stays in `sigmax.plannedProjects`
 * until there is code to show.
 */
export interface MiniProject extends Linkable {
  id: string;
  name: string;
  /** one line: what sort of project this is */
  kind: string;
  summary: string;
  /** 2 to 4 short facts */
  points: string[];
  /** short list for chips */
  stack: string[];
  /** "done" (default) or "building" (shows an "In progress" chip) */
  status?: "done" | "building";
}

export const miniProjects: MiniProject[] = [
  {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe with an unbeatable AI",
    kind: "Mini project: Java Swing app and browser game",
    summary:
      "The same game twice, as a Java Swing desktop app and as a browser game. The AI tries every possible game with Minimax and Alpha-Beta pruning, so on the hardest level the best you can do is a draw.",
    points: [
      "Play against the computer or a friend, with 3 levels: Easy, Medium and Unbeatable.",
      "Both versions use the same Minimax logic: 452 lines of Java Swing and 218 lines of JavaScript.",
      "The browser version keeps the scoreboard in the browser, previews your move on hover, highlights the winning line and works on phones and with the keyboard.",
      "SharedCounter.java (28 lines) is a small thread-safety demo: two threads update one counter through a synchronized method.",
    ],
    stack: ["Java Swing", "JavaScript", "Minimax", "Alpha-Beta pruning"],
    repo: "https://github.com/sachinkrcodes/Tic-tac-toe",
    // Taken from your Vercel project list and NOT checked from here. Open it in a private window; fix or delete if it fails.
    liveUrl: "https://tic-tac-toe-zeta-one-90.vercel.app",
    liveLabel: "Play it",
  },
  {
    id: "attendly",
    name: "Attendly: attendance and campus app",
    kind: "Mini project: full-stack web app, Node.js and PostgreSQL",
    summary:
      "A classroom attendance app for teachers, students and a platform admin, with email-verified accounts and a database behind it. Plain HTML, CSS and JavaScript in the browser, a Node.js API on Vercel serverless functions, and it installs on a phone like an app.",
    points: [
      "Email-verified accounts: the 6-digit code is stored hashed, expires in 10 minutes and allows 5 tries. Passwords use scrypt, login tokens last 7 days, and an account locks for 15 minutes after 5 wrong passwords.",
      "Teachers create classes with a join code and take attendance (Present, Late, Absent or Leave). A live check-in code lets students mark themselves present from their phones.",
      "Leave requests, notices, a timetable, exams and marks, gate passes and a help desk, plus a planner that tells a student how many classes they can still miss. A platform admin adds colleges and approves teachers.",
      "A REST API of 62 endpoints over 16 tables, on PostgreSQL (Neon) in production and a SQLite file on my own machine. 61 end-to-end API checks pass, including that Late counts as attended and Leave is excused.",
    ],
    stack: ["Node.js", "PostgreSQL", "JavaScript", "REST API", "PWA", "Vercel"],
    repo: "https://github.com/sachinkrcodes/Attendance-system",
    // From the earlier README. NOT checked from here (the Vercel link cannot be opened from this workspace), and it may have changed with the new GitHub name.
    // Accounts now need an email code, so the live app needs a Neon database, AUTH_SECRET, ADMIN_EMAILS and either SMTP_USER and SMTP_PASS or SHOW_OTP=true (demo mode, the code shows on screen).
    // Open the link in a private window, sign up once, and also open its /api/health page (it should show {"ok":true}). If the link is different or dead, change or delete the next two lines.
    liveUrl: "https://attendance-system-codeswithsachin.vercel.app",
    liveLabel: "Live demo",
  },
];

/**
 * The About page: a short story of what I build, what I have checked, and where I come from.
 * Every fact in it is on the resume (v7C) or in a repo, and nothing in it goes out of date by itself
 * (no course dates, no "expected" years). The wording is a draft: change it to sound like you.
 * It is defined after the project lists because the "projects on GitHub" tile is counted from them.
 */
/** Every "REST endpoints" number in the stats of a Java project, added up. */
const javaRestEndpoints = projects
  .filter((p) => /\bJava\b/.test(p.stack.join(" ")))
  .reduce((sum, p) => sum + p.stats.filter((st) => /REST endpoints?/i.test(st.label)).reduce((a, st) => a + (parseInt(st.value, 10) || 0), 0), 0);

export const about = {
  kicker: "About",
  title: "From ERP and IT support to cloud backends.",
  story: [
    "I build backend software in Java: Spring Boot services with REST APIs, Spring Security and MySQL, packaged with Docker and tested with JUnit and Mockito. In Blood Bank Finder that means BCrypt-hashed passwords, per-IP rate limiting, a multi-stage Docker build and a Railway config that health-checks the app through Actuator, not just endpoints that return data.",
    "I care about the parts that have to be provably right. My Suzuki-Kasami simulator is checked by 400 randomized runs (about 1.2 million events) that verify after every event that exactly one token exists and at most one process is in the critical section. Cloud engineering is the next layer I am adding: AWS, Kubernetes and CI/CD, on top of my MCA in Cloud Computing at Parul University.",
    "I started in operations. For 2+ years I worked in ERP systems at two manufacturing companies in Vapi (Focus 9 at Hi-Tech Inks, SAP HANA at Sarla Performance Fibers) and was the IT support contact for 15 to 20 colleagues. It taught me to build for the person using the system: a wrong entry becomes a wrong report. I also lead a four-member research team on first-year cloud ERP cost estimation for manufacturing SMEs, and I am looking for an entry-level Software Engineer or Cloud Engineer role.",
  ],
  facts: [
    { value: "2+", label: "years in ERP and IT support" },
    // counted from the lists above, so it updates when you add a project
    { value: String(projects.length + miniProjects.length), label: "projects on GitHub" },
    // added up from the "REST endpoints" numbers in the stats of the Java projects (10 + 16 today), so it updates when `projects` changes
    { value: String(javaRestEndpoints), label: "REST endpoints built in Java" },
    { value: "4", label: "members in the research team I lead" },
  ],
  /** from the original CV (not on resume v7C) */
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
 * Newest first. The bullets are the duties from the resume (v7C) and the original CV, written out one
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

export const skills = [
  { group: "Languages", items: ["Java", "OOP", "Collections", "Streams", "JavaScript", "Python", "SQL", "HTML", "CSS"] },
  { group: "Frameworks", items: ["Spring Boot", "Spring MVC", "Spring Security", "Spring Data JPA", "Hibernate"] },
  { group: "Cloud and DevOps", items: ["Docker", "Git", "GitHub", "Maven", "Spring Boot Actuator", "Railway"] },
  { group: "Backend and Testing", items: ["REST APIs", "Authentication", "MySQL", "JUnit", "Postman", "Swagger"] },
  { group: "Core Concepts", items: ["DSA", "DBMS", "Distributed Computing", "Cloud-Native Architecture"] },
  { group: "ERP and Support", items: ["SAP HANA", "Focus 9 ERP", "Troubleshooting", "Technical Support", "Data Handling", "Excel"] },
];

/** Shown as the "Currently Building" island and the "Currently Learning" tag group. */
export const learning = ["AWS", "Kubernetes", "CI/CD", "React", "Node.js", "Express", "MongoDB"];

export const sigmax = {
  title: "SigmaX: AI Powered 10X Software Engineer",
  issuer: "Apna College",
  when: "Aug 2026 to May 2027",
  /** "In progress" now. When the program is over, change it to "Completed". */
  status: "In progress" as "In progress" | "Completed",
  covers: "DSA in Java, MERN, AI integration and DevOps",
  projectsDue: "May 2027",
  // Program projects are DUE May 2027. They are planned, not finished. Never show them as completed.
  // When one is really built: delete its name here and add it to `miniProjects` (small) or `projects` (full case study).
  // When the list is empty the "Planned program projects" part is hidden by itself.
  plannedProjects: ["Zerodha Clone on AWS", "Zoom Clone", "GitHub Clone", "LinkedIn Clone", "Airbnb Clone", "3 AI full stack projects"] as string[],
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
    blurb: `${projects.length} case stud${projects.length === 1 ? "y" : "ies"} (${projects.map((p) => p.name).join(", ")})${
      miniProjects.length ? ` and ${miniProjects.length} smaller project${miniProjects.length === 1 ? "" : "s"}` : ""
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
    title: "Currently Building",
    short: "Building",
    blurb: "Construction zone: AWS, Kubernetes, CI/CD, React and Node.js.",
  },
};

export const islandOrder: IslandId[] = ["projects", "research", "experience", "building"];

export const site = {
  title: "Sachin Kumar | Software Engineer and Cloud Engineer",
  description:
    "Entry-level Software Engineer and Cloud Engineer from Vadodara, India. Java, Spring Boot, MySQL, Docker. MCA (Cloud Computing) student with 2+ years in ERP and IT support.",
};
