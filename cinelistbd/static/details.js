document.addEventListener("DOMContentLoaded", () => {
  const movieId = window.location.pathname.split("/").pop();
  fetch("/api/movies")
    .then(res => res.json())
    .then(movies => {
      const movie = movies.find(m => m.id == movieId);
      if (!movie) return;

      const container = document.getElementById("movie-details");
      container.innerHTML = `
        <h2>${movie.title} (${movie.year})</h2>
        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
        <p><strong>পরিচালক:</strong> ${movie.director}</p>
        <p><strong>অভিনেতা:</strong> ${movie.actors}</p>
        <p><strong>রেটিং:</strong> ${movie.rating}</p>
        <p><strong>বর্ণনা:</strong> ${movie.description}</p>
        <iframe width="560" height="315" src="${movie.trailer}" frameborder="0" allowfullscreen></iframe>
        <h3>ডাউনলোড লিংক:</h3>
        <ul>
          ${movie.download_links.map(link => `<li><a href="${link.url}" target="_blank">${link.quality}</a></li>`).join("")}
        </ul>
      `;
    });
});