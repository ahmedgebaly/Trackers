(() => {
  const CUISINE_LABELS = {
    egyptian: "مصري",
    gulf: "خليجي",
    levantine: "شامي",
    world: "عالمي",
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

  function renderCard(dish) {
    const cuisineKey = dish.cuisine || "";
    const cuisineLabel = CUISINE_LABELS[cuisineKey] || cuisineKey;
    const badgeClass = cuisineKey
      ? `cuisine-badge cuisine-badge--${escapeHtml(cuisineKey)}`
      : "cuisine-badge";
    const nameEn = dish.nameEn
      ? `<p class="dish-name-en">${escapeHtml(dish.nameEn)}</p>`
      : "";
    const country = dish.country
      ? `<p class="dish-meta"><strong>الدولة</strong>${escapeHtml(dish.country)}</p>`
      : "";
    const hideDefaultHalal = new Set([
      "حلال (لا يحتوي على خمور أو خنزير)",
      "حلال (بدون خمور أو خنزير)",
    ]);
    const halalNote = (dish.halal || "").trim();
    const halal = halalNote && !hideDefaultHalal.has(halalNote)
      ? `<p class="dish-section"><strong>التوافق الشرعي</strong>${escapeHtml(halalNote)}</p>`
      : "";

    return `
      <article class="dish-card">
        <div class="dish-card-head">
          <div>
            <h2 class="dish-name">${escapeHtml(dish.name)}</h2>
            ${nameEn}
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
        ${halal}
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
