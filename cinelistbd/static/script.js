let allMovies = [];

let sectionPages = {
  recent: 1,
  latest: 1,
  movies: 1,
  webseries: 1,
  drama: 1
};

const perPage = 20;

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

  Object.values(sections).forEach(({ container, wrapper }) => {
    container.innerHTML = '';
    const seeMoreBtn = wrapper.querySelector('.see-more-btn');
    if (seeMoreBtn) seeMoreBtn.remove();
  });

  Object.keys(sectionPages).forEach(key => {
    const sectionMovies = movies.filter(m => m.category === key);
    const start = (sectionPages[key] - 1) * perPage;
    const end = start + perPage;
    const paginated = sectionMovies.slice(start, end);

    paginated.forEach(m => {
      const card = document.createElement('div');
      card.className = `${m.category}-card`;
      card.innerHTML = `
        <a href="${m.trailer}" target="_blank">
          <img src="${m.poster}" alt="${m.title}" class="poster" />
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
      sections[m.category].container.appendChild(card);
    });

    if (end < sectionMovies.length) {
      const btn = document.createElement('button');
      btn.className = 'see-more-btn';
      btn.textContent = 'আরও দেখুন';
      btn.addEventListener('click', () => {
        sectionPages[key]++;
        renderMovies(allMovies);
        setTimeout(() => {
          sections[key].wrapper.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      sections[key].wrapper.appendChild(btn);
    }

    sections[key].wrapper.style.display = sectionMovies.length ? 'block' : 'none';
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