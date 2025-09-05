let allMovies = [];

async function loadMovies() {
  try {
    const res = await fetch('/api/movies');
    const data = await res.json();

    const trending = data.trending.map(m => ({ ...m, category: 'trending' }));
    const recent = data.recent.map(m => ({ ...m, category: 'recent' }));
    const latest = data.latest.map(m => ({ ...m, category: 'latest' }));
    const movies = data.movies.map(m => ({ ...m, category: 'movies' }));
    const webseries = data.webseries.map(m => ({ ...m, category: 'webseries' }));
    const drama = data.drama.map(m => ({ ...m, category: 'drama' }));

    allMovies = [...trending, ...recent, ...latest, ...movies, ...webseries, ...drama];
    renderMovies(allMovies);
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
}

function renderMovies(movies) {
  const sections = {
    trending: document.getElementById('trending-scroll'),
    recent: document.getElementById('recent-list'),
    latest: document.getElementById('latest-list'),
    movies: document.getElementById('popularmovies-list'),
    webseries: document.getElementById('popularwebseries-list'),
    drama: document.getElementById('populardrama-list')
  };

  // Clear previous content
  Object.values(sections).forEach(el => el.innerHTML = '');

  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = `${m.category}-card`;

    card.innerHTML = `
      <a href="${m.trailer}" target="_blank">
        <img src="${m.poster}" alt="${m.title}" class="poster" />
      </a>
      <h3>${m.title}</h3>
      <p>Language: ${Array.isArray(m.lang) ? m.lang.join(', ') : m.lang}</p>
      <p>Quality: ${Array.isArray(m.quality) ? m.quality.join(', ') : m.quality}</p>
      <p>Release: ${m.date || 'N/A'}</p>
      <a href="${m.trailer}" target="_blank" class="watch-btn">▶ Watch Movie</a>
    `;

    sections[m.category]?.appendChild(card);
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
    const matchesPlatform = !platform || movie.platform === platform;
    const matchesGenre = !genre || movie.genre === genre;
    const matchesLang = !lang || (Array.isArray(movie.lang) ? movie.lang.includes(lang) : movie.lang === lang);
    const matchesType = !type || movie.type === type;
    const matchesQuality = !quality || (Array.isArray(movie.quality) ? movie.quality.includes(quality) : movie.quality === quality);

    return (
      matchesSearch &&
      matchesSection &&
      matchesPlatform &&
      matchesGenre &&
      matchesLang &&
      matchesType &&
      matchesQuality
    );
  });

  renderMovies(filtered);
}

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

function setupDarkModeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
}

function autoScrollTrending() {
  const trending = document.getElementById('trending-scroll');
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
    }, 1500);
  });

  setInterval(scrollToCard, 3000);
}

window.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  setupFilterListeners();
  setupDarkModeToggle();
  autoScrollTrending();
});