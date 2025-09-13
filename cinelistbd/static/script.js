let allMovies = [];
const sectionStates = {
  trending: 0, recent: 0, latest: 0,
  movies: 0, webseries: 0, drama: 0
};

function getPosterPath(m) {
  if (!m.poster || m.poster.trim() === "") return null;
  return m.poster.startsWith('http') ? m.poster : `/img/${m.poster}`;
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

  slice.forEach(m => {
    const card = document.createElement('div');
    card.className = `${m.category}-card`;
    const posterPath = getPosterPath(m);
    card.innerHTML = `
      <a href="${m.trailer}" target="_blank">
        ${posterPath ? `<img src="${posterPath}" alt="${m.title}" class="poster" />` : `<div class="poster-frame">No Poster</div>`}
      </a>
      <h3>${m.title}</h3>
      ${m.date ? `<p>Release: ${m.date}</p>` : ""}
      ${Array.isArray(m.lang) ? `<p>Language: ${m.lang.join(', ')}</p>` : ""}
      ${Array.isArray(m.quality) ? `<p>Quality: ${m.quality.join(', ')}</p>` : ""}
    `;
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

${m.watch ? `<a href="${m.watch}" target="_blank" class="watch-btn">▶ Watch Movie</a>` : ""}

function setupSeeMoreButtons() {
  document.querySelectorAll('.see-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      loadMore(section);
    });
  });
}

function applyFilters() {
  const searchText = document.getElementById("search-box").value.toLowerCase();
  const section = document.getElementById("section-filter").value;
  const platform = document.getElementById("platform-filter").value;
  const genre = document.getElementById("genre-filter").value;
  const lang = document.getElementById("lang-filter").value;
  const type = document.getElementById("type-filter").value;
  const quality = document.getElementById("quality-filter").value;

  const filtered = allMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchText);
    const matchesSection = !section || movie.category === section;
    const matchesPlatform = !platform || (Array.isArray(movie.platform) ? movie.platform.includes(platform) : movie.platform === platform);
    const matchesGenre = !genre || (Array.isArray(movie.genre) ? movie.genre.includes(genre) : movie.genre === genre);
    const matchesLang = !lang || (Array.isArray(movie.lang) ? movie.lang.includes(lang) : movie.lang === lang);
    const matchesType = !type || (Array.isArray(movie.type) ? movie.type.includes(type) : movie.type === type);
    const matchesQuality = !quality || (Array.isArray(movie.quality) ? movie.quality.includes(quality) : movie.quality === quality);

    return matchesSearch && matchesSection && matchesPlatform && matchesGenre && matchesLang && matchesType && matchesQuality;
  });

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
      if (wrapper) wrapper.style.display = 'none';
    }
  });

  sections.forEach(section => {
    const movies = filteredMovies.filter(m => m.category === section);
    if (movies.length > 0) {
      renderSection(section, movies, true);
      const container = document.getElementById(`${section}-list`);
      const wrapper = container.closest('section');
      if (wrapper) wrapper.style.display = 'block';
    }
  });
}

// 🔹 Filter listeners
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
    document.getElementById(id).addEventListener('input', applyFilters);
  });
}

// 🔹 Dark mode toggle
function setupDarkModeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
}

// 🔹 Auto-scroll for trending
function autoScrollTrending() {
  const trending = document.getElementById('trending-list');
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

// 🔹 Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
  const sections = Object.keys(sectionStates);
  sections.forEach(section => loadSection(section));
  setupSeeMoreButtons();
  setupFilterListeners();
  setupDarkModeToggle();
  autoScrollTrending();
});