document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/movies")
    .then(res => res.json())
    .then(movies => {
      const latestGrid = document.getElementById("latest-movies-grid");
      const popularGrid = document.getElementById("popular-movies-grid");

      movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
          <a href="/details/${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
            <h3>${movie.title}</h3>
            <p>${movie.year} • ⭐ ${movie.rating}</p>
          </a>
        `;
        latestGrid.appendChild(card);
        popularGrid.appendChild(card.cloneNode(true));
      });
    });
});