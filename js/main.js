(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const navEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navEntry?.type === "reload";

  if (isReload && window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }

  if (isReload || !window.location.hash) {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  const year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  const onScrollHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  const setMenu = (open) => {
    if (!menuBtn || !mobileNav) return;
    menuBtn.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };

  menuBtn?.addEventListener("click", () => {
    setMenu(mobileNav?.hidden ?? true);
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const wireLogo = (img, fallback) => {
    if (!img) return;
    const showFallback = () => {
      img.classList.remove("is-ready");
      fallback?.classList.remove("is-hidden");
    };
    const showLogo = () => {
      img.classList.add("is-ready");
      fallback?.classList.add("is-hidden");
    };

    img.addEventListener("error", showFallback);
    img.addEventListener("load", showLogo);

    if (img.complete && img.naturalWidth > 0) showLogo();
    else if (img.complete) showFallback();
  };

  wireLogo(
    document.getElementById("brand-logo"),
    document.getElementById("brand-fallback")
  );
  wireLogo(
    document.getElementById("footer-logo"),
    document.getElementById("footer-fallback")
  );

  const pillSection = document.querySelector(".pill-scroll");
  const pillTrack = document.getElementById("pill-track");
  const pillTexts = [...document.querySelectorAll("#pill-texts h3")];
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const syncPillScroll = () => {
    if (!pillSection || !pillTrack) return;

    const slides = pillTrack.querySelectorAll(".pill-slide");
    if (!slides.length) return;

    const slideHeight = slides[0].offsetHeight;
    const maxTranslate = slideHeight * (slides.length - 1);
    const total = Math.max(pillSection.offsetHeight - window.innerHeight, 1);
    const scrolled = Math.min(
      Math.max(-pillSection.getBoundingClientRect().top, 0),
      total
    );
    const progress = reduceMotion ? 0 : scrolled / total;

    pillTrack.style.transform = `translate3d(0, ${-progress * maxTranslate}px, 0)`;

    const idx = Math.min(
      pillTexts.length - 1,
      Math.floor(progress * pillTexts.length + Number.EPSILON)
    );
    pillTexts.forEach((el, i) => {
      el.classList.toggle("is-active", i === idx);
    });
  };

  syncPillScroll();
  window.addEventListener("scroll", syncPillScroll, { passive: true });
  window.addEventListener("resize", syncPillScroll);
})();
