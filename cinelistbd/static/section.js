let currentPage = 1;
let totalPages = 1;
const perPage = 20;

const container = document.getElementById('movie-list');
const seeMoreBtn = document.getElementById('see-more-btn');
const loader = document.getElementById('loader');
const pageNumbers = document.getElementById('page-numbers');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function fetchMovies(page) {
  loader.style.display = 'block';
  fetch(`/api/section/${section}?page=${page}`)
    .then(res => res.json())
    .then(data => {
      renderMovies(data.movies);
      totalPages = Math.ceil(data.total / perPage);
      updatePagination();
      loader.style.display = 'none';
    });
}

function renderMovies(movies) {
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = `${section}-card`;
    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}" class="poster">
      <h3>${movie.title}</h3>
      <p>${movie.year}</p>
    `;
    container.appendChild(card);
  });
}

function updatePagination() {
  pageNumbers.innerHTML = '';
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);

  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }

  for (let i = start; i <= end; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      container.innerHTML = '';
      fetchMovies(currentPage);
    });
    pageNumbers.appendChild(btn);
  }

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    container.innerHTML = '';
    fetchMovies(currentPage);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    container.innerHTML = '';
    fetchMovies(currentPage);
  }
});

seeMoreBtn.addEventListener('click', () => {
  currentPage++;
  if (currentPage <= totalPages) {
    fetchMovies(currentPage);
  } else {
    seeMoreBtn.style.display = 'none';
  }
});

fetchMovies(currentPage);