(function () {
  const config = window.WEDDING_CONFIG || {};
  const placeholderUrl = "COLE_AQUI_A_URL_DO_GOOGLE_APPS_SCRIPT";

  const form = document.querySelector("#rsvpForm");
  const statusEl = document.querySelector("#formStatus");
  const calendarLink = document.querySelector("#calendarLink");
  const mapLink = document.querySelector("#mapLink");
  const pageLoader = document.querySelector("#pageLoader");
  const entryScreen = document.querySelector("#entryScreen");
  const entryButton = document.querySelector("#entryButton");
  const petalTransition = document.querySelector("#petalTransition");
  const loaderStartedAt = performance.now();

  hideLoaderWhenReady();

  document.querySelectorAll("[data-config]").forEach((element) => {
    const key = element.dataset.config;
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      element.textContent = config[key];
    }
  });

  if (calendarLink) {
    const calendarUrl = buildCalendarUrl(config);
    if (calendarUrl) {
      calendarLink.href = calendarUrl;
    } else {
      calendarLink.hidden = true;
    }
  }

  if (mapLink) {
    if (config.mapsUrl) {
      mapLink.href = config.mapsUrl;
    } else {
      mapLink.hidden = true;
    }
  }

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  if (entryScreen && entryButton) {
    entryButton.addEventListener("click", enterInvitation);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      attendance: String(formData.get("attendance") || ""),
      guests: Number(formData.get("guests") || 0),
      message: String(formData.get("message") || "").trim(),
      createdAt: new Date().toISOString(),
      source: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (!payload.name || !payload.attendance) {
      setStatus("Preencha seu nome e escolha Sim ou Não.", true);
      return;
    }

    if (!config.scriptUrl || config.scriptUrl === placeholderUrl) {
      setStatus("Cole a URL do Google Apps Script no arquivo config.js.", true);
      return;
    }

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Enviando...";
    setStatus("Enviando sua resposta...", false);

    try {
      await fetch(config.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      form.reset();
      setStatus("Confirmação enviada. Obrigado!", false);
    } catch (error) {
      setStatus("Não foi possível enviar agora. Tente novamente em instantes.", true);
    } finally {
      button.disabled = false;
      button.textContent = "Enviar confirmação";
    }
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function hideLoaderWhenReady() {
    if (!pageLoader) {
      activateEntryScreen();
      return;
    }

    const minLoaderTime = 1250;
    const hideLoader = () => {
      const elapsed = performance.now() - loaderStartedAt;
      const delay = Math.max(0, minLoaderTime - elapsed);

      window.setTimeout(() => {
        playPetalTransition(32, 3200);
        pageLoader.classList.add("is-releasing");

        window.setTimeout(activateEntryScreen, 260);
        window.setTimeout(() => pageLoader.classList.add("is-hidden"), 620);
        window.setTimeout(() => pageLoader.remove(), 1600);
      }, delay);
    };

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader, { once: true });
    }
  }

  function activateEntryScreen() {
    if (!entryScreen) {
      document.body.classList.remove("has-entry-screen");
      return;
    }

    entryScreen.classList.add("is-active");
    window.setTimeout(() => entryScreen.classList.add("is-settled"), 1300);
  }

  function enterInvitation() {
    playPetalTransition(28, 3000);
    document.body.classList.add("is-revealing-invitation");
    entryScreen.classList.add("is-exiting");

    window.setTimeout(() => {
      entryScreen.remove();
      document.body.classList.remove("has-entry-screen");
      document.body.classList.remove("is-revealing-invitation");
    }, 1200);
  }

  function playPetalTransition(count, duration) {
    if (!petalTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    petalTransition.replaceChildren();
    petalTransition.classList.add("is-active");

    for (let index = 0; index < count; index += 1) {
      const petal = document.createElement("img");
      const width = randomNumber(24, 42);
      const delay = randomNumber(0, 620);
      const fallDuration = randomNumber(2600, 3900);

      petal.src = "assets/petala.svg";
      petal.alt = "";
      petal.className = "petal";
      petal.decoding = "async";
      petal.draggable = false;
      petal.style.setProperty("--petal-left", `${randomNumber(-4, 100)}vw`);
      petal.style.setProperty("--petal-width", `${width}px`);
      petal.style.setProperty("--petal-delay", `${delay}ms`);
      petal.style.setProperty("--petal-duration", `${fallDuration}ms`);
      petal.style.setProperty("--petal-opacity", String(randomNumber(78, 100) / 100));
      petal.style.setProperty("--petal-drift", `${randomNumber(-58, 58)}px`);

      petalTransition.append(petal);
    }

    window.setTimeout(() => {
      petalTransition.classList.remove("is-active");
      petalTransition.replaceChildren();
    }, duration);
  }

  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function buildCalendarUrl(eventConfig) {
    if (!eventConfig.calendar || !eventConfig.calendar.start || !eventConfig.calendar.end) {
      return "";
    }

    const dates = `${toGoogleDate(eventConfig.calendar.start)}/${toGoogleDate(
      eventConfig.calendar.end
    )}`;
    const details = `Casamento de ${eventConfig.coupleNames || "Noiva & Noivo"}`;
    const location = [
      eventConfig.ceremonyVenue,
      eventConfig.ceremonyAddress,
    ]
      .filter(Boolean)
      .join(" - ");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: details,
      dates,
      location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function toGoogleDate(value) {
    return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
})();
