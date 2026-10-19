/**
 * Progressive enhancement layer. All content is already in the HTML
 * (generated from js/data.js by npm run build) — nothing here is required
 * to read the page. Every animation respects prefers-reduced-motion.
 */
import { PORTFOLIO as P } from "./data.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

/* ───────────────────────────── footer year ───────────────────────────── */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ─────────────────────────────── theme ───────────────────────────────── */
const themeBtn = $("#themeToggle");

function currentTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function paintThemeButton(theme) {
  if (!themeBtn) return;
  const dark = theme === "dark";
  themeBtn.setAttribute("aria-pressed", String(dark));
  themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}

function applyTheme(theme, persist) {
  document.documentElement.setAttribute("data-theme", theme);
  paintThemeButton(theme);
  if (persist) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* ignore */
    }
  }
}

paintThemeButton(currentTheme());

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    const update = () => applyTheme(next, true);
    if (document.startViewTransition && !reduced.matches) {
      document.startViewTransition(update);
    } else {
      update();
    }
  });
}

/* Follow the OS theme until the visitor makes an explicit choice. */
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (err) {
    /* ignore */
  }
  if (stored !== "dark" && stored !== "light") {
    applyTheme(e.matches ? "dark" : "light", false);
  }
});

/* ───────────────────── header state + scroll progress ─────────────────── */
const header = $("#siteHeader");
const progressBar = $("#progressBar");
let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ────────────────────────── active nav section ────────────────────────── */
const navLinks = $$(".nav__list a, .drawer__list a");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  $$("main section[id]").forEach((section) => sectionObserver.observe(section));
}

/* ────────────────────────────── mobile drawer ────────────────────────── */
const menuToggle = $("#menuToggle");
const drawer = $("#mobileMenu");

if (menuToggle && drawer) {
  const panel = $(".drawer__panel", drawer);
  let lastFocused = null;

  const focusables = () =>
    $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', panel).filter(
      (el) => el.offsetParent !== null
    );

  function openDrawer() {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    const first = focusables()[0];
    if (first) first.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    const finish = () => {
      drawer.hidden = true;
    };
    if (reduced.matches) finish();
    else window.setTimeout(finish, 240);
    if (lastFocused) lastFocused.focus();
  }

  menuToggle.addEventListener("click", () => {
    if (drawer.hidden) openDrawer();
    else closeDrawer();
  });

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
    if (e.target.closest("a")) closeDrawer();
  });

  document.addEventListener("keydown", (e) => {
    if (drawer.hidden) return;
    if (e.key === "Escape") {
      closeDrawer();
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
    if (e.matches && !drawer.hidden) closeDrawer();
  });
}

/* ───────────────────── staggered reveal on scroll ─────────────────────── */
const revealEls = $$(".reveal");
if (revealEls.length && "IntersectionObserver" in window && !reduced.matches) {
  document.documentElement.classList.add("motion-ok");
  // Stagger: index of each reveal element among its section's reveal set.
  $$("main section, .hero").forEach((section) => {
    $$(".reveal", section).forEach((el, i) => el.style.setProperty("--i", String(Math.min(i, 6))));
  });
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
  // Safety net: never leave content hidden if something goes wrong.
  window.setTimeout(() => {
    revealEls.forEach((el) => {
      if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-in");
      }
    });
  }, 2500);
}

/* ───────────────────────── animated proof counters ────────────────────── */
const counters = $$("[data-count]");
if (counters.length) {
  const run = (el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduced.matches) {
      el.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(run);
  }
}

/* ───────────────────────────── project filter ─────────────────────────── */
const filterBar = $("#projectFilters");
const projectCards = $$("#projectGrid .project");
const filterStatus = $("#filterStatus");

if (filterBar && projectCards.length) {
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const filter = btn.dataset.filter;
    $$(".chip", filterBar).forEach((chip) =>
      chip.setAttribute("aria-pressed", String(chip === btn))
    );
    let shown = 0;
    projectCards.forEach((card) => {
      const match = filter === "all" || card.dataset.cat === filter;
      card.hidden = !match;
      if (match) shown += 1;
    });
    if (filterStatus) {
      filterStatus.textContent = `${shown} project${shown === 1 ? "" : "s"} shown.`;
    }
  });
}

/* ─────────────────────── contact reveal (email/phone) ─────────────────── */
$$("[data-reveal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const part1 = btn.dataset.p1 || "";
    const part2 = btn.dataset.p2 || "";
    const kind = btn.dataset.reveal;
    const valueEl = $(".channel__value", btn);
    if (!valueEl || !part1 || !part2) return;
    if (kind === "email") {
      const address = `${part1}@${part2}`;
      const link = document.createElement("a");
      link.href = `mailto:${address}`;
      link.textContent = address;
      valueEl.replaceChildren(link);
    } else if (kind === "phone") {
      const tel = part1 + part2;
      const link = document.createElement("a");
      link.href = `tel:${tel.replace(/\s+/g, "")}`;
      link.textContent = btn.dataset.display || tel;
      valueEl.replaceChildren(link);
    }
    btn.dataset.reveal = "done";
    btn.disabled = true;
  });
});

/* ───────────────────────────── contact form ──────────────────────────── */
const form = $("#contactForm");
const formStatus = $("#formStatus");
const mailtoFallback = $("#mailtoFallback");
const endpoint = (P.contact && P.contact.formEndpoint) || "";
const provider = (P.contact && P.contact.formProvider) || "formspree";

if (mailtoFallback && P.email) {
  mailtoFallback.href = `mailto:${P.email}`;
}

function setFieldError(input, message) {
  const errEl = document.getElementById(`${input.id}-err`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (errEl) errEl.textContent = message || "";
}

function validateForm(formEl) {
  let ok = true;
  $$("input[required], textarea[required]", formEl).forEach((input) => {
    const value = input.value.trim();
    let message = "";
    if (!value) message = "This field is required.";
    else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      message = "Please enter a valid email address.";
    }
    setFieldError(input, message);
    if (message) ok = false;
  });
  return ok;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      if (formStatus) {
        formStatus.textContent = "Please fix the highlighted fields and try again.";
        formStatus.className = "form__status is-error";
      }
      const firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }

    const submitBtn = $("#formSubmit");
    const data = new FormData(form);

    // Honeypot: silently accept and drop bot submissions.
    if (data.get("_gotcha")) {
      if (formStatus) {
        formStatus.textContent = "Thanks — your message has been sent.";
        formStatus.className = "form__status is-success";
      }
      form.reset();
      return;
    }

    if (!endpoint) {
      // No endpoint configured yet → mailto fallback (documented in README).
      const subject = data.get("subject") || `Portfolio enquiry from ${data.get("name")}`;
      const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`;
      window.location.href = `mailto:${P.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      if (formStatus) {
        formStatus.textContent =
          "No form endpoint is configured yet — opening your email app instead.";
        formStatus.className = "form__status";
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "form__status";
    }

    try {
      const headers = { Accept: "application/json" };
      let body;
      if (provider === "web3forms") {
        // Web3Forms: access key is a public, publishable key (safe in the repo).
        data.append("access_key", form.dataset.web3formsKey || "");
        body = data;
      } else {
        body = JSON.stringify(Object.fromEntries(data.entries()));
        headers["Content-Type"] = "application/json";
      }
      const res = await fetch(endpoint, { method: "POST", headers, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      if (formStatus) {
        formStatus.textContent = "Thanks — your message has been sent. I'll reply soon.";
        formStatus.className = "form__status is-success";
      }
    } catch (err) {
      if (formStatus) {
        formStatus.textContent =
          "Something went wrong sending the form. Please email me directly instead.";
        formStatus.className = "form__status is-error";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      }
    }
  });

  // Clear a field's error as soon as the visitor edits it.
  form.addEventListener("input", (e) => {
    if (e.target.matches("input, textarea") && e.target.getAttribute("aria-invalid") === "true") {
      setFieldError(e.target, "");
    }
  });
}

/* ─────────────────── micro-interactions (pointer devices) ─────────────── */
if (finePointer.matches && !reduced.matches) {
  // Magnetic buttons
  $$(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.28;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });

  // Spotlight border glow
  $$(".glow").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    });
  });

  // Subtle photo parallax
  const heroMedia = $(".hero__media .photo");
  if (heroMedia) {
    const hero = $("#home");
    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      heroMedia.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 10).toFixed(1)}px)`;
    });
    hero.addEventListener("pointerleave", () => {
      heroMedia.style.transform = "";
    });
  }
}

/* ──────────────────────────── print support ──────────────────────────── */
window.addEventListener("beforeprint", () => {
  $$("details").forEach((d) => {
    d.dataset.wasOpen = d.open ? "1" : "0";
    d.open = true;
  });
});
window.addEventListener("afterprint", () => {
  $$("details").forEach((d) => {
    d.open = d.dataset.wasOpen === "1";
  });
});
