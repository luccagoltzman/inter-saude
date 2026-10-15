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

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const pillSection = document.querySelector(".pill-scroll");
  const pillTrack = document.getElementById("pill-track");
  const pillTexts = [...document.querySelectorAll("#pill-texts h3")];

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

  const diffPin = document.querySelector(".diff-pin");
  const diffTrack = document.getElementById("diff-track");
  const diffPanels = [...document.querySelectorAll("[data-diff-panel]")];
  const diffDots = document.getElementById("diff-dots");

  if (diffDots && diffPanels.length) {
    diffDots.innerHTML = diffPanels
      .map((_, i) => `<span${i === 0 ? ' class="is-active"' : ""}></span>`)
      .join("");
  }

  const syncDiffScroll = () => {
    if (!diffPin || !diffTrack || !diffPanels.length) return;

    const total = Math.max(diffPin.offsetHeight - window.innerHeight, 1);
    const scrolled = Math.min(
      Math.max(-diffPin.getBoundingClientRect().top, 0),
      total
    );
    const progress = reduceMotion ? 0 : scrolled / total;

    // Alinha o início do último card à esquerda da área útil (ignora padding do viewport)
    const last = diffPanels[diffPanels.length - 1];
    const maxTranslate = Math.max(0, last.offsetLeft);

    diffTrack.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;

    const idx = Math.min(
      diffPanels.length - 1,
      Math.round(progress * (diffPanels.length - 1))
    );

    const dots = diffDots ? [...diffDots.children] : [];
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === idx);
    });
  };

  // Cards já nascem visíveis (texto/imagem não ficam opacity:0 esperando scroll)
  diffPanels.forEach((panel) => panel.classList.add("is-visible"));

  const onScrollSync = () => {
    syncPillScroll();
    syncDiffScroll();
  };

  onScrollSync();
  window.addEventListener("scroll", onScrollSync, { passive: true });
  window.addEventListener("resize", onScrollSync);

  // --- Polimento: cursor customizado, botões magnéticos, glow e tilt 3D ---
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (!reduceMotion && !isCoarsePointer) {
    const cursorDot = document.getElementById("cursor-dot");
    if (cursorDot) {
      window.addEventListener(
        "pointermove",
        (e) => {
          cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          cursorDot.classList.add("is-active");
        },
        { passive: true }
      );
      document.querySelectorAll("a, button, #hero-canvas").forEach((el) => {
        el.addEventListener("pointerenter", () => cursorDot.classList.add("is-hover"));
        el.addEventListener("pointerleave", () => cursorDot.classList.remove("is-hover"));
      });
    }

    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });

    document.querySelectorAll(".glow-reactive").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tiltY", `${px * 14}deg`);
        card.style.setProperty("--tiltX", `${-py * 14}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tiltX", "0deg");
        card.style.setProperty("--tiltY", "0deg");
      });
    });
  }

  // --- Depoimentos: navegação da faixa horizontal (setas + dots) ---
  const testimonialsTrack = document.getElementById("testimonials-track");
  const testimonialPrev = document.getElementById("testimonial-prev");
  const testimonialNext = document.getElementById("testimonial-next");
  const testimonialDotsEl = document.getElementById("testimonial-dots");
  const testimonialPanels = testimonialsTrack
    ? [...testimonialsTrack.querySelectorAll(".testimonial-panel")]
    : [];

  if (testimonialsTrack && testimonialPanels.length) {
    if (testimonialDotsEl) {
      testimonialDotsEl.innerHTML = testimonialPanels
        .map((_, i) => `<span${i === 0 ? ' class="is-active"' : ""}></span>`)
        .join("");
    }
    const dots = testimonialDotsEl ? [...testimonialDotsEl.children] : [];

    const scrollToPanel = (index) => {
      const panel = testimonialPanels[index];
      if (!panel) return;
      testimonialsTrack.scrollTo({
        left: panel.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };

    const getActiveIndex = () => {
      const { scrollLeft } = testimonialsTrack;
      let closest = 0;
      let closestDist = Infinity;
      testimonialPanels.forEach((panel, i) => {
        const dist = Math.abs(panel.offsetLeft - scrollLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      return closest;
    };

    const updateNav = () => {
      const max = testimonialsTrack.scrollWidth - testimonialsTrack.clientWidth - 1;
      testimonialPrev?.toggleAttribute("disabled", testimonialsTrack.scrollLeft <= 1);
      testimonialNext?.toggleAttribute("disabled", testimonialsTrack.scrollLeft >= max);

      const active = getActiveIndex();
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
    };

    testimonialPrev?.addEventListener("click", () => {
      scrollToPanel(Math.max(0, getActiveIndex() - 1));
    });
    testimonialNext?.addEventListener("click", () => {
      scrollToPanel(Math.min(testimonialPanels.length - 1, getActiveIndex() + 1));
    });

    let updateNavFrame = null;
    const scheduleUpdateNav = () => {
      if (updateNavFrame) cancelAnimationFrame(updateNavFrame);
      updateNavFrame = requestAnimationFrame(updateNav);
    };

    updateNav();
    testimonialsTrack.addEventListener("scroll", scheduleUpdateNav, { passive: true });
    window.addEventListener("resize", scheduleUpdateNav);

    // Recalcula ao entrar na viewport: evita ficar com estado desatualizado
    // caso o layout mude enquanto a seção ainda não era visível.
    if ("IntersectionObserver" in window) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) scheduleUpdateNav();
        });
      }, { threshold: 0.1 });
      navObserver.observe(testimonialsTrack);
    }
  }

  // --- FAQ accordion ---
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn?.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // --- Formulário de lead: Formspree + fallback mailto, nunca perde o lead ---
  const leadForm = document.getElementById("lead-form");
  const leadStatus = document.getElementById("lead-form-status");
  const leadSubmit = document.getElementById("lead-submit");
  const leadLabel = leadSubmit?.querySelector(".btn-label");

  leadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!leadForm.reportValidity()) return;

    const formData = new FormData(leadForm);
    const nome = String(formData.get("nome") || "").trim();
    const whatsapp = String(formData.get("whatsapp") || "").trim();
    const originalLabel = leadLabel?.textContent;

    leadSubmit?.setAttribute("aria-busy", "true");
    leadSubmit?.setAttribute("disabled", "true");
    if (leadLabel) leadLabel.textContent = "Enviando…";
    if (leadStatus) {
      leadStatus.textContent = "";
      leadStatus.classList.remove("is-error");
    }

    try {
      const response = await fetch(leadForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Formspree respondeu com erro");

      // Evento de conversão é disparado em obrigado.html (ponto de disparo mais
      // confiável, página de destino) para não contar o lead duas vezes.
      const params = new URLSearchParams({ nome, tel: whatsapp });
      window.location.href = `obrigado.html?${params.toString()}`;
      return;
    } catch (err) {
      const body = [...formData.entries()]
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      const mailto = `mailto:contato@intersaude.com.br?subject=${encodeURIComponent(
        "Novo lead — site InterSaúde"
      )}&body=${encodeURIComponent(body)}`;

      if (leadStatus) {
        leadStatus.textContent =
          "Não foi possível enviar automaticamente. Abrindo seu e-mail com os dados preenchidos — é só enviar.";
        leadStatus.classList.add("is-error");
      }
      window.location.href = mailto;
    } finally {
      leadSubmit?.removeAttribute("aria-busy");
      leadSubmit?.removeAttribute("disabled");
      if (leadLabel && originalLabel) leadLabel.textContent = originalLabel;
    }
  });
})();
