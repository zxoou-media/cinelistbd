// একটি ফাংশন যা API থেকে ডেটা লোড করবে
async function fetchData() {
    try {
        const response = await fetch('/api/movies'); // URL পরিবর্তন করা হয়েছে
        if (!response.ok) {
            throw new Error('ডেটা লোড করা যায়নি।');
        }
        return await response.json();
    } catch (error) {
        console.error('ফ্যাচিং সমস্যা:', error);
        return null;
    }
}

// একটি ফাংশন যা মুভির বিস্তারিত তথ্য প্রদর্শন করবে
function displayMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details-section');

    const html = `
        <img src="${movie.poster}" alt="${movie.title} পোস্টার" class="details-poster">
        <div class="details-info">
            <h1>${movie.title}</h1>
            <p><strong>রেটিং:</strong> ${movie.rating}/10</p>
            <p><strong>মুক্তির বছর:</strong> ${movie.year}</p>
            <p><strong>পরিচালক:</strong> ${movie.director}</p>
            <p><strong>অভিনয়ে:</strong> ${movie.actors}</p>
            <p><strong>কাহিনী সংক্ষেপ:</strong> ${movie.description}</p>
            
            <div class="trailer">
                <h3>ট্রেলার</h3>
                <iframe width="560" height="315" src="${movie.trailer}" frameborder="0" allowfullscreen></iframe>
            </div>

            <div class="download-links">
                <h3>ডাউনলোড</h3>
                ${movie.download_links.map(link => `<a href="${link.url}">${link.quality}</a>`).join('')}
            </div>

            <div class="related-movies">
                <h3>সম্পর্কিত মুভি</h3>
                <div class="movie-grid" id="related-movies-grid">
                    </div>
            </div>
        </div>
    `;

    detailsContainer.innerHTML = html;
}

// একটি ফাংশন যা মুভির কার্ড তৈরি করবে
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.dataset.id = movie.id;

    card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title} পোস্টার">
        <div class="movie-info">
            <h3>${movie.title}</h3>
        </div>
    `;
    return card;
}

// একটি ফাংশন যা সম্পর্কিত মুভি খুঁজে বের করে প্রদর্শন করবে
function displayRelatedMovies(allMovies, currentMovie) {
    const relatedMoviesContainer = document.getElementById('related-movies-grid');
    if (!relatedMoviesContainer) return;

    // একই জনরার মুভিগুলো খুঁজে বের করা
    const relatedMovies = allMovies.filter(movie => {
        // জনরা অ্যারে থেকে মিল খুঁজে বের করার জন্য পরিবর্তিত লজিক
        const hasMatchingGenre = movie.genre.some(genre => currentMovie.genre.includes(genre));
        return hasMatchingGenre && movie.id !== currentMovie.id;
    }).slice(0, 4); // শুধুমাত্র প্রথম ৪টি মুভি দেখানো হবে

    // যদি সম্পর্কিত মুভি না পাওয়া যায়, তাহলে বার্তা প্রদর্শন করা
    if (relatedMovies.length === 0) {
        relatedMoviesContainer.innerHTML = '<p>এই ধরনের আর কোনো মুভি পাওয়া যায়নি।</p>';
        return;
    }

    // সম্পর্কিত মুভিগুলো প্রদর্শন করা
    relatedMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        relatedMoviesContainer.appendChild(movieCard);

        // কার্ডে ক্লিক করার কার্যকারিতা যোগ করা
        movieCard.addEventListener('click', () => {
            window.location.href = `/details/${movie.id}`; // URL পরিবর্তন করা হয়েছে
        });
    });
}

// প্রধান ফাংশন যা পেজ লোড হলে কাজ করবে
async function init() {
    const data = await fetchData();
    if (!data) return;

    const allMovies = data.movies;
    const pathSegments = window.location.pathname.split('/');
    const movieId = pathSegments[pathSegments.length - 1]; // URL থেকে আইডি বের করা হয়েছে
    
    const currentMovie = allMovies.find(m => m.id == movieId);

    if (currentMovie) {
        displayMovieDetails(currentMovie);
        displayRelatedMovies(allMovies, currentMovie);
    } else {
        document.getElementById('movie-details-section').innerHTML = '<h2>মুভি খুঁজে পাওয়া যায়নি।</h2>';
    }
}

document.addEventListener('DOMContentLoaded', init);
