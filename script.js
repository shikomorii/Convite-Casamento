(function () {
  const config = window.WEDDING_CONFIG || {};
  const placeholderUrl = "COLE_AQUI_A_URL_DO_GOOGLE_APPS_SCRIPT";

  const form = document.querySelector("#rsvpForm");
  const statusEl = document.querySelector("#formStatus");
  const calendarLink = document.querySelector("#calendarLink");
  const mapLink = document.querySelector("#mapLink");

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
