async function loadMovies() {
  const res = await fetch('/api/movies');
  const movies = await res.json();

  const latestContainer = document.getElementById('latest-movies-grid');
  const popularContainer = document.getElementById('popular-movies-grid');

  latestContainer.innerHTML = '';
  popularContainer.innerHTML = '';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <a href="/details/${movie.id}">
        <img src="${movie.poster}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <p>${movie.year} | ⭐ ${movie.rating}</p>
      </a>
    `;
    latestContainer.appendChild(card);
    popularContainer.appendChild(card.cloneNode(true));
  });
}

window.onload = loadMovies;