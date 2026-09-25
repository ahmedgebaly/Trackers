(() => {
  const CUISINE_LABELS = {
    egyptian: "مصري",
    gulf: "خليجي",
    levantine: "شامي",
    world: "عالمي",
  };

  const CUISINE_COUNTRY_FALLBACK = {
    egyptian: "مصر",
    gulf: "خليجي",
    levantine: "شامي",
    world: "",
  };

  const COUNTRY_EN = {
    أفغانستان: "Afghanistan",
    ألمانيا: "Germany",
    أمريكا: "USA",
    أوزبكستان: "Uzbekistan",
    إثيوبيا: "Ethiopia",
    إسبانيا: "Spain",
    إندونيسيا: "Indonesia",
    "إندونيسيا/ماليزيا": "Indonesia Malaysia",
    إيران: "Iran",
    إيطاليا: "Italy",
    "إيطاليا/أمريكا": "Italy USA",
    الأرجنتين: "Argentina",
    البرازيل: "Brazil",
    الجزائر: "Algeria",
    السنغال: "Senegal",
    الصين: "China",
    الفلبين: "Philippines",
    المجر: "Hungary",
    المغرب: "Morocco",
    المكسيك: "Mexico",
    "المكسيك/أمريكا": "Mexico USA",
    الهند: "India",
    اليابان: "Japan",
    اليونان: "Greece",
    باكستان: "Pakistan",
    بريطانيا: "UK",
    بولندا: "Poland",
    بيرو: "Peru",
    تايلاند: "Thailand",
    تركيا: "Turkey",
    تونس: "Tunisia",
    روسيا: "Russia",
    "روسيا/أوكرانيا": "Russia Ukraine",
    سنغافورة: "Singapore",
    فرنسا: "France",
    فيتنام: "Vietnam",
    كوريا: "Korea",
    كينيا: "Kenya",
    ماليزيا: "Malaysia",
    نيجيريا: "Nigeria",
  };

  const nameFilter = document.getElementById("nameFilter");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const costFilter = document.getElementById("costFilter");
  const proteinFilter = document.getElementById("proteinFilter");
  const searchBtn = document.getElementById("searchBtn");
  const cuisineChips = document.querySelectorAll(".cuisine-chip");
  const resultsEl = document.getElementById("results");
  const resultCountEl = document.getElementById("resultCount");
  const filtersForm = document.getElementById("filtersForm");

  const allDishes = Array.isArray(window.FOOD_DATA) ? window.FOOD_DATA : [];
  let selectedCuisine = "";

  let applied = {
    name: "",
    difficulty: "",
    cost: "",
    protein: "",
    cuisine: "",
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hideResults() {
    resultCountEl.textContent = "";
    resultsEl.innerHTML =
      `<div class="empty">اضغط بحث لعرض النتائج</div>`;
  }

  function dishSearchQuery(dish) {
    const country =
      (dish.country || "").trim() ||
      CUISINE_COUNTRY_FALLBACK[dish.cuisine] ||
      "";
    return [dish.name, country].filter(Boolean).join(" ").trim();
  }

  function dishSearchQueryEn(dish) {
    const nameEn = (dish.nameEn || "").trim();
    const countryEn = COUNTRY_EN[(dish.country || "").trim()] || "";
    return [nameEn, countryEn].filter(Boolean).join(" ").trim();
  }

  function googleSearchUrl(query) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  function youtubeSearchUrl(query) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  function youtubeIconSvg() {
    return `
      <svg class="youtube-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.2 3.5-6.2 3.5z"/>
      </svg>`;
  }

  function renderCard(dish) {
    const cuisineKey = dish.cuisine || "";
    const cuisineLabel = CUISINE_LABELS[cuisineKey] || cuisineKey;
    const badgeClass = cuisineKey
      ? `cuisine-badge cuisine-badge--${escapeHtml(cuisineKey)}`
      : "cuisine-badge";
    const country = dish.country
      ? `<p class="dish-meta"><strong>الدولة</strong>${escapeHtml(dish.country)}</p>`
      : "";
    const hideDefaultHalal = new Set([
      "حلال (لا يحتوي على خمور أو خنزير)",
      "حلال (بدون خمور أو خنزير)",
    ]);
    const halalNote = (dish.halal || "").trim();
    const halalBlock = halalNote && !hideDefaultHalal.has(halalNote)
      ? `<p class="dish-section"><strong>التوافق الشرعي</strong>${escapeHtml(halalNote)}</p>`
      : "";

    const queryAr = dishSearchQuery(dish);
    const googleUrlAr = googleSearchUrl(queryAr);
    const youtubeUrlAr = youtubeSearchUrl(queryAr);
    const ytIcon = youtubeIconSvg();

    const dishNameRow = `
      <div class="dish-name-row">
        <h2 class="dish-name">
          <a class="dish-name-link" href="${escapeHtml(googleUrlAr)}" target="_blank" rel="noopener noreferrer" title="بحث في Google">
            ${escapeHtml(dish.name)}
          </a>
        </h2>
        <a class="youtube-btn" href="${escapeHtml(youtubeUrlAr)}" target="_blank" rel="noopener noreferrer" title="بحث في YouTube" aria-label="بحث في YouTube عن ${escapeHtml(dish.name)}">
          ${ytIcon}
        </a>
      </div>`;

    let nameEnBlock = "";
    let youtubeEnBlock = "";
    if (cuisineKey === "world" && dish.nameEn) {
      const queryEn = dishSearchQueryEn(dish);
      const countryEn = COUNTRY_EN[(dish.country || "").trim()] || "";
      const linkLabel = [dish.nameEn, countryEn].filter(Boolean).join(" · ");
      const googleUrlEn = googleSearchUrl(queryEn);
      const youtubeUrlEn = youtubeSearchUrl(queryEn);
      nameEnBlock = `
        <p class="dish-name-en">
          <a class="dish-name-link dish-name-link--en" href="${escapeHtml(googleUrlEn)}" target="_blank" rel="noopener noreferrer" title="Google search (English)" dir="ltr">
            ${escapeHtml(linkLabel)}
          </a>
        </p>`;
      youtubeEnBlock = `
        <div class="dish-en-actions" dir="ltr">
          <a class="youtube-btn youtube-btn--en" href="${escapeHtml(youtubeUrlEn)}" target="_blank" rel="noopener noreferrer" title="YouTube search (English)" aria-label="YouTube search for ${escapeHtml(linkLabel)}">
            ${ytIcon}
            <span>YouTube EN</span>
          </a>
        </div>`;
    }

    return `
      <article class="dish-card">
        <div class="dish-card-head">
          <div>
            ${dishNameRow}
            ${nameEnBlock}
          </div>
          <span class="${badgeClass}">${escapeHtml(cuisineLabel)}</span>
        </div>
        <div class="chips">
          <span class="chip chip--ease">سهولة: ${escapeHtml(dish.difficulty)}</span>
          <span class="chip chip--cost">تكلفة: ${escapeHtml(dish.cost)}</span>
          <span class="chip chip--protein">بروتين: ${escapeHtml(dish.protein)}</span>
        </div>
        ${country}
        <p class="dish-section"><strong>المكونات لـ 4 أفراد</strong>${escapeHtml(dish.ingredients)}</p>
        ${halalBlock}
        ${youtubeEnBlock}
      </article>
    `;
  }

  function getFilteredDishes() {
    const nameQuery = applied.name;
    const difficulty = applied.difficulty;
    const cost = applied.cost;
    const protein = applied.protein;
    const cuisine = applied.cuisine;

    return allDishes.filter((dish) => {
      if (cuisine && dish.cuisine !== cuisine) return false;
      if (difficulty && dish.difficulty !== difficulty) return false;
      if (cost && dish.cost !== cost) return false;
      if (protein && dish.protein !== protein) return false;
      if (nameQuery) {
        const ar = (dish.name || "").toLowerCase();
        const en = (dish.nameEn || "").toLowerCase();
        if (!ar.includes(nameQuery) && !en.includes(nameQuery)) return false;
      }
      return true;
    });
  }

  function renderResults() {
    if (!allDishes.length) {
      resultCountEl.textContent = "تعذر التحميل";
      resultsEl.innerHTML =
        `<div class="status-msg">تعذر تحميل بيانات الوصفات.</div>`;
      return;
    }

    const filtered = getFilteredDishes();
    resultCountEl.textContent =
      filtered.length === 0
        ? "لا توجد نتائج"
        : `${filtered.length} نتيجة`;

    if (filtered.length === 0) {
      resultsEl.innerHTML = `<div class="empty">لا توجد أطباق مطابقة للفلاتر الحالية.</div>`;
      return;
    }

    resultsEl.innerHTML = filtered.map(renderCard).join("");
  }

  function applySearch() {
    applied = {
      name: (nameFilter.value || "").trim().toLowerCase(),
      difficulty: difficultyFilter.value,
      cost: costFilter.value,
      protein: proteinFilter.value,
      cuisine: selectedCuisine,
    };
    renderResults();
  }

  function setCuisine(value) {
    selectedCuisine = value;
    cuisineChips.forEach((chip) => {
      const pressed = chip.dataset.cuisine === value;
      chip.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
    hideResults();
  }

  cuisineChips.forEach((chip) => {
    chip.addEventListener("click", () => setCuisine(chip.dataset.cuisine || ""));
  });

  nameFilter.addEventListener("input", hideResults);
  difficultyFilter.addEventListener("change", hideResults);
  costFilter.addEventListener("change", hideResults);
  proteinFilter.addEventListener("change", hideResults);

  searchBtn.addEventListener("click", applySearch);

  if (filtersForm) {
    filtersForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applySearch();
    });
  }

  hideResults();
})();
