document.addEventListener("DOMContentLoaded", () => {
  const latestGrid = document.getElementById("latest-movies-grid");
  const popularGrid = document.getElementById("popular-movies-grid");

  // ✅ Movie card generator
  function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";

    // Poster path handling (external or local)
    const posterPath = movie.poster.startsWith("http")
      ? movie.poster
      : `/static/img/${movie.poster}`;

    card.innerHTML = `
      <a href="/details/${movie.id}">
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
        <h3>${movie.title}</h3>
        <p>${movie.year} • ⭐ ${movie.rating}</p>
      </a>
    `;
    return card;
  }

  // ✅ Fetch and render movies
  async function fetchAndRenderMovies() {
    try {
      const response = await fetch("/api/movies");
      if (!response.ok) throw new Error("Network response was not ok");

      const movies = await response.json();
      if (!Array.isArray(movies)) throw new Error("Invalid movie data format");

      movies.forEach(movie => {
        const latestCard = createMovieCard(movie);
        const popularCard = createMovieCard(movie);
        latestGrid.appendChild(latestCard);
        popularGrid.appendChild(popularCard);
      });

      console.log("✅ Movies rendered:", movies.length);
    } catch (error) {
      console.error("❌ Movie fetch failed:", error);
      latestGrid.innerHTML = `<p class="error-msg">🎬 Movie data unavailable.</p>`;
      popularGrid.innerHTML = `<p class="error-msg">🎬 Movie data unavailable.</p>`;
    }
  }

  fetchAndRenderMovies();
});