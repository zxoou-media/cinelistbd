document.addEventListener("DOMContentLoaded", () => {
  const latestGrid = document.getElementById("latest-movies-grid");
  const popularGrid = document.getElementById("popular-movies-grid");

  function createCard(movie) {
    const posterPath = movie.poster.startsWith("http") ? movie.poster : `/static/img/${movie.poster}`;
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <a href="/details/${movie.id}">
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
        <h3>${movie.title}</h3>
        <p>${movie.year} • ⭐ ${movie.rating}</p>
      </a>
    `;
    return card;
  }

  async function loadMovies() {
    try {
      const res = await fetch("/api/movies");
      const movies = await res.json();
      movies.forEach(movie => {
        latestGrid.appendChild(createCard(movie));
        popularGrid.appendChild(createCard(movie));
      });
    } catch (err) {
      latestGrid.innerHTML = "<p>Movie data unavailable.</p>";
      popularGrid.innerHTML = "<p>Movie data unavailable.</p>";
    }
  }

  loadMovies();
});