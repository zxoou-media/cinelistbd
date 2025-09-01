// একটি ফাংশন যা JSON ফাইল থেকে ডেটা লোড করবে
async function fetchMovies() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('ডেটা লোড করা যায়নি।');
        }
        const data = await response.json();
        return data.movies;
    } catch (error) {
        console.error('ফ্যাচিং সমস্যা:', error);
        return [];
    }
}

// একটি ফাংশন যা একটি মুভির জন্য HTML কার্ড তৈরি করবে
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.dataset.id = movie.id; // ডেটা আইডি যোগ করা হয়েছে

    card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title} পোস্টার">
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <p>রেটিং: ${movie.rating} | বছর: ${movie.year}</p>
        </div>
    `;

    return card;
}

// একটি ফাংশন যা মুভিগুলোকে নির্দিষ্ট গ্রিডে প্রদর্শন করবে
function displayMovies(movies, elementId) {
    const container = document.getElementById(elementId);
    if (!container) {
        console.error(`কন্টেইনার খুঁজে পাওয়া যায়নি: #${elementId}`);
        return;
    }

    container.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
    });
}

// প্রধান ফাংশন যা সবকিছু পরিচালনা করবে
async function init() {
    const allMovies = await fetchMovies();

    // জনপ্রিয় মুভি (রেটিং অনুসারে সাজানো)
    const popularMovies = [...allMovies].sort((a, b) => b.rating - a.rating);
    
    // নতুন মুভি (ID অনুসারে সাজানো)
    const latestMovies = [...allMovies].sort((a, b) => b.id - a.id);

    displayMovies(latestMovies, 'latest-movies-grid');
    displayMovies(popularMovies, 'popular-movies-grid');

    // মুভি কার্ডে ক্লিক হ্যান্ডলার যোগ করা
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movieId = card.dataset.id;
            window.location.href = `movie_details.html?id=${movieId}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
