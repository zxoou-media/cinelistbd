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
    trending: {
      wrapper: document.getElementById('trending'),
      container: document.getElementById('trending-scroll')
    },
    recent: {
      wrapper: document.getElementById('recent'),
      container: document.getElementById('recent-list')
    },
    latest: {
      wrapper: document.getElementById('latest'),
      container: document.getElementById('latest-list')
    },
    movies: {
      wrapper: document.getElementById('movies'),
      container: document.getElementById('popularmovies-list')
    },
    webseries: {
      wrapper: document.getElementById('webseries'),
      container: document.getElementById('popularwebseries-list')
    },
    drama: {
      wrapper: document.getElementById('drama'),
      container: document.getElementById('populardrama-list')
    }
  };

  // Clear all containers
  Object.values(sections).forEach(({ container }) => container.innerHTML = '');

  // Track which sections have content
  const sectionHasContent = {
    trending: false,
    recent: false,
    latest: false,
    movies: false,
    webseries: false,
    drama: false
  };

  // Render filtered movies
  movies.forEach(m => {
    const section = sections[m.category];
    if (!section) return;

    const card = document.createElement('div');
    card.className = `${m.category}-card`;
    card.innerHTML = `
      <a href="${m.trailer}" target="_blank">
        <img src="${m.poster}" alt="${m.title}" class="poster" />
      </a>
      <h3>${m.title}</h3>
      <p>Language: ${Array.isArray(m.lang) ? m.lang.join(', ') : m.lang}</p>
      <p>Quality: ${Array.isArray(m.quality) ? m.quality.join(', ') : m.quality}</p>
      <p>Genre: ${Array.isArray(m.genre) ? m.genre.join(', ') : m.genre || 'N/A'}</p>
      <p>Type: ${Array.isArray(m.type) ? m.type.join(', ') : m.type || 'N/A'}</p>
      <p>Platform: ${Array.isArray(m.platform) ? m.platform.join(', ') : m.platform || 'N/A'}</p>
      <p>Release: ${m.date || 'N/A'}</p>
      <a href="${m.trailer}" target="_blank" class="watch-btn">▶ Watch Movie</a>
    `;
    section.container.appendChild(card);
    sectionHasContent[m.category] = true;
  });

  // Show/hide sections based on content
  Object.entries(sections).forEach(([key, { wrapper }]) => {
    wrapper.style.display = sectionHasContent[key] ? 'block' : 'none';
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
    const matchesPlatform = !platform || (
      Array.isArray(movie.platform) ? movie.platform.includes(platform) : movie.platform === platform
    );
    const matchesGenre = !genre || (
      Array.isArray(movie.genre) ? movie.genre.includes(genre) : movie.genre === genre
    );
    const matchesLang = !lang || (
      Array.isArray(movie.lang) ? movie.lang.includes(lang) : movie.lang === lang
    );
    const matchesType = !type || (
      Array.isArray(movie.type) ? movie.type.includes(type) : movie.type === type
    );
    const matchesQuality = !quality || (
      Array.isArray(movie.quality) ? movie.quality.includes(quality) : movie.quality === quality
    );

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