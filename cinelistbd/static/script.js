let allMovies = [];
const sectionStates = {
  trending: 0, recent: 0, latest: 0,
  movies: 0, webseries: 0, drama: 0
};

function getPosterPath(m) {
  if (!m.poster || m.poster.trim() === "") return null;
  return m.poster.startsWith('http') ? m.poster : `/img/${m.poster}`;
}

function createMovieCard(m) {
  const card = document.createElement('div');
  card.className = 'trending-card';
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
    ${Array.isArray(m.quality) ? `<p>Quality: ${m.quality.join(', ')}</p>` : ""}
    ${Array.isArray(m.platform) && m.platform.length ? `<p>Platform: ${m.platform.join(', ')}</p>` : ""}
    ${m.date ? `<p>Release: ${m.date}</p>` : ""}
    ${m.trailer ? `<a href="${m.trailer}" target="_blank" class="watch-btn">▶ Watch Movie</a>` : ""}
  `;
  return card;
}

function showNoResult(sectionId) {
  const container = document.getElementById(sectionId);
  container.innerHTML = `<p style="text-align:center; padding:20px;">😢 No results found</p>`;
}

async function loadSection(section) {
  try {
    const res = await fetch(`/api/movies?section=${section}&offset=0&limit=20`);
    const data = await res.json();
    const movies = data.movies.map(m => ({ ...m, category: section }));
    allMovies = [...allMovies, ...movies];
    renderSection(section, movies, true);
  } catch (err) {
    console.error(`Failed to load ${section}:`, err);
  }
}

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

function renderSection(section, movies, paginated = false) {
  const container = document.getElementById(`${section}-list`);
  if (!container) return;
  if (!paginated) container.innerHTML = '';

  const start = sectionStates[section] * 20;
  const end = start + 20;
  const slice = paginated ? movies.slice(0, 20) : movies;

  if (slice.length === 0) {
    showNoResult(`${section}-list`);
    return;
  }

  slice.forEach(m => {
    const card = createMovieCard(m);
    container.appendChild(card);
  });

  if (paginated) {
    sectionStates[section]++;
    const seeMoreBtn = document.querySelector(`.see-more-btn[data-section="${section}"]`);
    if (end >= movies.length && seeMoreBtn) {
      seeMoreBtn.style.display = 'none';
    }
  }
}

function setupSeeMoreButtons() {
  document.querySelectorAll('.see-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      loadMore(section);
    });
  });
}

// 🔍 Search Result
const searchResultsList = document.getElementById('search-results-list');
const searchResultsSection = document.getElementById('search-results-section');
const seeMoreSearchBtn = document.getElementById('see-more-search');
let searchFiltered = [];
let searchIndex = 0;
const searchPageSize = 20;

function renderSearchResults() {
  const slice = searchFiltered.slice(searchIndex, searchIndex + searchPageSize);
  if (slice.length === 0 && searchIndex === 0) {
    showNoResult('search-results-list');
    return;
  }
  slice.forEach(m => {
    const card = createMovieCard(m);
    searchResultsList.appendChild(card);
  });
  searchIndex += searchPageSize;
  seeMoreSearchBtn.style.display = searchIndex < searchFiltered.length ? 'block' : 'none';
}

seeMoreSearchBtn.addEventListener('click', renderSearchResults);

// 🎛️ Filter Result
const filterResultsList = document.getElementById('filter-results-list');
const filterResultsSection = document.getElementById('filter-results-section');
const seeMoreFilterBtn = document.getElementById('see-more-filter');
let filterFiltered = [];
let filterIndex = 0;
const filterPageSize = 20;

function renderFilterResults() {
  const slice = filterFiltered.slice(filterIndex, filterIndex + filterPageSize);
  if (slice.length === 0 && filterIndex === 0) {
    showNoResult('filter-results-list');
    return;
  }
  slice.forEach(m => {
    const card = createMovieCard(m);
    filterResultsList.appendChild(card);
  });
  filterIndex += filterPageSize;
  seeMoreFilterBtn.style.display = filterIndex < filterFiltered.length ? 'block' : 'none';
}

seeMoreFilterBtn.addEventListener('click', renderFilterResults);

// 🔁 Unified Filter Logic
function applyFilters() {
  const query = document.getElementById("search-box").value.toLowerCase().trim();
  const section = document.getElementById("section-filter").value;
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
      match(m.title, query) &&
      (!section || m.category === section) &&
      match(m.platform, platform) &&
      match(m.genre, genre) &&
      match(m.lang, lang) &&
      match(m.type, type) &&
      match(m.quality, quality)
    );
  });

  if (query) {
    searchFiltered = filtered;
    searchIndex = 0;
    searchResultsList.innerHTML = '';
    filterResultsSection.style.display = 'none';
    searchResultsSection.style.display = 'block';
    renderSearchResults();
    return;
  }

  if (platform || genre || lang || type || quality) {
    filterFiltered = filtered;
    filterIndex = 0;
    filterResultsList.innerHTML = '';
    searchResultsSection.style.display = 'none';
    filterResultsSection.style.display = 'block';
    renderFilterResults();
    return;
  }

  searchResultsSection.style.display = 'none';
  filterResultsSection.style.display = 'none';
  renderMovies(filtered);
}

function renderMovies(filteredMovies) {
  const sections = Object.keys(sectionStates);
  sections.forEach(section => {
    const container = document.getElementById(`${section}-list`);
    if (container) {
      container.innerHTML = '';
      sectionStates[section] = 0;
      const wrapper = container.closest('section');
      if (wrapper) {
  wrapper.style.display = 'block';
}
  });

  sections.forEach(section => {
    const movies = filteredMovies.filter(m => m.category === section);
    if (movies.length > 0) {
      renderSection(section, movies, true);
      const container = document.getElementById(`${section}-list`);
      const wrapper = container.closest('section');
      if (wrapper.style.display = 'block';
      }
    }
  });
}

// 🧭 Section Filter Logic
document.getElementById('section-filter').addEventListener('change', () => {
  const selected = document.getElementById('section-filter').value;
  const allSections = Object.keys(sectionStates);

  allSections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.style.display = 'none';
  });

  if (!selected || selected === '') {
    const path = window.location.pathname;
    let show = [];

    if (path.includes('movies')) show = ['movies', 'latest', 'recent'];
    else if (path.includes('webseries')) show = ['webseries', 'trending', 'recent'];
    else show = ['trending', 'latest', 'recent'];

    show.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.style.display = 'block';
    });
  } else {
    const section = document.getElementById(selected);
    if (section) section.style.display = 'block';
  }
});

// 🌙 Dark Mode Toggle
function setupDarkModeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
}

// 🔁 Auto Scroll for Trending
function autoScrollTrending() {
  const trending = document.getElementById('trending-list');
  if (!trending) return; // ✅ Prevent error if element not found
  ...
}
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