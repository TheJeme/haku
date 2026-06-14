    const STORAGE_KEY = "haku.settings.v3";
    const THEME_META_COLORS = {
      auto: "#e3e3e3",
      ink: "#e3e3e3",
      paper: "#dcc8a8",
      stone: "#d5dcdb",
      matcha: "#c7d9bc",
      dawn: "#dfb6a5",
      night: "#202423",
      contrast: "#ffffff"
    };

    const BUILT_IN_ENGINES = {
      google: {
        name: "Google",
        aliases: ["g", "google"],
        shortcut: "g",
        icon: "assets/google.svg",
        url: "https://www.google.com/search?q={query}"
      },
      bing: {
        name: "Bing",
        aliases: ["b", "bing"],
        shortcut: "b",
        icon: "assets/bing.svg",
        url: "https://www.bing.com/search?q={query}"
      },
      brave: {
        name: "Brave",
        aliases: ["br", "brave"],
        shortcut: "v",
        icon: "assets/brave.svg",
        url: "https://search.brave.com/search?q={query}"
      },
      duckduckgo: {
        name: "DuckDuckGo",
        aliases: ["d", "ddg", "duck"],
        shortcut: "d",
        icon: "assets/duckduckgo.svg",
        url: "https://duckduckgo.com/?q={query}"
      },
      ecosia: {
        name: "Ecosia",
        aliases: ["e", "eco", "ecosia"],
        shortcut: "e",
        icon: "assets/ecosia.svg",
        url: "https://www.ecosia.org/search?q={query}"
      },
      startpage: {
        name: "Startpage",
        aliases: ["s", "sp", "start"],
        shortcut: "s",
        icon: "assets/startpage.svg",
        url: "https://www.startpage.com/sp/search?query={query}"
      },
      kagi: {
        name: "Kagi",
        aliases: ["k", "kagi"],
        shortcut: "k",
        icon: "assets/kagi.svg",
        url: "https://kagi.com/search?q={query}"
      },
      yandex: {
        name: "Yandex",
        aliases: ["y", "ya", "yandex"],
        shortcut: "x",
        icon: "assets/yandex.svg",
        url: "https://yandex.com/search/?text={query}"
      },
      youtube: {
        name: "YouTube",
        aliases: ["yt", "youtube", "video"],
        shortcut: "y",
        icon: "assets/youtube.svg",
        url: "https://www.youtube.com/results?search_query={query}"
      },
      reddit: {
        name: "Reddit",
        aliases: ["r", "reddit"],
        shortcut: "r",
        icon: "assets/reddit.svg",
        url: "https://www.reddit.com/search/?q={query}"
      },
      wikipedia: {
        name: "Wikipedia",
        aliases: ["w", "wiki", "wp"],
        shortcut: "w",
        icon: "assets/wikipedia.svg",
        url: "https://en.wikipedia.org/w/index.php?search={query}"
      },
      github: {
        name: "GitHub",
        aliases: ["gh", "github", "git"],
        shortcut: "h",
        icon: "assets/github.svg",
        url: "https://github.com/search?q={query}"
      }
    };

    let ENGINES = { ...BUILT_IN_ENGINES };

    const DEFAULT_SETTINGS = {
      activeEngine: "duckduckgo",
      defaultEngine: "duckduckgo",
      enabledEngines: ["duckduckgo", "google", "youtube", "reddit"],
      engineOrder: ["duckduckgo", "google", "bing", "brave", "ecosia", "startpage", "kagi", "yandex", "youtube", "reddit", "wikipedia", "github"],
      customEngines: [],
      themeMode: "auto",
      clockMode: "digital",
      timeFormat: "24",
      dateFormat: "short-weekday",
      suggestionsEnabled: true,
      suggestionSource: "general",
      searchHistoryEnabled: false,
      searchHistory: [],
      weatherEnabled: true,
      weatherCity: "",
      weatherUnits: "celsius",
      links: []
    };

    const state = {
      settings: loadSettings(),
      weatherAbort: null,
      suggestAbort: null,
      suggestTimer: null,
      suggestions: [],
      suggestionContext: null,
      suggestionIndex: -1,
      suggestRequestId: 0,
      drag: null
    };

    const dom = {
      clockZone: document.getElementById("clockZone"),
      enginePicker: document.getElementById("enginePicker"),
      enginePickerButton: document.getElementById("enginePickerButton"),
      enginePickerIcon: document.getElementById("enginePickerIcon"),
      engineMenu: document.getElementById("engineMenu"),
      searchForm: document.getElementById("searchForm"),
      searchInput: document.getElementById("searchInput"),
      suggestionMenu: document.getElementById("suggestionMenu"),
      weatherRow: document.getElementById("weatherRow"),
      weather: document.getElementById("weather"),
      links: document.getElementById("links"),
      openSettings: document.getElementById("openSettings"),
      settingsDialog: document.getElementById("settingsDialog"),
      clockMode: document.getElementById("clockMode"),
      timeFormat: document.getElementById("timeFormat"),
      dateFormat: document.getElementById("dateFormat"),
      themeMode: document.getElementById("themeMode"),
      suggestionsEnabled: document.getElementById("suggestionsEnabled"),
      suggestionSource: document.getElementById("suggestionSource"),
      searchHistoryEnabled: document.getElementById("searchHistoryEnabled"),
      engineSettings: document.getElementById("engineSettings"),
      weatherEnabled: document.getElementById("weatherEnabled"),
      weatherCity: document.getElementById("weatherCity"),
      weatherUnits: document.getElementById("weatherUnits"),
      shortcutList: document.getElementById("shortcutList"),
      customEngineList: document.getElementById("customEngineList"),
      customEngineName: document.getElementById("customEngineName"),
      customEngineUrl: document.getElementById("customEngineUrl"),
      customEnginePrefix: document.getElementById("customEnginePrefix"),
      customEngineShortcut: document.getElementById("customEngineShortcut"),
      customEngineError: document.getElementById("customEngineError"),
      addCustomEngine: document.getElementById("addCustomEngine"),
      linkList: document.getElementById("linkList"),
      addLink: document.getElementById("addLink"),
      resetSettings: document.getElementById("resetSettings")
    };

    function loadSettings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return cloneDefaults();
        const parsed = JSON.parse(raw);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        merged.customEngines = sanitizeCustomEngines(merged.customEngines);
        refreshEngines(merged.customEngines);
        merged.engineOrder = sanitizeEngineOrder(merged.engineOrder, merged.enabledEngines);
        merged.enabledEngines = orderEnabledEngines(sanitizeEnabledEngines(merged.enabledEngines), merged.engineOrder);
        merged.defaultEngine = ENGINES[merged.defaultEngine] ? merged.defaultEngine : "google";
        merged.activeEngine = ENGINES[merged.activeEngine] ? merged.activeEngine : merged.defaultEngine;
        merged.themeMode = sanitizeThemeMode(merged.themeMode);
        merged.dateFormat = sanitizeDateFormat(merged.dateFormat);
        merged.suggestionsEnabled = merged.suggestionsEnabled !== false;
        merged.suggestionSource = sanitizeSuggestionSource(merged.suggestionSource);
        merged.searchHistoryEnabled = merged.searchHistoryEnabled === true;
        merged.searchHistory = sanitizeSearchHistory(merged.searchHistory);
        merged.weatherEnabled = merged.weatherEnabled !== false;
        if (!merged.enabledEngines.includes(merged.activeEngine)) merged.activeEngine = merged.defaultEngine;
        if (!merged.enabledEngines.includes(merged.defaultEngine)) merged.defaultEngine = merged.enabledEngines[0];
        merged.links = sanitizeLinks(merged.links);
        return merged;
      } catch {
        return cloneDefaults();
      }
    }

    function cloneDefaults() {
      refreshEngines([]);
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    function saveSettings() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
    }

    function refreshEngines(customEngines = state.settings?.customEngines || []) {
      ENGINES = { ...BUILT_IN_ENGINES };
      sanitizeCustomEngines(customEngines).forEach((engine) => {
        ENGINES[engine.id] = {
          name: engine.name,
          aliases: engine.aliases,
          shortcut: engine.shortcut,
          icon: "favicon.svg",
          url: engine.url,
          custom: true
        };
      });
    }

    function sanitizeCustomEngines(value) {
      if (!Array.isArray(value)) return [];
      const usedIds = new Set(Object.keys(BUILT_IN_ENGINES));
      return value
        .map((engine) => {
          const name = String(engine.name || "").trim().slice(0, 32);
          const url = String(engine.url || "").trim();
          if (!name || !isSafeSearchUrl(url)) return null;

          const baseId = String(engine.id || "").startsWith("custom-") ? slugify(engine.id) : `custom-${slugify(name)}`;
          let id = baseId;
          let suffix = 2;
          while (usedIds.has(id)) {
            id = `${baseId}-${suffix}`;
            suffix += 1;
          }
          usedIds.add(id);

          const prefix = String(engine.prefix || engine.aliases?.[0] || "").trim().toLowerCase().replace(/^[/!]+/, "");
          const aliases = Array.from(new Set([prefix, slugify(name)].filter(Boolean)));
          const shortcut = String(engine.shortcut || "").trim().toLowerCase().match(/^[a-z0-9]$/)?.[0] || "";

          return { id, name, url, prefix, aliases, shortcut };
        })
        .filter(Boolean);
    }

    function slugify(value) {
      return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    function isSafeSearchUrl(value) {
      if (!value.includes("{query}")) return false;
      return isSafeUrl(value.replace("{query}", "test"));
    }

    function sanitizeEnabledEngines(value) {
      const list = Array.isArray(value) ? value.filter((key) => ENGINES[key]) : [];
      return list.length ? Array.from(new Set(list)) : ["google"];
    }

    function sanitizeEngineOrder(value, preferred = []) {
      const order = [];
      const source = Array.isArray(value) && value.length ? value : preferred;
      [...source, ...Object.keys(ENGINES)].forEach((key) => {
        if (ENGINES[key] && !order.includes(key)) order.push(key);
      });
      return order;
    }

    function orderEnabledEngines(enabled, order) {
      const enabledSet = new Set(sanitizeEnabledEngines(enabled));
      return sanitizeEngineOrder(order).filter((key) => enabledSet.has(key));
    }

    function sanitizeSuggestionSource(value) {
      return value === "current" ? "current" : "general";
    }

    function sanitizeThemeMode(value) {
      return ["auto", "ink", "paper", "stone", "matcha", "dawn", "contrast"].includes(value) ? value : "auto";
    }

    function sanitizeDateFormat(value) {
      return ["short-weekday", "long-weekday", "numeric-us", "numeric-eu", "numeric-dotted", "iso"].includes(value) ? value : "short-weekday";
    }

    function sanitizeSearchHistory(value) {
      if (!Array.isArray(value)) return [];
      const seen = new Set();
      return value
        .map((item) => String(item || "").trim())
        .filter((item) => {
          const key = item.toLowerCase();
          if (!item || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 20);
    }

    function sanitizeLinks(value) {
      if (!Array.isArray(value)) return [];
      return value
        .map((link) => ({
          name: String(link.name || "").trim(),
          url: String(link.url || "").trim()
        }))
        .filter((link) => link.name && isSafeUrl(link.url));
    }

    function isSafeUrl(value) {
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    }

    function updateSettings(next) {
      state.settings = { ...state.settings, ...next };
      state.settings.customEngines = sanitizeCustomEngines(state.settings.customEngines);
      refreshEngines(state.settings.customEngines);
      state.settings.themeMode = sanitizeThemeMode(state.settings.themeMode);
      state.settings.dateFormat = sanitizeDateFormat(state.settings.dateFormat);
      state.settings.suggestionsEnabled = state.settings.suggestionsEnabled !== false;
      state.settings.suggestionSource = sanitizeSuggestionSource(state.settings.suggestionSource);
      state.settings.searchHistoryEnabled = state.settings.searchHistoryEnabled === true;
      state.settings.searchHistory = sanitizeSearchHistory(state.settings.searchHistory);
      state.settings.weatherEnabled = state.settings.weatherEnabled !== false;
      state.settings.engineOrder = sanitizeEngineOrder(state.settings.engineOrder, state.settings.enabledEngines);
      state.settings.enabledEngines = orderEnabledEngines(state.settings.enabledEngines, state.settings.engineOrder);
      if (!state.settings.enabledEngines.includes(state.settings.defaultEngine)) {
        state.settings.defaultEngine = state.settings.enabledEngines[0];
      }
      if (!state.settings.enabledEngines.includes(state.settings.activeEngine)) {
        state.settings.activeEngine = state.settings.defaultEngine;
      }
      saveSettings();
      render();
    }

    function render() {
      applyTheme();
      renderClock();
      renderEngines();
      renderLinks();
      renderSettings();
    }

    function applyTheme() {
      const theme = resolveTheme(state.settings.themeMode);
      document.documentElement.dataset.theme = theme;
      document.body.dataset.theme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_META_COLORS[theme]);
    }

    function resolveTheme(themeMode) {
      const theme = sanitizeThemeMode(themeMode);
      if (theme === "auto") {
        return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "night" : "ink";
      }
      return theme;
    }

    function renderClock() {
      if (state.settings.clockMode === "none") {
        dom.clockZone.innerHTML = "";
        return;
      } else if (state.settings.clockMode === "analog") {
        dom.clockZone.innerHTML = renderManualClock();
      } else {
        dom.clockZone.innerHTML = `
          <div class="digital-clock" aria-live="polite">
            <div class="time" id="timeText"></div>
            <div class="date" id="dateText"></div>
          </div>
        `;
      }
      updateClock();
    }

    function renderManualClock() {
      return `
        <svg class="analog-clock" viewBox="0 0 200 200" aria-labelledby="manualClockTitle" role="img">
          <title id="manualClockTitle">Manual clock</title>
          <circle class="clock-face" cx="100" cy="100" r="94" />
          ${renderClockTicks()}
          <line class="hand hand-tail hour" id="hourTail" x1="100" y1="100" x2="100" y2="113" />
          <line class="hand hour" id="hourHand" x1="100" y1="100" x2="100" y2="62" />
          <line class="hand hand-tail minute" id="minuteTail" x1="100" y1="100" x2="100" y2="118" />
          <line class="hand minute" id="minuteHand" x1="100" y1="100" x2="100" y2="42" />
          <line class="hand second" id="secondHand" x1="100" y1="116" x2="100" y2="34" />
          <circle class="clock-pin-ring" cx="100" cy="100" r="6.5" />
          <circle class="clock-pin" cx="100" cy="100" r="3.2" />
        </svg>
      `;
    }

    function renderClockTicks() {
      return Array.from({ length: 60 }, (_, index) => {
        const isHour = index % 5 === 0;
        const outer = pointOnClock(index * 6, 88);
        const inner = pointOnClock(index * 6, isHour ? 77 : 83);
        const className = isHour ? "tick major" : "tick";
        return `<line class="${className}" x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}" />`;
      }).join("");
    }

    function pointOnClock(angle, radius) {
      const radians = (angle - 90) * Math.PI / 180;
      return {
        x: (100 + Math.cos(radians) * radius).toFixed(2),
        y: (100 + Math.sin(radians) * radius).toFixed(2)
      };
    }

    function updateClock() {
      if (state.settings.clockMode === "none") return;
      const now = new Date();

      if (state.settings.clockMode === "analog") {
        const second = now.getSeconds() + now.getMilliseconds() / 1000;
        const minute = now.getMinutes() + second / 60;
        const hour = (now.getHours() % 12) + minute / 60;
        const hourAngle = hour * 30;
        const minuteAngle = minute * 6;
        const secondAngle = second * 6;
        const manualTitle = document.getElementById("manualClockTitle");
        const hourHand = document.getElementById("hourHand");
        const hourTail = document.getElementById("hourTail");
        const minuteHand = document.getElementById("minuteHand");
        const minuteTail = document.getElementById("minuteTail");
        const secondHand = document.getElementById("secondHand");

        if (!hourHand || !hourTail || !minuteHand || !minuteTail || !secondHand) return;

        hourHand.setAttribute("transform", `rotate(${hourAngle} 100 100)`);
        hourTail.setAttribute("transform", `rotate(${hourAngle} 100 100)`);
        minuteHand.setAttribute("transform", `rotate(${minuteAngle} 100 100)`);
        minuteTail.setAttribute("transform", `rotate(${minuteAngle} 100 100)`);
        secondHand.setAttribute("transform", `rotate(${secondAngle} 100 100)`);

        if (manualTitle) {
          manualTitle.textContent = new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: state.settings.timeFormat === "12"
          }).format(now);
        }
        return;
      }

      const hour12 = state.settings.timeFormat === "12";
      document.getElementById("timeText").textContent = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12
      }).format(now);
      document.getElementById("dateText").textContent = formatDate(now, state.settings.dateFormat);
    }

    function formatDate(date, format) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      if (format === "numeric-us") return `${month}/${day}/${year}`;
      if (format === "numeric-eu") return `${day}/${month}/${year}`;
      if (format === "numeric-dotted") return `${date.getDate()}.${date.getMonth() + 1}.${year}`;
      if (format === "iso") return `${year}-${month}-${day}`;

      if (format === "long-weekday") {
        return new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric"
        }).format(date);
      }

      return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      }).format(date);
    }

    function renderEngines() {
      const active = state.settings.activeEngine;
      const activeEngine = ENGINES[active] || ENGINES.google;
      dom.enginePickerIcon.src = activeEngine.icon;
      dom.enginePickerButton.title = activeEngine.name;
      dom.enginePickerButton.setAttribute("aria-label", `Search with ${activeEngine.name}`);
      dom.engineMenu.innerHTML = orderEnabledEngines(state.settings.enabledEngines, state.settings.engineOrder).map((key, index) => {
        const engine = ENGINES[key];
        const selected = key === active ? " is-active" : "";
        const shortcuts = [];
        if (index < 9) shortcuts.push(`Alt+${index + 1}`);
        if (engine.shortcut) shortcuts.push(`Alt+${engine.shortcut.toUpperCase()}`);
        return `
          <button class="engine-option${selected}" type="button" role="option" data-engine="${key}" aria-selected="${key === active}" title="${shortcuts.join(" / ")}">
            <img src="${engine.icon}" alt="" />
            <span>${engine.name}</span>
          </button>
        `;
      }).join("");
    }

    function renderLinks() {
      const links = sanitizeLinks(state.settings.links);
      dom.links.innerHTML = links.map((link) => `<a href="${escapeAttribute(link.url)}">${escapeHtml(link.name)}</a>`).join("");
    }

    function shortcutRows(items) {
      return items.map((item) => `
        <div class="shortcut-item">
          <kbd>${escapeHtml(item.keys)}</kbd>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join("");
    }

    function shortcutGroup(title, items) {
      if (!items.length) return "";
      return `
        <div class="shortcut-group">
          <h4 class="shortcut-group-title">${escapeHtml(title)}</h4>
          ${shortcutRows(items)}
        </div>
      `;
    }

    function renderShortcutHelp() {
      const engines = orderEnabledEngines(state.settings.enabledEngines, state.settings.engineOrder);
      const slashShortcuts = engines
        .map((key) => {
          const engine = ENGINES[key];
          const alias = engine.aliases?.[0] || key;
          return { keys: `/${alias} query`, label: engine.name };
        })
        .slice(0, 10);
      const letterShortcuts = engines
        .filter((key) => ENGINES[key].shortcut)
        .map((key) => ({ keys: `Alt+${ENGINES[key].shortcut.toUpperCase()}`, label: ENGINES[key].name }))
        .slice(0, 10);

      dom.shortcutList.innerHTML = [
        shortcutGroup("Search", [
          { keys: "/", label: "Focus search" },
          { keys: "Up / Down", label: "Move suggestion" },
          { keys: "Enter", label: "Search selected text" },
          { keys: "Esc", label: "Close menus" }
        ]),
        shortcutGroup("Engines", [
          { keys: "Alt+1-9", label: "Pick by order" },
          ...letterShortcuts
        ]),
        shortcutGroup("Prefixes", slashShortcuts)
      ].join("");
    }

    function renderSettings() {
      dom.clockMode.value = state.settings.clockMode;
      dom.timeFormat.value = state.settings.timeFormat;
      dom.dateFormat.value = state.settings.dateFormat;
      dom.themeMode.value = state.settings.themeMode;
      dom.suggestionsEnabled.value = String(state.settings.suggestionsEnabled);
      dom.suggestionSource.value = state.settings.suggestionSource;
      dom.searchHistoryEnabled.value = String(state.settings.searchHistoryEnabled);
      dom.weatherEnabled.value = String(state.settings.weatherEnabled);
      dom.weatherCity.value = state.settings.weatherCity;
      dom.weatherUnits.value = state.settings.weatherUnits;
      renderShortcutHelp();

      dom.engineSettings.innerHTML = sanitizeEngineOrder(state.settings.engineOrder).map((key) => {
        const engine = ENGINES[key];
        const enabled = state.settings.enabledEngines.includes(key);
        const checked = enabled ? "checked" : "";
        const defaulted = state.settings.defaultEngine === key ? "checked" : "";
        const disabled = enabled ? "" : "disabled";
        return `
          <div class="engine-setting-row draggable-row" data-engine-row="${key}">
            <button class="drag-handle" type="button" draggable="true" data-drag-type="engine" data-drag-key="${key}" aria-label="Move ${engine.name}" title="Drag to reorder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M8 8h10" />
                <path d="M8 12h10" />
                <path d="M8 16h10" />
                <path d="m4.5 9.5 2-2 2 2" />
                <path d="m4.5 14.5 2 2 2-2" />
              </svg>
            </button>
            <label class="engine-name">
              <input class="check" type="checkbox" data-engine-enabled="${key}" ${checked} />
              <img src="${engine.icon}" alt="" />
              <span class="engine-name-text">${escapeHtml(engine.name)}</span>
            </label>
            <span></span>
            <span class="mini-label">Default</span>
            <input class="radio" type="radio" name="defaultEngine" value="${key}" ${defaulted} ${disabled} aria-label="Default ${engine.name}" />
          </div>
        `;
      }).join("");

      dom.customEngineList.innerHTML = state.settings.customEngines.map((engine) => `
        <div class="link-row custom-engine-row">
          <input type="text" value="${escapeAttribute(engine.name)}" aria-label="Custom engine name" disabled />
          <input type="url" value="${escapeAttribute(engine.url)}" aria-label="Custom engine URL" disabled />
          <input type="text" value="${escapeAttribute(engine.prefix ? `/${engine.prefix}` : "")}" aria-label="Custom engine slash prefix" disabled />
          <input type="text" value="${escapeAttribute(engine.shortcut || "")}" aria-label="Custom engine shortcut" disabled />
          <button class="icon-button" type="button" data-remove-custom-engine="${engine.id}" aria-label="Remove custom engine" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      `).join("");

      dom.linkList.innerHTML = state.settings.links.map((link, index) => `
        <div class="link-row draggable-row" data-link-row="${index}">
          <button class="drag-handle" type="button" draggable="true" data-drag-type="link" data-drag-index="${index}" aria-label="Move link" title="Drag to reorder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M8 8h10" />
              <path d="M8 12h10" />
              <path d="M8 16h10" />
              <path d="m4.5 9.5 2-2 2 2" />
              <path d="m4.5 14.5 2 2 2-2" />
            </svg>
          </button>
          <input type="text" value="${escapeAttribute(link.name)}" data-link-name="${index}" aria-label="Link name" />
          <input type="url" value="${escapeAttribute(link.url)}" data-link-url="${index}" aria-label="Link URL" />
          <button class="icon-button" type="button" data-remove-link="${index}" aria-label="Remove link" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      `).join("");
    }

    async function updateWeather() {
      dom.weatherRow.hidden = !state.settings.weatherEnabled;
      if (!state.settings.weatherEnabled) {
        if (state.weatherAbort) state.weatherAbort.abort();
        dom.weather.textContent = "";
        return;
      }

      const city = getWeatherCity();
      if (!city) {
        dom.weather.textContent = "";
        return;
      }

      if (state.weatherAbort) state.weatherAbort.abort();
      state.weatherAbort = new AbortController();
      dom.weather.innerHTML = `<span class="weather-dot"></span><span>${escapeHtml(city)}</span>`;

      try {
        const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geocodeUrl.searchParams.set("name", city);
        geocodeUrl.searchParams.set("count", "1");
        geocodeUrl.searchParams.set("language", "en");
        geocodeUrl.searchParams.set("format", "json");
        const geocodeResponse = await fetch(geocodeUrl, { signal: state.weatherAbort.signal });
        const geocode = await geocodeResponse.json();
        const place = geocode.results?.[0];
        if (!place) throw new Error("Location not found");

        const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
        weatherUrl.searchParams.set("latitude", place.latitude);
        weatherUrl.searchParams.set("longitude", place.longitude);
        weatherUrl.searchParams.set("current", "temperature_2m,weather_code");
        weatherUrl.searchParams.set("temperature_unit", state.settings.weatherUnits);
        weatherUrl.searchParams.set("timezone", "auto");
        const weatherResponse = await fetch(weatherUrl, { signal: state.weatherAbort.signal });
        const weather = await weatherResponse.json();
        const unit = state.settings.weatherUnits === "fahrenheit" ? "F" : "C";
        const temperature = Math.round(weather.current.temperature_2m);
        const condition = weatherCondition(weather.current.weather_code);

        dom.weather.innerHTML = `
          <span class="weather-icon ${condition.icon}"></span>
          <span><strong>${temperature}&deg;${unit}</strong> ${escapeHtml(place.name)} - ${condition.label}</span>
        `;
      } catch (error) {
        if (error.name === "AbortError") return;
        dom.weather.innerHTML = `<span class="weather-dot"></span><span>${escapeHtml(city)}</span>`;
      }
    }

    function weatherCondition(code) {
      if ([0].includes(code)) return { icon: "clear", label: "Clear" };
      if ([1, 2].includes(code)) return { icon: "clear", label: "Partly cloudy" };
      if ([3, 45, 48].includes(code)) return { icon: "cloud", label: code === 3 ? "Cloudy" : "Fog" };
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
        return { icon: "rain", label: [95, 96, 99].includes(code) ? "Storm" : "Rain" };
      }
      if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "snow", label: "Snow" };
      return { icon: "cloud", label: "Weather" };
    }

    function getWeatherCity() {
      const saved = state.settings.weatherCity.trim();
      if (saved) return saved;

      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const lastSegment = zone.split("/").pop() || "";
      return lastSegment.replace(/_/g, " ");
    }

    function search(query) {
      const resolved = resolveSearch(query);
      const engine = ENGINES[resolved.engineKey] || ENGINES.google;
      const encoded = encodeURIComponent(resolved.query);
      rememberSearch(query);
      window.location.href = engine.url.replace("{query}", encoded);
    }

    function rememberSearch(query) {
      const normalized = String(query || "").trim();
      if (!state.settings.searchHistoryEnabled || !normalized) return;

      const next = [
        normalized,
        ...state.settings.searchHistory.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
      ].slice(0, 20);
      updateSettings({ searchHistory: next });
    }

    function resolveSearch(query) {
      const parts = query.trim().split(/\s+/);
      const prefixToken = parts[0] || "";
      if (!prefixToken.startsWith("/") || prefixToken.length === 1) {
        return {
          engineKey: state.settings.activeEngine,
          query
        };
      }

      const prefix = prefixToken.slice(1).toLowerCase();
      const engineKey = Object.keys(ENGINES).find((key) => {
        const aliases = ENGINES[key].aliases || [];
        return key === prefix || aliases.includes(prefix);
      });

      if (engineKey && parts.length > 1) {
        return {
          engineKey,
          query: parts.slice(1).join(" ")
        };
      }

      return {
        engineKey: state.settings.activeEngine,
        query
      };
    }

    function suggestionContextForInput(value) {
      const trimmed = value.trim();
      if (!trimmed) return null;

      const parts = trimmed.split(/\s+/);
      const prefixToken = parts[0] || "";
      if (prefixToken.startsWith("/") && prefixToken.length > 1) {
        const prefix = prefixToken.slice(1).toLowerCase();
        const engineKey = Object.keys(ENGINES).find((key) => {
          const aliases = ENGINES[key].aliases || [];
          return key === prefix || aliases.includes(prefix);
        });
        const query = parts.slice(1).join(" ").trim();
        return engineKey && query.length >= 2 ? { engineKey, prefixToken, query } : null;
      }

      return trimmed.length >= 2 ? { engineKey: state.settings.activeEngine, prefixToken: "", query: trimmed } : null;
    }

    function loadJsonp(url, signal) {
      return new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const callbackName = `hakuSuggest${Date.now()}${Math.random().toString(36).slice(2)}`;
        const script = document.createElement("script");
        let didCleanup = false;
        const cleanup = () => {
          if (didCleanup) return;
          didCleanup = true;
          window[callbackName] = () => {};
          window.setTimeout(() => delete window[callbackName], 1000);
          script.remove();
          signal?.removeEventListener("abort", onAbort);
        };
        const onAbort = () => {
          cleanup();
          reject(new DOMException("Aborted", "AbortError"));
        };

        window[callbackName] = (data) => {
          cleanup();
          resolve(data);
        };
        script.async = true;
        script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${encodeURIComponent(callbackName)}`;
        script.onerror = () => {
          cleanup();
          reject(new Error("Suggestion request failed"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        document.head.append(script);
      });
    }

    function googleSuggestionProvider(name, extraParams = "") {
      return {
        name,
        request: (query, signal) => loadJsonp(`https://suggestqueries.google.com/complete/search?client=firefox${extraParams}&q=${encodeURIComponent(query)}`, signal),
        parse: (data) => Array.isArray(data?.[1]) ? data[1] : []
      };
    }

    function currentEngineSuggestionProviders(engineKey) {
      if (engineKey === "google") {
        return [googleSuggestionProvider("Google")];
      }
      if (engineKey === "youtube") {
        return [googleSuggestionProvider("YouTube", "&ds=yt")];
      }
      if (engineKey === "wikipedia") {
        return [{
          name: "Wikipedia",
          url: (query) => `https://en.wikipedia.org/w/api.php?action=opensearch&namespace=0&limit=8&format=json&origin=*&search=${encodeURIComponent(query)}`,
          parse: (data) => Array.isArray(data?.[1]) ? data[1] : []
        }];
      }

      return [];
    }

    function suggestionProviders(engineKey) {
      if (state.settings.suggestionSource === "current") {
        return currentEngineSuggestionProviders(engineKey);
      }

      return [googleSuggestionProvider("General web")];
    }

    function scheduleSuggestions() {
      window.clearTimeout(state.suggestTimer);
      if (!state.settings.suggestionsEnabled && !state.settings.searchHistoryEnabled) {
        closeSuggestions();
        return;
      }
      state.suggestTimer = window.setTimeout(fetchSuggestions, 160);
    }

    async function fetchSuggestions() {
      const context = suggestionContextForInput(dom.searchInput.value);
      if (!context) {
        closeSuggestions();
        return;
      }

      const historyItems = historySuggestions(context);
      const providers = state.settings.suggestionsEnabled ? suggestionProviders(context.engineKey) : [];
      if (!providers.length) {
        if (historyItems.length) {
          state.suggestions = historyItems;
          state.suggestionContext = context;
          state.suggestionIndex = -1;
          renderSuggestions();
          return;
        }
        closeSuggestions();
        return;
      }

      if (state.suggestAbort) state.suggestAbort.abort();
      const requestId = state.suggestRequestId + 1;
      state.suggestRequestId = requestId;
      state.suggestAbort = new AbortController();
      for (const provider of providers) {
        try {
          let data;
          if (provider.request) {
            data = await provider.request(context.query, state.suggestAbort.signal);
          } else {
            const response = await fetch(provider.url(context.query), { signal: state.suggestAbort.signal });
            if (!response.ok) continue;
            data = await response.json();
          }
          if (requestId !== state.suggestRequestId) return;
          const seen = new Set(historyItems.map((item) => item.value.toLowerCase()));
          const items = provider.parse(data)
            .map((item) => String(item).trim())
            .filter((item) => item && item.toLowerCase() !== context.query.toLowerCase())
            .filter((item) => {
              const key = item.toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .slice(0, Math.max(0, 6 - historyItems.length))
            .map((item) => ({ value: item, source: "web" }));

          const suggestions = [...historyItems, ...items];
          if (!suggestions.length) continue;
          state.suggestions = suggestions;
          state.suggestionContext = context;
          state.suggestionIndex = -1;
          renderSuggestions();
          return;
        } catch (error) {
          if (error.name === "AbortError") return;
        }
      }

      if (historyItems.length) {
        state.suggestions = historyItems;
        state.suggestionContext = context;
        state.suggestionIndex = -1;
        renderSuggestions();
        return;
      }

      closeSuggestions();
    }

    function historySuggestions(context) {
      if (!state.settings.searchHistoryEnabled) return [];

      const rawInput = dom.searchInput.value.trim().toLowerCase();
      const query = context.query.toLowerCase();
      return state.settings.searchHistory
        .filter((item) => {
          const normalized = item.toLowerCase();
          return normalized.includes(rawInput) || normalized.includes(query);
        })
        .slice(0, 3)
        .map((item) => ({ value: item, source: "history" }));
    }

    function renderSuggestions() {
      if (!state.suggestions.length || document.activeElement !== dom.searchInput) {
        closeSuggestions();
        return;
      }

      dom.searchInput.setAttribute("aria-expanded", "true");
      dom.suggestionMenu.hidden = false;
      dom.suggestionMenu.innerHTML = state.suggestions.map((suggestion, index) => `
        <button class="suggestion-option${index === state.suggestionIndex ? " is-active" : ""}" type="button" role="option" data-suggestion-index="${index}" aria-selected="${index === state.suggestionIndex}">
          <span>${escapeHtml(displaySuggestion(suggestion))}</span>
          <span class="suggestion-source">${suggestion.source === "history" ? "Recent" : ""}</span>
        </button>
      `).join("");
    }

    function displaySuggestion(suggestion) {
      if (suggestion.source === "history") return suggestion.value;
      const prefix = state.suggestionContext?.prefixToken;
      return prefix ? `${prefix} ${suggestion.value}` : suggestion.value;
    }

    function closeSuggestions() {
      if (state.suggestAbort) state.suggestAbort.abort();
      state.suggestions = [];
      state.suggestionContext = null;
      state.suggestionIndex = -1;
      dom.suggestionMenu.hidden = true;
      dom.suggestionMenu.innerHTML = "";
      dom.searchInput.setAttribute("aria-expanded", "false");
    }

    function moveSuggestion(delta) {
      if (!state.suggestions.length || dom.suggestionMenu.hidden) return false;
      state.suggestionIndex = (state.suggestionIndex + delta + state.suggestions.length) % state.suggestions.length;
      renderSuggestions();
      return true;
    }

    function useSuggestion(index = state.suggestionIndex, shouldSearch = false) {
      const suggestion = state.suggestions[index];
      if (!suggestion) return false;
      dom.searchInput.value = displaySuggestion(suggestion);
      closeSuggestions();
      if (shouldSearch) search(dom.searchInput.value.trim());
      return true;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char]));
    }

    function escapeAttribute(value) {
      return escapeHtml(value).replaceAll(/`/g, "&#096;");
    }

    function moveItem(list, fromIndex, toIndex) {
      const next = [...list];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    }

    function moveItemToSlot(list, fromIndex, slotIndex) {
      const boundedSlot = Math.max(0, Math.min(list.length, slotIndex));
      if (boundedSlot === fromIndex || boundedSlot === fromIndex + 1) return [...list];
      const toIndex = fromIndex < boundedSlot ? boundedSlot - 1 : boundedSlot;
      return moveItem(list, fromIndex, toIndex);
    }

    function startDrag(event) {
      const handle = event.target.closest("[data-drag-type]");
      if (!handle) return;
      const row = handle.closest(".draggable-row");

      state.drag = {
        type: handle.dataset.dragType,
        key: handle.dataset.dragKey,
        index: handle.dataset.dragIndex === undefined ? undefined : Number(handle.dataset.dragIndex),
        dropIndex: null,
        placeholder: null,
        rowHeight: row?.offsetHeight || 46
      };
      row?.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.drag.key || String(state.drag.index));
    }

    function allowDrop(event) {
      if (!state.drag) return;
      const container = dragContainerForType(state.drag.type);
      if (!container || event.currentTarget !== container) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      updateDropPlaceholder(event, container);
    }

    function endDrag() {
      clearDropPlaceholder();
      document.querySelectorAll(".draggable-row.is-dragging").forEach((row) => row.classList.remove("is-dragging"));
      state.drag = null;
    }

    function dragContainerForType(type) {
      if (type === "engine") return dom.engineSettings;
      if (type === "link") return dom.linkList;
      return null;
    }

    function ensureDropPlaceholder() {
      if (!state.drag.placeholder) {
        state.drag.placeholder = document.createElement("div");
        state.drag.placeholder.className = "drop-placeholder";
        state.drag.placeholder.setAttribute("aria-hidden", "true");
      }
      state.drag.placeholder.style.minHeight = `${Math.max(46, state.drag.rowHeight || 46)}px`;
      return state.drag.placeholder;
    }

    function updateDropPlaceholder(event, container) {
      const rows = Array.from(container.querySelectorAll(".draggable-row"));
      if (!rows.length) return;

      const directRow = event.target.closest(".draggable-row");
      const targetRow = directRow && container.contains(directRow)
        ? directRow
        : rows.find((row) => event.clientY < row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2);

      let slotIndex = rows.length;
      if (targetRow) {
        const rect = targetRow.getBoundingClientRect();
        const targetIndex = rows.indexOf(targetRow);
        slotIndex = targetIndex + (event.clientY > rect.top + rect.height / 2 ? 1 : 0);
      }

      state.drag.dropIndex = slotIndex;
      const placeholder = ensureDropPlaceholder();
      const referenceRow = rows[slotIndex] || null;
      if (referenceRow !== placeholder.nextSibling) {
        container.insertBefore(placeholder, referenceRow);
      }
    }

    function clearDropPlaceholder() {
      state.drag?.placeholder?.remove();
    }

    function dropEngine(event) {
      if (!state.drag || state.drag.type !== "engine") return;
      event.preventDefault();

      const sourceKey = state.drag.key;
      if (!sourceKey) return endDrag();
      if (state.drag.dropIndex === null) updateDropPlaceholder(event, dom.engineSettings);

      const order = sanitizeEngineOrder(state.settings.engineOrder);
      const fromIndex = order.indexOf(sourceKey);
      if (fromIndex === -1 || state.drag.dropIndex === null) return endDrag();

      updateSettings({ engineOrder: moveItemToSlot(order, fromIndex, state.drag.dropIndex) });
      endDrag();
    }

    function dropLink(event) {
      if (!state.drag || state.drag.type !== "link") return;
      event.preventDefault();

      const sourceIndex = state.drag.index;
      if (!Number.isInteger(sourceIndex)) return endDrag();
      if (state.drag.dropIndex === null) updateDropPlaceholder(event, dom.linkList);
      if (state.drag.dropIndex === null) return endDrag();

      updateSettings({ links: moveItemToSlot(state.settings.links, sourceIndex, state.drag.dropIndex) });
      endDrag();
    }

    function selectEngineShortcut(index) {
      const engines = orderEnabledEngines(state.settings.enabledEngines, state.settings.engineOrder);
      const key = engines[index];
      if (!key) return false;
      updateSettings({ activeEngine: key });
      dom.searchInput.focus();
      scheduleSuggestions();
      return true;
    }

    function selectEngineLetterShortcut(letter) {
      const normalized = letter.toLowerCase();
      const engines = orderEnabledEngines(state.settings.enabledEngines, state.settings.engineOrder);
      const key = engines.find((engineKey) => ENGINES[engineKey].shortcut === normalized);
      if (!key) return false;
      updateSettings({ activeEngine: key });
      dom.searchInput.focus();
      scheduleSuggestions();
      return true;
    }

    function validateCustomEngineForm(requireValues = false) {
      const name = dom.customEngineName.value.trim();
      const url = dom.customEngineUrl.value.trim();
      const prefix = dom.customEnginePrefix.value.trim().toLowerCase().replace(/^[/!]+/, "");
      const shortcut = dom.customEngineShortcut.value.trim().toLowerCase();
      const errors = [];
      const hasInput = Boolean(name || url || prefix || shortcut);

      [dom.customEngineName, dom.customEngineUrl, dom.customEnginePrefix, dom.customEngineShortcut].forEach((input) => {
        input.setCustomValidity("");
      });

      if (!hasInput && !requireValues) {
        dom.customEngineError.textContent = "";
        return true;
      }

      if (!name) {
        dom.customEngineName.setCustomValidity("Name is required.");
        errors.push("Name is required.");
      } else {
        const duplicateName = Object.values(ENGINES).some((engine) => engine.name.toLowerCase() === name.toLowerCase());
        if (duplicateName) {
          dom.customEngineName.setCustomValidity("Use a unique engine name.");
          errors.push("Use a unique engine name.");
        }
      }

      if (!url) {
        dom.customEngineUrl.setCustomValidity("URL template is required.");
        errors.push("URL template is required.");
      } else if (!url.includes("{query}")) {
        dom.customEngineUrl.setCustomValidity("URL must contain {query}.");
        errors.push("URL must contain {query}.");
      } else if (!isSafeSearchUrl(url)) {
        dom.customEngineUrl.setCustomValidity("Use a valid http or https URL.");
        errors.push("Use a valid http or https URL.");
      }

      if (prefix) {
        const prefixTaken = Object.keys(ENGINES).some((key) => key === prefix || ENGINES[key].aliases?.includes(prefix));
        if (prefixTaken) {
          dom.customEnginePrefix.setCustomValidity("Prefix is already used.");
          errors.push("Prefix is already used.");
        }
      }

      if (shortcut && !/^[a-z0-9]$/.test(shortcut)) {
        dom.customEngineShortcut.setCustomValidity("Shortcut must be one letter or number.");
        errors.push("Shortcut must be one letter or number.");
      } else if (shortcut) {
        const shortcutTaken = Object.values(ENGINES).some((engine) => engine.shortcut === shortcut);
        if (shortcutTaken) {
          dom.customEngineShortcut.setCustomValidity("Shortcut is already used.");
          errors.push("Shortcut is already used.");
        }
      }

      dom.customEngineError.textContent = Array.from(new Set(errors)).join(" ");
      return errors.length === 0;
    }

    function addCustomEngine() {
      if (!validateCustomEngineForm(true)) {
        [dom.customEngineName, dom.customEngineUrl, dom.customEnginePrefix, dom.customEngineShortcut]
          .find((input) => !input.validity.valid)
          ?.reportValidity();
        return;
      }

      const engine = sanitizeCustomEngines([{
        name: dom.customEngineName.value,
        url: dom.customEngineUrl.value,
        prefix: dom.customEnginePrefix.value,
        shortcut: dom.customEngineShortcut.value
      }])[0];

      if (!engine) {
        validateCustomEngineForm();
        return;
      }

      const customEngines = sanitizeCustomEngines([...state.settings.customEngines, engine]);
      const addedEngine = customEngines[customEngines.length - 1];
      const engineOrder = [...state.settings.engineOrder, addedEngine.id];
      const enabledEngines = [...state.settings.enabledEngines, addedEngine.id];
      updateSettings({ customEngines, engineOrder, enabledEngines, activeEngine: addedEngine.id, defaultEngine: addedEngine.id });
      dom.customEngineName.value = "";
      dom.customEngineUrl.value = "";
      dom.customEnginePrefix.value = "";
      dom.customEngineShortcut.value = "";
      validateCustomEngineForm(false);
    }

    function removeCustomEngine(id) {
      const customEngines = state.settings.customEngines.filter((engine) => engine.id !== id);
      const engineOrder = state.settings.engineOrder.filter((key) => key !== id);
      const enabledEngines = state.settings.enabledEngines.filter((key) => key !== id);
      const nextDefault = state.settings.defaultEngine === id ? enabledEngines[0] || "google" : state.settings.defaultEngine;
      const nextActive = state.settings.activeEngine === id ? nextDefault : state.settings.activeEngine;
      updateSettings({
        customEngines,
        engineOrder,
        enabledEngines: enabledEngines.length ? enabledEngines : ["google"],
        defaultEngine: nextDefault,
        activeEngine: nextActive
      });
    }

    dom.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.suggestionIndex >= 0 && useSuggestion(state.suggestionIndex, true)) return;
      const query = dom.searchInput.value.trim();
      if (query) search(query);
    });

    dom.searchInput.addEventListener("input", scheduleSuggestions);
    dom.searchInput.addEventListener("focus", scheduleSuggestions);
    dom.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && moveSuggestion(1)) {
        event.preventDefault();
      }

      if (event.key === "ArrowUp" && moveSuggestion(-1)) {
        event.preventDefault();
      }

      if (event.key === "Enter" && state.suggestionIndex >= 0 && useSuggestion(state.suggestionIndex, true)) {
        event.preventDefault();
      }

      if (event.key === "Escape" && !dom.suggestionMenu.hidden) {
        event.preventDefault();
        closeSuggestions();
      }
    });

    dom.searchInput.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!dom.suggestionMenu.matches(":hover")) closeSuggestions();
      }, 120);
    });

    dom.suggestionMenu.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });

    dom.suggestionMenu.addEventListener("click", (event) => {
      const index = Number(event.target.closest("[data-suggestion-index]")?.dataset.suggestionIndex);
      if (Number.isInteger(index)) useSuggestion(index, true);
    });

    function setEngineMenuOpen(open) {
      dom.engineMenu.hidden = !open;
      dom.enginePickerButton.setAttribute("aria-expanded", String(open));
      if (open) {
        requestAnimationFrame(() => focusEngineOption(activeEngineIndex()));
      }
    }

    function engineOptionButtons() {
      return Array.from(dom.engineMenu.querySelectorAll("[data-engine]"));
    }

    function activeEngineIndex() {
      const buttons = engineOptionButtons();
      const activeIndex = buttons.findIndex((button) => button.dataset.engine === state.settings.activeEngine);
      return activeIndex === -1 ? 0 : activeIndex;
    }

    function focusEngineOption(index) {
      const buttons = engineOptionButtons();
      if (!buttons.length) return;
      const normalized = (index + buttons.length) % buttons.length;
      buttons.forEach((button) => button.classList.remove("is-focused"));
      buttons[normalized].classList.add("is-focused");
      buttons[normalized].focus();
    }

    function moveEngineFocus(delta) {
      const buttons = engineOptionButtons();
      if (!buttons.length) return;
      const currentIndex = buttons.indexOf(document.activeElement);
      focusEngineOption((currentIndex === -1 ? activeEngineIndex() : currentIndex) + delta);
    }

    function selectFocusedEngine() {
      const button = document.activeElement?.closest?.("[data-engine]");
      if (!button || dom.engineMenu.hidden) return false;
      updateSettings({ activeEngine: button.dataset.engine });
      setEngineMenuOpen(false);
      dom.searchInput.focus();
      scheduleSuggestions();
      return true;
    }

    dom.enginePickerButton.addEventListener("click", () => {
      setEngineMenuOpen(dom.enginePickerButton.getAttribute("aria-expanded") !== "true");
    });

    dom.enginePickerButton.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        setEngineMenuOpen(true);
      }
    });

    dom.engineMenu.addEventListener("click", (event) => {
      const button = event.target.closest("[data-engine]");
      if (!button) return;
      updateSettings({ activeEngine: button.dataset.engine });
      setEngineMenuOpen(false);
      dom.searchInput.focus();
      scheduleSuggestions();
    });

    document.addEventListener("click", (event) => {
      if (dom.enginePicker.contains(event.target)) return;
      setEngineMenuOpen(false);
      if (dom.searchForm.contains(event.target) || dom.suggestionMenu.contains(event.target)) return;
      closeSuggestions();
    });

    dom.openSettings.addEventListener("click", () => {
      if (typeof dom.settingsDialog.showModal === "function") {
        dom.settingsDialog.showModal();
      } else {
        dom.settingsDialog.setAttribute("open", "");
      }
    });

    dom.clockMode.addEventListener("change", () => updateSettings({ clockMode: dom.clockMode.value }));
    dom.timeFormat.addEventListener("change", () => updateSettings({ timeFormat: dom.timeFormat.value }));
    dom.dateFormat.addEventListener("change", () => updateSettings({ dateFormat: dom.dateFormat.value }));
    dom.themeMode.addEventListener("change", () => updateSettings({ themeMode: dom.themeMode.value }));
    dom.suggestionsEnabled.addEventListener("change", () => {
      updateSettings({ suggestionsEnabled: dom.suggestionsEnabled.value === "true" });
      scheduleSuggestions();
    });
    dom.suggestionSource.addEventListener("change", () => {
      updateSettings({ suggestionSource: dom.suggestionSource.value });
      scheduleSuggestions();
    });
    dom.searchHistoryEnabled.addEventListener("change", () => {
      const enabled = dom.searchHistoryEnabled.value === "true";
      updateSettings({ searchHistoryEnabled: enabled, searchHistory: enabled ? state.settings.searchHistory : [] });
      scheduleSuggestions();
    });
    dom.weatherEnabled.addEventListener("change", () => {
      updateSettings({ weatherEnabled: dom.weatherEnabled.value === "true" });
      updateWeather();
    });
    dom.weatherUnits.addEventListener("change", () => {
      updateSettings({ weatherUnits: dom.weatherUnits.value });
      updateWeather();
    });
    dom.weatherCity.addEventListener("change", () => {
      updateSettings({ weatherCity: dom.weatherCity.value.trim() });
      updateWeather();
    });

    dom.engineSettings.addEventListener("change", (event) => {
      const enabledKey = event.target.dataset.engineEnabled;
      if (enabledKey) {
        const enabled = new Set(state.settings.enabledEngines);
        if (event.target.checked) {
          enabled.add(enabledKey);
        } else if (enabled.size > 1) {
          enabled.delete(enabledKey);
        } else {
          event.target.checked = true;
        }
        updateSettings({ enabledEngines: Array.from(enabled) });
      }

      if (event.target.name === "defaultEngine") {
        updateSettings({ defaultEngine: event.target.value, activeEngine: event.target.value });
      }
    });

    dom.engineSettings.addEventListener("dragstart", startDrag);
    dom.engineSettings.addEventListener("dragover", allowDrop);
    dom.engineSettings.addEventListener("drop", dropEngine);
    dom.engineSettings.addEventListener("dragend", endDrag);

    dom.addCustomEngine.addEventListener("click", addCustomEngine);
    [dom.customEngineName, dom.customEngineUrl, dom.customEnginePrefix, dom.customEngineShortcut].forEach((input) => {
      input.addEventListener("input", () => validateCustomEngineForm(false));
    });
    dom.customEngineList.addEventListener("click", (event) => {
      const id = event.target.closest("[data-remove-custom-engine]")?.dataset.removeCustomEngine;
      if (id) removeCustomEngine(id);
    });

    dom.linkList.addEventListener("input", (event) => {
      const nameIndex = event.target.dataset.linkName;
      const urlIndex = event.target.dataset.linkUrl;
      const links = [...state.settings.links];

      if (nameIndex !== undefined) links[Number(nameIndex)].name = event.target.value;
      if (urlIndex !== undefined) links[Number(urlIndex)].url = event.target.value;

      state.settings.links = links;
      saveSettings();
      renderLinks();
    });

    dom.linkList.addEventListener("click", (event) => {
      const index = event.target.closest("[data-remove-link]")?.dataset.removeLink;
      if (index === undefined) return;
      const links = state.settings.links.filter((_, linkIndex) => linkIndex !== Number(index));
      updateSettings({ links });
    });

    dom.linkList.addEventListener("dragstart", startDrag);
    dom.linkList.addEventListener("dragover", allowDrop);
    dom.linkList.addEventListener("drop", dropLink);
    dom.linkList.addEventListener("dragend", endDrag);

    dom.addLink.addEventListener("click", () => {
      const links = [...state.settings.links, { name: "New", url: "https://" }];
      updateSettings({ links });
    });

    dom.resetSettings.addEventListener("click", () => {
      const confirmed = window.confirm("Reset all Haku settings? This removes custom engines, links, theme, weather, and search preferences from this browser.");
      if (!confirmed) return;
      state.settings = cloneDefaults();
      saveSettings();
      render();
      updateWeather();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setEngineMenuOpen(false);
      }

      if (!dom.engineMenu.hidden && ["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(event.key)) {
        event.preventDefault();
        if (event.key === "ArrowDown") moveEngineFocus(1);
        if (event.key === "ArrowUp") moveEngineFocus(-1);
        if (event.key === "Home") focusEngineOption(0);
        if (event.key === "End") focusEngineOption(engineOptionButtons().length - 1);
        if (event.key === "Enter") selectFocusedEngine();
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey && /^[1-9]$/.test(event.key) && !dom.settingsDialog.open) {
        if (selectEngineShortcut(Number(event.key) - 1)) {
          event.preventDefault();
        }
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey && /^[a-z]$/i.test(event.key) && !dom.settingsDialog.open) {
        if (selectEngineLetterShortcut(event.key)) {
          event.preventDefault();
        }
      }

      if (event.key === "/" && document.activeElement !== dom.searchInput && !dom.settingsDialog.open) {
        event.preventDefault();
        dom.searchInput.focus();
      }
    });

    const colorSchemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleColorSchemeChange = () => {
      if (state.settings.themeMode === "auto") applyTheme();
    };
    if (colorSchemeQuery?.addEventListener) {
      colorSchemeQuery.addEventListener("change", handleColorSchemeChange);
    } else {
      colorSchemeQuery?.addListener?.(handleColorSchemeChange);
    }

    render();
    updateWeather();
    setInterval(updateClock, 250);
    setInterval(updateWeather, 30 * 60 * 1000);
