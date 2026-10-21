/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH — edit this file, then run:  npm run build
 * ─────────────────────────────────────────────────────────────────────────────
 *  Anything marked  TODO  is waiting for you. Empty strings / empty arrays are
 *  HIDDEN on the site — nothing is invented and nothing looks broken.
 *  After editing run `npm run build` (regenerates index.html) and `npm run check`.
 */

export const PORTFOLIO = {
  /* ── Identity ──────────────────────────────────────────────────────────── */
  name: "Alayu Legesse Siyfu",
  initials: "AL",
  title: "Full-Stack Developer | AI Powered Platform Developer",

  headline: "Full-Stack Developer | AI Powered Platform Developer",
  subhead: "Building AI-powered web applications that transform data into useful answers.",

  location: "Debre Berhan, Ethiopia",
  timezone: "EAT (UTC+3)",
  availability: "Open to full-time roles and freelance work — remote-friendly",

  // Public contact. Email/phone are rendered obfuscated + reveal-on-click.
  email: "alayusif002@gmail.com",
  phone: "+251913847934", // digits only, used to build the tel: link
  phoneDisplay: "+251 913 847 934",

  // TODO(add): path to your CV PDF, e.g. "assets/cv/alayu-legesse-cv.pdf"
  cv: "",

  // TODO(set): production URL, e.g. "https://alayulegesse.dev" (no trailing slash).
  // Needed to generate the canonical URL, absolute og:image, and sitemap.xml.
  siteUrl: "",

  // TODO(add): your real profiles. Empty = hidden on the site.
  social: {
    github: "https://github.com/Alayu-07/", //   e.g. "https://github.com/yourusername"
    linkedin: "", // e.g. "https://www.linkedin.com/in/yourusername"
    telegram: "", // e.g. "https://t.me/yourusername"
  },

  /* ── Contact form ──────────────────────────────────────────────────────── */
  contact: {
    // TODO(set): a free form endpoint — create one at formspree.io or web3forms.com
    // and paste the URL here. While empty, the form falls back to opening the
    // visitor's email app. Never commit private API keys; access keys for
    // Web3Forms are designed to be public and are documented in the README.
    formEndpoint: "",
    // "formspree" (https://formspree.io/f/xxxx) or "web3forms"
    // (https://api.web3forms.com/submit). Drives the hidden access-key field.
    formProvider: "formspree",
  },

  /* ── Proof strip (hero) ────────────────────────────────────────────────── */
  proof: [
    { value: 18, suffix: "+", label: "years leading teams" },
    { value: "MBA", label: "in Management" },
    { value: "MSc", label: "in Chemistry" },
    { value: "ISO", suffix: " 9001 · 14001", label: "quality & environmental" },
  ],

  /* ── About (bento) ─────────────────────────────────────────────────────── */
  about: {
    story: [
      "I'm a full stack developer focused on AI-powered web applications. I've built a Netflix-inspired streaming site, an AI-powered Evangadi Forum that answers questions with RAG, and a full ChatGPT-style clone powered by Google's Gemini API. I enjoy turning ideas into clear, responsive experiences — and understanding how every layer of a product works, from the interface down to the database.",
      "I work across the whole stack: React and Vite on the front end, Node.js and Express with MySQL behind it. Most of what I know comes from building and reading real code — wiring up an API, testing the result, and refining it until the experience feels simple. I care about readable structure, documented decisions, and changes that are easy to review and improve.",
    ],
    // Stats are derived only from facts already in this file.
    stats: [
      { value: "18+", label: "years in leadership" },
      { value: "5", label: "industries & roles" },
      { value: "2", label: "postgraduate degrees" },
    ],
    focus: [
      "Building AI-powered web applications",
      "Full stack projects with clean, responsive UIs",
      "Open to full-time roles and freelance work",
    ],
    highlights: [
      "MBA in Management (Debre Berhan University) and MSc in Chemistry (Bahir Dar University)",
      "Head of Quality Control, Safety & Security — MDF manufacturing",
      "Production management across distillery and packaging lines",
      "Programming & data analysis coursework, Udacity Ethiopia",
    ],
  },

  /* ── Career path (compact progression strip) ───────────────────────────── */
  careerPath: [
    { label: "Chemistry teacher", year: "2008" },
    { label: "School director", year: "2015" },
    { label: "Chemist", year: "2018" },
    { label: "Production manager", year: "2020" },
    { label: "Head of QC", year: "Present" },
    { label: "Developer", year: "Building now" },
  ],

  /* ── What I do (services) ──────────────────────────────────────────────── */
  services: [
    {
      icon: "layout",
      title: "Web development",
      text: "Responsive, accessible interfaces designed to make products straightforward to use.",
    },
    {
      icon: "layers",
      title: "Full stack projects",
      text: "Complete web experiences — connecting the user interface with application behaviour and data.",
    },
    {
      icon: "sparkles",
      title: "AI-powered features",
      text: "Practical AI experiences built through hands-on projects: forums, chat interfaces, and more.",
    },
    {
      icon: "shield",
      title: "Operations & quality",
      text: "Production processes, quality systems (ISO 9001 / 14001), safety, and team coordination.",
    },
  ],

  /* ── Skills ────────────────────────────────────────────────────────────── */
  // TODO(confirm): add a "Currently learning" group once you know what belongs there.
  skills: [
    {
      group: "Frontend",
      items: [
        "HTML",
        "CSS",
        "JavaScript",
        "React 19",
        "Vite",
        "React Router",
        "Responsive design",
        "Accessible UI",
      ],
    },
    {
      group: "Backend",
      items: [
        "Node.js",
        "Express 5",
        "REST APIs",
        "JWT authentication",
        "bcryptjs",
        "multer (file uploads)",
        "express-validator",
      ],
    },
    {
      group: "Databases",
      items: ["MySQL", "mysql2"],
    },
    {
      group: "AI & ML",
      items: [
        "Google Gemini API (@google/genai)",
        "Retrieval-Augmented Generation (RAG)",
        "Prompt & system-prompt design",
      ],
    },
    {
      group: "Tools",
      items: ["Git", "GitHub", "npm", "ESLint", "Vitest", "Testing Library", "VS Code", "Postman"],
    },
  ],

  /* ── How I work ────────────────────────────────────────────────────────── */
  howIWork: [
    {
      icon: "target",
      title: "Define the standard first",
      text: "From quality systems: agree on what “done” looks like before building — clear scope, clear acceptance criteria.",
    },
    {
      icon: "gauge",
      title: "Measure, then improve",
      text: "Check the result against the standard, find the biggest gap, fix that, repeat. No guesswork.",
    },
    {
      icon: "shield",
      title: "Safety and clarity over shortcuts",
      text: "Years of safety leadership: no hidden risks, readable code, and changes that are easy to review and roll back.",
    },
    {
      icon: "users",
      title: "Lead the people, not just the process",
      text: "18 years of teams taught me that communication, documentation, and handover decide whether work survives me.",
    },
  ],

  /* ── Experience (reverse-chronological; ONE current role) ──────────────── */
  experience: [
    {
      role: "Head of Quality Control, Safety & Security",
      org: "Zamu MDF PLC",
      // TODO(confirm): exact start date. Shown as the current role.
      period: "Present",
      current: true,
      summary:
        "Responsible for quality, safety, and security across medium-density fibreboard production.",
      points: [
        "Oversee quality across the MDF production process, from chipping through final lamination.",
        "Coordinate quality, waste reduction, production cost, safety, and security priorities.",
      ],
    },
    {
      role: "Production Manager",
      org: "Rorank Business S.C.",
      // TODO(confirm): end date — source CV says "May 2020 – 2026".
      period: "2020 – 2026",
      summary: "Managed production operations across distillery and packaging workflows.",
      points: [
        "Coordinated teams, production records, budgets, resource use, and regulatory stakeholders.",
        "Managed distillery and packaging operations end to end.",
      ],
    },
    {
      role: "Chemist, Shift Team Leader & Packaging Supervisor",
      org: "Rorank Business S.C.",
      period: "2018 – 2020",
      summary: "Progressed through chemistry, shift leadership, and packaging supervision roles.",
      points: [
        "Supported fermentation, distillery, utilities, and three packaging lines.",
        "Led shift teams and supervised packaging operations.",
      ],
    },
    {
      role: "Director & Teacher",
      org: "Thrive Academy",
      period: "2015 – 2018",
      summary: "Led and taught at a community-focused school supported by an international NGO.",
      points: ["Combined school leadership with classroom teaching duties."],
    },
    {
      role: "Chemistry Teacher",
      org: "Government Education Office",
      period: "2008 – 2015",
      summary: "Taught chemistry at secondary and preparatory school level.",
      points: ["Secondary and preparatory school chemistry instruction."],
    },
  ],

  /* ── Education ─────────────────────────────────────────────────────────── */
  education: [
    {
      role: "AI Powered Fullstack Application Development",
      org: "Evangadi Networks",
      period: "Ongoing",
      summary:
        "Standardized, project-based training in modern full-stack and AI-powered application development.",
      points: [],
    },
    {
      role: "MBA, Management",
      org: "Debre Berhan University",
      period: "2016 – 2019",
      summary: "Graduate business administration with a management focus.",
      points: [],
    },
    {
      role: "MSc, Chemistry",
      org: "Bahir Dar University",
      period: "2011 – 2015",
      summary: "Postgraduate chemistry research degree.",
      points: [],
    },
    {
      role: "BSc, Chemistry",
      org: "Bahir Dar University",
      period: "2004 – 2008",
      summary: "Undergraduate chemistry degree.",
      points: [],
    },
    {
      role: "Programming & Data Analysis Fundamentals",
      org: "Udacity Ethiopia",
      period: "Short courses",
      summary: "Coursework in programming, data analysis, AI and career empowerment.",
      points: [],
    },
  ],

  /* ── Projects ──────────────────────────────────────────────────────────── */
  // stack: TECHNOLOGIES only (React, Node, MongoDB, …). Empty = hidden until confirmed.
  // tags:  domain words for filtering (web / app / data).
  // Each project's image is a 16:10 live screenshot in assets/img/projects/.
  projects: [
    {
      title: "AI-Powered Evangadi Forum",
      category: "web",
      description:
        "A community Q&A platform with an AI assistant that helps users ask better questions and receive relevant, context-aware answers using a curated knowledge base.",
      problem:
        "Community Q&A platforms often leave questions unanswered or buried without helpful guidance.",
      built:
        "Full-stack forum with authentication, question/answer flows, and RAG-powered AI responses.",
      role: "Full-stack developer",
      stack: [
        "React 19",
        "Vite",
        "React Router v7",
        "axios",
        "framer-motion",
        "lucide-react",
        "react-markdown",
        "Node.js",
        "Express 5",
        "MySQL",
        "mysql2",
        "@google/genai (Gemini)",
        "JWT",
        "bcryptjs",
        "multer",
        "express-validator",
        "Vitest",
        "Testing Library",
      ],
      tags: ["Community", "Q&A", "AI", "RAG", "Full-stack"],
      features: [
        "User authentication and protected routes",
        "Ask, answer, and browse questions",
        "AI-assisted answers via Gemini API with RAG context",
        "Admin dashboard for managing users, questions, answers, and documents",
        "File/document upload for RAG knowledge base",
      ],
      learnings:
        "Learned to integrate RAG with LLMs, build role-based access control, and test a full-stack React + Express app.",
      live: "https://evangadiforum.tsedetech.com/",
      repo: "https://github.com/Alayu-07/FullEvangadi-Forum",
      image: "assets/img/projects/evangadi.webp", // live screenshot (16:10)
    },
    {
      title: "Full ChatGPT Clone",
      category: "app",
      description:
        "A full-stack conversational AI application with a clean chat interface powered by Google's Gemini API, featuring persistent user conversations and message history.",
      problem:
        "Working with AI APIs needs a polished, intuitive interface with proper backend handling and conversation management.",
      built:
        "Full-stack chat app with React frontend and Express backend integrating Gemini API with conversation persistence.",
      role: "Full-stack developer",
      stack: [
        "React 19",
        "Vite",
        "axios",
        "react-markdown",
        "react-syntax-highlighter",
        "lucide-react",
        "CSS Modules",
        "Node.js",
        "Express 5",
        "MySQL",
        "mysql2",
        "@google/genai (Gemini)",
        "dotenv",
        "cors",
      ],
      tags: ["AI", "Chat", "Web app", "Full-stack", "Gemini"],
      features: [
        "Real-time chat interface with AI responses via Gemini API",
        "Conversation management and message history",
        "Responsive, clean UI with markdown and code syntax highlighting",
        "Backend API for chat processing and data persistence",
      ],
      learnings:
        "Gained experience integrating LLM APIs, handling streaming-style responses, and building a production-ready chat backend with database persistence.",
      live: "https://clonegpt.tsedetech.com/",
      repo: "https://github.com/Alayu-07/Full-ChatGPT-Clone",
      image: "assets/img/projects/chatgpt-clone.webp", // live screenshot (16:10)
    },
    {
      title: "Netflix 2026 - Movie Streaming Clone",
      category: "web",
      description:
        "A Netflix-inspired streaming UI built with React, featuring movie browsing, carousels, and responsive layouts for an immersive viewing experience.",
      problem:
        "Media catalogues are hard to browse on small screens without a strong visual hierarchy.",
      built:
        "Modern React frontend with TMDB API integration, sleek carousels, and mobile-first responsive design.",
      role: "Frontend developer",
      stack: [
        "React 19",
        "Vite",
        "React Router v7",
        "axios",
        "Swiper",
        "lucide-react",
        "react-icons",
        "CSS Modules",
      ],
      tags: ["Entertainment", "Responsive UI", "Web app", "Movies"],
      features: [
        "Hero banner with dynamic movie content",
        "Horizontal scrollable rows with Swiper carousel",
        "Responsive design across mobile and desktop",
        "Movie data fetched from TMDB API",
        "Modern Netflix-inspired UI/UX",
      ],
      learnings:
        "Learned to build complex UI components like carousels, work with third-party APIs, and create polished, responsive user interfaces.",
      live: "https://netclone.tsedetech.com/",
      repo: "https://github.com/Alayu-07/Netflix-2026",
      image: "assets/img/projects/netflix.webp", // live screenshot (16:10)
    },
  ],

  /* ── Recommendations ───────────────────────────────────────────────────── */
  // TODO(add): 1–2 real quotes with name + role. Rendered only when non-empty.
  // e.g. { quote: "…", name: "…", role: "…, Zamu MDF PLC" }
  recommendations: [],
};
