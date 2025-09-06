let allMovies = [];

const sectionStates = {
  recent: 0,
  latest: 0,
  movies: 0,
  webseries: 0,
  drama: 0
};

const sectionMap = {
  trending: 'trending-scroll',
  recent: 'recent-list',
  latest: 'latest-list',
  movies: 'popularmovies-list',
  webseries: 'popularwebseries-list',
  drama: 'populardrama-list'
};

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
    renderInitialMovies();
  } catch (err) {
    console.error("Failed to load movies:", err);
  }
}

function renderInitialMovies() {
  renderSection('trending', allMovies.filter(m => m.category === 'trending'));
  ['recent', 'latest', 'movies', 'webseries', 'drama'].forEach(section => {
    renderSection(section, allMovies.filter(m => m.category === section), true);
  });
}

function getPosterPath(m) {
  return m.poster ? `/img/${m.poster}` : '/img/default.jpg';
}

function renderSection(section, movies, paginated = false) {
  const container = document.getElementById(sectionMap[section]);
  if (!container) return;

  if (!paginated) container.innerHTML = '';

  const start = sectionStates[section] * 20;
  const end = start + 20;
  const slice = paginated ? movies.slice(start, end) : movies;

  slice.forEach(m => {
    const card = document.createElement('div');
    card.className = `${m.category}-card`;
    const posterPath = getPosterPath(m);
    card.innerHTML = `
      <a href="${m.trailer}" target="_blank">
        <img src="${posterPath}" alt="${m.title}" class="poster" />
      </a>
      <h3>${m.title}</h3>
      ${m.sequel ? `<p>Sequel: ${m.sequel}</p>` : ""}
      ${m.episode && Array.isArray(m.type) && m.type.includes("Web Series") ? `<p>Episode: ${m.episode}</p>` : ""}
      ${Array.isArray(m.genre) && m.genre.length ? `<p>Genre: ${m.genre.join(', ')}</p>` : ""}
      ${Array.isArray(m.lang) && m.lang.length ? `<p>Language: ${m.lang.join(', ')}</p>` : ""}
      ${Array.isArray(m.country) && m.country.length ? `<p>Country: ${m.country.join(', ')}</p>` : ""}
      ${Array.isArray(m.type) && m.type.length ? `<p>Type: ${m.type.join(', ')}</p>` : ""}
      ${Array.isArray(m.actors) && m.actors.length ? `<p>Actors: ${m.actors.join(', ')}</p>` : ""}
      ${Array.isArray(m.directors) && m.directors.length ? `<p>Directors: ${m.directors.join(', ')}</p>` : ""}
      ${m.runtime ? `<p>Runtime: ${m.runtime}</p>` : ""}
      ${m.date ? `<p>Release: ${m.date}</p>` : ""}
      ${Array.isArray(m.quality) && m.quality.length ? `<p>Quality: ${m.quality.join(', ')}</p>` : ""}
      ${m.imdb ? `<p>IMDb Rating: ${m.imdb}</p>` : ""}
      ${m.tmdb ? `<p>TMDb Rating: ${m.tmdb}</p>` : ""}
      ${Array.isArray(m.platform) && m.platform.length ? `<p>Platform: ${m.platform.join(', ')}</p>` : ""}
      ${m.trailer ? `<a href="${m.trailer}" target="_blank" class="watch-btn">▶ Watch Trailer</a>` : ""}
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

function setupSeeMoreButtons() {
  document.querySelectorAll('.see-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      const movies = allMovies.filter(m => m.category === section);
      renderSection(section, movies, true);
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

function renderMovies(filteredMovies) {
  Object.keys(sectionMap).forEach(section => {
    const container = document.getElementById(sectionMap[section]);
    container.innerHTML = '';
    sectionStates[section] = 0;
  });

  Object.keys(sectionStates).forEach(section => {
    const movies = filteredMovies.filter(m => m.category === section);
    renderSection(section, movies, true);
  });
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
    }, 150);
  });

  setInterval(scrollToCard, 3000);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  setupSeeMoreButtons();
  setupFilterListeners();
  setupDarkModeToggle();
  autoScrollTrending();
});