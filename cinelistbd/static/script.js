// 🔁 Global State
let allMovies = [];
let searchFiltered = [];
let filterFiltered = [];
let searchIndex = 0;
let filterIndex = 0;
const sectionStates = {
  trending: 0, recent: 0, latest: 0,
  movies: 0, webseries: 0, drama: 0,
  action: 0, romance: 0, crime: 0,
  anime: 0, fantasy: 0, thriller: 0
};

// 🔁 DOM References
const searchResultsList = document.getElementById('search-results-list');
const searchResultsSection = document.getElementById('search-results-section');
const filterResultsList = document.getElementById('filter-results-list');
const filterResultsSection = document.getElementById('filter-results-section');
const seeMoreSearchBtn = document.getElementById('see-more-search');
const seeMoreFilterBtn = document.getElementById('see-more-filter');

// 🔍 Poster Path
function getPosterPath(m) {
  if (!m.poster || m.poster.trim() === "") return '/img/fallback.jpg';
  return m.poster.startsWith('http') ? m.poster : `/img/${m.poster}`;
}

// 🎬 Movie Card
function createMovieCard(m) {
  const card = document.createElement('div');
  card.className = `${m.category}-card`;
  const posterPath = getPosterPath(m);
  card.innerHTML = `
    <a href="${m.trailer}" target="_blank">
      ${posterPath ? `<img src="${posterPath}" alt="${m.title}" class="poster" />` : `<div class="poster-frame">No Poster</div>`}
    </a>
    <h3>${m.title}</h3>
    ${m.sequel ? `<p>Sequel: ${m.sequel}</p>` : ""}
    ${m.episode && Array.isArray(m.type) && m.type.includes("Web Series") ? `<p>Episode: ${m.episode}</p>` : ""}
    ${Array.isArray(m.genre) && m.genre.length ? `<p>Genre: ${m.genre.join(', ')}</p>` : ""}
    ${Array.isArray(m.type) && m.type.length ? `<p>Type: ${m.type.join(', ')}</p>` : ""}
    ${Array.isArray(m.lang) ? `<p>Language: ${m.lang.join(', ')}</p>` : ""}
    ${Array.isArray(m.country) ? `<p>Country: ${m.country.join(', ')}</p>` : ""}
    ${Array.isArray(m.quality) ? `<p>Quality: ${m.quality.join(', ')}</p>` : ""}
    ${Array.isArray(m.platform) && m.platform.length ? `<p>Platform: ${m.platform.join(', ')}</p>` : ""}
    ${m.date ? `<p>Release: ${m.date}</p>` : ""}
    ${m.year ? `<p>Year: ${m.year}</p>` : ""}
    ${m.trailer ? `<a href="${m.trailer}" target="_blank" class="watch-btn">▶ Watch Movie</a>` : ""}
  `;
  return card;
}

// ❌ No Result
function showNoResult(sectionId) {
  const container = document.getElementById(sectionId);
  container.innerHTML = `<p style="text-align:center; padding:20px;">😢 No results found</p>`;
}

// 🔁 Load Section
async function loadSection(section) {
  if (document.getElementById(`${section}-list`)?.children.length > 0) return;
  try {
    const res = await fetch(`/api/movies?section=${section}&offset=0&limit=20`);
    const data = await res.json();
    const movies = data.movies.map(m => ({ ...m, category: section }));
    allMovies = [...allMovies.filter(m => m.category !== section), ...movies];
    sectionStates[section] = 0;
    renderSection(section, movies, true);
  } catch (err) {
    console.error(`Failed to load ${section}:`, err);
  }
}

// 🔁 Load More
async function loadMore(section) {
  const offset = sectionStates[section] * 20;
  try {
    const res = await fetch(`/api/movies?section=${section}&offset=${offset}&limit=20`);
    const data = await res.json();
    const movies = data.movies.map(m => ({ ...m, category: section }));
    allMovies = [...allMovies, ...movies];
    renderSection(section, movies, true);
  } catch (err) {
    console.error(`Failed to load more ${section}:`, err);
  }
}

// 🎬 Render Section
function renderSection(section, movies, paginated = false) {
  const container = document.getElementById(`${section}-list`);
  if (!container) return;
  if (!paginated) container.innerHTML = '';

  const start = sectionStates[section] * 20;
  const end = start + 20;
  const slice = paginated ? movies.slice(start, end) : movies;

  if (slice.length === 0) {
    showNoResult(`${section}-list`);
    return;
  }

  slice.forEach(m => {
    const card = createMovieCard(m);
    container.appendChild(card);
  });

  if (paginated && slice.length > 0) {
    sectionStates[section]++;
    const seeMoreBtn = document.querySelector(`.see-more-btn[data-section="${section}"]`);
    if (end >= movies.length && seeMoreBtn) {
      seeMoreBtn.style.display = 'none';
    }
  }
}

// 🔁 See More Buttons
function setupSeeMoreButtons() {
  document.querySelectorAll('.see-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      loadMore(section);
    });
  });
}

// 🔍 Keyword Match
function keywordMatch(movie, query) {
  if (!query) return true;
  query = query.toLowerCase();
  const fields = [
    movie.title, movie.platform, movie.genre, movie.lang,
    movie.type, movie.quality, movie.country, movie.date, movie.year
  ];
  return fields.some(field => {
    if (!field) return false;
    const str = Array.isArray(field) ? field.join(', ') : field.toString();
    return str.toLowerCase().includes(query);
  });
}

// 🔁 Unified Filter Logic
function applyFilters() {
  searchResultsList.innerHTML = '';
  filterResultsList.innerHTML = '';
  searchResultsSection.style.display = 'none';
  filterResultsSection.style.display = 'none';

  const query = document.getElementById("search-box").value.toLowerCase().trim();
  const sectionRaw = document.getElementById("section-filter").value;
  const section = sectionRaw ? sectionRaw.toLowerCase() : null;
  const platform = document.getElementById("platform-filter").value.toLowerCase();
  const genre = document.getElementById("genre-filter").value.toLowerCase();
  const lang = document.getElementById("lang-filter").value.toLowerCase();
  const type = document.getElementById("type-filter").value.toLowerCase();
  const quality = document.getElementById("quality-filter").value.toLowerCase();

  const match = (field, value) => {
    if (!value) return true;
    if (!field) return false;
    const str = Array.isArray(field) ? field.join(', ') : field.toString();
    return str.toLowerCase().includes(value);
  };

  const filtered = allMovies.filter(m => {
    return (
      keywordMatch(m, query) &&
      (!section || (m.category && m.category.toLowerCase() === section)) &&
      match(m.platform, platform) &&
      match(m.genre, genre) &&
      match(m.lang, lang) &&
      match(m.type, type) &&
      match(m.quality, quality)
    );
  });

  const allSections = Object.keys(sectionStates);
  allSections.forEach(id => {
    const wrapper = document.getElementById(id);
    if (wrapper && !wrapper.hasAttribute('data-static')) {
      wrapper.style.display = 'none';
    }
  });

  if (query) {
    searchFiltered = filtered;
    searchIndex = 0;
    searchResultsSection.style.display = 'block';
    renderSearchResults();
    return;
  }

  if (platform || genre || lang || type || quality || section) {
    filterFiltered = filtered;
    filterIndex = 0;

    // ✅ Heading update block — now placed correctly
    const heading = document.getElementById("filter-results-heading");
    if (heading) {
      if (sectionRaw) {
        const sectionLabels = {
          trending: "Trending",
          recent: "Recently Updated",
          latest: "Latest Movies",
          movies: "Popular Movies",
          webseries: "Popular Web Series",
          drama: "Popular Drama",
          action: "Action",
          romance: "Romance",
          crime: "Crime",
          anime: "Anime",
          fantasy: "Fantasy",
          thriller: "Thriller"
        };
        const label = sectionLabels[sectionRaw.toLowerCase()] || sectionRaw;
        heading.textContent = `${label} Results`;
      } else {
        heading.textContent = "All Filter Result";
      }
    }

    filterResultsSection.style.display = 'block';
    renderFilterResults();
    return;
  }

  renderMovies(filtered);
}

// 🎬 Section Renderer
function renderMovies(filteredMovies) {
  const sections = Object.keys(sectionStates);
  sections.forEach(section => {
    const container = document.getElementById(`${section}-list`);
    if (container) {
      container.innerHTML = '';
      sectionStates[section] = 0;
      const wrapper = container.closest('section');
      if (wrapper) wrapper.style.display = 'none';
    }
  });

  sections.forEach(section => {
    const movies = filteredMovies.filter(m => m.category && m.category.toLowerCase() === section.toLowerCase());
    if (movies.length > 0) {
renderSection(section, movies, true);
      const container = document.getElementById(`${section}-list`);
      const wrapper = container?.closest('section');
      if (wrapper) wrapper.style.display = 'block';
    }
  });
}

// 🔍 Render Search Results
function renderSearchResults() {
  const slice = searchFiltered.slice(searchIndex, searchIndex + 20);
  if (slice.length === 0 && searchIndex === 0) {
    searchResultsList.innerHTML = `<p style="text-align:center; padding:20px;">😢 No results found</p>`;
    return;
  }
  slice.forEach(m => {
    const card = createMovieCard(m);
    searchResultsList.appendChild(card);
  });
  searchIndex += 20;
  seeMoreSearchBtn.style.display = searchIndex < searchFiltered.length ? 'block' : 'none';
}

// 🔍 Render Filter Results
function renderFilterResults() {
  const slice = filterFiltered.slice(filterIndex, filterIndex + 20);
  if (slice.length === 0 && filterIndex === 0) {
    filterResultsList.innerHTML = `<p style="text-align:center; padding:20px;">😢 No results found</p>`;
    return;
  }
  slice.forEach(m => {
    const card = createMovieCard(m);
    filterResultsList.appendChild(card);
  });
  filterIndex += 20;
  seeMoreFilterBtn.style.display = filterIndex < filterFiltered.length ? 'block' : 'none';
}

// 🌙 Dark Mode Toggle
function setupDarkModeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') document.body.classList.add('dark');

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

// 🔁 Auto Scroll for Trending
function autoScrollTrending() {
  const trending = document.getElementById('trending-list');
  if (!trending) return;

  let index = 0;
  let isUserScrolling = false;
  let scrollTimeout;

  function scrollToCard() {
    const cards = trending.querySelectorAll('.trending-card');
    if (cards.length === 0 || isUserScrolling) return;
    index = (index + 1) % cards.length;
    const scrollTo = cards[index].offsetLeft;
    trending.scrollTo({ left: scrollTo, behavior: 'smooth' });
  }

  trending.addEventListener('scroll', () => {
    isUserScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isUserScrolling = false;
      const cards = trending.querySelectorAll('.trending-card');
      for (let i = 0; i < cards.length; i++) {
        const cardLeft = cards[i].offsetLeft;
        const scrollLeft = trending.scrollLeft;
        if (cardLeft >= scrollLeft) {
          index = i - 1 >= 0 ? i - 1 : 0;
          break;
        }
      }
    }, 150);
  });

  trending.addEventListener('mouseenter', () => isUserScrolling = true);
  trending.addEventListener('mouseleave', () => isUserScrolling = false);

  setInterval(scrollToCard, 3000);
}

// 🧩 Filter Listener Binding
function setupFilterListeners() {
  const filterIds = [
    'search-box',
    'section-filter',
    'platform-filter',
    'genre-filter',
    'lang-filter',
    'type-filter',
    'quality-filter'
  ];
  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });
}

// 🎯 Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  const sections = Object.keys(sectionStates);
  sections.forEach(section => loadSection(section));
  setupSeeMoreButtons();
  setupFilterListeners();
  setupDarkModeToggle();
  autoScrollTrending();
});