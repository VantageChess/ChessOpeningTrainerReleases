(function () {
  const config = window.APP_CONFIG || {};
  const translations = window.TRANSLATIONS || {};
  const defaultLanguage = "en";
  const languageSelect = document.getElementById("language-select");
  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const topbarActions = document.getElementById("topbar-actions");
  const latestVersionEl = document.getElementById("latest-version");
  const heroPhotoEl = document.querySelector(".hero-photo");
  const languageStorageKey = "chess-opening-trainer-language";
  const themeStorageKey = "chess-opening-trainer-theme";
  const navCollapseBreakpoint = 1180;
  const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

  function getReleasesUrl() {
    if (config.github && config.github.releasesUrl) {
      return config.github.releasesUrl;
    }

    const owner = config.github && config.github.owner ? config.github.owner : "";
    const repo = config.github && config.github.repo ? config.github.repo : "";
    return owner && repo ? `https://github.com/${owner}/${repo}/releases` : "#";
  }

  function getAssetUrl(fileName) {
    if (!fileName) {
      return "";
    }

    const owner = config.github && config.github.owner ? config.github.owner : "";
    const repo = config.github && config.github.repo ? config.github.repo : "";
    const version = config.github && config.github.latestVersion ? config.github.latestVersion : "";

    if (!owner || !repo || !version) {
      return "";
    }

    return `https://github.com/${owner}/${repo}/releases/download/${version}/${fileName}`;
  }

  function setLink(id, url, fallbackUrl) {
    const link = document.getElementById(id);
    if (!link) {
      return;
    }

    const resolvedUrl = url || fallbackUrl || "#";
    link.href = resolvedUrl;

    if (resolvedUrl === "#") {
      link.setAttribute("aria-disabled", "true");
      link.classList.add("is-disabled");
      return;
    }

    link.removeAttribute("aria-disabled");
    link.classList.remove("is-disabled");
  }

  function getValueByPath(source, path) {
    return path.split(".").reduce(function (acc, part) {
      if (!acc || typeof acc !== "object") {
        return undefined;
      }

      return acc[part];
    }, source);
  }

  function detectLanguage() {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved && translations[saved]) {
      return saved;
    }

    const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || defaultLanguage];

    for (const language of browserLanguages) {
      const normalized = String(language).slice(0, 2).toLowerCase();
      if (translations[normalized]) {
        return normalized;
      }
    }

    return defaultLanguage;
  }

  function setMenuOpen(isOpen) {
    if (!menuToggle || !topbarActions) {
      return;
    }

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    topbarActions.classList.toggle("is-open", isOpen);
  }

  function getStoredLanguagePreference() {
    const saved = window.localStorage.getItem(languageStorageKey);
    return saved && translations[saved] ? saved : null;
  }

  function getStoredThemePreference() {
    const saved = window.localStorage.getItem(themeStorageKey);
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  }

  function resolveTheme(themePreference) {
    if (themePreference === "light" || themePreference === "dark") {
      return themePreference;
    }

    return themeMedia.matches ? "dark" : "light";
  }

  function applyTheme(themePreference) {
    const resolvedTheme = resolveTheme(themePreference);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;

    if (themeToggle) {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
      themeToggle.setAttribute("aria-label", "Switch to " + nextTheme + " theme");
      themeToggle.setAttribute("title", "Switch to " + nextTheme + " theme");
    }
  }

  function applyTranslations(language) {
    const dictionary = translations[language] || translations[defaultLanguage] || {};
    const fallback = translations[defaultLanguage] || {};

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      const key = node.getAttribute("data-i18n");
      const value = getValueByPath(dictionary, key);
      const fallbackValue = getValueByPath(fallback, key);
      const resolved = value !== undefined ? value : fallbackValue;

      if (resolved !== undefined) {
        node.textContent = resolved;
      }
    });
  }

  function renderScreenshots(language) {
    const section = document.getElementById("screenshots");
    const grid = document.getElementById("screenshot-grid");
    if (!grid || !section) {
      return;
    }

    const screenshots = (Array.isArray(config.screenshots) ? config.screenshots : []).filter(function (shot) {
      return shot && shot.image;
    });

    grid.innerHTML = "";

    if (!screenshots.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    screenshots.forEach(function (shot) {
      const card = document.createElement("article");
      card.className = "screenshot-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "screenshot-media";

      const image = document.createElement("img");
      image.className = "screenshot-image";
      image.src = shot.image;
      image.alt = shot.title || config.appName || "Screenshot";
      image.loading = "lazy";
      imageWrap.appendChild(image);

      const title = shot.title ? document.createElement("h3") : null;
      if (title) {
        title.textContent = shot.title;
      }

      const description = shot.description ? document.createElement("p") : null;
      if (description) {
        description.textContent = shot.description;
      }

      card.appendChild(imageWrap);
      if (title) {
        card.appendChild(title);
      }
      if (description) {
        card.appendChild(description);
      }
      grid.appendChild(card);
    });
  }

  function applyConfig() {
    const releasesUrl = getReleasesUrl();
    const macUrl = getAssetUrl(config.assets && config.assets.macos);
    const debUrl = getAssetUrl(config.assets && config.assets.linuxDeb);
    const appImageUrl = getAssetUrl(config.assets && config.assets.linuxAppImage);
    const supportUrl = config.support && config.support.contactUrl ? config.support.contactUrl : "#";
    const supportLabel = config.support && config.support.contactLabel ? config.support.contactLabel : "";

    document.title = config.appName || "Chess Opening Trainer";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && config.shortDescription) {
      metaDescription.setAttribute("content", config.shortDescription);
    }

    if (latestVersionEl) {
      latestVersionEl.textContent = config.github && config.github.latestVersion ? config.github.latestVersion : "TBD";
    }

    const firstScreenshot = Array.isArray(config.screenshots) ? config.screenshots.find(function (shot) {
      return shot && shot.image;
    }) : null;
    if (heroPhotoEl && firstScreenshot && firstScreenshot.image) {
      heroPhotoEl.style.backgroundImage =
        "linear-gradient(180deg, rgba(5, 6, 7, 0.08), rgba(5, 6, 7, 0.48)), url('" + firstScreenshot.image + "')";
    }

    setLink("download-latest-link", releasesUrl, "#");
    setLink("topbar-releases-link", releasesUrl, "#");
    setLink("view-releases-link", releasesUrl, "#");
    setLink("closing-download-link", releasesUrl, "#");
    setLink("download-macos-link", macUrl, releasesUrl);
    setLink("download-linux-deb-link", debUrl, releasesUrl);
    setLink("download-linux-appimage-link", appImageUrl, releasesUrl);
    setLink("footer-releases-link", releasesUrl, "#");
    setLink("footer-support-link", supportUrl, "#");

    const supportLink = document.getElementById("footer-support-link");
    if (supportLink) {
      if (!supportUrl || supportUrl === "#") {
        supportLink.hidden = true;
      } else {
        supportLink.hidden = false;
      }
    }

    if (supportLink && supportLabel) {
      supportLink.title = supportLabel;
    }
  }

  function setLanguage(languagePreference, persist) {
    const selectedLanguage = languagePreference && translations[languagePreference] ? languagePreference : detectLanguage();

    if (persist) {
      window.localStorage.setItem(languageStorageKey, selectedLanguage);
    }

    if (languageSelect) {
      languageSelect.value = selectedLanguage;
    }

    applyTranslations(selectedLanguage);
    renderScreenshots(selectedLanguage);
  }

  applyConfig();

  applyTheme(getStoredThemePreference());
  setLanguage(getStoredLanguagePreference(), false);

  if (languageSelect) {
    languageSelect.addEventListener("change", function (event) {
      setLanguage(event.target.value, true);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const currentResolvedTheme = document.documentElement.getAttribute("data-theme") || resolveTheme("system");
      const nextTheme = currentResolvedTheme === "dark" ? "light" : "dark";
      window.localStorage.setItem(themeStorageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }

  themeMedia.addEventListener("change", function () {
    if (getStoredThemePreference() === "system") {
      applyTheme("system");
    }
  });

  if (menuToggle && topbarActions) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    topbarActions.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= navCollapseBreakpoint) {
          setMenuOpen(false);
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > navCollapseBreakpoint) {
        setMenuOpen(false);
      }
    });
  }
})();
