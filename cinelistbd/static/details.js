async function fetchMovieDetails() {
    try {
        // URL থেকে মুভির আইডি বের করা
        const params = new URLSearchParams(window.location.search);
        const movieId = params.get('id');

        if (!movieId) {
            document.getElementById('movie-details-section').innerHTML = '<h2>মুভি খুঁজে পাওয়া যায়নি।</h2>';
            return;
        }

        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('ডেটা লোড করা যায়নি।');
        }
        const data = await response.json();
        const movie = data.movies.find(m => m.id == movieId);

        if (movie) {
            displayMovieDetails(movie);
        } else {
            document.getElementById('movie-details-section').innerHTML = '<h2>মুভি খুঁজে পাওয়া যায়নি।</h2>';
        }

    } catch (error) {
        console.error('ফ্যাচিং সমস্যা:', error);
    }
}

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
                <a href="#">1080p Full HD</a>
                <a href="#">720p HD</a>
                <a href="#">480p SD</a>
            </div>

            <div class="related-movies">
                <h3>সম্পর্কিত মুভি</h3>
                </div>
        </div>
    `;

    detailsContainer.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', fetchMovieDetails);
