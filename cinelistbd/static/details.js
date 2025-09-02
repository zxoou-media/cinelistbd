document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("movie-details");
  const movieId = parseInt(window.location.pathname.split("/").pop());

  try {
    const res = await fetch("/api/movies");
    const movies = await res.json();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
      container.innerHTML = "<p>Movie not found.</p>";
      return;
    }

    const posterPath = movie.poster.startsWith("http") ? movie.poster : `/static/img/${movie.poster}`;
    container.innerHTML = `
      <h2>${movie.title}</h2>
      <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
      <p><strong>Year:</strong> ${movie.year}</p>
      <p><strong>Rating:</strong> ⭐ ${movie.rating}</p>
      <p><strong>Genre:</strong> ${movie.genre.join(", ")}</p>
      <p><strong>Language:</strong> ${movie.language}</p>
      <p><strong>Country:</strong> ${movie.country}</p>
      <p><strong>Director:</strong> ${movie.director}</p>
      <p><strong>Actors:</strong> ${movie.actors.join(", ")}</p>
      <p><strong>Summary:</strong> ${movie.summary}</p>
      <iframe width="560" height="315" src="${movie.trailer}" frameborder="0" allowfullscreen></iframe>
    `;
  } catch (err) {
    container.innerHTML = "<p>Failed to load movie details.</p>";
  }
});