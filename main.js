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
  initializeServiceTerminal();
  initializeQuoteChat();
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

/** Digita o comando ilustrativo quando o terminal entra na área visível. */
function initializeServiceTerminal() {
  const command = document.querySelector("[data-terminal-command]");
  if (!command || !("IntersectionObserver" in window)) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fullCommand = command.textContent;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (motion.matches) return;

    let length = 0;
    command.textContent = "";
    const timer = window.setInterval(() => {
      length = motion.matches ? fullCommand.length : length + 1;
      command.textContent = fullCommand.slice(0, length);
      if (length === fullCommand.length) window.clearInterval(timer);
    }, 65);
  }, { threshold: 0.5 });

  observer.observe(command.closest(".service-terminal"));
}

const quoteServices = [
  {
    label: "Sites e landing pages",
    keywords: /\b(sites?|landing(?: pages?)?|loja virtual|e commerce|pagina web|paginas web|website)\b/,
    price: "A partir de R$ 990,00",
    question: "Qual é o objetivo do site? Se já souber, diga quantas páginas ou quais recursos precisa."
  },
  {
    label: "Sistemas sob medida",
    keywords: /\b(sistemas?|erp|crm|painel de gestao|software sob medida)\b/,
    price: "R$ 3.500,00",
    question: "Que processo o sistema precisa organizar? Diga quem vai usar e o que precisa fazer."
  },
  {
    label: "Automações e Python",
    keywords: /\b(automacao|automacoes|automatizar|automatize|python|scripts?|robos?)\b/,
    price: "R$ 3.800,00",
    question: "Qual tarefa você quer automatizar? Conte como ela é feita hoje."
  },
  {
    label: "Suporte e manutenção",
    keywords: /\b(suporte|manutencao|conserto|assistencia|formatacao|formatar|reparo)\b/,
    question: "Qual problema você precisa resolver ou o que deseja manter funcionando?",
    plans: [
      { label: "Mensal", price: "R$ 150,00 por mês", keywords: /\b(mensal|mes|mensalidade|por mes)\b/ },
      { label: "Por hora", price: "R$ 89,90 por hora", keywords: /\b(hora|horas|avulso por hora)\b/ },
      { label: "Por atendimento", price: "R$ 100,00 por atendimento", keywords: /\b(atendimento|visita|chamado|pontual)\b/ }
    ]
  },
  {
    label: "Aplicativo Android",
    keywords: /\b(android|apps?|aplicativos?|play store)\b/,
    price: "R$ 3.800,00",
    question: "O que o aplicativo Android deve fazer? Conte quais funções são mais importantes."
  }
];

function normalizeQuoteText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, " ");
}

/** Coleta o escopo e prepara o orçamento para revisão e envio pelo cliente. */
function initializeQuoteChat() {
  const dialog = document.querySelector("#quote-chat");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const form = dialog.querySelector(".quote-form");
  const input = form.elements.reply;
  const label = form.querySelector("label");
  const messages = dialog.querySelector(".quote-messages");
  const options = dialog.querySelector(".quote-options");
  const content = dialog.querySelector(".quote-content");
  const close = dialog.querySelector(".quote-close");
  let opener;
  let service;
  let plan;
  let request;
  let details;
  let onReply;
  let started = false;

  function scrollToLatest() {
    content.scrollTop = content.scrollHeight;
  }

  function message(text, customer = false) {
    const line = document.createElement("p");
    line.className = customer ? "quote-message quote-message-customer" : "quote-message";
    line.textContent = text;
    messages.append(line);
    scrollToLatest();
  }

  function option(text, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", action);
    options.append(button);
  }

  function ask(prompt, fieldLabel, handler) {
    options.replaceChildren();
    form.hidden = false;
    label.textContent = fieldLabel;
    input.value = "";
    onReply = handler;
    message(prompt);
    if (dialog.open) input.focus({ preventScroll: true });
  }

  function start() {
    started = true;
    messages.replaceChildren();
    service = plan = request = details = null;
    selectService(quoteServices, "Olá! Conte o que você precisa ou escolha um serviço.");
  }

  function selectService(choices, prompt) {
    ask(prompt, "Descreva o que você precisa", (text) => {
      const normalized = normalizeQuoteText(text);
      const matches = quoteServices.filter((item) => item.keywords.test(normalized));
      request = text;
      if (matches.length === 1) {
        chooseService(matches[0]);
        return;
      }
      selectService(
        matches.length ? matches : quoteServices,
        matches.length
          ? "Encontrei mais de um serviço. Qual você quer orçar primeiro?"
          : "Qual destes serviços se aproxima mais do que você procura?"
      );
    });
    choices.forEach((item) => option(item.label, () => {
      message(item.label, true);
      chooseService(item);
    }));
    scrollToLatest();
  }

  function chooseService(item) {
    service = item;
    if (!item.plans) {
      askDetails();
      return;
    }
    const specified = item.plans.filter((mode) => mode.keywords.test(normalizeQuoteText(request || "")));
    if (specified.length === 1) {
      plan = specified[0];
      message(plan.label + " · " + plan.price);
      askDetails();
      return;
    }
    askPlan();
  }

  function askPlan() {
    ask("Como prefere contratar o suporte?", "Modalidade de suporte", (text) => {
      const matches = service.plans.filter((mode) => mode.keywords.test(normalizeQuoteText(text)));
      if (matches.length !== 1) {
        askPlan();
        return;
      }
      plan = matches[0];
      askDetails();
    });
    service.plans.forEach((mode) => option(mode.label + " · " + mode.price, () => {
      message(mode.label, true);
      plan = mode;
      askDetails();
    }));
    scrollToLatest();
  }

  function askDetails(existing = request || "") {
    ask(service.question, "Detalhes do projeto", (text) => {
      details = text;
      askDeadline();
    });
    input.value = existing;
    if (existing) input.setSelectionRange(existing.length, existing.length);
  }

  function askDeadline() {
    ask("Para quando você precisa?", "Prazo desejado", review);
    option("Ainda não tenho prazo", () => {
      message("Ainda não tenho prazo", true);
      review("A definir");
    });
    scrollToLatest();
  }

  function review(deadline) {
    const price = plan ? plan.price : service.price;
    const summary = [
      `Serviço: ${service.label}${plan ? " — " + plan.label : ""}`,
      `Previsão de preço: ${price}`,
      `Pedido: ${details}`,
      `Prazo desejado: ${deadline}`
    ].join("\n");
    options.replaceChildren();
    form.hidden = true;
    onReply = null;
    message(summary + "\n\nConfira o pedido. O valor final será confirmado após a análise do escopo.");

    const confirm = document.createElement("a");
    confirm.className = "quote-confirm";
    confirm.href = "https://wa.me/5553997073648?text=" + encodeURIComponent(
      "Olá, Durand Tech Systen! Revisei este pedido e gostaria de confirmar o orçamento.\n\n" + summary
    );
    confirm.target = "_blank";
    confirm.rel = "noopener noreferrer";
    confirm.textContent = "Confirmar e abrir WhatsApp";
    message("No WhatsApp, toque em Enviar para concluir.");
    options.append(confirm);
    option("Editar detalhes", () => askDetails(details));
    option("Novo orçamento", start);
    confirm.focus({ preventScroll: true });
    scrollToLatest();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || !onReply) return;
    message(text, true);
    onReply(text);
  });

  document.querySelectorAll("[data-open-quote]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      opener = link;
      dialog.showModal();
      if (!started) start();
      if (!form.hidden) input.focus({ preventScroll: true });
      scrollToLatest();
    });
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (opener && opener.getClientRects().length) opener.focus();
    else document.querySelector(".menu-toggle")?.focus();
  });
}
