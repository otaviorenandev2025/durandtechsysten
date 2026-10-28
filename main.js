/* ==========================================================
   DURAND TECH SYSTEN — interações do site
   Menu mobile, animações de entrada e ano automático.
   ========================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initializeMobileMenu();
  initializeRevealAnimations();
  setCurrentYear();
  initializeServiceLinks();
});

/** Controla a abertura e o fechamento da navegação mobile. */
function initializeMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");

  if (!toggle || !navigation) return;

  toggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  // Fecha o menu após selecionar uma seção.
  navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    });
  });

  // Fecha com Escape para melhorar a acessibilidade.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navigation.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    }
  });
}

/** Revela elementos quando entram na área visível da página. */
function initializeRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");

  // Fallback para navegadores sem suporte ao IntersectionObserver.
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((element) => observer.observe(element));
}

/** Atualiza automaticamente o ano no rodapé. */
function setCurrentYear() {
  const yearElement = document.querySelector("#current-year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();
}

/** Inclui o serviço escolhido no texto inicial da conversa via WhatsApp. */
function initializeServiceLinks() {
  const serviceLinks = document.querySelectorAll("[data-service]");
  const whatsappBase = "https://wa.me/53997073648?text=";

  serviceLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const service = link.dataset.service;
      const message = `Olá, Durand Tech Systen! Tenho interesse em: ${service}. Podemos conversar?`;
      link.href = `${whatsappBase}${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  });
}
/* Reinicia a animação da logo ao passar o mouse */
const logo = document.querySelector(".logo-d");

if (logo) {
    logo.addEventListener("mouseenter", () => {
        logo.style.animation = "none";

        // Força o navegador a recalcular a animação.
        void logo.offsetWidth;

        logo.style.animation =
            "logoEntrada 1.2s cubic-bezier(.16, 1, .3, 1) forwards";
    });
}